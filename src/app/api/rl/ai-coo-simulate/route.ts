import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, useAICOO = true } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use the AI COO system to generate comprehensive business recommendations
    const aiCOORecommendation = await generateAICOORecommendation(userId, useAICOO)
    
    if (!aiCOORecommendation) {
      return NextResponse.json({ error: 'Failed to generate AI COO recommendation' }, { status: 500 })
    }

    // Create RLTask for UI display (pending approval)
    const rlTask = {
      id: `ai-coo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: formatAICOOTitle(aiCOORecommendation),
      description: formatAICOODescription(aiCOORecommendation),
      action: aiCOORecommendation.action,
      category: aiCOORecommendation.category || 'business_operations',
      quantity: aiCOORecommendation.quantity || 0,
      predicted_roi: aiCOORecommendation.expected_roi,
      predicted_profit_usd: aiCOORecommendation.predicted_profit_usd,
      confidence_score: aiCOORecommendation.confidence,
      explanation: aiCOORecommendation.reasoning,
      priority: mapConfidenceToPriority(aiCOORecommendation.confidence),
      completed: false,
      approved: null, // Pending approval
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours for business operations
      createdAt: new Date(),
      rlData: {
        expected_roi: aiCOORecommendation.expected_roi,
        predicted_profit_usd: aiCOORecommendation.predicted_profit_usd,
        confidence: aiCOORecommendation.confidence,
        reasoning: aiCOORecommendation.reasoning,
        timestamp: aiCOORecommendation.timestamp,
        category: aiCOORecommendation.category,
        alternative_actions: aiCOORecommendation.alternative_actions || [],
        ai_coo_model: useAICOO,
        comprehensive_analysis: true,
        business_analysis: aiCOORecommendation.business_analysis || {},
        recommendations_by_category: aiCOORecommendation.recommendations_by_category || {},
        comprehensive_plan: aiCOORecommendation.comprehensive_plan || {}
      }
    }

    // Save to pending approvals
    await savePendingApproval(rlTask)

    // Save recommendation to the format/location Slack script expects
    await saveRecommendationForSlack(aiCOORecommendation)

    // Trigger Slack notification for approval
    await triggerSlackApproval()

    return NextResponse.json({
      success: true,
      task: rlTask,
      message: 'AI COO recommendation generated and sent for approval',
      ai_coo_features: {
        comprehensive_analysis: true,
        multi_category_recommendations: true,
        business_plan_generation: true,
        roi_optimization: true
      }
    })

  } catch (error) {
    console.error('Error in AI COO simulate:', error)
    return NextResponse.json({ 
      error: 'Failed to generate AI COO recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

interface AICOORecommendation {
  action: string
  description: string
  category?: string
  quantity?: number
  expected_roi: string
  predicted_profit_usd: number
  confidence: string
  reasoning: string
  timestamp: string
  business_analysis?: {
    average_profit: string
    recommendation_diversity: string
    total_recommendations: number
    categories_covered: string[]
  }
  recommendations_by_category?: Record<string, any[]>
  comprehensive_plan?: {
    immediate_actions: any[]
    short_term_initiatives: any[]
    strategic_priorities: any[]
  }
  alternative_actions?: any[]
}

async function generateAICOORecommendation(userId: string, useAICOO: boolean): Promise<AICOORecommendation | null> {
  return new Promise((resolve, reject) => {
    const pythonScript = join(process.cwd(), 'rl-agent', 'ai_coo_integration.py')
    const pythonProcess = spawn('python3', [pythonScript, userId, useAICOO.toString()], {
      cwd: join(process.cwd(), 'rl-agent'),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the JSON output from Python
          const lines = stdout.trim().split('\n')
          const jsonLine = lines.find(line => line.startsWith('{'))
          
          if (jsonLine) {
            const recommendation = JSON.parse(jsonLine)
            resolve(recommendation)
          } else {
            console.error('No valid JSON found in Python output:', stdout)
            resolve(null)
          }
        } catch (error) {
          console.error('Error parsing Python output:', error)
          console.error('Raw output:', stdout)
          resolve(null)
        }
      } else {
        console.error('Python process failed with code:', code)
        console.error('stderr:', stderr)
        console.error('stdout:', stdout)
        resolve(null)
      }
    })

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error)
      reject(error)
    })
  })
}

function formatAICOOTitle(recommendation: AICOORecommendation): string {
  const category = recommendation.category || 'business'
  const action = recommendation.action || 'optimize'
  
  const categoryTitles = {
    'inventory': 'Inventory Management',
    'marketing': 'Marketing Optimization',
    'financial': 'Financial Operations',
    'pricing': 'Pricing Strategy',
    'operational': 'Operational Excellence',
    'monitor': 'Business Monitoring'
  }
  
  const categoryTitle = categoryTitles[category as keyof typeof categoryTitles] || 'Business Operations'
  
  if (recommendation.quantity && recommendation.quantity > 0) {
    return `${categoryTitle}: ${action} ${recommendation.quantity} units`
  } else {
    return `${categoryTitle}: ${recommendation.description}`
  }
}

function formatAICOODescription(recommendation: AICOORecommendation): string {
  const baseDescription = `Agent Recommends ${recommendation.description} with ${recommendation.expected_roi} expected ROI.`
  
  if (recommendation.business_analysis) {
    const analysis = recommendation.business_analysis
    const diversityNote = analysis.recommendation_diversity ? 
      ` Analysis covers ${analysis.categories_covered?.length || 0} business functions with ${analysis.recommendation_diversity} diversity score.` : ''
    
    return baseDescription + diversityNote
  }
  
  return baseDescription + ' This recommendation is part of a comprehensive business operations analysis.'
}

function mapConfidenceToPriority(confidence: string): 'low' | 'medium' | 'high' {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'high'
    case 'medium':
      return 'medium'
    case 'low':
    default:
      return 'low'
  }
}

async function savePendingApproval(task: any): Promise<void> {
  try {
    const pendingApprovalsPath = join(process.cwd(), 'pending_approvals.json')
    
    let pendingApprovals: any[] = []
    try {
      const existingData = await readFile(pendingApprovalsPath, 'utf-8')
      const parsed = JSON.parse(existingData)
      
      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        pendingApprovals = parsed
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Convert object to array if it's in object format
        pendingApprovals = Object.values(parsed)
      } else {
        pendingApprovals = []
      }
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      pendingApprovals = []
    }
    
    pendingApprovals.push(task)
    
    await writeFile(pendingApprovalsPath, JSON.stringify(pendingApprovals, null, 2))
  } catch (error) {
    console.error('Error saving pending approval:', error)
  }
}

async function saveRecommendationForSlack(recommendation: AICOORecommendation): Promise<void> {
  try {
    // Save to the path the Slack script expects: rl-agent/recommendations.json
    const rlAgentPath = join(process.cwd(), 'rl-agent', 'recommendations.json')
    
    // Convert AI COO recommendation to the format the Slack script expects
    const slackRecommendation = {
      action: recommendation.action,
      quantity: recommendation.quantity || 0,
      expected_roi: recommendation.expected_roi,
      confidence: recommendation.confidence,
      reasoning: recommendation.reasoning,
      item: recommendation.category || 'Business Operations',
      category: recommendation.category || 'business_operations',
      timestamp: recommendation.timestamp,
      generated_at: recommendation.timestamp,
      predicted_profit_usd: recommendation.predicted_profit_usd,
      alternative_actions: recommendation.alternative_actions || []
    }
    
    await writeFile(rlAgentPath, JSON.stringify(slackRecommendation, null, 2))
    console.log('✅ Saved recommendation for Slack to:', rlAgentPath)
  } catch (error) {
    console.error('Error saving recommendation for Slack:', error)
  }
}

async function triggerSlackApproval(): Promise<{ success: boolean; error?: string }> {
  try {
    const slackScript = join(process.cwd(), 'simple_slack_approval.py')
    
    return new Promise((resolve) => {
      const slackProcess = spawn('python3', [slackScript], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
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
          resolve({ success: true })
        } else {
          console.error('Slack notification failed:', stderr)
          resolve({ success: false, error: stderr })
        }
      })
      
      slackProcess.on('error', (error) => {
        console.error('Failed to start Slack process:', error)
        resolve({ success: false, error: error.message })
      })
    })
  } catch (error) {
    console.error('Error triggering Slack approval:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 