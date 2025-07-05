'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { User, CompanyProfile } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Check if onboarding is complete
    const onboardingData = localStorage.getItem(`onboarding_${parsedUser.id}`)
    if (!onboardingData) {
      setShowOnboarding(true)
    } else {
      try {
        const profile = JSON.parse(onboardingData) as CompanyProfile
        if (!profile.isOnboardingComplete) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error parsing onboarding data:', error)
        setShowOnboarding(true)
      }
    }

    setLoading(false)
  }, [router])

  const handleOnboardingComplete = (profile: CompanyProfile) => {
    if (!user) return
    
    // Save the complete profile
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(profile))
    
    // Update user data to include onboarding completion
    const updatedUser = { ...user, onboardingComplete: true }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    setShowOnboarding(false)
  }

  const handleSkipOnboarding = () => {
    if (!user) return
    
    // Create a minimal profile to indicate onboarding was skipped
    const skippedProfile: CompanyProfile = {
      id: `profile-${Date.now()}`,
      userId: user.id,
      userRole: 'founder',
      companySize: 5,
      businessDescription: 'Onboarding skipped',
      teamExperience: 'balanced',
      primaryFocus: 'growth',
      workingStyle: 'flexible',
      weeklyCommitment: 40,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOnboardingComplete: false,
      onboardingCompletedAt: undefined
    }
    
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(skippedProfile))
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#1A4231] rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-[#c9f223] border-t-transparent rounded-full animate-spin" />
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
        onSkip={handleSkipOnboarding}
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