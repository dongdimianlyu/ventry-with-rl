import { 
  ShopifyConnection, 
  ShopifyProduct, 
  ShopifyOrder, 
  ShopifyCustomer, 
  ShopifyBusinessInsights,
  ShopifyIntegrationStatus
} from '@/types'

// Enhanced Demo Shopify Connection for $200k/month business
export function generateEnhancedShopifyConnection(userId: string): ShopifyConnection {
  return {
    id: `enhanced-connection-${userId}`,
    userId,
    shopDomain: 'tech-home-store',
    accessToken: 'enhanced-access-token',
    shopName: 'TechHome Solutions',
    shopEmail: 'owner@techhome-solutions.com',
    shopCurrency: 'USD',
    shopTimezone: 'America/New_York',
    connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    lastSyncAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isActive: true,
    permissions: [
      'read_orders',
      'read_products',
      'read_customers',
      'read_inventory',
      'read_analytics',
      'read_reports',
      'read_fulfillments',
      'read_price_rules'
    ],
    webhookIds: ['enhanced-webhook-1', 'enhanced-webhook-2', 'enhanced-webhook-3']
  }
}

// Professional Product Catalog for $200k/month business
export function generateEnhancedProducts(): ShopifyProduct[] {
  return [
    {
      id: 'prod-tech-mouse-001',
      title: 'Tech Pro Wireless Mouse',
      handle: 'tech-pro-wireless-mouse',
      vendor: 'TechHome Solutions',
      productType: 'Electronics',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
      tags: ['electronics', 'wireless', 'office', 'productivity'],
      variants: [
        {
          id: 'var-tpm-001',
          productId: 'prod-tech-mouse-001',
          title: 'Black',
          price: '49.99',
          sku: 'TST-PRO-BLK-001',
          inventoryQuantity: 150,
          weight: 0.3,
          weightUnit: 'lb'
        },
        {
          id: 'var-tpm-002',
          productId: 'prod-tech-mouse-001',
          title: 'White',
          price: '49.99',
          sku: 'TST-PRO-WHT-001',
          inventoryQuantity: 75,
          weight: 0.3,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-tpm-001',
        productId: 'prod-tech-mouse-001',
        src: 'https://via.placeholder.com/400x400/1E40AF/FFFFFF?text=Tech+Pro+Mouse',
        alt: 'Tech Pro Wireless Mouse',
        position: 1
      }]
    },
    {
      id: 'prod-air-purifier-001',
      title: 'Premium Air Purifier HEPA',
      handle: 'premium-air-purifier-hepa',
      vendor: 'TechHome Solutions',
      productType: 'Home & Garden',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-15'),
      tags: ['home', 'air-quality', 'hepa', 'health'],
      variants: [
        {
          id: 'var-pap-001',
          productId: 'prod-air-purifier-001',
          title: 'Small Room',
          price: '199.99',
          sku: 'PAP-HEPA-SM-001',
          inventoryQuantity: 45,
          weight: 8.5,
          weightUnit: 'lb'
        },
        {
          id: 'var-pap-002',
          productId: 'prod-air-purifier-001',
          title: 'Large Room',
          price: '299.99',
          sku: 'PAP-HEPA-LG-001',
          inventoryQuantity: 25,
          weight: 12.0,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-pap-001',
        productId: 'prod-air-purifier-001',
        src: 'https://via.placeholder.com/400x400/059669/FFFFFF?text=Air+Purifier',
        alt: 'Premium Air Purifier HEPA',
        position: 1
      }]
    },
    {
      id: 'prod-athletic-socks-001',
      title: 'Premium Athletic Socks 3-Pack',
      handle: 'premium-athletic-socks-3pack',
      vendor: 'TechHome Solutions',
      productType: 'Fashion',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-10'),
      tags: ['fashion', 'athletic', 'socks', 'comfort'],
      variants: [
        {
          id: 'var-pas-001',
          productId: 'prod-athletic-socks-001',
          title: 'Medium / Black',
          price: '19.99',
          sku: 'PAS-ATH-MD-BLK',
          inventoryQuantity: 200,
          weight: 0.5,
          weightUnit: 'lb'
        },
        {
          id: 'var-pas-002',
          productId: 'prod-athletic-socks-001',
          title: 'Large / White',
          price: '19.99',
          sku: 'PAS-ATH-LG-WHT',
          inventoryQuantity: 150,
          weight: 0.5,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-pas-001',
        productId: 'prod-athletic-socks-001',
        src: 'https://via.placeholder.com/400x400/374151/FFFFFF?text=Athletic+Socks',
        alt: 'Premium Athletic Socks 3-Pack',
        position: 1
      }]
    },
    {
      id: 'prod-protein-powder-001',
      title: 'Protein Powder Vanilla 2lb',
      handle: 'protein-powder-vanilla-2lb',
      vendor: 'TechHome Solutions',
      productType: 'Health & Fitness',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-03-25'),
      tags: ['health', 'fitness', 'protein', 'vanilla', 'supplement'],
      variants: [
        {
          id: 'var-ppv-001',
          productId: 'prod-protein-powder-001',
          title: 'Vanilla 2lb',
          price: '59.99',
          sku: 'PPV-VAN-2LB-001',
          inventoryQuantity: 80,
          weight: 2.0,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-ppv-001',
        productId: 'prod-protein-powder-001',
        src: 'https://via.placeholder.com/400x400/DC2626/FFFFFF?text=Protein+Powder',
        alt: 'Protein Powder Vanilla 2lb',
        position: 1
      }]
    },
    {
      id: 'prod-desk-organizer-001',
      title: 'Ergonomic Desk Organizer',
      handle: 'ergonomic-desk-organizer',
      vendor: 'TechHome Solutions',
      productType: 'Office',
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-03-05'),
      tags: ['office', 'organizer', 'desk', 'ergonomic', 'productivity'],
      variants: [
        {
          id: 'var-edo-001',
          productId: 'prod-desk-organizer-001',
          title: 'Bamboo',
          price: '42.99',
          sku: 'EDO-BAMB-001',
          inventoryQuantity: 65,
          weight: 3.2,
          weightUnit: 'lb'
        },
        {
          id: 'var-edo-002',
          productId: 'prod-desk-organizer-001',
          title: 'Black Wood',
          price: '42.99',
          sku: 'EDO-BLKW-001',
          inventoryQuantity: 40,
          weight: 3.2,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-edo-001',
        productId: 'prod-desk-organizer-001',
        src: 'https://via.placeholder.com/400x400/92400E/FFFFFF?text=Desk+Organizer',
        alt: 'Ergonomic Desk Organizer',
        position: 1
      }]
    },
    {
      id: 'prod-standing-desk-001',
      title: 'Adjustable Standing Desk Converter',
      handle: 'adjustable-standing-desk-converter',
      vendor: 'TechHome Solutions',
      productType: 'Office',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-30'),
      tags: ['office', 'standing-desk', 'ergonomic', 'adjustable', 'health'],
      variants: [
        {
          id: 'var-asd-001',
          productId: 'prod-standing-desk-001',
          title: 'Standard Size',
          price: '149.99',
          sku: 'ASD-STAN-001',
          inventoryQuantity: 35,
          weight: 25.0,
          weightUnit: 'lb'
        }
      ],
      images: [{
        id: 'img-asd-001',
        productId: 'prod-standing-desk-001',
        src: 'https://via.placeholder.com/400x400/1F2937/FFFFFF?text=Standing+Desk',
        alt: 'Adjustable Standing Desk Converter',
        position: 1
      }]
    }
  ]
}

