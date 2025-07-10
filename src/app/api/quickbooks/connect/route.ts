import { NextRequest, NextResponse } from 'next/server'

const QB_CLIENT_ID = process.env.QB_CLIENT_ID || process.env.QUICKBOOKS_CLIENT_ID || ''
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI || process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quickbooks/callback`
const QB_SANDBOX = process.env.QB_SANDBOX === 'true' || process.env.QUICKBOOKS_SANDBOX === 'true'

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

    if (!QB_CLIENT_ID) {
      return NextResponse.json(
        { error: 'QuickBooks client ID not configured' },
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

    // Generate QuickBooks OAuth URL
    const scope = 'com.intuit.quickbooks.accounting'
    const params = new URLSearchParams({
      client_id: QB_CLIENT_ID,
      scope: scope,
      redirect_uri: QB_REDIRECT_URI,
      response_type: 'code',
      access_type: 'offline',
      state: encodeURIComponent(state)
    })

    const baseUrl = QB_SANDBOX 
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2'

    const oauthUrl = `${baseUrl}?${params.toString()}`

    return NextResponse.json({
      success: true,
      oauthUrl,
      state,
      sandbox: QB_SANDBOX
    })

  } catch (error) {
    console.error('Error initiating QuickBooks connection:', error)
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    )
  }
} 