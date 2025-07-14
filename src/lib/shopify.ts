import { ShopifyConfig, ShopifyConnection, ShopifyOAuthState, ShopifyRateLimitStatus } from '@/types'
import { promises as fs } from 'fs'
import path from 'path'

// Shopify Configuration
export const SHOPIFY_CONFIG: ShopifyConfig = {
  clientId: process.env.SHOPIFY_CLIENT_ID || '',
  clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
  scopes: [
    'read_orders',
    'read_products', 
    'read_customers',
    'read_inventory',
    'read_analytics',
    'read_reports'
  ],
  redirectUri: process.env.SHOPIFY_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/shopify/callback`,
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
  apiVersion: '2024-01'
}

// OAuth URL Generation
export function generateShopifyOAuthUrl(shop: string, state: string): string {
  const scopes = SHOPIFY_CONFIG.scopes.join(',')
  const params = new URLSearchParams({
    client_id: SHOPIFY_CONFIG.clientId,
    scope: scopes,
    redirect_uri: SHOPIFY_CONFIG.redirectUri,
    state: state,
    'grant_options[]': 'per-user'
  })
  
  return `https://${shop}.myshopify.com/admin/oauth/authorize?${params.toString()}`
}

// OAuth State Management
export function generateOAuthState(userId: string, returnUrl: string = '/dashboard/settings'): ShopifyOAuthState {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return {
    userId,
    returnUrl,
    nonce,
    createdAt: new Date()
  }
}

export function encodeOAuthState(state: ShopifyOAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString('base64')
}

export function decodeOAuthState(encodedState: string): ShopifyOAuthState {
  return JSON.parse(Buffer.from(encodedState, 'base64').toString('utf-8'))
}

// Shopify API Client Class
export class ShopifyApiClient {
  private connection: ShopifyConnection
  private rateLimitStatus: ShopifyRateLimitStatus | null = null

  constructor(connection: ShopifyConnection) {
    this.connection = connection
  }

  // Rate Limiting
  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitStatus) {
      const now = new Date()
      if (this.rateLimitStatus.callsRemaining <= 0 && now < this.rateLimitStatus.resetTime) {
        const waitTime = this.rateLimitStatus.resetTime.getTime() - now.getTime()
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  private updateRateLimitStatus(headers: Headers): void {
    const callLimit = headers.get('x-shopify-shop-api-call-limit')
    if (callLimit) {
      const [callsMade, maxCalls] = callLimit.split('/').map(Number)
      this.rateLimitStatus = {
        callLimit: maxCalls,
        callsMade,
        callsRemaining: maxCalls - callsMade,
        resetTime: new Date(Date.now() + 1000), // Reset every second
        bucketSize: maxCalls,
        leakRate: 2 // 2 calls per second
      }
    }
  }

  // Generic API Request Method
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    await this.checkRateLimit()

    const url = `https://${this.connection.shopDomain}.myshopify.com/admin/api/${SHOPIFY_CONFIG.apiVersion}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.connection.accessToken,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    this.updateRateLimitStatus(response.headers)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Shopify API Error: ${response.status} - ${errorData.errors || response.statusText}`)
    }

    return response.json()
  }

  // Shop Information
  async getShopInfo() {
    return this.makeRequest('/shop.json')
  }

  // Products
  async getProducts(limit: number = 250, sinceId?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (sinceId) params.append('since_id', sinceId)
    return this.makeRequest(`/products.json?${params.toString()}`)
  }

  async getProduct(productId: string) {
    return this.makeRequest(`/products/${productId}.json`)
  }

  // Orders
  async getOrders(limit: number = 250, sinceId?: string, status: string = 'any') {
    const params = new URLSearchParams({ 
      limit: limit.toString(),
      status,
      financial_status: 'any',
      fulfillment_status: 'any'
    })
    if (sinceId) params.append('since_id', sinceId)
    return this.makeRequest(`/orders.json?${params.toString()}`)
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/orders/${orderId}.json`)
  }

  // Customers
  async getCustomers(limit: number = 250, sinceId?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (sinceId) params.append('since_id', sinceId)
    return this.makeRequest(`/customers.json?${params.toString()}`)
  }

  async getCustomer(customerId: string) {
    return this.makeRequest(`/customers/${customerId}.json`)
  }

  // Inventory
  async getInventoryLevels(locationIds?: string[]) {
    const params = new URLSearchParams({ limit: '250' })
    if (locationIds && locationIds.length > 0) {
      params.append('location_ids', locationIds.join(','))
    }
    return this.makeRequest(`/inventory_levels.json?${params.toString()}`)
  }

  // Analytics & Reports
  async getOrdersCount(dateRange?: { start: string; end: string }) {
    const params = new URLSearchParams()
    if (dateRange) {
      params.append('created_at_min', dateRange.start)
      params.append('created_at_max', dateRange.end)
    }
    return this.makeRequest(`/orders/count.json?${params.toString()}`)
  }

  async getCustomersCount(dateRange?: { start: string; end: string }) {
    const params = new URLSearchParams()
    if (dateRange) {
      params.append('created_at_min', dateRange.start)
      params.append('created_at_max', dateRange.end)
    }
    return this.makeRequest(`/customers/count.json?${params.toString()}`)
  }

  // Webhooks
  async createWebhook(topic: string, address: string) {
    return this.makeRequest('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: 'json'
        }
      })
    })
  }

  async getWebhooks() {
    return this.makeRequest('/webhooks.json')
  }

  async deleteWebhook(webhookId: string) {
    return this.makeRequest(`/webhooks/${webhookId}.json`, {
      method: 'DELETE'
    })
  }

  // Connection Health Check
  async testConnection(): Promise<boolean> {
    try {
      await this.getShopInfo()
      return true
    } catch (error) {
      console.error('Shopify connection test failed:', error)
      return false
    }
  }

  // Rate Limit Status
  getRateLimitStatus(): ShopifyRateLimitStatus | null {
    return this.rateLimitStatus
  }
}

// OAuth Token Exchange
export async function exchangeCodeForToken(
  shop: string, 
  code: string
): Promise<{ access_token: string; scope: string }> {
  const response = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: SHOPIFY_CONFIG.clientId,
      client_secret: SHOPIFY_CONFIG.clientSecret,
      code
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OAuth token exchange failed: ${response.status} - ${errorData.error_description || response.statusText}`)
  }

  return response.json()
}

