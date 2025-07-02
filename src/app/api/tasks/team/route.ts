import { NextRequest, NextResponse } from 'next/server'
import { generateTeamTasks } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { teamMembers, goals } = await request.json()

    // Validation
    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'Team members array is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (!goals || !Array.isArray(goals)) {
      return NextResponse.json(
        { error: 'Goals array is required' },
        { status: 400 }
      )
    }

    // Validate team members structure
    for (const member of teamMembers) {
      if (!member.name || !member.role) {
        return NextResponse.json(
          { error: 'Each team member must have a name and role' },
          { status: 400 }
        )
      }
    }

    // Validate goals structure
    for (const goal of goals) {
      if (!goal.title || !goal.description) {
        return NextResponse.json(
          { error: 'Each goal must have title and description' },
          { status: 400 }
        )
      }
    }

    const teamTasks = await generateTeamTasks(teamMembers, goals)

    return NextResponse.json({
      teamTasks,
      message: 'Team tasks generated successfully'
    })

  } catch (error: unknown) {
    console.error('Error generating team tasks:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('OpenAI client not available')) {
        return NextResponse.json(
          { 
            error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
            details: 'Check your .env.local file and ensure OPENAI_API_KEY is set correctly.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to generate team tasks',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 