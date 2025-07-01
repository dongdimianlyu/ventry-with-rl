import { NextRequest, NextResponse } from 'next/server'
import { generateDailyTasks } from '@/lib/openai'
import { knowledgeBase } from '@/data/knowledge-base'

export async function POST(request: NextRequest) {
  try {
    const { goals, previousTasks } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if no OpenAI key is provided
      return NextResponse.json({
        tasks: [
          {
            title: "Review Q4 sales pipeline and identify top 5 leads",
            description: "Analyze current pipeline, prioritize high-value prospects, and create follow-up plan for this week.",
            explanation: "Based on your revenue growth goal, focusing on pipeline acceleration is critical. Sales data shows that concentrated follow-up efforts increase close rates by 35%.",
            priority: "high",
            completed: false,
            dueDate: new Date().toISOString(),
            relatedGoalIds: goals.filter((g: any) => g.title.toLowerCase().includes('revenue') || g.title.toLowerCase().includes('sales')).map((g: any) => g.id)
          },
          {
            title: "Conduct customer retention analysis",
            description: "Review churn data from last month, identify patterns, and create action plan for at-risk customers.",
            explanation: "Your retention goals align with industry best practices showing that reducing churn by 5% can increase profitability by 25-95%. Early intervention is key.",
            priority: "high",
            completed: false,
            dueDate: new Date().toISOString(),
            relatedGoalIds: goals.filter((g: any) => g.title.toLowerCase().includes('retention')).map((g: any) => g.id)
          },
          {
            title: "Schedule team 1:1s for goal alignment",
            description: "Book individual meetings with each team member to discuss quarterly objectives and address any blockers.",
            explanation: "Strategic planning research shows teams with clear goal alignment achieve 2.5x better performance. This directly supports your operational efficiency goals.",
            priority: "medium",
            completed: false,
            dueDate: new Date().toISOString(),
            relatedGoalIds: goals.map((g: any) => g.id)
          }
        ]
      })
    }

    const context = {
      goals,
      previousTasks: previousTasks || [],
      knowledgeBase,
      timeframe: 'today' as const
    }

    const tasks = await generateDailyTasks(context)
    
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error generating tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    )
  }
}