// Generate realistic customers with segmentation for $200k/month business
export function generateEnhancedCustomers(): ShopifyCustomer[] {
  const customers: ShopifyCustomer[] = []
  
  // Customer segments with different spending patterns
  const segments = [
    { type: 'VIP', count: 200, avgSpend: [800, 2500], avgOrders: [15, 35] },
    { type: 'Loyal', count: 500, avgSpend: [300, 800], avgOrders: [8, 15] },
    { type: 'Regular', count: 800, avgSpend: [150, 300], avgOrders: [4, 8] },
    { type: 'Occasional', count: 400, avgSpend: [50, 150], avgOrders: [2, 4] },
    { type: 'New', count: 100, avgSpend: [25, 75], avgOrders: [1, 2] }
  ]
  
  let customerId = 1
  
  segments.forEach(segment => {
    for (let i = 0; i < segment.count; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      const ordersCount = Math.floor(Math.random() * (segment.avgOrders[1] - segment.avgOrders[0]) + segment.avgOrders[0])
      const totalSpent = (Math.random() * (segment.avgSpend[1] - segment.avgSpend[0]) + segment.avgSpend[0]).toFixed(2)
      
      customers.push({
        id: `customer-${customerId.toString().padStart(4, '0')}`,
        email: `customer${customerId}@${segment.type.toLowerCase()}mail.com`,
        firstName: `${segment.type}Customer${i + 1}`,
        lastName: 'Smith',
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        ordersCount,
        totalSpent,
        tags: [segment.type.toLowerCase(), ordersCount > 10 ? 'high-value' : 'standard'],
        acceptsMarketing: Math.random() > 0.25,
        marketingOptInLevel: Math.random() > 0.25 ? 'confirmed_opt_in' : 'not_opted_in'
      })
      
      customerId++
    }
  })
  
  return customers
}

