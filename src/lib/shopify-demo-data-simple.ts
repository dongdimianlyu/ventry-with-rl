import { 
  ShopifyConnection, 
  ShopifyIntegrationStatus
} from '@/types'

// Simple demo data for testing without complex type issues
export function generateDemoConnection(userId: string): ShopifyConnection {
  return {
    id: `demo-connection-${userId}`,
    userId,
    shopDomain: 'demo-store',
    accessToken: 'demo-access-token',
    shopName: 'Demo Fashion Store',
    shopEmail: 'owner@demo-store.com',
    shopCurrency: 'USD',
    shopTimezone: 'America/New_York',
    connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isActive: true,
    permissions: ['read_orders', 'read_products', 'read_customers'],
    webhookIds: ['demo-webhook-1', 'demo-webhook-2']
  }
}

export function generateDemoStatus(): ShopifyIntegrationStatus {
  return {
    isConnected: true,
    connectionHealth: 'healthy',
    lastSuccessfulSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    apiCallsUsed: 245,
    apiCallsLimit: 1000,
    webhooksActive: 2,
    webhooksTotal: 2,
    dataFreshness: 'fresh'
  }
}

// Simple demo insights for testing
export function generateDemoInsights(userId: string) {
  return {
    userId,
    generatedAt: new Date(),
    salesSummary: {
      totalRevenue: 15420.50,
      totalOrders: 128,
      averageOrderValue: 120.47,
      revenueGrowth: 12.3,
      orderGrowth: 8.7
    },
    topProducts: [
      { name: 'Premium Cotton T-Shirt', revenue: 6168.20, unitsSold: 78 },
      { name: 'Denim Jeans', revenue: 5397.18, unitsSold: 38 },
      { name: 'Leather Jacket', revenue: 3855.13, unitsSold: 12 }
    ],
    customerMetrics: {
      totalCustomers: 85,
      newCustomers: 23,
      returningCustomers: 62,
      repeatPurchaseRate: 72.9,
      customerLifetimeValue: 245.80,
      churnRate: 12.5
    },
    inventoryAlerts: {
      lowStockProducts: [
        { name: 'Premium Cotton T-Shirt (Medium)', currentStock: 5, threshold: 10 }
      ],
      outOfStockProducts: [
        { name: 'Premium Cotton T-Shirt (Large)', lastStockDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      ]
    }
  }
}

// Store demo data in localStorage
export function storeDemoData(userId: string) {
  const connection = generateDemoConnection(userId)
  const insights = generateDemoInsights(userId)
  
  // Store connection
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const existingIndex = connections.findIndex((c: any) => c.userId === userId)
  if (existingIndex >= 0) {
    connections[existingIndex] = connection
  } else {
    connections.push(connection)
  }
  localStorage.setItem('shopify_connections', JSON.stringify(connections))
  
  // Store insights
  const storedInsights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const existingInsightIndex = storedInsights.findIndex((i: any) => i.userId === userId)
  if (existingInsightIndex >= 0) {
    storedInsights[existingInsightIndex] = insights
  } else {
    storedInsights.push(insights)
  }
  localStorage.setItem('shopify_insights', JSON.stringify(storedInsights))
  
  return { connection, insights }
}

// Clear demo data
export function clearDemoData(userId: string) {
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const filteredConnections = connections.filter((c: any) => c.userId !== userId)
  localStorage.setItem('shopify_connections', JSON.stringify(filteredConnections))
  
  const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const filteredInsights = insights.filter((i: any) => i.userId !== userId)
  localStorage.setItem('shopify_insights', JSON.stringify(filteredInsights))
} 