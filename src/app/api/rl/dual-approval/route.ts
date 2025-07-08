import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId, userId, source } = body
    
    if (!action || !taskId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (action === 'approve') {
      // Load the recommendation from the RL agent file
      const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
      let recommendation = null
      
      try {
        const fileContent = await readFile(rlAgentPath, 'utf-8')
        recommendation = JSON.parse(fileContent)
      } catch (error) {
        return NextResponse.json({ error: 'No recommendation found' }, { status: 404 })
      }
      
      // Create approved task entry
      const approvedTask = {
        id: taskId,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
        approved_via: source || 'UI',
        recommendation: recommendation
      }
      
      // Save to approved tasks file
      const approvedTasksPath = join(process.cwd(), 'approved_tasks.json')
      let approvedTasks = []
      
      try {
        const existingContent = await readFile(approvedTasksPath, 'utf-8')
        approvedTasks = JSON.parse(existingContent)
      } catch (error) {
        // File doesn't exist, start with empty array
      }
      
      approvedTasks.push(approvedTask)
      await writeFile(approvedTasksPath, JSON.stringify(approvedTasks, null, 2))
      
      // If approved via UI, send notification to Slack
      if (source === 'UI') {
        await sendSlackNotification('approved', recommendation, userId, taskId)
      }
      
      // Clean up pending approval if it exists
      try {
        const pendingPath = join(process.cwd(), 'pending_approvals.json')
        const pendingContent = await readFile(pendingPath, 'utf-8')
        const pendingData = JSON.parse(pendingContent)
        
        // Remove the pending approval file since it's now approved
        await writeFile(pendingPath, JSON.stringify({ ...pendingData, status: 'approved' }, null, 2))
      } catch (error) {
        // No pending approval file, that's fine
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Task approved successfully',
        approvedTask: approvedTask
      })
      
    } else if (action === 'reject') {
      // Load the recommendation
      const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
      let recommendation = null
      
      try {
        const fileContent = await readFile(rlAgentPath, 'utf-8')
        recommendation = JSON.parse(fileContent)
      } catch (error) {
        return NextResponse.json({ error: 'No recommendation found' }, { status: 404 })
      }
      
      // Create rejected task entry
      const rejectedTask = {
        id: taskId,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: userId,
        rejected_via: source || 'UI',
        recommendation: recommendation
      }
      
      // Save to rejected tasks file
      const rejectedTasksPath = join(process.cwd(), 'rejected_tasks.json')
      let rejectedTasks = []
      
      try {
        const existingContent = await readFile(rejectedTasksPath, 'utf-8')
        rejectedTasks = JSON.parse(existingContent)
      } catch (error) {
        // File doesn't exist, start with empty array
      }
      
      rejectedTasks.push(rejectedTask)
      await writeFile(rejectedTasksPath, JSON.stringify(rejectedTasks, null, 2))
      
      // If rejected via UI, send notification to Slack
      if (source === 'UI') {
        await sendSlackNotification('rejected', recommendation, userId, taskId)
      }
      
      // Clean up pending approval if it exists
      try {
        const pendingPath = join(process.cwd(), 'pending_approvals.json')
        const pendingContent = await readFile(pendingPath, 'utf-8')
        const pendingData = JSON.parse(pendingContent)
        
        // Remove the pending approval file since it's now rejected
        await writeFile(pendingPath, JSON.stringify({ ...pendingData, status: 'rejected' }, null, 2))
      } catch (error) {
        // No pending approval file, that's fine
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Task rejected successfully',
        rejectedTask: rejectedTask
      })
      
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in dual approval endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process approval request' },
      { status: 500 }
    )
  }
}

async function sendSlackNotification(action: string, recommendation: any, userId: string, taskId: string): Promise<void> {
  return new Promise((resolve) => {
    const pythonScript = `
import sys
import os
import json
import ssl
sys.path.append('.')

# Fix SSL certificate issues in development
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except:
    pass

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

try:
    from simple_slack_approval import SimpleSlackApproval
    
    approval = SimpleSlackApproval()
    
    action = "${action}"
    task_id = "${taskId}"
    user_id = "${userId}"
    
    if action == "approved":
        message = f"✅ **Task Approved via UI**\\n\\n**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units\\n**Expected ROI:** ${recommendation.expected_roi || 'N/A'}\\n**Confidence:** ${recommendation.confidence || 'N/A'}\\n**Approved by:** User {user_id}\\n**Task ID:** {task_id}\\n\\n**Status:** Approved via frontend UI and queued for execution\\n\\n**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}\\n\\nThe task has been approved and added to the execution queue."
    else:
        message = f"❌ **Task Rejected via UI**\\n\\n**Action:** ${recommendation.action || 'restock'} ${recommendation.quantity || 0} units\\n**Expected ROI:** ${recommendation.expected_roi || 'N/A'}\\n**Confidence:** ${recommendation.confidence || 'N/A'}\\n**Rejected by:** User {user_id}\\n**Task ID:** {task_id}\\n\\n**Status:** Rejected via frontend UI\\n\\n**AI Reasoning:** ${recommendation.reasoning || 'No reasoning provided'}\\n\\nThe recommendation has been logged as rejected."
    
    result = approval.client.chat_postMessage(
        channel=approval.channel_id,
        text=message,
        mrkdwn=True
    )
    
    if result["ok"]:
        print(f"✅ Slack notification sent successfully for {action}")
    else:
        print(f"❌ Failed to send Slack notification: {result}")
        
except Exception as e:
    print(f"❌ Error sending Slack notification: {e}")
`

    const slackProcess = spawn('python3', ['-c', pythonScript], {
      cwd: process.cwd(),
      stdio: 'pipe'
    })

    slackProcess.on('close', (code) => {
      resolve()
    })

    slackProcess.on('error', (error) => {
      console.error('Error sending Slack notification:', error)
      resolve()
    })
  })
} 