import { getShopifyConnection } from './shopify'
import { getStoredInsights, getStoredInsightSummaries } from './shopify-insights'
import { ShopifyTaskContext, ShopifyInsightSummary } from '@/types'

export async function generateShopifyTaskContext(userId: string): Promise<ShopifyTaskContext | null> {
  try {
    // Check if user has Shopify connection
    const connection = getShopifyConnection(userId)
    if (!connection) {
      return null
    }

    // Get stored insights and summaries
    const insights = getStoredInsights(userId)
    const summaries = getStoredInsightSummaries(userId)

    if (!insights || summaries.length === 0) {
      return null
    }

    // Generate business context summary
    const businessContext = generateBusinessContextSummary(insights, connection)

    // Extract urgent alerts
    const urgentAlerts = extractUrgentAlerts(summaries)

    // Extract opportunities
    const opportunities = extractOpportunities(summaries, insights)

    return {
      insights: summaries,
      urgentAlerts,
      opportunities,
      businessContext,
      timeframe: insights.timeframe
    }

  } catch (error) {
    console.error('Error generating Shopify task context:', error)
    return null
  }
}

function generateBusinessContextSummary(insights: any, connection: any): string {
  const { salesSummary, customerMetrics, fulfillmentMetrics, topProducts } = insights

  const context = []

  // Sales performance context
  if (salesSummary.revenueGrowth !== 0) {
    const trend = salesSummary.revenueGrowth > 0 ? 'growing' : 'declining'
    context.push(`Revenue is ${trend} by ${Math.abs(salesSummary.revenueGrowth).toFixed(1)}% with $${salesSummary.totalRevenue.toLocaleString()} from ${salesSummary.totalOrders} orders`)
  }

  // Customer insights context
  if (customerMetrics.repeatCustomerRate < 25) {
    context.push(`Low customer retention at ${customerMetrics.repeatCustomerRate.toFixed(1)}% repeat rate - focus needed on loyalty`)
  } else if (customerMetrics.repeatCustomerRate > 40) {
    context.push(`Strong customer loyalty with ${customerMetrics.repeatCustomerRate.toFixed(1)}% repeat customers`)
  }

  // Operational context
  if (fulfillmentMetrics.delayedOrdersRate > 10) {
    context.push(`Fulfillment delays affecting ${fulfillmentMetrics.delayedOrdersRate.toFixed(1)}% of orders - operational improvement needed`)
  }

  // Product performance context
  if (topProducts.length > 0) {
    const topProduct = topProducts[0]
    context.push(`${topProduct.title} is top performer with ${topProduct.unitsSold} units sold`)
  }

  return context.join('. ') + '.'
}

function extractUrgentAlerts(summaries: ShopifyInsightSummary[]): string[] {
  const alerts: string[] = []

  summaries.forEach(summary => {
    if (summary.urgencyLevel === 'high') {
      alerts.push(`HIGH PRIORITY: ${summary.summary}`)
    } else if (summary.urgencyLevel === 'medium' && summary.businessImpact === 'operations') {
      alerts.push(`OPERATIONS ALERT: ${summary.summary}`)
    }
  })

  return alerts
}

function extractOpportunities(summaries: ShopifyInsightSummary[], insights: any): string[] {
  const opportunities: string[] = []

  // Revenue growth opportunities
  if (insights.salesSummary.revenueGrowth > 10) {
    opportunities.push('Strong revenue growth momentum - consider scaling successful initiatives')
  }

  // Product opportunities
  if (insights.topProducts.length > 0) {
    const topProduct = insights.topProducts[0]
    if (topProduct.growthRate > 20) {
      opportunities.push(`${topProduct.title} showing strong growth - potential for inventory scaling or marketing focus`)
    }
  }

  // Customer opportunities
  if (insights.customerMetrics.newCustomers > insights.customerMetrics.returningCustomers) {
    opportunities.push('High new customer acquisition - implement retention strategies to maximize lifetime value')
  }

  // Inventory opportunities
  if (insights.inventoryAlerts.lowStockProducts.length > 0) {
    opportunities.push('Low stock alerts present - opportunity to optimize inventory management and prevent stockouts')
  }

  // Extract opportunities from actionable insights
  summaries.forEach(summary => {
    if (summary.urgencyLevel === 'low' && summary.businessImpact === 'revenue') {
      summary.actionableInsights.forEach(insight => {
        if (insight.toLowerCase().includes('opportunity') || insight.toLowerCase().includes('consider')) {
          opportunities.push(insight)
        }
      })
    }
  })

  return opportunities
}

