'use client'

import { useState, useEffect } from 'react'
import { Settings, RefreshCw, User, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOnboardingProfile, resetOnboarding, formatDate } from '@/lib/utils'
import { CompanyProfile } from '@/types'

export default function SettingsPage() {
  const [onboardingProfile, setOnboardingProfile] = useState<CompanyProfile | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [user, setUser] = useState<{ id: string; name?: string; email: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Load onboarding profile
      const profile = getOnboardingProfile(parsedUser.id)
      setOnboardingProfile(profile)
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

          {/* Additional Settings Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#1A4231]" />
                <span>Application Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">More Settings Coming Soon</h3>
                <p className="text-gray-500">
                  Additional preferences, notifications, and team settings will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 