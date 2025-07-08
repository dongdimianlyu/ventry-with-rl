import { NextRequest, NextResponse } from 'next/server'
import { RLTask } from '@/types'

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
        action: 'monitor',
        quantity: 0,
        expected_roi: '0%',
        confidence: 'low',
        reasoning: 'Current inventory levels optimal for clothing category. AI recommends monitoring for 48 hours before taking action.',
        item: 'SKU-54321',
        category: 'Clothing'
      }
    ]

    // Pick a random recommendation
    const selectedRec = simulatedRecommendations[Math.floor(Math.random() * simulatedRecommendations.length)]
    
    // Only return actionable recommendations (not monitor)
    if (selectedRec.action === 'monitor') {
      return NextResponse.json({ 
        message: 'No actionable recommendations at this time',
        rlTask: null 
      })
    }

    // Convert to RLTask format
    const rlTask: RLTask = {
      id: `rl-sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: `${selectedRec.action === 'restock' ? 'Restock' : selectedRec.action} ${selectedRec.quantity} units of ${selectedRec.item}`,
      description: `AI recommends immediate ${selectedRec.action} of ${selectedRec.quantity} units for ${selectedRec.category} category (${selectedRec.item}) to optimize inventory levels and maximize revenue.`,
      action: selectedRec.action,
      quantity: selectedRec.quantity,
      predicted_roi: selectedRec.expected_roi,
      confidence_score: selectedRec.confidence,
      explanation: selectedRec.reasoning,
      priority: selectedRec.confidence === 'high' ? 'high' : selectedRec.confidence === 'medium' ? 'medium' : 'low',
      completed: false,
      approved: null,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
      createdAt: new Date(),
      rlData: {
        expected_roi: selectedRec.expected_roi,
        confidence: selectedRec.confidence,
        reasoning: selectedRec.reasoning,
        timestamp: new Date().toISOString(),
        alternative_actions: []
      }
    }

    return NextResponse.json({ 
      message: 'Simulated RL task generated successfully',
      rlTask: rlTask 
    })
  } catch (error) {
    console.error('Error simulating RL task:', error)
    return NextResponse.json(
      { error: 'Failed to simulate RL task' },
      { status: 500 }
    )
  }
} 