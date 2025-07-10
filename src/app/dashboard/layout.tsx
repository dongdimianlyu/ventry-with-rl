'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { User, CompanyProfile } from '@/types'
import { Building2 } from 'lucide-react'

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 