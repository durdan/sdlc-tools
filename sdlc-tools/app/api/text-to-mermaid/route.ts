import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("[Text-to-Mermaid API] Converting description:", description);
    
    // Use Claude API to convert natural language to Mermaid
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Claude API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `Convert the following natural language description into a Mermaid diagram. Based on the context, determine the most appropriate diagram type (flowchart, sequence, class, state, etc.).

Description: "${description}"

Please respond with ONLY the Mermaid syntax, starting with the diagram type. Do not include any explanations or markdown code blocks. Examples:

For process flows: Start with "flowchart TD"
For user interactions: Start with "sequenceDiagram"
For data relationships: Start with "erDiagram"
For system states: Start with "stateDiagram-v2"
For class structures: Start with "classDiagram"

Mermaid diagram:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[Text-to-Mermaid API] Claude API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate Mermaid diagram" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const mermaidCode = data.content[0].text.trim();
    
    console.log("[Text-to-Mermaid API] Generated Mermaid code:", mermaidCode);
    
    return new Response(
      JSON.stringify({ 
        mermaidCode,
        description,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("[Text-to-Mermaid API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}