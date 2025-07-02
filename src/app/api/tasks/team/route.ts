import { NextRequest, NextResponse } from 'next/server'
import { generateTeamTasks } from '@/lib/openai'
import { TeamMember, Goal } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { teamMembers, goals } = await request.json()

    if (!teamMembers || !Array.isArray(teamMembers)) {
      return NextResponse.json(
        { error: 'Team members are required' },
        { status: 400 }
      )
    }

    // Generate tasks using OpenAI
    let teamTasks: Record<string, any[]>
    try {
      teamTasks = await generateTeamTasks(teamMembers as TeamMember[], goals as Goal[] || [])
    } catch (openaiError) {
      console.error('OpenAI generation failed, using fallback:', openaiError)
      
      // Fallback to mock data if OpenAI fails
      teamTasks = {}
      teamMembers.forEach((member: TeamMember) => {
        const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
        teamTasks[memberKey] = getMockTasksForRole(member.role === 'Custom' ? member.customRole || 'Marketing' : member.role, member.id)
      })
    }

    return NextResponse.json({ teamTasks })

  } catch (error) {
    console.error('Error in team tasks API:', error)
    return NextResponse.json(
      { error: 'Failed to generate team tasks' },
      { status: 500 }
    )
  }
}

function getMockTasksForRole(role: string, memberId: string) {
  const roleTasks: Record<string, any[]> = {
    'Marketing': [
      {
        title: "Plan Instagram content calendar",
        reason: "Increase brand visibility and engagement with consistent content",
        priority: 'high'
      },
      {
        title: "Analyze campaign performance",
        reason: "Optimize marketing ROI based on data insights",
        priority: 'medium'
      },
      {
        title: "Draft newsletter content",
        reason: "Improve customer retention through regular communication",
        priority: 'medium'
      }
    ],
    'Sales': [
      {
        title: "Follow up with warm leads",
        reason: "Convert prospects to paying customers",
        priority: 'high'
      },
      {
        title: "Update CRM pipeline",
        reason: "Maintain accurate sales forecasting",
        priority: 'medium'
      },
      {
        title: "Prepare Q4 sales presentation",
        reason: "Close more deals with compelling pitch materials",
        priority: 'high'
      }
    ],
    'Product': [
      {
        title: "Review user feedback",
        reason: "Identify improvement opportunities from customer insights",
        priority: 'high'
      },
      {
        title: "Update product roadmap",
        reason: "Align development with market needs",
        priority: 'medium'
      },
      {
        title: "Conduct user interviews",
        reason: "Validate product-market fit for new features",
        priority: 'high'
      }
    ],
    'Design': [
      {
        title: "Create mobile wireframes",
        reason: "Improve user experience on mobile devices",
        priority: 'high'
      },
      {
        title: "Update brand guidelines",
        reason: "Ensure visual consistency across all touchpoints",
        priority: 'medium'
      },
      {
        title: "Design onboarding flow",
        reason: "Reduce user drop-off and increase activation",
        priority: 'high'
      }
    ],
    'Ops': [
      {
        title: "Review team workflows",
        reason: "Increase operational efficiency across the organization",
        priority: 'high'
      },
      {
        title: "Analyze team metrics",
        reason: "Data-driven optimization of team performance",
        priority: 'medium'
      },
      {
        title: "Optimize tools stack",
        reason: "Reduce costs while improving productivity",
        priority: 'medium'
      }
    ]
  }

  const baseTasks = roleTasks[role] || [
    {
      title: "Review weekly objectives",
      reason: "Stay aligned with company goals and priorities",
      priority: 'medium'
    },
    {
      title: "Complete high-priority tasks",
      reason: "Meet project deadlines and deliver results",
      priority: 'high'
    }
  ]

  return baseTasks.map((task, index) => ({
    id: `api-${memberId}-${index}-${Date.now()}`,
    title: task.title,
    description: `Detailed implementation of ${task.title.toLowerCase()}`,
    reason: task.reason,
    priority: task.priority,
    completed: false,
    dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
    assignedTo: memberId
  }))
} 