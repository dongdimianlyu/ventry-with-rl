import { NextRequest, NextResponse } from 'next/server'

const QB_CLIENT_ID = process.env.QB_CLIENT_ID || process.env.QUICKBOOKS_CLIENT_ID || ''
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET || process.env.QUICKBOOKS_CLIENT_SECRET || ''
const QB_SANDBOX = process.env.QB_SANDBOX === 'true' || process.env.QUICKBOOKS_SANDBOX === 'true'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const realmId = searchParams.get('realmId')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('QuickBooks OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent('QuickBooks connection failed')}`, request.url)
      )
    }

    // Validate required parameters
    if (!code || !state || !realmId) {
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
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
    const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.QB_REDIRECT_URI || process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quickbooks/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('QuickBooks token exchange failed:', tokenData)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent('Failed to connect to QuickBooks')}`, request.url)
      )
    }

    // Get company info from QuickBooks API
    const baseUrl = QB_SANDBOX 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com'

    const companyInfoResponse = await fetch(
      `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      }
    )

    let companyName = 'Unknown Company'
    if (companyInfoResponse.ok) {
      const companyData = await companyInfoResponse.json()
      companyName = companyData.QueryResponse?.CompanyInfo?.[0]?.CompanyName || 'Unknown Company'
    }

    // Create connection object
    const connection = {
      id: `quickbooks-${oauthState.userId}-${Date.now()}`,
      userId: oauthState.userId,
      companyId: realmId,
      companyName,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      scope: tokenData.scope?.split(' ') || ['com.intuit.quickbooks.accounting'],
      connectedAt: new Date(),
      lastSyncAt: new Date(),
      isActive: true,
      tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      sandbox: QB_SANDBOX,
      country: 'US',
      baseUrl
    }

    // In a real implementation, save to database
    // For demo purposes, save to localStorage via client-side redirect
    console.log('QuickBooks connection established:', connection)

    // Redirect to success page
    const redirectUrl = new URL(oauthState.returnUrl || '/dashboard/settings', request.url)
    redirectUrl.searchParams.set('quickbooks_connected', 'true')
    redirectUrl.searchParams.set('company_name', connection.companyName)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error in QuickBooks OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Connection failed', request.url)
    )
  }
} 