// Generate realistic orders for $200k/month business (~6,700 orders/month)
export function generateEnhancedOrders(): ShopifyOrder[] {
  const now = new Date()
  const orders: ShopifyOrder[] = []
  const products = generateEnhancedProducts()
  const customers = generateEnhancedCustomers()
  
  // Generate orders for the last 90 days to reach ~$200k/month
  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const dayOfWeek = orderDate.getDay()
    const month = orderDate.getMonth()
    
    // Seasonal and weekly patterns
    let baseOrdersPerDay = 75  // ~2,250 orders per month
    
    // Weekend boost
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseOrdersPerDay *= 1.3
    }
    
    // Holiday season boost (Nov-Dec)
    if (month === 10 || month === 11) {
      baseOrdersPerDay *= 1.4
    }
    
    // Random variation
    const dailyOrders = Math.floor(baseOrdersPerDay * (0.8 + Math.random() * 0.4))
    
    for (let orderIndex = 0; orderIndex < dailyOrders; orderIndex++) {
      const orderNumber = 10000 + dayOffset * 100 + orderIndex
      const customer = customers[Math.floor(Math.random() * customers.length)]
      
      // Order time during business hours
      const orderTime = new Date(orderDate)
      orderTime.setHours(9 + Math.floor(Math.random() * 12))
      orderTime.setMinutes(Math.floor(Math.random() * 60))
      
      // Generate line items based on customer segment
      const customerSegment = customer.tags?.[0] || 'regular'
      const lineItems = generateRealisticLineItems(products, customerSegment)
      
      // Calculate order total
      const subtotal = lineItems.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      )
      const tax = subtotal * 0.08  // 8% tax
      const total = subtotal + tax
      
      orders.push({
        id: `order-${orderNumber}`,
        orderNumber: `#TH${orderNumber}`,
        createdAt: orderTime,
        updatedAt: new Date(orderTime.getTime() + 2 * 60 * 60 * 1000),
        processedAt: new Date(orderTime.getTime() + 15 * 60 * 1000),
        customerId: customer.id,
        email: customer.email,
        totalPrice: total.toFixed(2),
        subtotalPrice: subtotal.toFixed(2),
        totalTax: tax.toFixed(2),
        currency: 'USD',
        financialStatus: Math.random() > 0.05 ? 'paid' : 'pending',
        fulfillmentStatus: generateRealisticFulfillmentStatus(orderTime),
        lineItems,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          address1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          province: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          country: 'United States',
          zip: String(Math.floor(Math.random() * 90000) + 10000)
        },
        billingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          address1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          province: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          country: 'United States',
          zip: String(Math.floor(Math.random() * 90000) + 10000)
        },
        tags: [customerSegment, `month-${month + 1}`]
      })
    }
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function generateRealisticLineItems(products: ShopifyProduct[], customerSegment: string) {
  const items = []
  
  // Determine number of items based on customer segment
  let maxItems = 1
  if (customerSegment === 'vip') maxItems = 4
  else if (customerSegment === 'loyal') maxItems = 3
  else if (customerSegment === 'regular') maxItems = 2
  
  const numItems = Math.floor(Math.random() * maxItems) + 1
  
  for (let i = 0; i < numItems; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    const variant = product.variants[Math.floor(Math.random() * product.variants.length)]
    
    // Quantity based on customer segment and product type
    let quantity = 1
    if (customerSegment === 'vip' && Math.random() > 0.5) quantity = 2
    if (product.productType === 'Fashion' && Math.random() > 0.7) quantity = 2
    
    items.push({
      id: `line-item-${Date.now()}-${i}`,
      productId: product.id,
      variantId: variant.id,
      title: `${product.title} - ${variant.title}`,
      quantity,
      price: variant.price,
      totalDiscount: '0.00',
      sku: variant.sku,
      vendor: product.vendor,
      productType: product.productType
    })
  }
  
  return items
}

function generateRealisticFulfillmentStatus(orderDate: Date): string {
  const now = new Date()
  const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysDiff < 1) return 'unfulfilled'
  if (daysDiff < 2) return Math.random() > 0.3 ? 'fulfilled' : 'unfulfilled'
  if (daysDiff < 7) return Math.random() > 0.1 ? 'fulfilled' : 'partial'
  return 'fulfilled'
}

// Enhanced Integration Status
export function generateEnhancedIntegrationStatus(): ShopifyIntegrationStatus {
  return {
    isConnected: true,
    connectionHealth: 'healthy',
    lastSuccessfulSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    apiCallsUsed: 2840,
    apiCallsLimit: 5000,
    webhooksActive: 3,
    webhooksTotal: 3,
    dataFreshness: 'fresh'
  }
}

