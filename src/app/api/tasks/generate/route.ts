import { NextRequest, NextResponse } from 'next/server'
import { generateDailyTasks, generateTeamTasks, generateTaskSuggestions, generateTeamTaskSuggestions } from '@/lib/openai'
import { getOnboardingProfile, generateTaskContext } from '@/lib/utils'
import { generateShopifyTaskContext, isShopifyDataFresh } from '@/lib/shopify-task-integration'

export async function POST(request: NextRequest) {
  try {
    // Log that the API is being called
    console.log('📝 Task generation API called')
    
    const { goals, previousTasks, knowledgeBase, timeframe, teamMembers, generateForTeam = true, suggestionMode = false, previousTeamTasks, userId } = await request.json()

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

    // Get onboarding profile for personalized context
    let onboardingContext = ''
    if (userId) {
      const profile = getOnboardingProfile(userId)
      if (profile && profile.isOnboardingComplete) {
        onboardingContext = generateTaskContext(profile)
      }
    }

    // Enhanced knowledge base with onboarding context
    const enhancedKnowledgeBase = onboardingContext 
      ? [
          {
            id: 'onboarding-profile',
            title: 'Company Profile & Preferences',
            content: onboardingContext,
            category: 'operational-context' as const,
            tags: ['profile', 'context', 'personalization']
          },
          ...(knowledgeBase || [])
        ]
      : (knowledgeBase || [])

    // Generate Shopify context if available and fresh
    let shopifyContext = undefined
    if (userId && isShopifyDataFresh(userId)) {
      const context = await generateShopifyTaskContext(userId)
      if (context) {
        shopifyContext = context
        console.log('🛍️ Including Shopify business intelligence in task generation')
      }
    }

    const context = {
      goals: goals || [],
      previousTasks: previousTasks || [],
      knowledgeBase: enhancedKnowledgeBase,
      timeframe: timeframe || 'today',
      shopifyContext
    }

    if (suggestionMode) {
      // Generate task suggestions for modal selection
      const ceoSuggestions = await generateTaskSuggestions(context)

      // Generate team task suggestions if team members are provided and generateForTeam is true
      let teamSuggestions = {}
      if (generateForTeam && teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
        try {
          // Validate team members structure
          for (const member of teamMembers) {
            if (!member.name || !member.role) {
              console.warn('Invalid team member structure, skipping team task suggestion generation')
              break
            }
          }
          
          teamSuggestions = await generateTeamTaskSuggestions(teamMembers, goals)
        } catch (error) {
          console.warn('Team task suggestion generation failed:', error)
          // Continue without team suggestions rather than failing entirely
        }
      }

      return NextResponse.json({ 
        ceoSuggestions,
        teamSuggestions,
        message: 'Task suggestions generated successfully',
        onboardingContext: onboardingContext ? 'Personalized based on your profile' : 'Using default context'
      })
    } else {
      // Generate actual tasks (original behavior)
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
          
          teamTasks = await generateTeamTasks(teamMembers, goals, previousTeamTasks)
        } catch (error) {
          console.warn('Team task generation failed:', error)
          // Continue without team tasks rather than failing entirely
        }
      }

      return NextResponse.json({ 
        tasks: ceoTasks,
        teamTasks,
        message: 'Tasks generated successfully',
        onboardingContext: onboardingContext ? 'Personalized based on your profile' : 'Using default context'
      })
    }

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