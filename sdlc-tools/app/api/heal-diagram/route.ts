import { NextRequest } from "next/server";
import { query } from "@anthropic-ai/claude-code";

export async function POST(req: NextRequest) {
  try {
    const { diagramCode, errorContext } = await req.json();
    
    if (!diagramCode) {
      return new Response(
        JSON.stringify({ error: "Diagram code is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("[API] Starting diagram healing for code:", diagramCode.substring(0, 100) + "...");
    
    // Create the healing prompt with context about common Mermaid errors
    const healingPrompt = `You are a Mermaid diagram syntax expert. Please analyze and fix the following malformed Mermaid diagram code.

Common Mermaid syntax errors to look for:
- Missing graph direction (e.g., "graph TD", "flowchart TD", "sequenceDiagram")
- Incorrect arrow syntax (should be --> or --- for connections)
- Invalid node IDs (avoid spaces, special characters)
- Missing quotes around node labels with spaces
- Incorrect subgraph syntax
- Wrong participant syntax in sequence diagrams
- Invalid class diagram syntax

Original diagram code (potentially malformed):
\`\`\`mermaid
${diagramCode}
\`\`\`

${errorContext ? `Error context: ${errorContext}` : ''}

Please:
1. Identify what type of diagram this should be
2. Fix any syntax errors
3. Return ONLY the corrected Mermaid code in a code block
4. Ensure the corrected diagram maintains the original intent
5. Make minimal changes - only fix syntax issues

Return your response in this exact format:
CORRECTED_DIAGRAM:
\`\`\`mermaid
[corrected diagram code here]
\`\`\`

CHANGES_MADE:
- [list of specific changes made]`;

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the async healing
    (async () => {
      try {
        const abortController = new AbortController();
        let healedDiagram = "";
        let changesList = "";
        
        for await (const message of query({
          prompt: healingPrompt,
          abortController: abortController,
          options: {
            maxTurns: 3, // Keep it focused on this single task
            allowedTools: [] // No tools needed for this task
          }
        })) {
          
          if (message.type === 'text') {
            const content = (message as any).content || "";
            
            // Extract the corrected diagram from the response
            const correctedMatch = content.match(/CORRECTED_DIAGRAM:\s*```mermaid\s*([\s\S]*?)\s*```/);
            if (correctedMatch) {
              healedDiagram = correctedMatch[1].trim();
            }
            
            // Also try alternative extraction patterns in case the format varies
            if (!healedDiagram) {
              const altMatch = content.match(/```mermaid\s*([\s\S]*?)\s*```/);
              if (altMatch) {
                healedDiagram = altMatch[1].trim();
              }
            }
            
            // Extract the changes made
            const changesMatch = content.match(/CHANGES_MADE:\s*([\s\S]*?)(?=\n\n|\n$|$)/);
            if (changesMatch) {
              changesList = changesMatch[1].trim();
            }
            
            // Send progress update
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                content: content
              })}\n\n`)
            );
          }
        }
        
        // Send the final result
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            healedDiagram: healedDiagram || diagramCode, // fallback to original if extraction failed
            changes: changesList || "No specific changes detected",
            originalDiagram: diagramCode
          })}\n\n`)
        );
        
        console.log("[API] Diagram healing complete");
        
        // Send completion signal
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error: any) {
        console.error("[API] Error during diagram healing:", error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: error.message 
          })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("[API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}