import { NextRequest, NextResponse } from 'next/server'
import { generateDailyTasks, generateTeamTasks } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { goals, previousTasks, knowledgeBase, timeframe, teamMembers, generateForTeam = true } = await request.json()

    // Basic validation
    if (!goals || !Array.isArray(goals)) {
      return NextResponse.json(
        { error: 'Goals array is required' },
        { status: 400 }
      )
    }

    // Validate goals structure
    for (const goal of goals) {
      if (!goal.title || !goal.description || !goal.timeframe || !goal.priority) {
        return NextResponse.json(
          { error: 'Each goal must have title, description, timeframe, and priority' },
          { status: 400 }
        )
      }
    }

    const context = {
      goals: goals || [],
      previousTasks: previousTasks || [],
      knowledgeBase: knowledgeBase || [],
      timeframe: timeframe || 'today'
    }

    // Generate CEO tasks
    const ceoTasks = await generateDailyTasks(context)

    // Generate team tasks if team members are provided and generateForTeam is true
    let teamTasks = {}
    if (generateForTeam && teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
      try {
        // Validate team members structure
        for (const member of teamMembers) {
          if (!member.name || !member.role) {
            console.warn('Invalid team member structure, skipping team task generation')
            break
          }
        }
        
        teamTasks = await generateTeamTasks(teamMembers, goals)
      } catch (error) {
        console.warn('Team task generation failed:', error)
        // Continue without team tasks rather than failing entirely
      }
    }

    return NextResponse.json({ 
      tasks: ceoTasks,
      teamTasks,
      message: 'Tasks generated successfully'
    })

  } catch (error: unknown) {
    console.error('Error in task generation:', error)
    
    // Handle specific OpenAI errors
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
          error: 'Failed to generate tasks',
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