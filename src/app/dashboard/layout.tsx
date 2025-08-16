'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import IntegrationsOnboardingFlow from '@/components/onboarding/IntegrationsOnboardingFlow'
import { User, CompanyProfile } from '@/types'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user: firebaseUser, userProfile, loading: authLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showIntegrationsOnboarding, setShowIntegrationsOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!firebaseUser) {
      router.push('/auth/signin')
      return
    }

    // Convert Firebase user profile to local User type
    if (userProfile) {
      const convertedUser: User = {
        id: userProfile.uid,
        email: userProfile.email,
        name: userProfile.name,
        createdAt: userProfile.createdAt,
      }
      setUser(convertedUser)

      // Check if we're on localhost - if so, always show onboarding
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      
      if (isLocalhost) {
        // Force onboarding flow on localhost
        setShowOnboarding(true)
      } else {
        // Normal onboarding logic for production
        const onboardingData = localStorage.getItem(`onboarding_${userProfile.uid}`)
        const integrationsData = localStorage.getItem(`integrations_onboarding_${userProfile.uid}`)
        
        if (!onboardingData) {
          setShowOnboarding(true)
        } else {
          try {
            const profile = JSON.parse(onboardingData) as CompanyProfile
            if (!profile.isOnboardingComplete) {
              setShowOnboarding(true)
            } else if (!integrationsData) {
              // Main onboarding complete, but integrations onboarding not shown yet
              setShowIntegrationsOnboarding(true)
            }
          } catch (error) {
            console.error('Error parsing onboarding data:', error)
            setShowOnboarding(true)
          }
        }
      }

      setLoading(false)
    }
  }, [authLoading, firebaseUser, userProfile, router])

  const handleOnboardingComplete = (profile: CompanyProfile) => {
    if (!user) return
    
    // Save the complete profile
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(profile))
    
    // Update user data to include onboarding completion
    const updatedUser = { ...user, onboardingComplete: true }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    setShowOnboarding(false)
    
    // Show integrations onboarding next
    setShowIntegrationsOnboarding(true)
  }

  const handleIntegrationsOnboardingComplete = () => {
    if (!user) return
    
    // Mark integrations onboarding as complete
    localStorage.setItem(`integrations_onboarding_${user.id}`, JSON.stringify({ 
      completed: true, 
      completedAt: new Date().toISOString() 
    }))
    
    setShowIntegrationsOnboarding(false)
  }

  const handleIntegrationsOnboardingSkip = () => {
    if (!user) return
    
    // Mark integrations onboarding as skipped
    localStorage.setItem(`integrations_onboarding_${user.id}`, JSON.stringify({ 
      skipped: true, 
      skippedAt: new Date().toISOString() 
    }))
    
    setShowIntegrationsOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#1A4231] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-[#c9f223] animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding && user) {
    return (
      <OnboardingFlow
        user={user}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  if (showIntegrationsOnboarding && user) {
    return (
      <IntegrationsOnboardingFlow
        user={user}
        onComplete={handleIntegrationsOnboardingComplete}
        onSkip={handleIntegrationsOnboardingSkip}
      />
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 