'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Target, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Sparkles,
  Briefcase,
  TrendingUp,
  Settings,
  User
} from 'lucide-react'
import { CompanyProfile, User as UserType } from '@/types'

interface OnboardingFlowProps {
  user: UserType
  onComplete: (profile: CompanyProfile) => void
}

export default function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({
    userId: user.id,
    userRole: 'founder',
    companySize: 5,
    businessDescription: '',
    teamExperience: 'balanced',
    primaryFocus: 'growth',
    workingStyle: 'structured',
    weeklyCommitment: 40
  })

  const steps = [
    {
      id: 'role',
      title: 'Your Role',
      description: 'What\'s your position in the company?',
      icon: <User className="h-6 w-6" />
    },
    {
      id: 'company',
      title: 'Company Size',
      description: 'How many people are on your team?',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'business',
      title: 'Business Context',
      description: 'Tell us about your company',
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: 'experience',
      title: 'Team Experience',
      description: 'How should the AI work with your team?',
      icon: <Briefcase className="h-6 w-6" />
    },
    {
      id: 'focus',
      title: 'Primary Focus',
      description: 'What\'s your main priority right now?',
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 'style',
      title: 'Working Style',
      description: 'How do you prefer to work?',
      icon: <Settings className="h-6 w-6" />
    },
    {
      id: 'commitment',
      title: 'Time Commitment',
      description: 'How many hours per week can your team commit?',
      icon: <Clock className="h-6 w-6" />
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      const completeProfile: CompanyProfile = {
        id: `profile-${Date.now()}`,
        userId: user.id,
        userRole: profile.userRole!,
        customRole: profile.customRole,
        companySize: profile.companySize!,
        businessDescription: profile.businessDescription!,
        teamExperience: profile.teamExperience!,
        primaryFocus: profile.primaryFocus!,
        customFocus: profile.customFocus,
        workingStyle: profile.workingStyle!,
        weeklyCommitment: profile.weeklyCommitment!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      onComplete(completeProfile)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    const step = steps[currentStep]
    switch (step.id) {
      case 'role':
        return profile.userRole && (profile.userRole !== 'other' || profile.customRole?.trim())
      case 'company':
        return profile.companySize && profile.companySize > 0
      case 'business':
        return profile.businessDescription?.trim() && profile.businessDescription.length >= 10
      case 'experience':
        return profile.teamExperience
      case 'focus':
        return profile.primaryFocus && (profile.primaryFocus !== 'other' || profile.customFocus?.trim())
      case 'style':
        return profile.workingStyle
      case 'commitment':
        return profile.weeklyCommitment && profile.weeklyCommitment >= 5 && profile.weeklyCommitment <= 100
      default:
        return true
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'role':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'founder', label: 'Founder' },
                { value: 'ceo', label: 'CEO' },
                { value: 'coo', label: 'COO' },
                { value: 'manager', label: 'Manager' },
                { value: 'lead', label: 'Team Lead' },
                { value: 'other', label: 'Other' }
              ].map(role => (
                <button
                  key={role.value}
                  onClick={() => setProfile({ ...profile, userRole: role.value as CompanyProfile['userRole'] })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    profile.userRole === role.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium">{role.label}</div>
                </button>
              ))}
            </div>
            {profile.userRole === 'other' && (
              <input
                type="text"
                placeholder="Please specify your role"
                value={profile.customRole || ''}
                onChange={(e) => setProfile({ ...profile, customRole: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )

      case 'company':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 1, label: 'Just me', desc: 'Solo founder' },
                { value: 5, label: '2-5 people', desc: 'Small team' },
                { value: 15, label: '6-15 people', desc: 'Growing team' },
                { value: 50, label: '16-50 people', desc: 'Medium company' },
                { value: 100, label: '51-100 people', desc: 'Large company' },
                { value: 500, label: '100+ people', desc: 'Enterprise' }
              ].map(size => (
                <button
                  key={size.value}
                  onClick={() => setProfile({ ...profile, companySize: size.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    profile.companySize === size.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-sm">{size.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{size.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter exact number:
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={profile.companySize || ''}
                onChange={(e) => setProfile({ ...profile, companySize: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of team members"
              />
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-4">
            <textarea
              placeholder="Describe what your company does and where you're headed. This helps us create relevant tasks."
              value={profile.businessDescription || ''}
              onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Be specific about your industry, target market, and current goals</span>
              <span>{profile.businessDescription?.length || 0}/500</span>
            </div>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-4">
            {[
              {
                value: 'guided',
                title: 'Provide detailed guidance',
                desc: 'The AI should give step-by-step instructions and close oversight'
              },
              {
                value: 'balanced',
                title: 'Mix of guidance and independence',
                desc: 'The AI should provide clear direction but trust the team to execute'
              },
              {
                value: 'independent',
                title: 'Assume high independence',
                desc: 'The AI should focus on high-level strategy and let the team handle details'
              }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setProfile({ ...profile, teamExperience: option.value as CompanyProfile['teamExperience'] })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  profile.teamExperience === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium">{option.title}</div>
                <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        )

      case 'focus':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'growth', label: 'Growth & Scaling', icon: <TrendingUp className="h-4 w-4" /> },
                { value: 'fundraising', label: 'Fundraising', icon: <Target className="h-4 w-4" /> },
                { value: 'product', label: 'Product Development', icon: <Settings className="h-4 w-4" /> },
                { value: 'operations', label: 'Operations', icon: <Briefcase className="h-4 w-4" /> },
                { value: 'hiring', label: 'Team Building', icon: <Users className="h-4 w-4" /> },
                { value: 'sales', label: 'Sales & Revenue', icon: <Target className="h-4 w-4" /> }
              ].map(focus => (
                <button
                  key={focus.value}
                  onClick={() => setProfile({ ...profile, primaryFocus: focus.value as CompanyProfile['primaryFocus'] })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    profile.primaryFocus === focus.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {focus.icon}
                    {focus.label}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setProfile({ ...profile, primaryFocus: 'other' })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                profile.primaryFocus === 'other'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium">Other</div>
            </button>
            {profile.primaryFocus === 'other' && (
              <input
                type="text"
                placeholder="What's your primary focus?"
                value={profile.customFocus || ''}
                onChange={(e) => setProfile({ ...profile, customFocus: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )

      case 'style':
        return (
          <div className="space-y-4">
            {[
              {
                value: 'structured',
                title: 'Structured Plans',
                desc: 'Clear roadmaps with defined milestones and deadlines'
              },
              {
                value: 'suggestive',
                title: 'Suggestive Advice',
                desc: 'Recommendations and ideas that you can adapt as needed'
              },
              {
                value: 'agile',
                title: 'Agile & Iterative',
                desc: 'Flexible approach with short cycles and quick pivots'
              }
            ].map(style => (
              <button
                key={style.value}
                onClick={() => setProfile({ ...profile, workingStyle: style.value as CompanyProfile['workingStyle'] })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  profile.workingStyle === style.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium">{style.title}</div>
                <div className="text-sm text-gray-600 mt-1">{style.desc}</div>
              </button>
            ))}
          </div>
        )

      case 'commitment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 10, label: '10 hours/week', desc: 'Part-time focus' },
                { value: 25, label: '25 hours/week', desc: 'Balanced approach' },
                { value: 40, label: '40 hours/week', desc: 'Full-time dedication' },
                { value: 60, label: '60+ hours/week', desc: 'Intense sprint mode' }
              ].map(commitment => (
                <button
                  key={commitment.value}
                  onClick={() => setProfile({ ...profile, weeklyCommitment: commitment.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    profile.weeklyCommitment === commitment.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-sm">{commitment.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{commitment.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom hours per week:
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={profile.weeklyCommitment || ''}
                onChange={(e) => setProfile({ ...profile, weeklyCommitment: parseInt(e.target.value) || 40 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hours per week"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to VEntry
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Let&apos;s personalize your experience to generate the most relevant tasks for your company
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 