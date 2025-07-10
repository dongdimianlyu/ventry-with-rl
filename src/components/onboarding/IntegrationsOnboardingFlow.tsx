'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2,
  MessageSquare,
  Calculator,
  ShoppingBag,
  ExternalLink,
  Shield,
  Zap,
  Lock,
  X
} from 'lucide-react'
import { User } from '@/types'

interface IntegrationsOnboardingFlowProps {
  user: User
  onComplete: () => void
  onSkip: () => void
}

interface IntegrationStatus {
  connected: boolean
  connecting: boolean
  error: string | null
}

interface IntegrationConfig {
  id: 'slack' | 'quickbooks' | 'shopify'
  name: string
  description: string
  icon: React.ReactNode
  helpText: string
  logoUrl?: string
  features: string[]
  priority: 'essential' | 'recommended' | 'optional'
}

const integrations: IntegrationConfig[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get task approvals and notifications directly in your team chat.',
    icon: <MessageSquare className="h-6 w-6" />,
    helpText: "We'll never post to Slack without your approval.",
    features: [
      'Smart task notifications',
      'Team approval workflows', 
      'Real-time updates',
      'Secure approval process'
    ],
    priority: 'recommended'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Automatically execute financial tasks and update your books.',
    icon: <Calculator className="h-6 w-6" />,
    helpText: "QuickBooks access is sandboxed and secure.",
    features: [
      'Automated invoice creation',
      'Expense tracking',
      'Financial reporting',
      'Secure data access'
    ],
    priority: 'recommended'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Generate smart business tasks based on your store performance.',
    icon: <ShoppingBag className="h-6 w-6" />,
    helpText: "We only read store data to provide better recommendations.",
    features: [
      'Smart inventory insights',
      'Sales performance tasks',
      'Customer growth recommendations',
      'Automated business intelligence'
    ],
    priority: 'essential'
  }
]

