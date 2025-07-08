import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { RLTask } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const approvedTasksPath = join(process.cwd(), 'approved_tasks.json')
    
    try {
      const fileContent = await readFile(approvedTasksPath, 'utf-8')
      const approvedTasks = JSON.parse(fileContent)
      
      // Convert approved tasks to RLTask format for the UI
      const rlTasks: RLTask[] = approvedTasks.map((task: any) => {
        const recommendation = task.recommendation || {}
        
        return {
          id: `rl-approved-${task.approved_at || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: recommendation.user_id || 'unknown',
          title: `${recommendation.action || 'Restock'} ${recommendation.quantity || 0} units of ${recommendation.item || 'Unknown Item'}`,
          description: `AI-approved ${recommendation.action || 'restock'} of ${recommendation.quantity || 0} units for ${recommendation.category || 'Unknown Category'} (${recommendation.item || 'Unknown Item'}) to optimize inventory levels and maximize revenue.`,
          action: recommendation.action || 'restock',
          quantity: recommendation.quantity || 0,
          predicted_roi: recommendation.expected_roi || '0%',
          confidence_score: recommendation.confidence || 'unknown',
          explanation: recommendation.reasoning || 'No reasoning provided',
          priority: recommendation.confidence === 'high' ? 'high' : recommendation.confidence === 'medium' ? 'medium' : 'low',
          completed: false,
          approved: true, // These are approved tasks
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
          createdAt: new Date(task.approved_at || Date.now()),
          rlData: {
            expected_roi: recommendation.expected_roi || '0%',
            confidence: recommendation.confidence || 'unknown',
            reasoning: recommendation.reasoning || 'No reasoning provided',
            timestamp: recommendation.timestamp || new Date().toISOString(),
            alternative_actions: recommendation.alternative_actions || []
          }
        }
      })
      
      return NextResponse.json({ 
        success: true,
        tasks: rlTasks,
        count: rlTasks.length
      })
      
    } catch (fileError) {
      // File doesn't exist or is empty
      return NextResponse.json({ 
        success: true,
        tasks: [],
        count: 0,
        message: 'No approved tasks found'
      })
    }
    
  } catch (error) {
    console.error('Error fetching approved tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approved tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, action } = body
    
    if (!taskId || !action) {
      return NextResponse.json({ error: 'Task ID and action are required' }, { status: 400 })
    }
    
    if (action === 'complete') {
      // Mark task as completed
      const approvedTasksPath = join(process.cwd(), 'approved_tasks.json')
      
      try {
        const fileContent = await readFile(approvedTasksPath, 'utf-8')
        const approvedTasks = JSON.parse(fileContent)
        
        // Find and update the task
        const taskIndex = approvedTasks.findIndex((task: any) => {
          const taskIdFromData = `rl-approved-${task.approved_at || Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          return taskIdFromData === taskId || task.id === taskId
        })
        
        if (taskIndex !== -1) {
          approvedTasks[taskIndex].completed = true
          approvedTasks[taskIndex].completed_at = new Date().toISOString()
          
          // Write back to file
          await writeFile(approvedTasksPath, JSON.stringify(approvedTasks, null, 2))
          
          return NextResponse.json({ 
            success: true,
            message: 'Task marked as completed'
          })
        } else {
          return NextResponse.json({ 
            error: 'Task not found' 
          }, { status: 404 })
        }
        
      } catch (fileError) {
        return NextResponse.json({ 
          error: 'No approved tasks file found' 
        }, { status: 404 })
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid action' 
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error updating approved task:', error)
    return NextResponse.json(
      { error: 'Failed to update approved task' },
      { status: 500 }
    )
  }
} 