// Webhook Verification
export function verifyWebhook(body: string, signature: string): boolean {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', SHOPIFY_CONFIG.webhookSecret)
  hmac.update(body, 'utf8')
  const hash = hmac.digest('base64')
  return hash === signature
}

// Utility Functions
export function isValidShopDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/
  return shopRegex.test(shop) && shop.length >= 3 && shop.length <= 60
}

export function sanitizeShopDomain(shop: string): string {
  return shop.replace(/\.myshopify\.com$/, '').toLowerCase()
}

export function formatShopifyPrice(price: string, currency: string = 'USD'): string {
  const amount = parseFloat(price)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatShopifyDate(dateString: string): Date {
  return new Date(dateString)
}

// Connection Management
const connectionsFilePath = path.join(process.cwd(), 'shopify_connections.json')

async function readConnectionsFile(): Promise<ShopifyConnection[]> {
  try {
    const data = await fs.readFile(connectionsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [] // File doesn't exist, return empty array
    }
    console.error('Error reading Shopify connections file:', error)
    throw error // Re-throw other errors
  }
}

async function writeConnectionsFile(connections: ShopifyConnection[]): Promise<void> {
  try {
    await fs.writeFile(connectionsFilePath, JSON.stringify(connections, null, 2))
  } catch (error) {
    console.error('Error writing Shopify connections file:', error)
    throw error
  }
}

export async function saveShopifyConnection(connection: ShopifyConnection): Promise<void> {
  const connections = await readConnectionsFile()
  const existingIndex = connections.findIndex(c => c.userId === connection.userId)
  
  if (existingIndex >= 0) {
    connections[existingIndex] = connection
  } else {
    connections.push(connection)
  }
  
  await writeConnectionsFile(connections)
}

export async function getShopifyConnection(userId: string): Promise<ShopifyConnection | null> {
  const connections = await readConnectionsFile()
  return connections.find(c => c.userId === userId && c.isActive) || null
}

export async function getShopifyConnections(): Promise<ShopifyConnection[]> {
  return await readConnectionsFile()
}

export async function removeShopifyConnection(userId: string): Promise<void> {
  let connections = await readConnectionsFile()
  connections = connections.filter(c => c.userId !== userId)
  await writeConnectionsFile(connections)
} 