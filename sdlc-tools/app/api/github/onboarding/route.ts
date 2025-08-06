import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RepositoryOnboardingService } from '@/lib/repository-onboarding'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { owner, repo } = await request.json()
    
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 })
    }

    console.log(`[API] Starting onboarding analysis for ${owner}/${repo}`);

    // Create a readable stream for Server-Sent Events with better error handling
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let isStreamClosed = false

        // Function to send SSE data safely
        const sendSSE = async (data: any) => {
          if (isStreamClosed) return
          
          try {
            const sseData = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(sseData))
          } catch (error) {
            console.error('[API] Error writing to stream:', error)
            isStreamClosed = true
          }
        }

        // Handle client disconnect
        request.signal?.addEventListener('abort', () => {
          console.log('[API] Client disconnected')
          isStreamClosed = true
          try {
            controller.close()
          } catch (e) {
            // Stream might already be closed
          }
        })

        try {
          await sendSSE({ type: 'progress', message: 'Starting repository analysis...' })
          
          const onboardingService = new RepositoryOnboardingService(session.accessToken!)
          
          await sendSSE({ type: 'progress', message: 'Gathering repository data...' })
          
          const result = await onboardingService.generateComprehensiveOnboarding(owner, repo)
          
          if (isStreamClosed) return
          
          if (result.success) {
            // Send progress updates for comprehensive analysis
            const progressSteps = [
              { message: 'Analyzing repository structure...', progress: 25 },
              { message: 'Processing key files...', progress: 50 },
              { message: 'Generating technical analysis...', progress: 75 },
              { message: 'Creating recommendations...', progress: 90 }
            ];
            
            for (let i = 0; i < progressSteps.length && !isStreamClosed; i++) {
              const step = progressSteps[i];
              await sendSSE({ 
                type: 'message', 
                data: {
                  type: 'progress',
                  content: step.message,
                  timestamp: new Date().toISOString(),
                  progress: step.progress
                }
              })
              
              // Rate limit to prevent overwhelming
              await new Promise(resolve => setTimeout(resolve, 300))
            }
            
            if (!isStreamClosed) {
              // Send final results
              await sendSSE({ 
                type: 'complete', 
                data: {
                  onboardingGuide: result.onboardingGuide || 'Analysis completed',
                  technicalAnalysis: result.technicalAnalysis || 'Technical analysis completed',
                  recommendations: result.recommendations || []
                }
              })
            }
          } else {
            if (!isStreamClosed) {
              await sendSSE({ 
                type: 'error', 
                message: result.error || 'Analysis failed'
              })
            }
          }
          
        } catch (error: any) {
          console.error('[API] Onboarding error:', error)
          if (!isStreamClosed) {
            await sendSSE({ 
              type: 'error', 
              message: error.message || 'Unknown error occurred'
            })
          }
        } finally {
          if (!isStreamClosed) {
            try {
              controller.close()
            } catch (closeError) {
              console.warn('[API] Error closing controller:', closeError)
            }
          }
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error: any) {
    console.error('[API] Request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
