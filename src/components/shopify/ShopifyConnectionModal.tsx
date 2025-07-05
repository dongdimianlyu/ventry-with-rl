'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingBag, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowRight,
  Eye,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Lock,
  Info
} from 'lucide-react'
import { ShopifyConnection, ShopifyIntegrationStatus } from '@/types'

interface ShopifyConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (shopDomain: string) => void
  existingConnection?: ShopifyConnection | null
  integrationStatus?: ShopifyIntegrationStatus | null
  isConnecting?: boolean
}

export function ShopifyConnectionModal({ 
  isOpen, 
  onClose, 
  onConnect, 
  existingConnection,
  integrationStatus,
  isConnecting = false 
}: ShopifyConnectionModalProps) {
  const [shopDomain, setShopDomain] = useState('')
  const [currentStep, setCurrentStep] = useState<'intro' | 'permissions' | 'connect'>('intro')
  const [domainError, setDomainError] = useState('')

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('permissions')
    } else if (currentStep === 'permissions') {
      setCurrentStep('connect')
    }
  }

  const handleBack = () => {
    if (currentStep === 'permissions') {
      setCurrentStep('intro')
    } else if (currentStep === 'connect') {
      setCurrentStep('permissions')
    }
  }

  const handleConnect = () => {
    if (!shopDomain.trim()) {
      setDomainError('Please enter your shop domain')
      return
    }

    // Validate shop domain format
    const cleanDomain = shopDomain.replace(/\.myshopify\.com$/, '').toLowerCase()
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(cleanDomain)) {
      setDomainError('Please enter a valid shop domain (e.g., your-shop-name)')
      return
    }

    setDomainError('')
    onConnect(cleanDomain)
  }

  const permissions = [
    {
      icon: <ShoppingBag className="h-5 w-5 text-blue-600" />,
      title: 'Read Orders',
      description: 'View order history, sales data, and customer purchase patterns',
      why: 'To analyze sales trends and identify growth opportunities'
    },
    {
      icon: <Package className="h-5 w-5 text-green-600" />,
      title: 'Read Products',
      description: 'Access product information, inventory levels, and catalog data',
      why: 'To track product performance and inventory management'
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: 'Read Customers',
      description: 'View customer profiles, purchase history, and engagement metrics',
      why: 'To understand customer behavior and improve retention'
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-orange-600" />,
      title: 'Read Analytics',
      description: 'Access sales reports, conversion metrics, and performance data',
      why: 'To generate actionable business insights and recommendations'
    }
  ]

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: 'Smart Task Generation',
      description: 'Get AI-powered tasks based on your actual business performance and trends'
    },
    {
      icon: <Eye className="h-6 w-6 text-blue-500" />,
      title: 'Business Intelligence',
      description: 'Receive plain-language insights about sales, customers, and operations'
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
      title: 'Proactive Alerts',
      description: 'Get notified about inventory issues, fulfillment delays, and opportunities'
    }
  ]

  const renderIntroStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Shopify Store</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Supercharge your task generation with real business insights from your Shopify store.
        </p>
      </div>

      <div className="grid gap-4">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Privacy & Security</h4>
            <p className="text-sm text-blue-700">
              We only request read-only access to your store data. Your information is never shared 
              and is used solely to improve your task recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderPermissionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Permissions Required</h2>
        <p className="text-gray-600 text-sm">
          We request only the minimum permissions needed to provide valuable insights
        </p>
      </div>

      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {permission.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{permission.title}</h3>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{permission.why}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Read-Only Access</h4>
            <p className="text-sm text-amber-700">
              We will never modify your store data, create orders, or make changes to your products. 
              This is strictly read-only access for analytics purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          Authorize Access
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderConnectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
        <p className="text-gray-600 text-sm">
          Enter your Shopify store domain to establish the connection
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-2">
            Shop Domain
          </label>
          <div className="relative">
            <input
              id="shopDomain"
              type="text"
              value={shopDomain}
              onChange={(e) => {
                setShopDomain(e.target.value)
                setDomainError('')
              }}
              placeholder="your-shop-name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                domainError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isConnecting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">.myshopify.com</span>
            </div>
          </div>
          {domainError && (
            <p className="mt-1 text-sm text-red-600">{domainError}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Enter just the shop name (e.g., "my-store" for my-store.myshopify.com)
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. You'll be redirected to Shopify to authorize the connection</li>
            <li>2. Review and approve the requested permissions</li>
            <li>3. You'll be brought back to Ventry with your store connected</li>
            <li>4. We'll immediately start analyzing your data for insights</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={isConnecting}>
          Back
        </Button>
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting || !shopDomain.trim()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              Connect Store
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">Shopify Integration</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isConnecting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'intro' && renderIntroStep()}
          {currentStep === 'permissions' && renderPermissionsStep()}
          {currentStep === 'connect' && renderConnectStep()}
        </div>
      </div>
    </div>
  )
}

// Connection Status Component
interface ShopifyConnectionStatusProps {
  connection: ShopifyConnection
  integrationStatus: ShopifyIntegrationStatus
  onDisconnect: () => void
  onRefresh: () => void
}

export function ShopifyConnectionStatus({ 
  connection, 
  integrationStatus, 
  onDisconnect, 
  onRefresh 
}: ShopifyConnectionStatusProps) {
  const getStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />
      case 'warning': return <AlertCircle className="h-5 w-5" />
      case 'error': return <X className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const getDataFreshnessText = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'Data is up to date'
      case 'stale': return 'Data is 1-6 hours old'
      case 'very_stale': return 'Data is over 6 hours old'
      default: return 'Data freshness unknown'
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5 text-green-600" />
          <span>Shopify Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{connection.shopName}</h3>
            <p className="text-sm text-gray-600">{connection.shopDomain}.myshopify.com</p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(integrationStatus.connectionHealth)}`}>
            {getStatusIcon(integrationStatus.connectionHealth)}
            <span className="capitalize">{integrationStatus.connectionHealth}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Last Sync</div>
            <div className="font-semibold text-gray-900">
              {new Date(integrationStatus.lastSuccessfulSync).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Data Freshness</div>
            <div className="font-semibold text-gray-900">
              {getDataFreshnessText(integrationStatus.dataFreshness)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">API Usage</div>
            <div className="font-semibold text-gray-900">
              {integrationStatus.apiCallsUsed} / {integrationStatus.apiCallsLimit}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(integrationStatus.apiCallsUsed / integrationStatus.apiCallsLimit) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Webhooks</div>
            <div className="font-semibold text-gray-900">
              {integrationStatus.webhooksActive} / {integrationStatus.webhooksTotal} active
            </div>
          </div>
        </div>

        {integrationStatus.lastError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900">Last Error</div>
                <div className="text-sm text-red-700">{integrationStatus.lastError.message}</div>
                <div className="text-xs text-red-600 mt-1">
                  {new Date(integrationStatus.lastError.occurredAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onRefresh}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={onDisconnect} className="text-red-600 hover:text-red-700">
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 