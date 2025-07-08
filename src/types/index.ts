export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  explanation: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  dueDate: Date
  createdAt: Date
  relatedGoalIds: string[]
  businessImpact?: {
    type: 'cost_reduction' | 'revenue_growth' | 'profit_increase' | 'time_savings' | 'efficiency_gain' | 'risk_mitigation' | 'customer_satisfaction' | 'strategic_advantage'
    description: string
    estimatedValue?: string
    timeframe?: string
  }
}

export interface TeamMember {
  id: string
  name: string
  role: 'Marketing' | 'Sales' | 'Product' | 'Design' | 'Ops' | 'Custom'
  customRole?: string
}

export interface TeamTask {
  id: string
  title: string
  description: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  dueDate: Date
  assignedTo: string // TeamMember ID
  businessImpact?: {
    type: 'cost_reduction' | 'revenue_growth' | 'profit_increase' | 'time_savings' | 'efficiency_gain' | 'risk_mitigation' | 'customer_satisfaction' | 'strategic_advantage'
    description: string
    estimatedValue?: string
    timeframe?: string
  }
}

export interface TeamSetup {
  id: string
  userId: string
  members: TeamMember[]
  isSetupComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  category: 'strategy' | 'operations' | 'growth' | 'retention' | 'sales' | 'marketing' | 'finance' | 'customer-success' | 'role-templates' | 'frameworks' | 'planning' | 'workflows' | 'time-estimates' | 'best-practices' | 'operational-context'
  tags: string[]
}

export interface CompanyProfile {
  id: string
  userId: string
  userRole: 'founder' | 'ceo' | 'coo' | 'manager' | 'lead' | 'other'
  customRole?: string
  companySize: number
  businessDescription: string
  teamExperience: 'guided' | 'balanced' | 'independent'
  primaryFocus: 'growth' | 'fundraising' | 'product' | 'operations' | 'other'
  customFocus?: string
  workingStyle: 'structured' | 'flexible' | 'agile'
  weeklyCommitment: number
  createdAt: Date
  updatedAt: Date
  isOnboardingComplete: boolean
  onboardingCompletedAt?: Date
}

export interface TaskGenerationContext {
  goals: Goal[]
  previousTasks: Task[]
  knowledgeBase: KnowledgeBase[]
  timeframe: 'today' | 'week'
  shopifyContext?: ShopifyTaskContext
}

// New types for task suggestion system
export interface TaskSuggestion {
  id: string
  title: string
  description: string
  explanation: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  relatedGoalIds: string[]
  selected: boolean
  rank: number // For auto-mode priority ranking
  businessImpact?: {
    type: 'cost_reduction' | 'revenue_growth' | 'profit_increase' | 'time_savings' | 'efficiency_gain' | 'risk_mitigation' | 'customer_satisfaction' | 'strategic_advantage'
    description: string
    estimatedValue?: string
    timeframe?: string
  }
}

export interface TeamTaskSuggestion {
  id: string
  title: string
  description: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  collaborationNeeded?: string
  successMetrics?: string
  selected: boolean
  rank: number // For auto-mode priority ranking
  assignedTo: string
  businessImpact?: {
    type: 'cost_reduction' | 'revenue_growth' | 'profit_increase' | 'time_savings' | 'efficiency_gain' | 'risk_mitigation' | 'customer_satisfaction' | 'strategic_advantage'
    description: string
    estimatedValue?: string
    timeframe?: string
  }
}

export interface TaskSuggestionResponse {
  ceoSuggestions: TaskSuggestion[]
  teamSuggestions: Record<string, TeamTaskSuggestion[]>
  message: string
}

export interface AutoModeSettings {
  enabled: boolean
  maxTasksPerPerson: number // Default 3
  prioritizeHighImpact: boolean
  ensureDiversity: boolean
}

export interface TaskSelectionState {
  ceoSelected: TaskSuggestion[]
  teamSelected: Record<string, TeamTaskSuggestion[]>
  autoMode: AutoModeSettings
}

export interface OnboardingStatus {
  userId: string
  isComplete: boolean
  completedAt?: Date
  currentStep: number
  totalSteps: number
  canSkip: boolean
}

// Shopify Integration Types
export interface ShopifyConnection {
  id: string
  userId: string
  shopDomain: string
  accessToken: string
  shopName: string
  shopEmail: string
  shopCurrency: string
  shopTimezone: string
  connectedAt: Date
  lastSyncAt: Date
  isActive: boolean
  permissions: string[]
  webhookIds: string[]
}

export interface ShopifyOAuthState {
  userId: string
  returnUrl: string
  nonce: string
  createdAt: Date
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  productType: string
  tags: string[]
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  createdAt: Date
  updatedAt: Date
}

export interface ShopifyVariant {
  id: string
  productId: string
  title: string
  price: string
  sku: string
  inventoryQuantity: number
  weight: number
  weightUnit: string
}

export interface ShopifyImage {
  id: string
  productId: string
  src: string
  alt: string
  position: number
}

export interface ShopifyOrder {
  id: string
  orderNumber: string
  email: string
  customerId?: string
  totalPrice: string
  subtotalPrice: string
  totalTax: string
  currency: string
  financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided'
  fulfillmentStatus: 'fulfilled' | 'null' | 'partial' | 'restocked'
  lineItems: ShopifyLineItem[]
  shippingAddress?: ShopifyAddress
  billingAddress?: ShopifyAddress
  createdAt: Date
  updatedAt: Date
  processedAt: Date
  cancelledAt?: Date
  tags: string[]
}

