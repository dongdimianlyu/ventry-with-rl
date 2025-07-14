import { NextRequest, NextResponse } from 'next/server'
import { getShopifyConnection, removeShopifyConnection, ShopifyApiClient } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get existing connection
    const connection = getShopifyConnection(userId)
    if (!connection) {
      return NextResponse.json(
        { error: 'No connection found' },
        { status: 404 }
      )
    }

    // Clean up webhooks
    try {
      const apiClient = new ShopifyApiClient(connection)
      const webhooks = await apiClient.getWebhooks() as any
      
      // Delete all webhooks created by this app
      for (const webhook of webhooks.webhooks) {
        if (connection.webhookIds.includes(webhook.id.toString())) {
          await apiClient.deleteWebhook(webhook.id.toString())
        }
      }
    } catch (error) {
      console.warn('Failed to clean up webhooks:', error)
      // Continue with disconnection even if webhook cleanup fails
    }

    // Remove connection from storage
    removeShopifyConnection(userId)

    return NextResponse.json({
      success: true,
      message: 'Shopify connection disconnected successfully'
    })

  } catch (error) {
    console.error('Error disconnecting Shopify:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
} 