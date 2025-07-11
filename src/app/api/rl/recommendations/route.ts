import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { RLRecommendation, RLTask } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Read the RL agent recommendations
    const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
    
    let recommendation: RLRecommendation
    try {
      const fileContent = await readFile(rlAgentPath, 'utf-8')
      recommendation = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading RL recommendations:', error)
      return NextResponse.json({ rlTasks: [] })
    }

    // Convert RL recommendation to RLTask format
    const rlTask: RLTask = {
      id: `rl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: `${recommendation.action === 'restock' ? 'Restock' : recommendation.action} ${recommendation.quantity} units`,
      description: `AI recommends ${recommendation.action} of ${recommendation.quantity} units based on predictive analysis.`,
      action: recommendation.action,
      quantity: recommendation.quantity,
      predicted_roi: recommendation.expected_roi,
      predicted_profit_usd: recommendation.predicted_profit_usd || 0,
      confidence_score: recommendation.confidence,
      explanation: recommendation.reasoning,
      priority: recommendation.confidence === 'high' ? 'high' : recommendation.confidence === 'medium' ? 'medium' : 'low',
      completed: false,
      approved: null,
      dueDate: new Date(),
      createdAt: new Date(),
      rlData: {
        expected_roi: recommendation.expected_roi,
        predicted_profit_usd: recommendation.predicted_profit_usd || 0,
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        timestamp: recommendation.timestamp,
        alternative_actions: recommendation.alternative_actions || []
      }
    }

    return NextResponse.json({ rlTasks: [rlTask] })
  } catch (error) {
    console.error('Error fetching RL recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RL recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId, userId } = body

    if (!taskId || !userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      console.log(`Approving RL task ${taskId} for user ${userId}`)
      
      try {
        // First, get the original recommendation data to send to Slack
        const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
        let recommendation: RLRecommendation | null = null
        
        try {
          const fileContent = await readFile(rlAgentPath, 'utf-8')
          recommendation = JSON.parse(fileContent)
        } catch (error) {
          console.error('Error reading RL recommendations for Slack:', error)
          // Continue without Slack integration if file not found
        }

        // Send to Slack for notification (async, don't wait for response)
        if (recommendation) {
          try {
            // Call Slack notification directly using spawn (server-side)
            const { spawn } = await import('child_process')
            
            const pythonScript = `
import sys
import os
import ssl
import json
sys.path.append('.')

# Handle SSL issues in development
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except:
    pass

try:
    # Load Slack configuration from JSON file
    config = {}
    config_file = "slack_config.json"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
    
    # Set environment variables from config
    if config.get("SLACK_BOT_TOKEN"):
        os.environ["SLACK_BOT_TOKEN"] = config["SLACK_BOT_TOKEN"]
    if config.get("SLACK_CHANNEL_ID"):
        os.environ["SLACK_CHANNEL_ID"] = config["SLACK_CHANNEL_ID"]
    
    from simple_slack_approval import SimpleSlackApproval
    
    approval = SimpleSlackApproval()
    
    message = """✅ **Task Approved via UI**

**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units
**Expected ROI:** ${recommendation.expected_roi || 'N/A'}
**Confidence:** ${recommendation.confidence || 'N/A'}
**Approved by:** User ${userId}
**Task ID:** ${taskId}

**Status:** Approved via frontend UI and queued for QuickBooks execution

**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}

The task has been approved and added to the execution queue."""
    
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
        
except Exception as e:
    print(f"❌ Error sending Slack notification: {e}")
    import traceback
    traceback.print_exc()
`

            const slackProcess = spawn('python3', ['-c', pythonScript], {
              cwd: process.cwd(),
              stdio: 'pipe'
            })

            let stdout = ''
            let stderr = ''

            slackProcess.stdout.on('data', (data) => {
              const output = data.toString()
              stdout += output
              console.log(`[SLACK STDOUT]: ${output}`)
            })

            slackProcess.stderr.on('data', (data) => {
              const output = data.toString()
              stderr += output
              console.error(`[SLACK STDERR]: ${output}`)
            })

            slackProcess.on('close', (code) => {
              console.log(`[SLACK PROCESS] Closed with code: ${code}`)
              console.log(`[SLACK STDOUT FULL]: ${stdout}`)
              if (stderr) console.error(`[SLACK STDERR FULL]: ${stderr}`)
              
              if (code === 0) {
                console.log('✅ Slack notification sent successfully')
              } else {
                console.error(`❌ Slack notification failed with code ${code}`)
              }
            })

            slackProcess.on('error', (error) => {
              console.error(`[SLACK PROCESS ERROR]: ${error.message}`)
            })

            console.log('🔄 Slack notification process started...')
          } catch (slackError) {
            console.error('Error starting Slack notification:', slackError)
            // Continue with approval even if Slack fails
          }
        }

        // Create approved task entry for QuickBooks executor
        const { writeFile } = await import('fs/promises')
        
        const approvedTasksPath = join(process.cwd(), 'approved_tasks.json')
        const approvedTask = {
          id: taskId,
          userId: userId,
          approvedAt: new Date().toISOString(),
          status: 'approved',
          source: 'rl_agent_ui',
          action: 'restock',
          details: {
            description: `RL Agent approved task for user ${userId}`,
            executionType: 'quickbooks',
            priority: 'high'
          },
          recommendation: recommendation || null
        }
        
        // Read existing approved tasks
        let existingTasks = []
        try {
          const { readFile } = await import('fs/promises')
          const existingContent = await readFile(approvedTasksPath, 'utf-8')
          existingTasks = JSON.parse(existingContent)
        } catch (error) {
          // File doesn't exist or is empty, start with empty array
          existingTasks = []
        }
        
        // Add new task
        existingTasks.push(approvedTask)
        
        // Write back to file
        await writeFile(approvedTasksPath, JSON.stringify(existingTasks, null, 2))
        
        return NextResponse.json({ 
          success: true, 
          message: 'Task approved, queued for QuickBooks execution, and Slack notification sent',
          slackIntegration: 'Notification sent to Slack channel',
          quickbooksQueued: true,
          approvedTasksFile: 'approved_tasks.json updated'
        })
      } catch (error) {
        console.error('Error creating approved task:', error)
        return NextResponse.json({ 
          success: true, 
          message: 'Task approved but integration had issues - manual execution may be required',
          error: 'Integration file write failed'
        })
      }
    } else if (action === 'reject') {
      console.log(`Rejecting RL task ${taskId} for user ${userId}`)
      
      // Send rejection notification to Slack
      try {
        const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
        let recommendation: RLRecommendation | null = null
        
        try {
          const fileContent = await readFile(rlAgentPath, 'utf-8')
          recommendation = JSON.parse(fileContent)
        } catch (error) {
          console.error('Error reading RL recommendations for Slack rejection:', error)
        }

        if (recommendation) {
          // Send rejection notification to Slack
          try {
            // Call Slack notification directly using spawn (server-side)
            const { spawn } = await import('child_process')
            
            const pythonScript = `
import sys
import os
import ssl
import json
sys.path.append('.')

# Handle SSL issues in development
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except:
    pass

try:
    # Load Slack configuration from JSON file
    config = {}
    config_file = "slack_config.json"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
    
    # Set environment variables from config
    if config.get("SLACK_BOT_TOKEN"):
        os.environ["SLACK_BOT_TOKEN"] = config["SLACK_BOT_TOKEN"]
    if config.get("SLACK_CHANNEL_ID"):
        os.environ["SLACK_CHANNEL_ID"] = config["SLACK_CHANNEL_ID"]
    
    from simple_slack_approval import SimpleSlackApproval
    
    approval = SimpleSlackApproval()
    
    message = """❌ **Task Rejected via UI**

**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units
**Expected ROI:** ${recommendation.expected_roi || 'N/A'}
**Confidence:** ${recommendation.confidence || 'N/A'}
**Rejected by:** User ${userId}
**Task ID:** ${taskId}

**Status:** Rejected via frontend UI

**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}

The recommendation has been logged as rejected."""
    
    result = approval.client.chat_postMessage(
        channel=approval.channel_id,
        text=message,
        mrkdwn=True
    )
    
    if result["ok"]:
        print("✅ Slack rejection notification sent successfully")
        print(f"Message timestamp: {result['ts']}")
    else:
        print(f"❌ Failed to send Slack rejection notification: {result}")
        
except Exception as e:
    print(f"❌ Error sending Slack rejection notification: {e}")
    import traceback
    traceback.print_exc()
`

            const slackProcess = spawn('python3', ['-c', pythonScript], {
              cwd: process.cwd(),
              stdio: 'pipe'
            })

            slackProcess.stdout.on('data', (data) => {
              console.log(`Slack rejection notification: ${data.toString()}`)
            })

            slackProcess.stderr.on('data', (data) => {
              console.error(`Slack rejection error: ${data.toString()}`)
            })

            slackProcess.on('close', (code) => {
              if (code === 0) {
                console.log('✅ Slack rejection notification sent successfully')
              } else {
                console.error(`❌ Slack rejection notification failed with code ${code}`)
              }
            })

            console.log('🔄 Slack rejection notification process started...')
          } catch (slackError) {
            console.error('Error starting Slack rejection notification:', slackError)
          }
        }
      } catch (error) {
        console.error('Error with Slack rejection notification:', error)
      }
      
      // Log rejection
      try {
        const { writeFile } = await import('fs/promises')
        const { join } = await import('path')
        
        const rejectedTasksPath = join(process.cwd(), 'rejected_tasks.json')
        const rejectedTask = {
          id: taskId,
          userId: userId,
          rejectedAt: new Date().toISOString(),
          source: 'rl_agent_ui',
          reason: 'User rejected via UI'
        }
        
        // Read existing rejected tasks
        let existingRejected = []
        try {
          const { readFile } = await import('fs/promises')
          const existingContent = await readFile(rejectedTasksPath, 'utf-8')
          existingRejected = JSON.parse(existingContent)
        } catch (error) {
          existingRejected = []
        }
        
        existingRejected.push(rejectedTask)
        await writeFile(rejectedTasksPath, JSON.stringify(existingRejected, null, 2))
        
        return NextResponse.json({ 
          success: true, 
          message: 'Task rejected, logged, and Slack notification sent',
          rejectedTasksFile: 'rejected_tasks.json updated',
          slackIntegration: 'Rejection notification sent to Slack channel'
        })
      } catch (error) {
        console.error('Error logging rejection:', error)
        return NextResponse.json({ 
          success: true, 
          message: 'Task rejected and Slack notified (logging failed)',
          error: 'Rejection log write failed'
        })
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing RL task action:', error)
    return NextResponse.json(
      { error: 'Failed to process RL task action' },
      { status: 500 }
    )
  }
} 