import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Simulate RL agent analysis with synthetic business data
    const simulatedRecommendations = [
      {
        action: 'restock',
        quantity: 50,
        expected_roi: '280.0%',
        confidence: 'high',
        reasoning: 'High-demand SKU showing consistent sales velocity with low inventory levels. Predictive model indicates 85% probability of stockout within 7 days.',
        item: 'SKU-12345',
        category: 'Electronics'
      },
      {
        action: 'restock',
        quantity: 25,
        expected_roi: '195.0%',
        confidence: 'medium',
        reasoning: 'Seasonal uptick detected for home goods category. Machine learning model predicts 3x sales increase over next 14 days based on historical patterns.',
        item: 'SKU-67890',
        category: 'Home Goods'
      },
      {
        action: 'restock',
        quantity: 75,
        expected_roi: '320.0%',
        confidence: 'high',
        reasoning: 'Critical inventory shortage detected. AI analysis shows immediate restocking will prevent lost sales and maximize Q1 revenue.',
        item: 'SKU-99999',
        category: 'Best Sellers'
      }
    ]

    // Pick a random recommendation (only actionable ones)
    const actionableRecs = simulatedRecommendations.filter(rec => rec.action !== 'monitor')
    const selectedRec = actionableRecs[Math.floor(Math.random() * actionableRecs.length)]
    
    // Create recommendation in RL agent format
    const recommendation = {
      action: selectedRec.action,
      quantity: selectedRec.quantity,
      expected_roi: selectedRec.expected_roi,
      confidence: selectedRec.confidence,
      reasoning: selectedRec.reasoning,
      item: selectedRec.item,
      category: selectedRec.category,
      timestamp: new Date().toISOString(),
      generated_at: new Date().toISOString(),
      user_id: userId,
      alternative_actions: [
        {
          action: 'restock',
          quantity: Math.floor(selectedRec.quantity * 0.5),
          expected_roi: `${Math.floor(parseFloat(selectedRec.expected_roi) * 0.7)}%`
        },
        {
          action: 'restock', 
          quantity: Math.floor(selectedRec.quantity * 1.5),
          expected_roi: `${Math.floor(parseFloat(selectedRec.expected_roi) * 1.2)}%`
        }
      ]
    }

    // Write to RL agent recommendations file
    const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
    await writeFile(rlAgentPath, JSON.stringify(recommendation, null, 2))

    // Create RLTask for UI display (pending approval)
    const rlTask = {
      id: `rl-sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: `${recommendation.action === 'restock' ? 'Restock' : recommendation.action} ${recommendation.quantity} units of ${recommendation.item}`,
      description: `AI recommends immediate ${recommendation.action} of ${recommendation.quantity} units for ${recommendation.category} category (${recommendation.item}) to optimize inventory levels and maximize revenue.`,
      action: recommendation.action,
      quantity: recommendation.quantity,
      predicted_roi: recommendation.expected_roi,
      confidence_score: recommendation.confidence,
      explanation: recommendation.reasoning,
      priority: recommendation.confidence === 'high' ? 'high' : recommendation.confidence === 'medium' ? 'medium' : 'low',
      completed: false,
      approved: null, // Pending approval
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      rlData: {
        expected_roi: recommendation.expected_roi,
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        timestamp: recommendation.timestamp,
        alternative_actions: recommendation.alternative_actions
      }
    }

    // Trigger Slack approval workflow (parallel to UI)
    const slackResult = await triggerSlackApproval()
    
    return NextResponse.json({ 
      message: 'RL task generated - approve in Slack or UI',
      recommendation: recommendation,
      rlTask: rlTask,
      slackStatus: slackResult.success ? 'sent' : 'failed',
      slackError: slackResult.success ? undefined : slackResult.error
    })

  } catch (error) {
    console.error('Error simulating RL task:', error)
    return NextResponse.json(
      { error: 'Failed to simulate RL task' },
      { status: 500 }
    )
  }
}

async function triggerSlackApproval(): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // Use Python script to send to Slack with environment variable loading and SSL fix
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
    success = approval.send_recommendation()
    
    if success:
        print("✅ Recommendation sent to Slack successfully")
        print("Reply with Y or N in Slack to approve/reject")
    else:
        print("❌ Failed to send recommendation to Slack")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error sending to Slack: {e}")
    sys.exit(1)
`

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
        console.log('✅ Slack approval request sent successfully')
        console.log('Stdout:', stdout)
        resolve({ success: true })
      } else {
        console.error(`❌ Slack approval request failed with code ${code}`)
        console.error('Stderr:', stderr)
        resolve({ success: false, error: stderr.trim() || 'Unknown error' })
      }
    })

    slackProcess.on('error', (error) => {
      console.error('Error starting Slack process:', error)
      resolve({ success: false, error: error.message })
    })
  })
} 