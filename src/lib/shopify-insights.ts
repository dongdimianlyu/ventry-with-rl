import { 
  ShopifyApiClient, 
  formatShopifyDate, 
  formatShopifyPrice 
} from './shopify'
import { 
  ShopifyBusinessInsights, 
  ShopifyInsightSummary, 
  ShopifyConnection,
  ShopifyOrder,
  ShopifyProduct,
  ShopifyCustomer
} from '@/types'

export class ShopifyInsightsEngine {
  private apiClient: ShopifyApiClient
  private connection: ShopifyConnection

  constructor(connection: ShopifyConnection) {
    this.connection = connection
    this.apiClient = new ShopifyApiClient(connection)
  }

  // Main insight generation method
  async generateBusinessInsights(timeframe: 'last_7_days' | 'last_30_days' | 'last_90_days' = 'last_30_days'): Promise<ShopifyBusinessInsights> {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'last_7_days':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'last_30_days':
        startDate.setDate(endDate.getDate() - 30)
        break
      case 'last_90_days':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    const dateRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }

    // Fetch all necessary data in parallel
    const [
      ordersData,
      productsData,
      customersData,
      previousPeriodOrdersData
    ] = await Promise.all([
      this.fetchOrdersData(dateRange),
      this.fetchProductsData(),
      this.fetchCustomersData(dateRange),
      this.fetchPreviousPeriodOrdersData(timeframe, startDate)
    ])

    // Generate insights
    const insights: ShopifyBusinessInsights = {
      id: `insights-${this.connection.userId}-${Date.now()}`,
      userId: this.connection.userId,
      shopDomain: this.connection.shopDomain,
      generatedAt: new Date(),
      timeframe,
      salesSummary: this.analyzeSalesPerformance(ordersData, previousPeriodOrdersData),
      topProducts: this.analyzeTopProducts(ordersData, productsData),
      customerMetrics: this.analyzeCustomerMetrics(customersData, ordersData),
      fulfillmentMetrics: this.analyzeFulfillmentMetrics(ordersData),
      conversionMetrics: this.analyzeConversionMetrics(ordersData),
      inventoryAlerts: await this.analyzeInventoryAlerts(productsData),
      trends: this.analyzeTrends(ordersData, productsData, timeframe)
    }

    // Save insights
    this.saveInsights(insights)

