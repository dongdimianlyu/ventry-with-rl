'use client'

import { useState, useEffect } from 'react'
import { Settings, RefreshCw, User, CheckCircle, AlertCircle, ShoppingBag, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOnboardingProfile, resetOnboarding, formatDate } from '@/lib/utils'
import { CompanyProfile, ShopifyConnection, ShopifyIntegrationStatus } from '@/types'
import { ShopifyConnectionModal, ShopifyConnectionStatus } from '@/components/shopify/ShopifyConnectionModal'
import { getShopifyConnection } from '@/lib/shopify'

export default function SettingsPage() {
  const [onboardingProfile, setOnboardingProfile] = useState<CompanyProfile | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [user, setUser] = useState<{ id: string; name?: string; email: string } | null>(null)
  
  // Shopify integration state
  const [shopifyConnection, setShopifyConnection] = useState<ShopifyConnection | null>(null)
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyIntegrationStatus | null>(null)
  const [showShopifyModal, setShowShopifyModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [shopifyError, setShopifyError] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Load onboarding profile
      const profile = getOnboardingProfile(parsedUser.id)
      setOnboardingProfile(profile)
      
      // Load Shopify connection
      loadShopifyConnection(parsedUser.id)
    }

    // Check for Shopify connection success/error from URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('shopify_connected') === 'true') {
      setShopifyError(null)
      // Reload connection data
      if (userData) {
        const parsedUser = JSON.parse(userData)
        loadShopifyConnection(parsedUser.id)
      }
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/settings')
    }
    if (urlParams.get('error')) {
      setShopifyError(urlParams.get('error'))
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/settings')
    }
  }, [])

  const handleResetOnboarding = async () => {
    if (!user) return
    
    setIsResetting(true)
    try {
      resetOnboarding(user.id)
      setOnboardingProfile(null)
      setShowResetConfirm(false)
      
      // Reload the page to trigger onboarding flow
      window.location.reload()
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    } finally {
      setIsResetting(false)
    }
  }

  const getRoleDisplay = (profile: CompanyProfile) => {
    return profile.userRole === 'other' ? profile.customRole || 'Other' : profile.userRole
  }

  const getFocusDisplay = (profile: CompanyProfile) => {
    return profile.primaryFocus === 'other' ? profile.customFocus || 'Other' : profile.primaryFocus
  }

  // Shopify connection management functions
  const loadShopifyConnection = async (userId: string) => {
    try {
      const connection = getShopifyConnection(userId)
      setShopifyConnection(connection)
      
      if (connection) {
        // Load connection status
        const response = await fetch(`/api/shopify/sync?userId=${userId}`)
        const data = await response.json()
        
        if (data.connected) {
          setShopifyStatus({
            isConnected: true,
            connectionHealth: data.status.isHealthy ? 'healthy' : 'warning',
            lastSuccessfulSync: new Date(data.status.lastSyncAt),
            apiCallsUsed: 0, // Would need to track this
            apiCallsLimit: 1000, // Shopify default
            webhooksActive: 0, // Would need to track this
            webhooksTotal: 0,
            dataFreshness: data.status.dataAge < 6 * 60 * 60 * 1000 ? 'fresh' : 'stale'
          })
        }
      }
    } catch (error) {
      console.error('Error loading Shopify connection:', error)
    }
  }

  const handleShopifyConnect = async (shopDomain: string) => {
    if (!user) return
    
    setIsConnecting(true)
    setShopifyError(null)
    
    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopDomain,
          userId: user.id,
          returnUrl: '/dashboard/settings'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Redirect to Shopify OAuth
        window.location.href = data.oauthUrl
      } else {
        setShopifyError(data.error || 'Failed to initiate connection')
        setIsConnecting(false)
      }
    } catch {
      setShopifyError('Failed to connect to Shopify')
      setIsConnecting(false)
    }
  }

  const handleShopifyDisconnect = async () => {
    if (!user || !shopifyConnection) return
    
    try {
      const response = await fetch('/api/shopify/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        setShopifyConnection(null)
        setShopifyStatus(null)
        setShopifyError(null)
      } else {
        setShopifyError('Failed to disconnect')
      }
    } catch {
      setShopifyError('Failed to disconnect')
    }
  }

  const handleShopifyRefresh = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        await loadShopifyConnection(user.id)
      }
    } catch {
      console.error('Error refreshing Shopify data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Settings className="h-6 w-6 text-[#1A4231] mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Onboarding Profile Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#1A4231]" />
                <span>Company Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-sm">
                    {onboardingProfile.isOnboardingComplete ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700">Onboarding Complete</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700">Onboarding Skipped</span>
                      </>
                    )}
                    {onboardingProfile.onboardingCompletedAt && (
                      <span className="text-gray-500">
                        • {formatDate(onboardingProfile.onboardingCompletedAt)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-gray-900 capitalize">{getRoleDisplay(onboardingProfile)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Size</label>
                      <p className="text-gray-900">{onboardingProfile.companySize} people</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Primary Focus</label>
                      <p className="text-gray-900 capitalize">{getFocusDisplay(onboardingProfile)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Working Style</label>
                      <p className="text-gray-900 capitalize">{onboardingProfile.workingStyle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Team Experience</label>
                      <p className="text-gray-900 capitalize">{onboardingProfile.teamExperience}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Weekly Commitment</label>
                      <p className="text-gray-900">{onboardingProfile.weeklyCommitment} hours</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Description</label>
                    <p className="text-gray-900 text-sm leading-relaxed mt-1">
                      {onboardingProfile.businessDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    {!showResetConfirm ? (
                      <Button
                        onClick={() => setShowResetConfirm(true)}
                        variant="outline"
                        className="flex items-center space-x-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reset Onboarding</span>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Are you sure you want to reset your onboarding? This will clear your current profile and restart the setup process.
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleResetOnboarding}
                            disabled={isResetting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isResetting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              'Yes, Reset'
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowResetConfirm(false)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
                  <p className="text-gray-500 mb-4">
                    Complete the onboarding process to personalize your task generation.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-[#1A4231] hover:bg-[#1A4231]/90 text-white"
                  >
                    Start Onboarding
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopify Integration Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                <span>Shopify Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shopifyConnection && shopifyStatus ? (
                <ShopifyConnectionStatus
                  connection={shopifyConnection}
                  integrationStatus={shopifyStatus}
                  onDisconnect={handleShopifyDisconnect}
                  onRefresh={handleShopifyRefresh}
                />
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Shopify Store</h3>
                  <p className="text-gray-500 mb-4">
                    Get AI-powered task recommendations based on your store&apos;s performance and business insights.
                  </p>
                  {shopifyError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{shopifyError}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => setShowShopifyModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isConnecting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Shopify Store
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shopify Connection Modal */}
      <ShopifyConnectionModal
        isOpen={showShopifyModal}
        onClose={() => setShowShopifyModal(false)}
        onConnect={handleShopifyConnect}
        isConnecting={isConnecting}
      />
    </div>
  )
} 