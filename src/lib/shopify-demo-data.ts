import { 
  ShopifyConnection, 
  ShopifyProduct, 
  ShopifyOrder, 
  ShopifyCustomer, 
  ShopifyBusinessInsights,
  ShopifyIntegrationStatus
} from '@/types'

// Demo Shopify Connection
export function generateDemoShopifyConnection(userId: string): ShopifyConnection {
  return {
    id: `demo-connection-${userId}`,
    userId,
    shopDomain: 'demo-store',
    accessToken: 'demo-access-token',
    shopName: 'Demo Fashion Store',
    shopEmail: 'owner@demo-store.com',
    shopCurrency: 'USD',
    shopTimezone: 'America/New_York',
    connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isActive: true,
    permissions: [
      'read_orders',
      'read_products',
      'read_customers',
      'read_inventory',
      'read_analytics',
      'read_reports'
    ],
    webhookIds: ['demo-webhook-1', 'demo-webhook-2']
  }
}

// Demo Products
export function generateDemoProducts(): ShopifyProduct[] {
  return [
    {
      id: 'demo-product-1',
      title: 'Premium Cotton T-Shirt',
      handle: 'premium-cotton-t-shirt',
      vendor: 'Demo Fashion',
      productType: 'T-Shirts',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      tags: ['cotton', 'premium', 'casual'],
      variants: [
        {
          id: 'variant-1',
          productId: 'demo-product-1',
          title: 'Small / Black',
          price: '29.99',
          sku: 'PCTS-SM-BLK',
          inventoryQuantity: 15,
          weight: 0.3,
          weightUnit: 'lb'
        },
        {
          id: 'variant-2',
          productId: 'demo-product-1',
          title: 'Medium / Black',
          price: '29.99',
          sku: 'PCTS-MD-BLK',
          inventoryQuantity: 5, // Low stock
          weight: 0.3,
          weightUnit: 'lb'
        },
        {
          id: 'variant-3',
          productId: 'demo-product-1',
          title: 'Large / White',
          price: '29.99',
          sku: 'PCTS-LG-WHT',
          inventoryQuantity: 0, // Out of stock
          weight: 0.3,
          weightUnit: 'lb'
        }
      ],
      images: [
        {
          id: 'image-1',
          productId: 'demo-product-1',
          src: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=T-Shirt',
          alt: 'Premium Cotton T-Shirt',
          position: 1
        }
      ]
    },
    {
      id: 'demo-product-2',
      title: 'Denim Jeans',
      handle: 'denim-jeans',
      vendor: 'Demo Fashion',
      productType: 'Jeans',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25'),
      tags: ['denim', 'casual', 'classic'],
      variants: [
        {
          id: 'variant-4',
          productId: 'demo-product-2',
          title: '32x32 / Blue',
          price: '79.99',
          sku: 'DJ-32-32-BLU',
          inventoryQuantity: 25,
          weight: 1.2,
          weightUnit: 'lb'
        },
        {
          id: 'variant-5',
          productId: 'demo-product-2',
          title: '34x34 / Blue',
          price: '79.99',
          sku: 'DJ-34-34-BLU',
          inventoryQuantity: 18,
          weight: 1.2,
          weightUnit: 'lb'
        }
      ],
      images: [
        {
          id: 'image-2',
          productId: 'demo-product-2',
          src: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=Jeans',
          alt: 'Denim Jeans',
          position: 1
        }
      ]
    },
    {
      id: 'demo-product-3',
      title: 'Leather Jacket',
      handle: 'leather-jacket',
      vendor: 'Demo Fashion',
      productType: 'Jackets',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      tags: ['leather', 'premium', 'outerwear'],
      variants: [
        {
          id: 'variant-6',
          productId: 'demo-product-3',
          title: 'Medium / Black',
          price: '199.99',
          sku: 'LJ-MD-BLK',
          inventoryQuantity: 8,
          weight: 2.5,
          weightUnit: 'lb'
        }
      ],
      images: [
        {
          id: 'image-3',
          productId: 'demo-product-3',
          src: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Jacket',
          alt: 'Leather Jacket',
          position: 1
        }
      ]
    }
  ]
}