// Helper function to check if Shopify data is fresh enough for task generation
export function isShopifyDataFresh(userId: string): boolean {
  try {
    const insights = getStoredInsights(userId)
    if (!insights) return false

    const dataAge = Date.now() - new Date(insights.generatedAt).getTime()
    const sixHours = 6 * 60 * 60 * 1000

    return dataAge < sixHours
  } catch (error) {
    console.error('Error checking Shopify data freshness:', error)
    return false
  }
}

// Helper function to get Shopify-enhanced task priorities
export function enhanceTaskPrioritiesWithShopify(tasks: any[], shopifyContext: ShopifyTaskContext): any[] {
  if (!shopifyContext || tasks.length === 0) return tasks

  return tasks.map(task => {
    let priority = task.priority
    let explanation = task.explanation

    // Boost priority for tasks related to urgent Shopify alerts
    shopifyContext.urgentAlerts.forEach(alert => {
      if (alert.toLowerCase().includes('inventory') && task.title.toLowerCase().includes('inventory')) {
        priority = 'high'
        explanation += ` [URGENT: Based on Shopify data showing ${alert}]`
      }
      if (alert.toLowerCase().includes('fulfillment') && task.title.toLowerCase().includes('fulfillment')) {
        priority = 'high'
        explanation += ` [URGENT: ${alert}]`
      }
    })

    // Add business impact context from Shopify insights
    const relevantInsight = shopifyContext.insights.find(insight => 
      task.title.toLowerCase().includes(insight.businessImpact) ||
      task.description.toLowerCase().includes(insight.businessImpact)
    )

    if (relevantInsight) {
      explanation += ` [Shopify Insight: ${relevantInsight.summary}]`
    }

    return {
      ...task,
      priority,
      explanation
    }
  })
}

// Helper function to generate Shopify-specific tasks
export function generateShopifySpecificTasks(shopifyContext: ShopifyTaskContext): any[] {
  const tasks: any[] = []

  // Generate tasks for urgent alerts
  shopifyContext.urgentAlerts.forEach(alert => {
    if (alert.includes('inventory')) {
      tasks.push({
        title: 'Address inventory shortage alerts from Shopify',
        description: 'Review low stock products identified in Shopify analytics and create reorder plan to prevent stockouts',
        explanation: `Based on Shopify data: ${alert}`,
        priority: 'high',
        estimatedHours: 2,
        businessImpact: {
          type: 'revenue_growth',
          description: 'Preventing stockouts maintains sales momentum and customer satisfaction',
          estimatedValue: 'Prevent potential revenue loss',
          timeframe: 'immediate'
        }
      })
    }

    if (alert.includes('fulfillment')) {
      tasks.push({
        title: 'Optimize order fulfillment process',
        description: 'Analyze delayed orders in Shopify and implement process improvements to reduce fulfillment time',
        explanation: `Based on Shopify data: ${alert}`,
        priority: 'high',
        estimatedHours: 3,
        businessImpact: {
          type: 'customer_satisfaction',
          description: 'Faster fulfillment improves customer satisfaction and reduces support requests',
          estimatedValue: '20% reduction in fulfillment time',
          timeframe: 'within 2 weeks'
        }
      })
    }
  })

  // Generate tasks for opportunities
  shopifyContext.opportunities.slice(0, 2).forEach(opportunity => {
    if (opportunity.includes('growth')) {
      tasks.push({
        title: 'Scale successful growth initiatives',
        description: 'Analyze top-performing products and marketing channels to replicate success across other areas',
        explanation: `Shopify opportunity: ${opportunity}`,
        priority: 'medium',
        estimatedHours: 4,
        businessImpact: {
          type: 'revenue_growth',
          description: 'Scaling successful initiatives can multiply current growth rates',
          estimatedValue: '15-25% revenue increase',
          timeframe: 'within 1 month'
        }
      })
    }

    if (opportunity.includes('retention')) {
      tasks.push({
        title: 'Implement customer retention strategy',
        description: 'Create email campaigns and loyalty programs to convert new customers into repeat buyers',
        explanation: `Shopify opportunity: ${opportunity}`,
        priority: 'medium',
        estimatedHours: 3,
        businessImpact: {
          type: 'customer_satisfaction',
          description: 'Improved retention increases customer lifetime value',
          estimatedValue: '30% increase in repeat purchases',
          timeframe: 'within 6 weeks'
        }
      })
    }
  })

  return tasks.slice(0, 2) // Limit to 2 Shopify-specific tasks
} 