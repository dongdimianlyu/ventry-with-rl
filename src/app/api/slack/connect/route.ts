import { NextRequest, NextResponse } from 'next/server'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || ''
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/slack/callback`

export async function POST(request: NextRequest) {
  try {
    const { userId, returnUrl } = await request.json()

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!SLACK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Slack client ID not configured' },
        { status: 500 }
      )
    }

    // Generate OAuth state
    const state = JSON.stringify({
      userId,
      returnUrl: returnUrl || '/dashboard/settings',
      nonce: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    })

    // Generate Slack OAuth URL
    const scopes = ['chat:write', 'channels:read', 'im:write', 'im:read'].join(',')
    const params = new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      scope: scopes,
      redirect_uri: SLACK_REDIRECT_URI,
      state: encodeURIComponent(state),
      user_scope: 'identity.basic,identity.email'
    })

    const oauthUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`

    return NextResponse.json({
      success: true,
      oauthUrl,
      state
    })

  } catch (error) {
    console.error('Error initiating Slack connection:', error)
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    )
  }
} 