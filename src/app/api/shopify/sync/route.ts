import { NextRequest, NextResponse } from 'next/server'
import { getShopifyConnection } from '@/lib/shopify'
import { ShopifyInsightsEngine, saveInsightSummaries } from '@/lib/shopify-insights'

export async function POST(request: NextRequest) {
  try {
    const { userId, timeframe = 'last_30_days' } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get Shopify connection
    const connection = await getShopifyConnection(userId)
    if (!connection) {
      return NextResponse.json(
        { error: 'No Shopify connection found' },
        { status: 404 }
      )
    }

    // Create insights engine
    const insightsEngine = new ShopifyInsightsEngine(connection)

    // Generate business insights
    console.log('🔄 Generating Shopify business insights...')
    const insights = await insightsEngine.generateBusinessInsights(timeframe)

    // Generate plain language summaries
    console.log('📝 Generating insight summaries...')
    const summaries = await insightsEngine.generateInsightSummaries(insights)

    // Save summaries
    saveInsightSummaries(summaries)

    // Update connection last sync time
    connection.lastSyncAt = new Date()
    const { saveShopifyConnection } = await import('@/lib/shopify')
    await saveShopifyConnection(connection)

    return NextResponse.json({
      success: true,
      insights: {
        totalRevenue: insights.salesSummary.totalRevenue,
        totalOrders: insights.salesSummary.totalOrders,
        topProducts: insights.topProducts.slice(0, 3),
        customerMetrics: insights.customerMetrics,
        alertsCount: insights.inventoryAlerts.lowStockProducts.length + insights.inventoryAlerts.outOfStockProducts.length
      },
      summaries: summaries.map(s => ({
        id: s.id,
        summary: s.summary,
        urgencyLevel: s.urgencyLevel,
        businessImpact: s.businessImpact
      })),
      lastSyncAt: connection.lastSyncAt
    })

  } catch (error) {
    console.error('Error syncing Shopify data:', error)
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get connection status
    const connection = await getShopifyConnection(userId)
    if (!connection) {
      return NextResponse.json({
        connected: false,
        error: 'No connection found'
      })
    }

    // Test connection health
    const { ShopifyApiClient } = await import('@/lib/shopify')
    const apiClient = new ShopifyApiClient(connection)
    const isHealthy = await apiClient.testConnection()

    // Get stored insights
    const { getStoredInsights, getStoredInsightSummaries } = await import('@/lib/shopify-insights')
    const insights = getStoredInsights(userId)
    const summaries = getStoredInsightSummaries(userId)

    return NextResponse.json({
      connected: true,
      connection: {
        shopName: connection.shopName,
        shopDomain: connection.shopDomain,
        connectedAt: connection.connectedAt,
        lastSyncAt: connection.lastSyncAt
      },
      status: {
        isHealthy,
        lastSyncAt: connection.lastSyncAt,
        dataAge: insights ? Date.now() - new Date(insights.generatedAt).getTime() : null
      },
      insights: insights ? {
        totalRevenue: insights.salesSummary.totalRevenue,
        totalOrders: insights.salesSummary.totalOrders,
        topProducts: insights.topProducts.slice(0, 3),
        alertsCount: insights.inventoryAlerts.lowStockProducts.length + insights.inventoryAlerts.outOfStockProducts.length
      } : null,
      summaries: summaries.map(s => ({
        id: s.id,
        summary: s.summary,
        urgencyLevel: s.urgencyLevel,
        businessImpact: s.businessImpact
      }))
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
} 