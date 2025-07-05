import { NextRequest, NextResponse } from 'next/server'
import { 
  exchangeCodeForToken, 
  decodeOAuthState, 
  saveShopifyConnection,
  ShopifyApiClient
} from '@/lib/shopify'
import { ShopifyConnection } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const shop = searchParams.get('shop')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error'
      console.error('Shopify OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent(errorDescription)}`, request.url)
      )
    }

    // Validate required parameters
    if (!code || !state || !shop) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Missing required parameters', request.url)
      )
    }

    // Decode and validate OAuth state
    let oauthState
    try {
      oauthState = decodeOAuthState(state)
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

    // Extract shop domain from shop parameter
    const shopDomain = shop.replace('.myshopify.com', '')

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(shopDomain, code)
    
    // Create API client to get shop information
    const tempConnection: ShopifyConnection = {
      id: `temp-${Date.now()}`,
      userId: oauthState.userId,
      shopDomain,
      accessToken: tokenResponse.access_token,
      shopName: '',
      shopEmail: '',
      shopCurrency: 'USD',
      shopTimezone: 'UTC',
      connectedAt: new Date(),
      lastSyncAt: new Date(),
      isActive: true,
      permissions: tokenResponse.scope.split(','),
      webhookIds: []
    }

    const apiClient = new ShopifyApiClient(tempConnection)
    const shopInfo = await apiClient.getShopInfo() as any

    // Create complete connection object
    const connection: ShopifyConnection = {
      id: `shopify-${oauthState.userId}-${Date.now()}`,
      userId: oauthState.userId,
      shopDomain,
      accessToken: tokenResponse.access_token,
      shopName: shopInfo.shop.name,
      shopEmail: shopInfo.shop.email,
      shopCurrency: shopInfo.shop.currency,
      shopTimezone: shopInfo.shop.iana_timezone,
      connectedAt: new Date(),
      lastSyncAt: new Date(),
      isActive: true,
      permissions: tokenResponse.scope.split(','),
      webhookIds: []
    }

    // Save connection
    saveShopifyConnection(connection)

    // Set up webhooks (optional - could be done in background)
    try {
      await setupWebhooks(apiClient, connection)
    } catch (error) {
      console.warn('Failed to set up webhooks:', error)
      // Continue without webhooks - they can be set up later
    }

    // Redirect to success page
    const redirectUrl = new URL(oauthState.returnUrl || '/dashboard/settings', request.url)
    redirectUrl.searchParams.set('shopify_connected', 'true')
    redirectUrl.searchParams.set('shop_name', connection.shopName)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error in Shopify OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Connection failed', request.url)
    )
  }
}

// Helper function to set up webhooks
async function setupWebhooks(apiClient: ShopifyApiClient, connection: ShopifyConnection) {
  const webhookTopics = [
    'orders/create',
    'orders/updated',
    'orders/paid',
    'orders/fulfilled',
    'orders/cancelled',
    'products/create',
    'products/update',
    'customers/create',
    'customers/update'
  ]

  const webhookIds: string[] = []
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  for (const topic of webhookTopics) {
    try {
      const webhook = await apiClient.createWebhook(
        topic,
        `${baseUrl}/api/shopify/webhooks`
      ) as any
      webhookIds.push(webhook.webhook.id.toString())
    } catch (error) {
      console.warn(`Failed to create webhook for ${topic}:`, error)
    }
  }

  // Update connection with webhook IDs
  if (webhookIds.length > 0) {
    connection.webhookIds = webhookIds
    saveShopifyConnection(connection)
  }
} 