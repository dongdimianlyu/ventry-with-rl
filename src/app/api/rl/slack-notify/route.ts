import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readFile } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId, userId, taskData } = body

    if (!action || !taskId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Try to get the original recommendation data
    let recommendation = null
    try {
      const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
      const fileContent = await readFile(rlAgentPath, 'utf-8')
      recommendation = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading RL recommendations:', error)
      // Use taskData as fallback if provided
      if (taskData) {
        recommendation = taskData
      }
    }

    if (!recommendation) {
      return NextResponse.json({ 
        error: 'No recommendation data available for Slack notification' 
      }, { status: 400 })
    }

    try {
      let slackMessage = ''
      
      if (action === 'approve') {
        slackMessage = `✅ **Task Approved via UI**

**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units
**Expected ROI:** ${recommendation.expected_roi || 'N/A'}
**Confidence:** ${recommendation.confidence || 'N/A'}
**Approved by:** User ${userId}
**Task ID:** ${taskId}

**Status:** Approved via frontend UI and queued for QuickBooks execution

**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}

The task has been approved and added to the execution queue.`
      } else if (action === 'reject') {
        slackMessage = `❌ **Task Rejected via UI**

**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units
**Expected ROI:** ${recommendation.expected_roi || 'N/A'}
**Confidence:** ${recommendation.confidence || 'N/A'}
**Rejected by:** User ${userId}
**Task ID:** ${taskId}

**Status:** Rejected via frontend UI

**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}

The recommendation has been logged as rejected.`
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }

      // Send notification to Slack using Python script
      const pythonScript = `
import sys
import os
import ssl
sys.path.append('.')

# Handle SSL issues in development (MUST be before Slack SDK import)
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except:
    pass

# Load environment variables from .env files
try:
    from dotenv import load_dotenv
    load_dotenv('.env')
    load_dotenv('.env.local')
except ImportError:
    pass

try:
    from simple_slack_approval import SimpleSlackApproval
    
    approval = SimpleSlackApproval()
    
    message = """${slackMessage}"""
    
    result = approval.client.chat_postMessage(
        channel=approval.channel_id,
        text=message,
        mrkdwn=True
    )
    
    if result["ok"]:
        print("✅ Slack notification sent successfully")
        print(f"Message timestamp: {result['ts']}")
    else:
        print(f"❌ Failed to send Slack notification: {result}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error sending Slack notification: {e}")
    sys.exit(1)
`

      return new Promise((resolve) => {
        const slackProcess = spawn('python3', ['-c', pythonScript], {
          cwd: process.cwd(),
          stdio: 'pipe'
        })

        let stdout = ''
        let stderr = ''

        slackProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        slackProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        slackProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Slack notification sent successfully')
            console.log('Stdout:', stdout)
            resolve(NextResponse.json({ 
              success: true, 
              message: 'Slack notification sent successfully',
              slackOutput: stdout.trim()
            }))
          } else {
            console.error(`❌ Slack notification failed with code ${code}`)
            console.error('Stderr:', stderr)
            resolve(NextResponse.json({ 
              success: false, 
              message: 'Slack notification failed',
              error: stderr.trim() || 'Unknown error'
            }, { status: 500 }))
          }
        })

        slackProcess.on('error', (error) => {
          console.error('Error starting Slack process:', error)
          resolve(NextResponse.json({ 
            success: false, 
            message: 'Failed to start Slack notification process',
            error: error.message
          }, { status: 500 }))
        })
      })

    } catch (error) {
      console.error('Error preparing Slack notification:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Error preparing Slack notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in Slack notification endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process Slack notification request' },
      { status: 500 }
    )
  }
} 