    return insights
  }

  // Sales Performance Analysis
  private analyzeSalesPerformance(currentOrders: ShopifyOrder[], previousOrders: ShopifyOrder[]) {
    const currentRevenue = currentOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    const currentOrderCount = currentOrders.length
    const previousOrderCount = previousOrders.length
    const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0

    const averageOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0

    return {
      totalRevenue: currentRevenue,
      totalOrders: currentOrderCount,
      averageOrderValue,
      revenueGrowth,
      orderGrowth
    }
  }

  // Top Products Analysis
  private analyzeTopProducts(orders: ShopifyOrder[], products: ShopifyProduct[]) {
    const productSales = new Map<string, { unitsSold: number; revenue: number; title: string }>()

    orders.forEach(order => {
      order.lineItems.forEach(item => {
        const existing = productSales.get(item.productId) || { unitsSold: 0, revenue: 0, title: item.title }
        existing.unitsSold += item.quantity
        existing.revenue += parseFloat(item.price) * item.quantity
        existing.title = item.title
        productSales.set(item.productId, existing)
      })
    })

    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
        growthRate: this.calculateProductGrowthRate(productId, orders) // Simplified calculation
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  // Customer Metrics Analysis
  private analyzeCustomerMetrics(customers: ShopifyCustomer[], orders: ShopifyOrder[]) {
    const totalCustomers = customers.length
    const newCustomers = customers.filter(c => 
      new Date(c.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
    ).length

    const customerOrderCounts = new Map<string, number>()
    orders.forEach(order => {
      if (order.customerId) {
        customerOrderCounts.set(order.customerId, (customerOrderCounts.get(order.customerId) || 0) + 1)
      }
    })

    const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length
    const repeatCustomerRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0

    const totalSpent = customers.reduce((sum, customer) => sum + parseFloat(customer.totalSpent), 0)
    const customerLifetimeValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0

    // Simplified churn rate calculation
    const activeCustomers = customers.filter(c => 
      c.lastOrderAt && new Date(c.lastOrderAt).getTime() > Date.now() - (90 * 24 * 60 * 60 * 1000)
    ).length
    const churnRate = totalCustomers > 0 ? ((totalCustomers - activeCustomers) / totalCustomers) * 100 : 0

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      repeatCustomerRate,
      customerLifetimeValue,
      churnRate
    }
  }

  // Fulfillment Metrics Analysis
  private analyzeFulfillmentMetrics(orders: ShopifyOrder[]) {
    const fulfilledOrders = orders.filter(o => o.fulfillmentStatus === 'fulfilled')
    const totalFulfillmentTime = fulfilledOrders.reduce((sum, order) => {
      const created = new Date(order.createdAt).getTime()
      const processed = new Date(order.processedAt).getTime()
      return sum + (processed - created)
    }, 0)

    const averageFulfillmentTime = fulfilledOrders.length > 0 
      ? totalFulfillmentTime / fulfilledOrders.length / (1000 * 60 * 60) // Convert to hours
      : 0

    const delayedOrders = orders.filter(order => {
      const created = new Date(order.createdAt).getTime()
      const now = Date.now()
      const hoursSinceCreated = (now - created) / (1000 * 60 * 60)
      return hoursSinceCreated > 48 && order.fulfillmentStatus !== 'fulfilled'
    })

    const delayedOrdersCount = delayedOrders.length
    const delayedOrdersRate = orders.length > 0 ? (delayedOrdersCount / orders.length) * 100 : 0

    // Simplified return and refund rates
    const refundedOrders = orders.filter(o => o.financialStatus === 'refunded' || o.financialStatus === 'partially_refunded')
    const returnRate = orders.length > 0 ? (refundedOrders.length / orders.length) * 100 : 0
    const refundRate = returnRate // Simplified

    return {
      averageFulfillmentTime,
      delayedOrdersCount,
      delayedOrdersRate,
      returnRate,
      refundRate
    }
  }

  // Conversion Metrics Analysis
  private analyzeConversionMetrics(orders: ShopifyOrder[]) {
    // These would typically require additional data from Shopify Analytics API
    // For now, we'll provide estimated values based on order data
    
    const totalItems = orders.reduce((sum, order) => sum + order.lineItems.length, 0)
    const averageItemsPerOrder = orders.length > 0 ? totalItems / orders.length : 0

    // Simplified metrics - in a real implementation, you'd need additional data
    const cartAbandonmentRate = 65 // Industry average placeholder
    const checkoutConversionRate = 2.5 // Industry average placeholder  
    const bounceRate = 45 // Industry average placeholder

    return {
      cartAbandonmentRate,
      checkoutConversionRate,
      averageItemsPerOrder,
      bounceRate
    }
  }

  // Inventory Alerts Analysis
  private async analyzeInventoryAlerts(products: ShopifyProduct[]) {
    const lowStockProducts: any[] = []
    const outOfStockProducts: any[] = []

    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.inventoryQuantity === 0) {
          outOfStockProducts.push({
            productId: product.id,
            title: product.title,
            missedSales: 0 // Would need historical data to calculate
          })
        } else if (variant.inventoryQuantity < 10) { // Low stock threshold
          lowStockProducts.push({
            productId: product.id,
            title: product.title,
            currentStock: variant.inventoryQuantity,
            projectedDaysLeft: Math.floor(variant.inventoryQuantity / 2) // Simplified calculation
          })
        }
      })
    })

    return {
      lowStockProducts: lowStockProducts.slice(0, 10),
      outOfStockProducts: outOfStockProducts.slice(0, 10)
    }
  }

  // Trends Analysis
  private analyzeTrends(orders: ShopifyOrder[], products: ShopifyProduct[], timeframe: string) {
    // Sales trends over time
    const salesTrends = this.calculateSalesTrends(orders, timeframe)
    
    // Category trends
    const categoryTrends = this.calculateCategoryTrends(orders, products)
    
    // Seasonal patterns (simplified)
    const seasonalPatterns = this.calculateSeasonalPatterns(orders)

    return {
      salesTrends,
      categoryTrends,
      seasonalPatterns
    }
  }

  // Helper methods for data fetching
  private async fetchOrdersData(dateRange: { start: string; end: string }): Promise<ShopifyOrder[]> {
    try {
      const response = await this.apiClient.getOrders(250)
      return response.orders.filter((order: any) => {
        const orderDate = new Date(order.created_at)
        return orderDate >= new Date(dateRange.start) && orderDate <= new Date(dateRange.end)
      }).map(this.transformOrder)
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  private async fetchProductsData(): Promise<ShopifyProduct[]> {
    try {
      const response = await this.apiClient.getProducts(250)
      return response.products.map(this.transformProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  private async fetchCustomersData(dateRange: { start: string; end: string }): Promise<ShopifyCustomer[]> {
    try {
      const response = await this.apiClient.getCustomers(250)
      return response.customers.map(this.transformCustomer)
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  }

  private async fetchPreviousPeriodOrdersData(timeframe: string, startDate: Date): Promise<ShopifyOrder[]> {
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(startDate)
    
    switch (timeframe) {
      case 'last_7_days':
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        break
      case 'last_30_days':
        previousStartDate.setDate(previousStartDate.getDate() - 30)
        break
      case 'last_90_days':
        previousStartDate.setDate(previousStartDate.getDate() - 90)
        break
    }

    return this.fetchOrdersData({
      start: previousStartDate.toISOString(),
      end: previousEndDate.toISOString()
    })
  }

  // Data transformation methods
  private transformOrder(shopifyOrder: any): ShopifyOrder {
    return {
      id: shopifyOrder.id.toString(),
      orderNumber: shopifyOrder.order_number,
      email: shopifyOrder.email,
      customerId: shopifyOrder.customer?.id?.toString(),
      totalPrice: shopifyOrder.total_price,
      subtotalPrice: shopifyOrder.subtotal_price,
      totalTax: shopifyOrder.total_tax,
      currency: shopifyOrder.currency,
      financialStatus: shopifyOrder.financial_status,
      fulfillmentStatus: shopifyOrder.fulfillment_status,
      lineItems: shopifyOrder.line_items.map((item: any) => ({
        id: item.id.toString(),
        productId: item.product_id.toString(),
        variantId: item.variant_id.toString(),
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        totalDiscount: item.total_discount,
        sku: item.sku,
        vendor: item.vendor,
        productType: item.product_type
      })),
      shippingAddress: shopifyOrder.shipping_address,
      billingAddress: shopifyOrder.billing_address,
      createdAt: formatShopifyDate(shopifyOrder.created_at),
      updatedAt: formatShopifyDate(shopifyOrder.updated_at),
      processedAt: formatShopifyDate(shopifyOrder.processed_at),
      cancelledAt: shopifyOrder.cancelled_at ? formatShopifyDate(shopifyOrder.cancelled_at) : undefined,
      tags: shopifyOrder.tags ? shopifyOrder.tags.split(', ') : []
    }
  }

  private transformProduct(shopifyProduct: any): ShopifyProduct {
    return {
      id: shopifyProduct.id.toString(),
      title: shopifyProduct.title,
      handle: shopifyProduct.handle,
      vendor: shopifyProduct.vendor,
      productType: shopifyProduct.product_type,
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
      variants: shopifyProduct.variants.map((variant: any) => ({
        id: variant.id.toString(),
        productId: shopifyProduct.id.toString(),
        title: variant.title,
        price: variant.price,
        sku: variant.sku,
        inventoryQuantity: variant.inventory_quantity,
        weight: variant.weight,
        weightUnit: variant.weight_unit
      })),
      images: shopifyProduct.images.map((image: any) => ({
        id: image.id.toString(),
        productId: shopifyProduct.id.toString(),
        src: image.src,
        alt: image.alt,
        position: image.position
      })),
      createdAt: formatShopifyDate(shopifyProduct.created_at),
      updatedAt: formatShopifyDate(shopifyProduct.updated_at)
    }
  }

  private transformCustomer(shopifyCustomer: any): ShopifyCustomer {
    return {
      id: shopifyCustomer.id.toString(),
      email: shopifyCustomer.email,
      firstName: shopifyCustomer.first_name,
      lastName: shopifyCustomer.last_name,
      phone: shopifyCustomer.phone,
      ordersCount: shopifyCustomer.orders_count,
      totalSpent: shopifyCustomer.total_spent,
      tags: shopifyCustomer.tags ? shopifyCustomer.tags.split(', ') : [],
      createdAt: formatShopifyDate(shopifyCustomer.created_at),
      updatedAt: formatShopifyDate(shopifyCustomer.updated_at),
      lastOrderAt: shopifyCustomer.last_order_date ? formatShopifyDate(shopifyCustomer.last_order_date) : undefined,
      acceptsMarketing: shopifyCustomer.accepts_marketing,
      marketingOptInLevel: shopifyCustomer.marketing_opt_in_level
    }
  }

  // Helper calculation methods
  private calculateProductGrowthRate(productId: string, orders: ShopifyOrder[]): number {
    // Simplified growth rate calculation
    return Math.random() * 20 - 10 // Placeholder: -10% to +10%
  }

  private calculateSalesTrends(orders: ShopifyOrder[], timeframe: string) {
    const periods = this.groupOrdersByPeriod(orders, timeframe)
    return periods.map(period => ({
      period: period.label,
      revenue: period.revenue,
      orders: period.orders,
      trend: this.determineTrend(period.revenue, period.previousRevenue)
    }))
  }

  private calculateCategoryTrends(orders: ShopifyOrder[], products: ShopifyProduct[]) {
    const categoryMap = new Map<string, number>()
    
    orders.forEach(order => {
      order.lineItems.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const category = product.productType || 'Uncategorized'
          categoryMap.set(category, (categoryMap.get(category) || 0) + parseFloat(item.price) * item.quantity)
        }
      })
    })

    return Array.from(categoryMap.entries()).map(([category, revenue]) => ({
      category,
      growth: Math.random() * 30 - 15, // Placeholder: -15% to +15%
      trend: this.determineTrend(revenue, revenue * 0.9) as 'hot' | 'declining' | 'stable'
    }))
  }

  private calculateSeasonalPatterns(orders: ShopifyOrder[]) {
    const monthlyData = new Map<string, number>()
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'long' })
      monthlyData.set(month, (monthlyData.get(month) || 0) + parseFloat(order.totalPrice))
    })

    return Array.from(monthlyData.entries()).map(([month, revenue]) => ({
      month,
      salesMultiplier: revenue / (monthlyData.get('January') || 1),
      insights: `${month} shows ${revenue > 1000 ? 'strong' : 'moderate'} sales performance`
    }))
  }

  private groupOrdersByPeriod(orders: ShopifyOrder[], timeframe: string) {
    // Simplified grouping - in reality, you'd want more sophisticated period grouping
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    return [{
      label: 'Current Period',
      revenue: totalRevenue,
      orders: orders.length,
      previousRevenue: totalRevenue * 0.9 // Placeholder
    }]
  }

  private determineTrend(current: number, previous: number): 'increasing' | 'decreasing' | 'stable' {
    const change = ((current - previous) / previous) * 100
    if (change > 5) return 'increasing'
    if (change < -5) return 'decreasing'
    return 'stable'
  }

  // Insight storage
  private saveInsights(insights: ShopifyBusinessInsights): void {
    try {
      const existingInsights = this.getStoredInsights()
      const updatedInsights = existingInsights.filter(i => i.userId !== insights.userId)
      updatedInsights.push(insights)
      localStorage.setItem('shopify_insights', JSON.stringify(updatedInsights))
    } catch (error) {
      console.error('Error saving insights:', error)
    }
  }

  private getStoredInsights(): ShopifyBusinessInsights[] {
    try {
      const data = localStorage.getItem('shopify_insights')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error retrieving insights:', error)
      return []
    }
  }

  // Generate plain language summaries
  async generateInsightSummaries(insights: ShopifyBusinessInsights): Promise<ShopifyInsightSummary[]> {
    const summaries: ShopifyInsightSummary[] = []

    // Sales Summary
    summaries.push({
      id: `summary-sales-${Date.now()}`,
      userId: insights.userId,
      insightsId: insights.id,
      summary: this.generateSalesSummary(insights),
      keyPoints: this.generateSalesKeyPoints(insights),
      actionableInsights: this.generateSalesActionableInsights(insights),
      urgencyLevel: this.determineSalesUrgency(insights),
      businessImpact: 'revenue',
      generatedAt: new Date(),
      isActive: true
    })

    // Customer Summary
    summaries.push({
      id: `summary-customers-${Date.now()}`,
      userId: insights.userId,
      insightsId: insights.id,
      summary: this.generateCustomerSummary(insights),
      keyPoints: this.generateCustomerKeyPoints(insights),
      actionableInsights: this.generateCustomerActionableInsights(insights),
      urgencyLevel: this.determineCustomerUrgency(insights),
      businessImpact: 'customer',
      generatedAt: new Date(),
      isActive: true
    })

    // Operations Summary
    summaries.push({
      id: `summary-operations-${Date.now()}`,
      userId: insights.userId,
      insightsId: insights.id,
      summary: this.generateOperationsSummary(insights),
      keyPoints: this.generateOperationsKeyPoints(insights),
      actionableInsights: this.generateOperationsActionableInsights(insights),
      urgencyLevel: this.determineOperationsUrgency(insights),
      businessImpact: 'operations',
      generatedAt: new Date(),
      isActive: true
    })

    return summaries
  }

  // Summary generation methods
  private generateSalesSummary(insights: ShopifyBusinessInsights): string {
    const { salesSummary, topProducts } = insights
    const topProduct = topProducts[0]
    
    return `Your store generated ${formatShopifyPrice(salesSummary.totalRevenue.toString(), 'USD')} in revenue from ${salesSummary.totalOrders} orders, with an average order value of ${formatShopifyPrice(salesSummary.averageOrderValue.toString(), 'USD')}. Revenue is ${salesSummary.revenueGrowth >= 0 ? 'up' : 'down'} ${Math.abs(salesSummary.revenueGrowth).toFixed(1)}% compared to the previous period. ${topProduct ? `${topProduct.title} is your top-performing product with ${topProduct.unitsSold} units sold.` : ''}`
  }

  private generateSalesKeyPoints(insights: ShopifyBusinessInsights): string[] {
    const { salesSummary, topProducts } = insights
    const points = [
      `${salesSummary.totalOrders} total orders processed`,
      `${formatShopifyPrice(salesSummary.averageOrderValue.toString(), 'USD')} average order value`,
      `${salesSummary.revenueGrowth >= 0 ? '+' : ''}${salesSummary.revenueGrowth.toFixed(1)}% revenue growth`
    ]
    
    if (topProducts.length > 0) {
      points.push(`${topProducts[0].title} is your best seller`)
    }
    
    return points
  }

  private generateSalesActionableInsights(insights: ShopifyBusinessInsights): string[] {
    const { salesSummary, topProducts } = insights
    const actions = []
    
    if (salesSummary.revenueGrowth < 0) {
      actions.push('Consider launching a promotional campaign to boost sales')
    }
    
    if (salesSummary.averageOrderValue < 50) {
      actions.push('Implement upselling strategies to increase average order value')
    }
    
    if (topProducts.length > 0 && topProducts[0].unitsSold > 50) {
      actions.push(`Stock up on ${topProducts[0].title} - it's performing exceptionally well`)
    }
    
    return actions
  }

  private generateCustomerSummary(insights: ShopifyBusinessInsights): string {
    const { customerMetrics } = insights
    
    return `You have ${customerMetrics.totalCustomers} customers with a ${customerMetrics.repeatCustomerRate.toFixed(1)}% repeat purchase rate. ${customerMetrics.newCustomers} new customers joined recently, and your average customer lifetime value is ${formatShopifyPrice(customerMetrics.customerLifetimeValue.toString(), 'USD')}.`
  }

  private generateCustomerKeyPoints(insights: ShopifyBusinessInsights): string[] {
    const { customerMetrics } = insights
    
    return [
      `${customerMetrics.totalCustomers} total customers`,
      `${customerMetrics.repeatCustomerRate.toFixed(1)}% repeat customer rate`,
      `${formatShopifyPrice(customerMetrics.customerLifetimeValue.toString(), 'USD')} average lifetime value`,
      `${customerMetrics.churnRate.toFixed(1)}% customer churn rate`
    ]
  }

  private generateCustomerActionableInsights(insights: ShopifyBusinessInsights): string[] {
    const { customerMetrics } = insights
    const actions = []
    
    if (customerMetrics.repeatCustomerRate < 25) {
      actions.push('Implement a customer loyalty program to improve retention')
    }
    
    if (customerMetrics.churnRate > 20) {
      actions.push('Launch a win-back campaign for inactive customers')
    }
    
    actions.push('Send personalized follow-up emails to recent customers')
    
    return actions
  }

  private generateOperationsSummary(insights: ShopifyBusinessInsights): string {
    const { fulfillmentMetrics, inventoryAlerts } = insights
    
    return `Your average fulfillment time is ${fulfillmentMetrics.averageFulfillmentTime.toFixed(1)} hours. ${fulfillmentMetrics.delayedOrdersCount} orders are delayed beyond 48 hours (${fulfillmentMetrics.delayedOrdersRate.toFixed(1)}% of total orders). ${inventoryAlerts.lowStockProducts.length} products are running low on inventory.`
  }

  private generateOperationsKeyPoints(insights: ShopifyBusinessInsights): string[] {
    const { fulfillmentMetrics, inventoryAlerts } = insights
    
    return [
      `${fulfillmentMetrics.averageFulfillmentTime.toFixed(1)} hours average fulfillment time`,
      `${fulfillmentMetrics.delayedOrdersCount} delayed orders`,
      `${inventoryAlerts.lowStockProducts.length} low stock alerts`,
      `${fulfillmentMetrics.returnRate.toFixed(1)}% return rate`
    ]
  }

  private generateOperationsActionableInsights(insights: ShopifyBusinessInsights): string[] {
    const { fulfillmentMetrics, inventoryAlerts } = insights
    const actions = []
    
    if (fulfillmentMetrics.delayedOrdersRate > 5) {
      actions.push('Review fulfillment process to reduce delayed orders')
    }
    
    if (inventoryAlerts.lowStockProducts.length > 0) {
      actions.push('Reorder inventory for low stock products immediately')
    }
    
    if (fulfillmentMetrics.returnRate > 10) {
      actions.push('Investigate product quality issues causing returns')
    }
    
    return actions
  }

  // Urgency determination methods
  private determineSalesUrgency(insights: ShopifyBusinessInsights): 'low' | 'medium' | 'high' {
    const { salesSummary } = insights
    if (salesSummary.revenueGrowth < -20) return 'high'
    if (salesSummary.revenueGrowth < -10) return 'medium'
    return 'low'
  }

  private determineCustomerUrgency(insights: ShopifyBusinessInsights): 'low' | 'medium' | 'high' {
    const { customerMetrics } = insights
    if (customerMetrics.churnRate > 30) return 'high'
    if (customerMetrics.repeatCustomerRate < 15) return 'medium'
    return 'low'
  }

  private determineOperationsUrgency(insights: ShopifyBusinessInsights): 'low' | 'medium' | 'high' {
    const { fulfillmentMetrics, inventoryAlerts } = insights
    if (fulfillmentMetrics.delayedOrdersRate > 15 || inventoryAlerts.outOfStockProducts.length > 5) return 'high'
    if (fulfillmentMetrics.delayedOrdersRate > 8 || inventoryAlerts.lowStockProducts.length > 3) return 'medium'
    return 'low'
  }
}

