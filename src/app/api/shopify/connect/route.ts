import { NextRequest, NextResponse } from 'next/server'
import { 
  generateShopifyOAuthUrl, 
  generateOAuthState, 
  encodeOAuthState, 
  isValidShopDomain, 
  sanitizeShopDomain 
} from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const { shopDomain, userId, returnUrl } = await request.json()

    // Validate required fields
    if (!shopDomain || !userId) {
      return NextResponse.json(
        { error: 'Shop domain and user ID are required' },
        { status: 400 }
      )
    }

    // Sanitize and validate shop domain
    const cleanDomain = sanitizeShopDomain(shopDomain)
    if (!isValidShopDomain(cleanDomain)) {
      return NextResponse.json(
        { error: 'Invalid shop domain format' },
        { status: 400 }
      )
    }

    // Generate OAuth state
    const oauthState = generateOAuthState(userId, returnUrl)
    const encodedState = encodeOAuthState(oauthState)

    // Store OAuth state temporarily (in production, use a database)
    // For now, we'll include it in the response for the client to handle
    const oauthUrl = generateShopifyOAuthUrl(cleanDomain, encodedState)

    return NextResponse.json({
      success: true,
      oauthUrl,
      state: encodedState,
      shopDomain: cleanDomain
    })

  } catch (error) {
    console.error('Error initiating Shopify connection:', error)
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    )
  }
} 