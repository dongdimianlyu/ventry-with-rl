import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Test QuickBooks configuration
  const qbClientId = process.env.QB_CLIENT_ID || process.env.QUICKBOOKS_CLIENT_ID
  const qbClientSecret = process.env.QB_CLIENT_SECRET || process.env.QUICKBOOKS_CLIENT_SECRET
  const qbRedirectUri = process.env.QB_REDIRECT_URI || process.env.QUICKBOOKS_REDIRECT_URI || `http://localhost:3000/api/quickbooks/callback`
  const qbSandbox = process.env.QB_SANDBOX === 'true' || process.env.QUICKBOOKS_SANDBOX === 'true'

  // Test Slack configuration  
  const slackClientId = process.env.SLACK_CLIENT_ID || process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
  const slackClientSecret = process.env.SLACK_CLIENT_SECRET
  const slackRedirectUri = process.env.SLACK_REDIRECT_URI || `http://localhost:3000/api/slack/callback`

  // Generate test OAuth URLs
  let qbOAuthUrl = ''
  let slackOAuthUrl = ''

  if (qbClientId) {
    const qbParams = new URLSearchParams({
      client_id: qbClientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: qbRedirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: 'test-state-123'
    })
    qbOAuthUrl = `https://appcenter.intuit.com/connect/oauth2?${qbParams.toString()}`
  }

  if (slackClientId) {
    const slackParams = new URLSearchParams({
      client_id: slackClientId,
      scope: 'chat:write,channels:read,im:write,im:read',
      redirect_uri: slackRedirectUri,
      state: 'test-state-456',
      user_scope: 'identity.basic,identity.email'
    })
    slackOAuthUrl = `https://slack.com/oauth/v2/authorize?${slackParams.toString()}`
  }

  return NextResponse.json({
    message: 'OAuth Configuration Test',
    timestamp: new Date().toISOString(),
    quickbooks: {
      configured: !!qbClientId && !!qbClientSecret,
      clientId: qbClientId ? `${qbClientId.substring(0, 10)}...` : 'NOT SET',
      clientSecret: qbClientSecret ? 'SET' : 'NOT SET',
      redirectUri: qbRedirectUri,
      sandbox: qbSandbox,
      testOAuthUrl: qbOAuthUrl || 'Cannot generate - missing client ID'
    },
    slack: {
      configured: !!slackClientId && !!slackClientSecret,
      clientId: slackClientId ? `${slackClientId.substring(0, 10)}...` : 'NOT SET',
      clientSecret: slackClientSecret ? 'SET' : 'NOT SET',
      redirectUri: slackRedirectUri,
      testOAuthUrl: slackOAuthUrl || 'Cannot generate - missing client ID'
    },
    instructions: {
      quickbooks: qbClientId ? 'QuickBooks appears configured!' : 'Need to set QB_CLIENT_ID and QB_CLIENT_SECRET',
      slack: slackClientId ? 'Slack appears configured!' : 'Need to set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET from your Slack app OAuth settings'
    }
  })
} 