export default function IntegrationsOnboardingFlow({ 
  user, 
  onComplete, 
  onSkip 
}: IntegrationsOnboardingFlowProps) {
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({
    slack: { connected: false, connecting: false, error: null },
    quickbooks: { connected: false, connecting: false, error: null },
    shopify: { connected: false, connecting: false, error: null }
  })

  // Check existing connections on mount
  useEffect(() => {
    checkExistingConnections()
  }, [user.id])

  const checkExistingConnections = async () => {
    // Check Shopify connection
    try {
      const shopifyResponse = await fetch(`/api/shopify/sync?userId=${user.id}`)
      const shopifyData = await shopifyResponse.json()
      if (shopifyData.connected) {
        setIntegrationStatuses(prev => ({
          ...prev,
          shopify: { ...prev.shopify, connected: true }
        }))
      }
    } catch (error) {
      console.error('Error checking Shopify connection:', error)
    }

    // Check Slack connection (would need API endpoint)
    // Check QuickBooks connection (would need API endpoint)
  }

  const handleConnect = async (integrationId: string) => {
    setIntegrationStatuses(prev => ({
      ...prev,
      [integrationId]: { ...prev[integrationId], connecting: true, error: null }
    }))

    try {
      switch (integrationId) {
        case 'slack':
          await connectSlack()
          break
        case 'quickbooks':
          await connectQuickBooks()
          break
        case 'shopify':
          await connectShopify()
          break
      }
    } catch (error) {
      setIntegrationStatuses(prev => ({
        ...prev,
        [integrationId]: { 
          ...prev[integrationId], 
          connecting: false, 
          error: error instanceof Error ? error.message : 'Connection failed' 
        }
      }))
    }
  }

  const connectSlack = async () => {
    const response = await fetch('/api/slack/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        returnUrl: window.location.pathname
      })
    })

    const data = await response.json()
    
    if (data.success) {
      window.location.href = data.oauthUrl
    } else {
      throw new Error(data.error || 'Failed to connect to Slack')
    }
  }

  const connectQuickBooks = async () => {
    const response = await fetch('/api/quickbooks/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        returnUrl: window.location.pathname
      })
    })

    const data = await response.json()
    
    if (data.success) {
      window.location.href = data.oauthUrl
    } else {
      throw new Error(data.error || 'Failed to connect to QuickBooks')
    }
  }

  const connectShopify = async () => {
    const shopDomain = prompt('Enter your Shopify store domain (e.g., "my-store"):')
    if (!shopDomain) {
      setIntegrationStatuses(prev => ({
        ...prev,
        shopify: { ...prev.shopify, connecting: false }
      }))
      return
    }

    const response = await fetch('/api/shopify/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopDomain,
        userId: user.id,
        returnUrl: window.location.pathname
      })
    })

    const data = await response.json()
    
    if (data.success) {
      window.location.href = data.oauthUrl
    } else {
      throw new Error(data.error || 'Failed to connect to Shopify')
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    setIntegrationStatuses(prev => ({
      ...prev,
      [integrationId]: { connected: false, connecting: false, error: null }
    }))
  }

  const getConnectedCount = () => {
    return Object.values(integrationStatuses).filter(status => status.connected).length
  }

  const allRecommendedConnected = () => {
    return integrations
      .filter(int => int.priority === 'essential' || int.priority === 'recommended')
      .every(int => integrationStatuses[int.id].connected)
  }

  const IntegrationCard = ({ integration }: { integration: IntegrationConfig }) => {
    const status = integrationStatuses[integration.id]
    
    return (
      <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 hover:border-[#c9f222]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#1A4231]/10">
                <div className="text-[#1A4231]">
                  {integration.icon}
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#1A4231]">
                  {integration.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {integration.priority === 'essential' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      Essential
                    </span>
                  )}
                  {integration.priority === 'recommended' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#c9f222]/20 text-[#1A4231]">
                      Recommended
                    </span>
                  )}
                  {integration.priority === 'optional' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status Icon */}
            <div className="flex items-center">
              {status.connected ? (
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              ) : status.connecting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-[#1A4231] animate-spin" />
                  <span className="text-sm font-medium text-[#1A4231]">Connecting...</span>
                </div>
              ) : status.error ? (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Error</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm font-medium text-gray-500">Not connected</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {integration.description}
          </p>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#1A4231] flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Key Features</span>
            </h4>
            <ul className="space-y-1">
              {integration.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-[#c9f222]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error Message */}
          {status.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{status.error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              <span>{integration.helpText}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {status.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(integration.id)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  disabled={status.connecting}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={() => handleConnect(integration.id)}
                  disabled={status.connecting}
                  className="bg-[#c9f222] hover:bg-[#c9f222]/90 text-[#1A4231] font-semibold border-0"
                  size="sm"
                >
                  {status.connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect to {integration.name}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img 
                src="/ventry-logo.png" 
                alt="Ventry Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-[#1A4231] rounded-xl items-center justify-center hidden">
                <Zap className="h-5 w-5 text-[#c9f223]" />
              </div>
            </div>
            <span className="text-2xl font-bold text-[#1A4231]">Ventry</span>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2"
          >
            <span>Skip integrations</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Integrations Setup ({getConnectedCount()}/3 connected)
            </span>
            <span className="text-sm font-medium text-[#1A4231]">
              {Math.round((getConnectedCount() / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#c9f222] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(getConnectedCount() / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A4231] rounded-2xl mb-6">
              <Shield className="h-8 w-8 text-[#c9f223]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1A4231] mb-4">
              Connect Your Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Integrate with your favorite business tools to unlock AI-powered workflows. 
              Connect the tools you use most to get personalized, actionable recommendations.
            </p>
          </div>

          {/* Integration Cards */}
          <div className="space-y-6 mb-8">
            {integrations.map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration} 
              />
            ))}
          </div>

          {/* Success State */}
          {allRecommendedConnected() && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <Check className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">
                  You're all set! Ventry is connected to your tools.
                </h3>
              </div>
              <p className="text-green-700">
                Your integrations are configured and ready to generate smart, context-aware tasks 
                based on your actual business data.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 hover:border-[#1A4231] hover:bg-[#1A4231]/5"
            >
              <span>Skip for now</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {getConnectedCount() > 0 ? (
                  <span>✅ {getConnectedCount()} integration{getConnectedCount() !== 1 ? 's' : ''} connected</span>
                ) : (
                  <span>No integrations connected yet</span>
                )}
              </div>
              
              <Button
                onClick={onComplete}
                className="flex items-center space-x-2 px-6 py-3 bg-[#1A4231] hover:bg-[#1A4231]/90 text-white"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Your data is secure and encrypted. We only access what's necessary to provide valuable insights.
        </div>
      </footer>
    </div>
  )
} 