import { NextRequest, NextResponse } from 'next/server'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || ''
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Slack OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent('Slack connection failed')}`, request.url)
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Missing required parameters', request.url)
      )
    }

    // Decode and validate OAuth state
    let oauthState
    try {
      oauthState = JSON.parse(decodeURIComponent(state))
    } catch (error) {
      console.error('Invalid OAuth state:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Invalid OAuth state', request.url)
      )
    }

    // Verify state timestamp (should be within 10 minutes)
    const stateAge = Date.now() - new Date(oauthState.createdAt).getTime()
    if (stateAge > 10 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=OAuth state expired', request.url)
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData.error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent('Failed to connect to Slack')}`, request.url)
      )
    }

    // Create connection object
    const connection = {
      id: `slack-${oauthState.userId}-${Date.now()}`,
      userId: oauthState.userId,
      teamId: tokenData.team.id,
      teamName: tokenData.team.name,
      accessToken: tokenData.access_token,
      botUserId: tokenData.bot_user_id,
      scope: tokenData.scope.split(','),
      connectedAt: new Date(),
      lastSyncAt: new Date(),
      isActive: true,
      appId: tokenData.app_id
    }

    // In a real implementation, save to database
    // For demo purposes, save to localStorage via client-side redirect
    console.log('Slack connection established:', connection)

    // Redirect to success page
    const redirectUrl = new URL(oauthState.returnUrl || '/dashboard/settings', request.url)
    redirectUrl.searchParams.set('slack_connected', 'true')
    redirectUrl.searchParams.set('team_name', connection.teamName)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error in Slack OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Connection failed', request.url)
    )
  }
} 