// Demo Orders
export function generateDemoOrders(): ShopifyOrder[] {
  const now = new Date()
  const orders: ShopifyOrder[] = []
  
  // Generate orders for the last 30 days
  for (let i = 0; i < 45; i++) {
    const orderDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const orderNumber = 1000 + i
    
    // Vary order patterns - more orders on weekends, seasonal trends
    const dayOfWeek = orderDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const orderCount = isWeekend ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 5) + 1
    
    for (let j = 0; j < orderCount; j++) {
      const customerId = `customer-${Math.floor(Math.random() * 20) + 1}`
      const isReturningCustomer = Math.random() > 0.6
      
      orders.push({
        id: `order-${orderNumber}-${j}`,
        orderNumber: `#${orderNumber}${j}`,
        createdAt: new Date(orderDate.getTime() + j * 60 * 60 * 1000),
        updatedAt: new Date(orderDate.getTime() + j * 60 * 60 * 1000 + 30 * 60 * 1000),
        processedAt: new Date(orderDate.getTime() + j * 60 * 60 * 1000 + 15 * 60 * 1000),
        customerId,
        email: `customer${customerId.split('-')[1]}@example.com`,
        totalPrice: generateRandomOrderValue(isReturningCustomer),
        subtotalPrice: '',
        totalTax: '',
        currency: 'USD',
        financialStatus: Math.random() > 0.1 ? 'paid' : 'pending',
        fulfillmentStatus: generateFulfillmentStatus(orderDate),
        lineItems: generateRandomLineItems(),
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'United States',
          zip: '10001'
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'United States',
          zip: '10001'
        },
        tags: isReturningCustomer ? ['returning-customer'] : ['new-customer']
      })
    }
  }
  
  return orders
}