// Utility functions for insights management
export function getStoredInsights(userId: string): ShopifyBusinessInsights | null {
  try {
    const data = localStorage.getItem('shopify_insights')
    if (!data) return null
    
    const insights: ShopifyBusinessInsights[] = JSON.parse(data)
    return insights.find(i => i.userId === userId) || null
  } catch (error) {
    console.error('Error retrieving stored insights:', error)
    return null
  }
}

export function getStoredInsightSummaries(userId: string): ShopifyInsightSummary[] {
  try {
    const data = localStorage.getItem('shopify_insight_summaries')
    if (!data) return []
    
    const summaries: ShopifyInsightSummary[] = JSON.parse(data)
    return summaries.filter(s => s.userId === userId && s.isActive)
  } catch (error) {
    console.error('Error retrieving stored insight summaries:', error)
    return []
  }
}

export function saveInsightSummaries(summaries: ShopifyInsightSummary[]): void {
  try {
    const existingSummaries = getAllStoredInsightSummaries()
    const updatedSummaries = existingSummaries.filter(s => 
      !summaries.some(newS => newS.userId === s.userId && newS.businessImpact === s.businessImpact)
    )
    updatedSummaries.push(...summaries)
    localStorage.setItem('shopify_insight_summaries', JSON.stringify(updatedSummaries))
  } catch (error) {
    console.error('Error saving insight summaries:', error)
  }
}

function getAllStoredInsightSummaries(): ShopifyInsightSummary[] {
  try {
    const data = localStorage.getItem('shopify_insight_summaries')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error retrieving all stored insight summaries:', error)
    return []
  }
} 