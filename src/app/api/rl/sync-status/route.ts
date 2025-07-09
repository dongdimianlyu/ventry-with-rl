import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const lastCheck = searchParams.get('lastCheck')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0)
    const result = {
      hasUpdates: false,
      newApprovals: [],
      newRejections: [],
      pendingCleared: false
    }

    // Check for new approved tasks
    const approvedTasksPath = join(process.cwd(), 'approved_tasks.json')
    try {
      const approvedFileStats = await stat(approvedTasksPath)
      if (approvedFileStats.mtime > lastCheckTime) {
        const fileContent = await readFile(approvedTasksPath, 'utf-8')
        const approvedTasks = JSON.parse(fileContent)
        
        // Find tasks approved after lastCheck and from Slack
        const newApprovals = approvedTasks.filter((task: any) => {
          const approvedAt = new Date(task.approved_at)
          return approvedAt > lastCheckTime && task.source === 'slack'
        })

        if (newApprovals.length > 0) {
          result.hasUpdates = true
          result.newApprovals = newApprovals.map((task: any) => {
            const recommendation = task.recommendation || {}
            return {
              id: `rl-approved-${task.approved_at}-${Math.random().toString(36).substr(2, 9)}`,
              userId: userId,
              title: `${recommendation.action || 'Restock'} ${recommendation.quantity || 0} units of ${recommendation.item || recommendation.product || 'Business Inventory'}`,
              description: `AI-approved ${recommendation.action || 'restock'} of ${recommendation.quantity || 0} units for ${recommendation.category || 'General Products'} (${recommendation.item || recommendation.product || 'Business Inventory'}) to optimize inventory levels and maximize revenue.`,
              action: recommendation.action || 'restock',
              quantity: recommendation.quantity || 0,
              predicted_roi: recommendation.expected_roi || '0%',
              confidence_score: recommendation.confidence || 'unknown',
              explanation: recommendation.reasoning || 'No reasoning provided',
              priority: recommendation.confidence === 'high' ? 'high' : recommendation.confidence === 'medium' ? 'medium' : 'low',
              completed: false,
              approved: true,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              createdAt: new Date(task.approved_at),
              rlData: {
                expected_roi: recommendation.expected_roi || '0%',
                confidence: recommendation.confidence || 'unknown',
                reasoning: recommendation.reasoning || 'No reasoning provided',
                timestamp: recommendation.timestamp || new Date().toISOString(),
                alternative_actions: recommendation.alternative_actions || []
              }
            }
          })
        }
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }

    // Check for new rejected tasks
    const rejectedTasksPath = join(process.cwd(), 'rejected_tasks.json')
    try {
      const rejectedFileStats = await stat(rejectedTasksPath)
      if (rejectedFileStats.mtime > lastCheckTime) {
        const fileContent = await readFile(rejectedTasksPath, 'utf-8')
        const rejectedTasks = JSON.parse(fileContent)
        
        // Find tasks rejected after lastCheck and from Slack
        const newRejections = rejectedTasks.filter((task: any) => {
          const rejectedAt = new Date(task.rejected_at)
          return rejectedAt > lastCheckTime && task.source === 'slack'
        })

        if (newRejections.length > 0) {
          result.hasUpdates = true
          result.newRejections = newRejections
        }
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }

    // Check if pending approvals have been cleared
    const pendingApprovalsPath = join(process.cwd(), 'pending_approvals.json')
    try {
      await stat(pendingApprovalsPath)
      // File exists, so there are still pending approvals
    } catch (error) {
      // File doesn't exist, so pending approvals have been cleared
      result.pendingCleared = true
      result.hasUpdates = true
    }

    return NextResponse.json({ 
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error syncing Slack status:', error)
    return NextResponse.json(
      { error: 'Failed to sync Slack status' },
      { status: 500 }
    )
  }
} 