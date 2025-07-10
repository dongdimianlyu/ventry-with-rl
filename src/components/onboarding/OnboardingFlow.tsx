'use client'

import { useState } from 'react'
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
  User,
  ArrowRight
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
    userRole: undefined,
    companySize: undefined,
    businessDescription: '',
    teamExperience: undefined,
    primaryFocus: undefined,
    workingStyle: undefined,
    weeklyCommitment: undefined
  })

  const steps = [
    {
      id: 'role',
      title: 'What\'s your role?',
      subtitle: 'Help us understand your position so we can tailor the experience',
      icon: <User className="h-8 w-8" />
    },
    {
      id: 'company',
      title: 'How big is your team?',
      subtitle: 'This helps us recommend the right level of task complexity',
      icon: <Users className="h-8 w-8" />
    },
    {
      id: 'business',
      title: 'Tell us about your company',
      subtitle: 'A brief description helps us generate relevant, actionable tasks',
      icon: <Building2 className="h-8 w-8" />
    },
    {
      id: 'experience',
      title: 'How should we work with your team?',
      subtitle: 'We can provide detailed guidance or assume more independence',
      icon: <Briefcase className="h-8 w-8" />
    },
    {
      id: 'focus',
      title: 'What\'s your primary focus right now?',
      subtitle: 'This helps us prioritize the most relevant tasks for your current stage',
      icon: <Target className="h-8 w-8" />
    },
    {
      id: 'style',
      title: 'What\'s your preferred working style?',
      subtitle: 'We\'ll adapt our recommendations to match how you like to work',
      icon: <Settings className="h-8 w-8" />
    },
    {
      id: 'commitment',
      title: 'How much time can your team commit?',
      subtitle: 'We\'ll set realistic deadlines based on your available capacity',
      icon: <Clock className="h-8 w-8" />
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
        updatedAt: new Date(),
        isOnboardingComplete: true,
        onboardingCompletedAt: new Date()
      }
      onComplete(completeProfile)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    // Skip current step by providing default values
    const step = steps[currentStep]
    switch (step.id) {
      case 'role':
        setProfile({ ...profile, userRole: 'founder' })
        break
      case 'company':
        setProfile({ ...profile, companySize: 5 })
        break
      case 'business':
        setProfile({ ...profile, businessDescription: 'Business description skipped' })
        break
      case 'experience':
        setProfile({ ...profile, teamExperience: 'balanced' })
        break
      case 'focus':
        setProfile({ ...profile, primaryFocus: 'growth' })
        break
      case 'style':
        setProfile({ ...profile, workingStyle: 'flexible' })
        break
      case 'commitment':
        setProfile({ ...profile, weeklyCommitment: 40 })
        break
    }
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding with skipped values
      const completeProfile: CompanyProfile = {
        id: `profile-${Date.now()}`,
        userId: user.id,
        userRole: profile.userRole || 'founder',
        customRole: profile.customRole,
        companySize: profile.companySize || 5,
        businessDescription: profile.businessDescription || 'Business description skipped',
        teamExperience: profile.teamExperience || 'balanced',
        primaryFocus: profile.primaryFocus || 'growth',
        customFocus: profile.customFocus,
        workingStyle: profile.workingStyle || 'flexible',
        weeklyCommitment: profile.weeklyCommitment || 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboardingComplete: true,
        onboardingCompletedAt: new Date()
      }
      onComplete(completeProfile)
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
        return profile.businessDescription?.trim() && profile.businessDescription.length >= 20
      case 'experience':
        return profile.teamExperience
      case 'focus':
        return profile.primaryFocus && (profile.primaryFocus !== 'other' || profile.customFocus?.trim())
      case 'style':
        return profile.workingStyle
      case 'commitment':
        return profile.weeklyCommitment && profile.weeklyCommitment >= 5 && profile.weeklyCommitment <= 80
      default:
        return true
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'role':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'founder', label: 'Founder', desc: 'Building and leading the company' },
                { value: 'ceo', label: 'CEO', desc: 'Chief Executive Officer' },
                { value: 'coo', label: 'COO', desc: 'Chief Operating Officer' },
                { value: 'manager', label: 'Manager', desc: 'Managing teams and operations' },
                { value: 'lead', label: 'Team Lead', desc: 'Leading specific teams or projects' },
                { value: 'other', label: 'Other Role', desc: 'Something else' }
              ].map(role => (
                <button
                  key={role.value}
                  onClick={() => setProfile({ ...profile, userRole: role.value as CompanyProfile['userRole'] })}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                    profile.userRole === role.value
                      ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                  }`}
                >
                  <div className="font-semibold text-lg">{role.label}</div>
                  <div className={`text-sm mt-1 ${
                    profile.userRole === role.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {role.desc}
                  </div>
                </button>
              ))}
            </div>
            {profile.userRole === 'other' && (
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Please specify your role"
                  value={profile.customRole || ''}
                  onChange={(e) => setProfile({ ...profile, customRole: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A4231] focus:ring-4 focus:ring-[#1A4231]/10 text-lg"
                />
              </div>
            )}
          </div>
        )

      case 'company':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 1, label: 'Just me', desc: 'Solo founder' },
                { value: 5, label: '2-5 people', desc: 'Small team' },
                { value: 15, label: '6-15 people', desc: 'Growing team' },
                { value: 50, label: '16-50 people', desc: 'Medium company' },
                { value: 100, label: '51-100 people', desc: 'Large company' },
                { value: 200, label: '100+ people', desc: 'Enterprise' }
              ].map(size => (
                <button
                  key={size.value}
                  onClick={() => setProfile({ ...profile, companySize: size.value })}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-center group hover:shadow-lg ${
                    profile.companySize === size.value
                      ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                  }`}
                >
                  <div className="font-semibold text-lg">{size.label}</div>
                  <div className={`text-sm mt-1 ${
                    profile.companySize === size.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {size.desc}
                  </div>
                </button>
              ))}
            </div>
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Or enter exact number:
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={profile.companySize === undefined ? '' : profile.companySize}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setProfile({ ...profile, companySize: undefined })
                  } else {
                    const numValue = parseInt(value)
                    if (!isNaN(numValue) && numValue >= 1) {
                      setProfile({ ...profile, companySize: numValue })
                    }
                  }
                }}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A4231] focus:ring-4 focus:ring-[#1A4231]/10 text-lg text-center"
                placeholder="Number of team members"
              />
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              <textarea
                placeholder="Describe what your company does, your target market, and current stage. For example: 'We're a B2B SaaS company providing project management tools for remote teams. We're in early growth stage with 50 customers and focusing on product-market fit.'"
                value={profile.businessDescription || ''}
                onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A4231] focus:ring-4 focus:ring-[#1A4231]/10 min-h-[160px] resize-none text-lg leading-relaxed"
                maxLength={800}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Be specific about your industry, target market, and current goals</span>
                                 <span className={(profile.businessDescription?.length || 0) >= 20 ? 'text-[#1A4231]' : 'text-gray-400'}>
                   {profile.businessDescription?.length || 0}/800
                 </span>
              </div>
            </div>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                value: 'guided',
                title: 'Provide detailed guidance',
                desc: 'Give us step-by-step instructions and close oversight. We\'re still learning the ropes.',
                icon: <Users className="h-6 w-6" />
              },
              {
                value: 'balanced',
                title: 'Mix of guidance and independence',
                desc: 'Give us clear direction but trust us to execute. We know our stuff but appreciate context.',
                icon: <Target className="h-6 w-6" />
              },
              {
                value: 'independent',
                title: 'Assume we\'re self-sufficient',
                desc: 'Just tell us what needs to be done. We\'ll figure out the how. We\'re experienced operators.',
                icon: <TrendingUp className="h-6 w-6" />
              }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setProfile({ ...profile, teamExperience: option.value as CompanyProfile['teamExperience'] })}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                  profile.teamExperience === option.value
                    ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                    : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 ${
                    profile.teamExperience === option.value ? 'text-white' : 'text-[#1A4231]'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{option.title}</div>
                    <div className={`text-sm mt-2 leading-relaxed ${
                      profile.teamExperience === option.value ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {option.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )

      case 'focus':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'growth', label: 'Growth', desc: 'Scaling revenue and expanding market reach' },
                { value: 'fundraising', label: 'Fundraising', desc: 'Raising capital and investor relations' },
                { value: 'product', label: 'Product Development', desc: 'Building and improving the product' },
                { value: 'operations', label: 'Operations', desc: 'Optimizing processes and efficiency' },
                { value: 'other', label: 'Other Focus', desc: 'Something else' }
              ].map(focus => (
                <button
                  key={focus.value}
                  onClick={() => setProfile({ ...profile, primaryFocus: focus.value as CompanyProfile['primaryFocus'] })}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                    profile.primaryFocus === focus.value
                      ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                  }`}
                >
                  <div className="font-semibold text-lg">{focus.label}</div>
                  <div className={`text-sm mt-1 ${
                    profile.primaryFocus === focus.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {focus.desc}
                  </div>
                </button>
              ))}
            </div>
            {profile.primaryFocus === 'other' && (
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Please specify your primary focus"
                  value={profile.customFocus || ''}
                  onChange={(e) => setProfile({ ...profile, customFocus: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A4231] focus:ring-4 focus:ring-[#1A4231]/10 text-lg"
                />
              </div>
            )}
          </div>
        )

      case 'style':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                value: 'structured',
                title: 'Structured plans',
                desc: 'I prefer detailed roadmaps, clear timelines, and systematic approaches to getting things done.',
                icon: <Settings className="h-6 w-6" />
              },
              {
                value: 'flexible',
                title: 'Flexible suggestions',
                desc: 'I like options and adaptability. Give me ideas I can modify and adjust as needed.',
                icon: <Sparkles className="h-6 w-6" />
              },
              {
                value: 'agile',
                title: 'Agile collaboration',
                desc: 'I work in sprints, iterate quickly, and prefer continuous feedback and adjustment.',
                icon: <TrendingUp className="h-6 w-6" />
              }
            ].map(style => (
              <button
                key={style.value}
                onClick={() => setProfile({ ...profile, workingStyle: style.value as CompanyProfile['workingStyle'] })}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                  profile.workingStyle === style.value
                    ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                    : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 ${
                    profile.workingStyle === style.value ? 'text-white' : 'text-[#1A4231]'
                  }`}>
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{style.title}</div>
                    <div className={`text-sm mt-2 leading-relaxed ${
                      profile.workingStyle === style.value ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {style.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )

      case 'commitment':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 10, label: '5-10 hours', desc: 'Light commitment' },
                { value: 20, label: '10-20 hours', desc: 'Part-time focus' },
                { value: 40, label: '20-40 hours', desc: 'Significant focus' },
                { value: 60, label: '40-60 hours', desc: 'High intensity' }
              ].map(commitment => (
                <button
                  key={commitment.value}
                  onClick={() => setProfile({ ...profile, weeklyCommitment: commitment.value })}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-center group hover:shadow-lg ${
                    profile.weeklyCommitment === commitment.value
                      ? 'border-[#1A4231] bg-[#1A4231] text-white shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#1A4231] hover:bg-[#1A4231]/5'
                  }`}
                >
                  <div className="font-semibold text-lg">{commitment.label}</div>
                  <div className={`text-sm mt-1 ${
                    profile.weeklyCommitment === commitment.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {commitment.desc}
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Or enter exact hours per week:
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={profile.weeklyCommitment || 40}
                  onChange={(e) => setProfile({ ...profile, weeklyCommitment: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #1A4231 0%, #1A4231 ${((profile.weeklyCommitment || 40) - 5) / 75 * 100}%, #e5e7eb ${((profile.weeklyCommitment || 40) - 5) / 75 * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="bg-[#1A4231] text-white px-4 py-2 rounded-lg font-semibold min-w-[80px] text-center">
                  {profile.weeklyCommitment || 40}h
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

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
                  // Fallback to icon if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-[#1A4231] rounded-xl items-center justify-center hidden">
                <Sparkles className="h-5 w-5 text-[#c9f223]" />
              </div>
            </div>
            <span className="text-2xl font-bold text-[#1A4231]">Ventry</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2"
          >
            <span>Skip this step</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-[#1A4231]">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1A4231] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Step Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A4231] rounded-2xl mb-6">
              <div className="text-[#c9f223]">
                {currentStepData.icon}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#1A4231] mb-4">
              {currentStepData.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-12">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 hover:border-[#1A4231] hover:bg-[#1A4231]/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index <= currentStep ? 'bg-[#1A4231]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-6 py-3 bg-[#1A4231] hover:bg-[#1A4231]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Your responses help us create personalized, actionable tasks that drive real business results.
        </div>
      </footer>
    </div>
  )
} 