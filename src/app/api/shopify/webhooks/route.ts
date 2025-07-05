import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    if (!signature || !topic || !shopDomain) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!verifyWebhook(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook data
    const webhookData = JSON.parse(body)
    
    console.log(`📨 Received Shopify webhook: ${topic} from ${shopDomain}`)

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(webhookData, shopDomain)
        break
      case 'orders/updated':
        await handleOrderUpdated(webhookData, shopDomain)
        break
      case 'orders/paid':
        await handleOrderPaid(webhookData, shopDomain)
        break
      case 'orders/fulfilled':
        await handleOrderFulfilled(webhookData, shopDomain)
        break
      case 'orders/cancelled':
        await handleOrderCancelled(webhookData, shopDomain)
        break
      case 'products/create':
        await handleProductCreated(webhookData, shopDomain)
        break
      case 'products/update':
        await handleProductUpdated(webhookData, shopDomain)
        break
      case 'customers/create':
        await handleCustomerCreated(webhookData, shopDomain)
        break
      case 'customers/update':
        await handleCustomerUpdated(webhookData, shopDomain)
        break
      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Webhook handlers
async function handleOrderCreated(orderData: any, shopDomain: string) {
  console.log(`🛒 New order created: ${orderData.order_number} for ${shopDomain}`)
  
  // Trigger insights refresh if this is a significant order
  if (parseFloat(orderData.total_price) > 100) {
    await triggerInsightsRefresh(shopDomain)
  }
}

async function handleOrderUpdated(orderData: any, shopDomain: string) {
  console.log(`📝 Order updated: ${orderData.order_number} for ${shopDomain}`)
  
  // Check if financial status changed to paid
  if (orderData.financial_status === 'paid') {
    await triggerInsightsRefresh(shopDomain)
  }
}

async function handleOrderPaid(orderData: any, shopDomain: string) {
  console.log(`💰 Order paid: ${orderData.order_number} for ${shopDomain}`)
  await triggerInsightsRefresh(shopDomain)
}

async function handleOrderFulfilled(orderData: any, shopDomain: string) {
  console.log(`📦 Order fulfilled: ${orderData.order_number} for ${shopDomain}`)
  // Could trigger fulfillment performance analysis
}

async function handleOrderCancelled(orderData: any, shopDomain: string) {
  console.log(`❌ Order cancelled: ${orderData.order_number} for ${shopDomain}`)
  // Could trigger cancellation analysis
}

async function handleProductCreated(productData: any, shopDomain: string) {
  console.log(`🆕 Product created: ${productData.title} for ${shopDomain}`)
  // Could trigger product catalog analysis
}

async function handleProductUpdated(productData: any, shopDomain: string) {
  console.log(`🔄 Product updated: ${productData.title} for ${shopDomain}`)
  
  // Check if inventory changed significantly
  const hasLowStock = productData.variants.some((v: any) => v.inventory_quantity < 10)
  if (hasLowStock) {
    await triggerInventoryAlert(shopDomain, productData)
  }
}

async function handleCustomerCreated(customerData: any, shopDomain: string) {
  console.log(`👤 Customer created: ${customerData.email} for ${shopDomain}`)
  // Could trigger customer acquisition analysis
}

async function handleCustomerUpdated(customerData: any, shopDomain: string) {
  console.log(`👤 Customer updated: ${customerData.email} for ${shopDomain}`)
  // Could trigger customer behavior analysis
}

// Helper functions
async function triggerInsightsRefresh(shopDomain: string) {
  try {
    // Find connection by shop domain
    const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
    const connection = connections.find((c: any) => c.shopDomain === shopDomain && c.isActive)
    
    if (connection) {
      console.log(`🔄 Triggering insights refresh for ${shopDomain}`)
      
      // In a real implementation, you might queue this as a background job
      // For now, we'll just log it
      console.log(`📊 Insights refresh queued for user ${connection.userId}`)
    }
  } catch (error) {
    console.error('Error triggering insights refresh:', error)
  }
}

async function triggerInventoryAlert(shopDomain: string, productData: any) {
  try {
    console.log(`⚠️ Low inventory alert for ${productData.title} in ${shopDomain}`)
    
    // In a real implementation, you might:
    // 1. Send notifications to the user
    // 2. Create urgent tasks for inventory management
    // 3. Update business insights with inventory alerts
    
    // For now, we'll just log it
    console.log(`📦 Inventory alert logged for product ${productData.id}`)
  } catch (error) {
    console.error('Error triggering inventory alert:', error)
  }
} 