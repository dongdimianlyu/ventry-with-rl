import { NextRequest, NextResponse } from 'next/server'
import { generateDailyTasks, generateTeamTasks } from '@/lib/openai'
import { Goal, Task, TaskGenerationContext, TeamMember, TeamTask } from '@/types'
import { knowledgeBase } from '@/data/knowledge-base'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goals, previousTasks, teamMembers, taskType = 'individual' } = body

    // Validate required fields for individual tasks
    if (taskType === 'individual' && (!goals || !Array.isArray(goals))) {
      return NextResponse.json(
        { error: 'Goals array is required for individual task generation' },
        { status: 400 }
      )
    }

    // Validate required fields for team tasks
    if (taskType === 'team' && (!teamMembers || !Array.isArray(teamMembers))) {
      return NextResponse.json(
        { error: 'Team members array is required for team task generation' },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (taskType === 'team') {
      // Generate team tasks
      if (!openaiApiKey) {
        // Return mock team tasks if no API key
        const mockTeamTasks: Record<string, TeamTask[]> = {}
        teamMembers.forEach((member: TeamMember, index: number) => {
          const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
          mockTeamTasks[memberKey] = generateMockTasksForRole(member.role, index)
        })
        return NextResponse.json({ teamTasks: mockTeamTasks })
      }

      try {
        const teamTasks = await generateTeamTasks(teamMembers, goals || [])
        return NextResponse.json({ teamTasks })
      } catch (error) {
        console.error('OpenAI team task generation failed:', error)
        // Fallback to mock tasks
        const mockTeamTasks: Record<string, TeamTask[]> = {}
        teamMembers.forEach((member: TeamMember, index: number) => {
          const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
          mockTeamTasks[memberKey] = generateMockTasksForRole(member.role, index)
        })
        return NextResponse.json({ teamTasks: mockTeamTasks })
      }
    } else {
      // Generate individual tasks (existing logic)
      if (!openaiApiKey) {
        // Return mock tasks if no API key
        const mockTasks: Omit<Task, 'id' | 'userId' | 'createdAt'>[] = [
          {
            title: "Review Q4 sales pipeline and identify top 5 leads",
            description: "Analyze current pipeline, prioritize high-value prospects, and create follow-up plan for this week.",
            explanation: "Based on your revenue growth goal, focusing on pipeline acceleration is critical. Sales data shows that concentrated follow-up efforts increase close rates by 35%.",
            priority: 'high' as const,
            completed: false,
            dueDate: new Date(),
            relatedGoalIds: []
          },
          {
            title: "Conduct customer retention analysis",
            description: "Review churn data from last month, identify patterns, and create action plan for at-risk customers.",
            explanation: "Your retention goals align with industry best practices showing that reducing churn by 5% can increase profitability by 25-95%. Early intervention is key.",
            priority: 'high' as const,
            completed: false,
            dueDate: new Date(),
            relatedGoalIds: []
          },
          {
            title: "Schedule team 1:1s for goal alignment",
            description: "Book individual meetings with each team member to discuss quarterly objectives and address any blockers.",
            explanation: "Strategic planning research shows teams with clear goal alignment achieve 2.5x better performance. This directly supports your operational efficiency goals.",
            priority: 'medium' as const,
            completed: false,
            dueDate: new Date(),
            relatedGoalIds: []
          }
        ]
        return NextResponse.json({ tasks: mockTasks })
      }

      try {
        const context: TaskGenerationContext = {
          goals,
          previousTasks: previousTasks || [],
          knowledgeBase,
          timeframe: 'today'
        }

        const tasks = await generateDailyTasks(context)
        return NextResponse.json({ tasks })
      } catch (error) {
        console.error('OpenAI task generation failed:', error)
        
        // Return fallback mock tasks
        const mockTasks: Omit<Task, 'id' | 'userId' | 'createdAt'>[] = [
          {
            title: "Review quarterly objectives and key results",
            description: "Assess progress on current OKRs and identify areas needing attention.",
            explanation: "Regular OKR reviews ensure strategic alignment and help identify course corrections early.",
            priority: 'high' as const,
            completed: false,
            dueDate: new Date(),
            relatedGoalIds: goals.map((g: Goal) => g.id)
          },
          {
            title: "Analyze key performance metrics",
            description: "Review dashboard metrics and identify trends or anomalies requiring action.",
            explanation: "Data-driven decision making is crucial for achieving your stated business goals.",
            priority: 'medium' as const,
            completed: false,
            dueDate: new Date(),
            relatedGoalIds: []
          }
        ]
        return NextResponse.json({ tasks: mockTasks })
      }
    }
  } catch (error) {
    console.error('Task generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    )
  }
}

function generateMockTasksForRole(role: string, index: number): TeamTask[] {
  const roleTasks: Record<string, TeamTask[]> = {
    'Marketing': [
      { id: `marketing-${index}-1`, title: "Plan Instagram content for the week", reason: "Increase brand visibility and engagement", priority: 'high' as const, completed: false },
      { id: `marketing-${index}-2`, title: "Draft monthly email newsletter", reason: "Improve customer retention through communication", priority: 'medium' as const, completed: false },
      { id: `marketing-${index}-3`, title: "Analyze social media performance metrics", reason: "Optimize content strategy based on data", priority: 'low' as const, completed: false }
    ],
    'Sales': [
      { id: `sales-${index}-1`, title: "Follow up with warm leads from last week", reason: "Convert prospects into paying customers", priority: 'high' as const, completed: false },
      { id: `sales-${index}-2`, title: "Update CRM with recent customer interactions", reason: "Maintain accurate sales pipeline data", priority: 'medium' as const, completed: false },
      { id: `sales-${index}-3`, title: "Schedule demo calls for qualified prospects", reason: "Move opportunities through the sales funnel", priority: 'high' as const, completed: false }
    ],
    'Product': [
      { id: `product-${index}-1`, title: "Review user feedback from latest feature release", reason: "Identify improvement opportunities", priority: 'high' as const, completed: false },
      { id: `product-${index}-2`, title: "Update product roadmap based on customer requests", reason: "Align development with market needs", priority: 'medium' as const, completed: false },
      { id: `product-${index}-3`, title: "Conduct competitive analysis", reason: "Stay ahead of market trends", priority: 'low' as const, completed: false }
    ],
    'Design': [
      { id: `design-${index}-1`, title: "Create wireframes for mobile app redesign", reason: "Improve user experience and engagement", priority: 'high' as const, completed: false },
      { id: `design-${index}-2`, title: "Update brand guidelines documentation", reason: "Ensure consistent visual identity", priority: 'medium' as const, completed: false },
      { id: `design-${index}-3`, title: "Design new landing page for campaign", reason: "Support marketing conversion goals", priority: 'high' as const, completed: false }
    ],
    'Ops': [
      { id: `ops-${index}-1`, title: "Review and optimize current workflows", reason: "Increase operational efficiency", priority: 'high' as const, completed: false },
      { id: `ops-${index}-2`, title: "Analyze team productivity metrics", reason: "Identify bottlenecks and improvements", priority: 'medium' as const, completed: false },
      { id: `ops-${index}-3`, title: "Update company policies and procedures", reason: "Ensure compliance and clarity", priority: 'low' as const, completed: false }
    ]
  }

  return roleTasks[role] || [
    { id: `custom-${index}-1`, title: "Review weekly objectives", reason: "Stay aligned with team goals", priority: 'medium' as const, completed: false },
    { id: `custom-${index}-2`, title: "Complete assigned project tasks", reason: "Meet project deadlines", priority: 'high' as const, completed: false }
  ]
}