// Enhanced Business Insights for $200k/month business
export function generateEnhancedBusinessInsights(): ShopifyBusinessInsights {
  const orders = generateEnhancedOrders()
  const customers = generateEnhancedCustomers()
  const products = generateEnhancedProducts()
  
  // Calculate last 30 days metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
  
  const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  const totalOrders = recentOrders.length
  const averageOrderValue = totalRevenue / Math.max(totalOrders, 1)
  
  // Previous month for growth calculation
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const previousOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt)
    return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
  })
  
  const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const orderGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0
  
  return {
    id: `insights-enhanced-${Date.now()}`,
    userId: 'enhanced-user',
    shopDomain: 'tech-home-store',
    generatedAt: new Date(),
    timeframe: 'last_30_days',
    salesSummary: {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10
    },
    topProducts: [
      {
        id: 'prod-tech-mouse-001',
        name: 'Tech Pro Wireless Mouse',
        revenue: totalRevenue * 0.28,
        unitsSold: Math.floor(totalOrders * 0.35),
        growthRate: 18.5
      },
      {
        id: 'prod-air-purifier-001',
        name: 'Premium Air Purifier HEPA',
        revenue: totalRevenue * 0.32,
        unitsSold: Math.floor(totalOrders * 0.15),
        growthRate: 25.2
      },
      {
        id: 'prod-standing-desk-001',
        name: 'Adjustable Standing Desk Converter',
        revenue: totalRevenue * 0.22,
        unitsSold: Math.floor(totalOrders * 0.08),
        growthRate: 42.8
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
      churnRate: 8.2
    },
    fulfillmentMetrics: {
      averageProcessingTime: 1.8,
      onTimeDeliveryRate: 96.3,
      pendingOrders: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
      delayedOrders: orders.filter(o => o.fulfillmentStatus === 'partial').length
    },
    conversionMetrics: {
      websiteConversionRate: 3.2,
      averageSessionValue: 45.80,
      cartAbandonmentRate: 68.5,
      emailConversionRate: 4.8
    },
    inventoryAlerts: {
      lowStockProducts: [
        {
          id: 'prod-standing-desk-001',
          name: 'Adjustable Standing Desk Converter',
          currentStock: 35,
          threshold: 50
        },
        {
          id: 'prod-desk-organizer-001',
          name: 'Ergonomic Desk Organizer (Black Wood)',
          currentStock: 40,
          threshold: 60
        }
      ],
      outOfStockProducts: []
    },
    trends: {
      salesTrend: 'increasing',
      topCategories: ['Electronics', 'Office', 'Home & Garden'],
      seasonalPatterns: {
        currentSeason: 'spring',
        expectedGrowth: 22.4,
        recommendedActions: [
          'Increase inventory for summer office products',
          'Prepare for back-to-office demand surge',
          'Focus marketing on health & wellness products'
        ]
      }
    }
  }
}

// Main enhanced data generator
export function generateEnhancedShopifyData(userId: string = 'enhanced-user') {
  return {
    connection: generateEnhancedShopifyConnection(userId),
    products: generateEnhancedProducts(),
    orders: generateEnhancedOrders(),
    customers: generateEnhancedCustomers(),
    integrationStatus: generateEnhancedIntegrationStatus(),
    businessInsights: generateEnhancedBusinessInsights()
  }
}

// Store enhanced demo data in localStorage
export function storeEnhancedDemoData(userId: string = 'enhanced-user') {
  const enhancedData = generateEnhancedShopifyData(userId)
  
  // Store connection
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const existingIndex = connections.findIndex((c: any) => c.userId === userId && c.shopDomain === 'tech-home-store')
  if (existingIndex >= 0) {
    connections[existingIndex] = enhancedData.connection
  } else {
    connections.push(enhancedData.connection)
  }
  localStorage.setItem('shopify_connections', JSON.stringify(connections))
  
  // Store insights
  const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const existingInsightIndex = insights.findIndex((i: any) => i.userId === userId && i.shopDomain === 'tech-home-store')
  if (existingInsightIndex >= 0) {
    insights[existingInsightIndex] = enhancedData.businessInsights
  } else {
    insights.push(enhancedData.businessInsights)
  }
  localStorage.setItem('shopify_insights', JSON.stringify(insights))
  
  console.log('Enhanced Shopify data stored:', {
    products: enhancedData.products.length,
    orders: enhancedData.orders.length,
    customers: enhancedData.customers.length,
    monthlyRevenue: enhancedData.businessInsights.salesSummary.totalRevenue
  })
  
  return enhancedData
} 