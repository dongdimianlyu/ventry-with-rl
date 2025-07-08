import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const pendingApprovalsPath = join(process.cwd(), 'pending_approvals.json')
    
    try {
      const fileContent = await readFile(pendingApprovalsPath, 'utf-8')
      const pendingData = JSON.parse(fileContent)
      
      // Check if the pending approval is still valid (not too old)
      const sentAt = new Date(pendingData.sent_at)
      const now = new Date()
      const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceSent > 24) {
        // Pending approval is too old, consider it expired
        return NextResponse.json({ 
          success: true,
          hasPendingApproval: false,
          message: 'No active pending approvals (expired)'
        })
      }
      
      const recommendation = pendingData.recommendation || {}
      
      return NextResponse.json({ 
        success: true,
        hasPendingApproval: true,
        pendingApproval: {
          messageTs: pendingData.message_ts,
          sentAt: pendingData.sent_at,
          status: pendingData.status,
          recommendation: {
            action: recommendation.action || 'restock',
            quantity: recommendation.quantity || 0,
            expectedRoi: recommendation.expected_roi || '0%',
            confidence: recommendation.confidence || 'unknown',
            reasoning: recommendation.reasoning || 'No reasoning provided',
            item: recommendation.item || 'Unknown Item',
            category: recommendation.category || 'Unknown Category',
            timestamp: recommendation.timestamp || recommendation.generated_at
          }
        }
      })
      
    } catch (fileError) {
      // File doesn't exist or is empty - no pending approvals
      return NextResponse.json({ 
        success: true,
        hasPendingApproval: false,
        message: 'No pending approvals found'
      })
    }
    
  } catch (error) {
    console.error('Error checking pending approvals:', error)
    return NextResponse.json(
      { error: 'Failed to check pending approvals' },
      { status: 500 }
    )
  }
} 