// Demo Customers
export function generateDemoCustomers(): ShopifyCustomer[] {
  const customers: ShopifyCustomer[] = []
  
  for (let i = 1; i <= 50; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    const ordersCount = Math.floor(Math.random() * 10) + 1
    const totalSpent = (Math.random() * 500 + 50).toFixed(2)
    
    customers.push({
      id: `customer-${i}`,
      email: `customer${i}@example.com`,
      firstName: `Customer${i}`,
      lastName: 'Demo',
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      ordersCount,
      totalSpent,
      tags: ordersCount > 5 ? ['vip', 'loyal'] : ordersCount > 2 ? ['returning'] : ['new'],
      acceptsMarketing: Math.random() > 0.3,
      defaultAddress: {
        firstName: `Customer${i}`,
        lastName: 'Demo',
        address1: `${100 + i} Demo Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
        province: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
        country: 'United States',
        zip: `${10000 + i}`
      }
    })
  }
  
  return customers
}

// Demo Integration Status
export function generateDemoIntegrationStatus(): ShopifyIntegrationStatus {
  return {
    isConnected: true,
    connectionHealth: 'healthy',
    lastSuccessfulSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    apiCallsUsed: 245,
    apiCallsLimit: 1000,
    webhooksActive: 2,
    webhooksTotal: 2,
    dataFreshness: 'fresh'
  }
}

// Demo Business Insights
export function generateDemoBusinessInsights(): ShopifyBusinessInsights {
  const products = generateDemoProducts()
  const orders = generateDemoOrders()
  const customers = generateDemoCustomers()
  
  // Calculate sales summary
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  const totalOrders = orders.length
  const averageOrderValue = totalRevenue / totalOrders
  
  // Calculate growth (comparing last 30 days to previous 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  
  const recentOrders = orders.filter(order => new Date(order.createdAt) >= thirtyDaysAgo)
  const previousOrders = orders.filter(order => 
    new Date(order.createdAt) >= sixtyDaysAgo && new Date(order.createdAt) < thirtyDaysAgo
  )
  
  const recentRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  
  const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const orderGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0
  
  return {
    userId: 'demo-user',
    generatedAt: new Date(),
    salesSummary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth,
      orderGrowth
    },
    topProducts: [
      {
        id: 'demo-product-1',
        name: 'Premium Cotton T-Shirt',
        revenue: totalRevenue * 0.4,
        unitsSold: Math.floor(totalOrders * 0.6),
        growthRate: 15.2
      },
      {
        id: 'demo-product-2',
        name: 'Denim Jeans',
        revenue: totalRevenue * 0.35,
        unitsSold: Math.floor(totalOrders * 0.3),
        growthRate: 8.7
      },
      {
        id: 'demo-product-3',
        name: 'Leather Jacket',
        revenue: totalRevenue * 0.25,
        unitsSold: Math.floor(totalOrders * 0.1),
        growthRate: -5.3
      }
    ],
    customerMetrics: {
      totalCustomers: customers.length,
      newCustomers: customers.filter(c => 
        new Date(c.createdAt) >= thirtyDaysAgo
      ).length,
      returningCustomers: customers.filter(c => c.ordersCount > 1).length,
      averageLifetimeValue: customers.reduce((sum, c) => sum + parseFloat(c.totalSpent), 0) / customers.length,
      repeatPurchaseRate: (customers.filter(c => c.ordersCount > 1).length / customers.length) * 100,
      churnRate: 12.5
    },
    fulfillmentMetrics: {
      averageProcessingTime: 1.2,
      onTimeDeliveryRate: 94.5,
      pendingOrders: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
      delayedOrders: orders.filter(o => o.fulfillmentStatus === 'partial').length
    },
    inventoryAlerts: {
      lowStockProducts: [
        {
          id: 'demo-product-1',
          name: 'Premium Cotton T-Shirt (Medium)',
          currentStock: 5,
          threshold: 10
        }
      ],
      outOfStockProducts: [
        {
          id: 'demo-product-1',
          name: 'Premium Cotton T-Shirt (Large)',
          lastStockDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    trends: {
      salesTrend: 'increasing',
      topCategories: ['T-Shirts', 'Jeans', 'Jackets'],
      seasonalPatterns: {
        currentSeason: 'spring',
        expectedGrowth: 15.3,
        recommendedActions: ['Increase inventory for summer items', 'Plan spring marketing campaigns']
      }
    }
  }
}

// Helper functions
function generateRandomOrderValue(isReturningCustomer: boolean): string {
  const baseValue = isReturningCustomer ? 60 : 40
  const variation = Math.random() * 80
  return (baseValue + variation).toFixed(2)
}

function generateFulfillmentStatus(orderDate: Date): 'fulfilled' | 'null' | 'partial' | 'restocked' {
  const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceOrder > 7) return 'fulfilled'
  if (daysSinceOrder > 3) return Math.random() > 0.2 ? 'fulfilled' : 'partial'
  if (daysSinceOrder > 1) return Math.random() > 0.5 ? 'fulfilled' : 'null'
  return 'null'
}

function generateRandomLineItems() {
  const products = ['Premium Cotton T-Shirt', 'Denim Jeans', 'Leather Jacket']
  const itemCount = Math.floor(Math.random() * 3) + 1
  
  return Array.from({ length: itemCount }, (_, i) => ({
    id: `line-item-${i}`,
    productId: `demo-product-${i + 1}`,
    variantId: `variant-${i + 1}`,
    title: products[i] || products[0],
    quantity: Math.floor(Math.random() * 3) + 1,
    price: ['29.99', '79.99', '199.99'][i] || '29.99',
    totalDiscount: '0.00',
    sku: ['PCTS-SM-BLK', 'DJ-32-32-BLU', 'LJ-MD-BLK'][i] || 'PCTS-SM-BLK',
    vendor: 'Demo Fashion',
    productType: ['T-Shirts', 'Jeans', 'Jackets'][i] || 'T-Shirts'
  }))
}

// Main demo data generator
export function generateDemoShopifyData(userId: string = 'demo-user') {
  return {
    connection: generateDemoShopifyConnection(userId),
    products: generateDemoProducts(),
    orders: generateDemoOrders(),
    customers: generateDemoCustomers(),
    integrationStatus: generateDemoIntegrationStatus(),
    businessInsights: generateDemoBusinessInsights()
  }
}

// Store demo data in localStorage for testing
export function storeDemoData(userId: string = 'demo-user') {
  const demoData = generateDemoShopifyData(userId)
  
  // Store connection
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const existingIndex = connections.findIndex((c: any) => c.userId === userId)
  if (existingIndex >= 0) {
    connections[existingIndex] = demoData.connection
  } else {
    connections.push(demoData.connection)
  }
  localStorage.setItem('shopify_connections', JSON.stringify(connections))
  
  // Store insights
  const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const existingInsightIndex = insights.findIndex((i: any) => i.userId === userId)
  if (existingInsightIndex >= 0) {
    insights[existingInsightIndex] = demoData.businessInsights
  } else {
    insights.push(demoData.businessInsights)
  }
  localStorage.setItem('shopify_insights', JSON.stringify(insights))
  
  return demoData
}

// Clear demo data
export function clearDemoData(userId: string = 'demo-user') {
  // Clear connection
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const filteredConnections = connections.filter((c: any) => c.userId !== userId)
  localStorage.setItem('shopify_connections', JSON.stringify(filteredConnections))
  
  // Clear insights
  const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const filteredInsights = insights.filter((i: any) => i.userId !== userId)
  localStorage.setItem('shopify_insights', JSON.stringify(filteredInsights))
  
  // Clear summaries
  const summaries = JSON.parse(localStorage.getItem('shopify_insight_summaries') || '[]')
  const filteredSummaries = summaries.filter((s: any) => s.userId !== userId)
  localStorage.setItem('shopify_insight_summaries', JSON.stringify(filteredSummaries))
} 