export interface ShopifyLineItem {
  id: string
  productId: string
  variantId: string
  title: string
  quantity: number
  price: string
  totalDiscount: string
  sku: string
  vendor: string
  productType: string
}

export interface ShopifyAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  country: string
  zip: string
  phone?: string
}

export interface ShopifyCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  ordersCount: number
  totalSpent: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastOrderAt?: Date
  acceptsMarketing: boolean
  marketingOptInLevel: string
}

export interface ShopifyWebhook {
  id: string
  topic: string
  address: string
  format: 'json' | 'xml'
  createdAt: Date
  updatedAt: Date
}

// Business Intelligence Types
export interface ShopifyBusinessInsights {
  id: string
  userId: string
  shopDomain: string
  generatedAt: Date
  timeframe: 'last_7_days' | 'last_30_days' | 'last_90_days'
  
  // Sales Performance
  salesSummary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    orderGrowth: number
  }
  
  // Product Performance
  topProducts: {
    productId: string
    title: string
    unitsSold: number
    revenue: number
    growthRate: number
  }[]
  
  // Customer Insights
  customerMetrics: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    repeatCustomerRate: number
    customerLifetimeValue: number
    churnRate: number
  }
  
  // Fulfillment & Operations
  fulfillmentMetrics: {
    averageFulfillmentTime: number
    delayedOrdersCount: number
    delayedOrdersRate: number
    returnRate: number
    refundRate: number
  }
  
  // Cart & Conversion
  conversionMetrics: {
    cartAbandonmentRate: number
    checkoutConversionRate: number
    averageItemsPerOrder: number
    bounceRate: number
  }
  
  // Inventory Insights
  inventoryAlerts: {
    lowStockProducts: {
      productId: string
      title: string
      currentStock: number
      projectedDaysLeft: number
    }[]
    outOfStockProducts: {
      productId: string
      title: string
      missedSales: number
    }[]
  }
  
  // Trends & Patterns
  trends: {
    salesTrends: {
      period: string
      revenue: number
      orders: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }[]
    categoryTrends: {
      category: string
      growth: number
      trend: 'hot' | 'declining' | 'stable'
    }[]
    seasonalPatterns: {
      month: string
      salesMultiplier: number
      insights: string
    }[]
  }
}

export interface ShopifyInsightSummary {
  id: string
  userId: string
  insightsId: string
  summary: string
  keyPoints: string[]
  actionableInsights: string[]
  urgencyLevel: 'low' | 'medium' | 'high'
  businessImpact: 'revenue' | 'operations' | 'customer' | 'inventory' | 'marketing'
  generatedAt: Date
  isActive: boolean
}

// API Response Types
export interface ShopifyApiResponse<T> {
  data: T
  errors?: ShopifyApiError[]
  extensions?: {
    cost: {
      requestedQueryCost: number
      actualQueryCost: number
      throttleStatus: {
        maximumAvailable: number
        currentlyAvailable: number
        restoreRate: number
      }
    }
  }
}

export interface ShopifyApiError {
  message: string
  locations?: {
    line: number
    column: number
  }[]
  path?: string[]
  extensions?: {
    code: string
    exception?: {
      stacktrace: string[]
    }
  }
}

export interface ShopifyRateLimitStatus {
  callLimit: number
  callsMade: number
  callsRemaining: number
  resetTime: Date
  bucketSize: number
  leakRate: number
}

// Configuration Types
export interface ShopifyConfig {
  clientId: string
  clientSecret: string
  scopes: string[]
  redirectUri: string
  webhookSecret: string
  apiVersion: string
}

export interface ShopifyConnectionSettings {
  autoSync: boolean
  syncInterval: number // in minutes
  enableWebhooks: boolean
  webhookEvents: string[]
  dataRetentionDays: number
  insightGenerationFrequency: 'daily' | 'weekly' | 'monthly'
  enableTaskGeneration: boolean
  taskGenerationContext: 'all' | 'high_priority' | 'custom'
}

// Integration Status Types
export interface ShopifyIntegrationStatus {
  isConnected: boolean
  connectionHealth: 'healthy' | 'warning' | 'error'
  lastSuccessfulSync: Date
  lastError?: {
    message: string
    code: string
    occurredAt: Date
  }
  apiCallsUsed: number
  apiCallsLimit: number
  webhooksActive: number
  webhooksTotal: number
  dataFreshness: 'fresh' | 'stale' | 'very_stale'
}

// Task Generation Enhancement Types
export interface ShopifyTaskContext {
  insights: ShopifyInsightSummary[]
  urgentAlerts: string[]
  opportunities: string[]
  businessContext: string
  timeframe: string
}

// RL Agent Task Types
export interface RLTask {
  id: string
  userId: string
  title: string
  description: string
  action: string
  quantity: number
  predicted_roi: string
  confidence_score: string
  explanation: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  approved: boolean | null
  dueDate: Date
  createdAt: Date
  rlData: {
    expected_roi: string
    confidence: string
    reasoning: string
    timestamp: string
    alternative_actions?: any[]
  }
}

export interface RLRecommendation {
  action: string
  quantity: number
  expected_roi: string
  confidence: string
  reasoning: string
  timestamp: string
  alternative_actions?: any[]
  generated_at: string
  model_type: string
  simulation_episodes: number
} 