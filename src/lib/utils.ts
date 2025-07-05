import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CompanyProfile } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCompactDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const isToday = dateObj.toDateString() === now.toDateString()
  
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  
  if (isToday) {
    return `Today • ${timeStr}`
  }
  
  const dateStr = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  
  return `${dateStr} • ${timeStr}`
}

// Onboarding data management utilities
export function getOnboardingProfile(userId: string): CompanyProfile | null {
  try {
    const data = localStorage.getItem(`onboarding_${userId}`)
    if (!data) return null
    
    const profile = JSON.parse(data) as CompanyProfile
    return profile
  } catch (error) {
    console.error('Error retrieving onboarding profile:', error)
    return null
  }
}

export function saveOnboardingProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(`onboarding_${profile.userId}`, JSON.stringify(profile))
  } catch (error) {
    console.error('Error saving onboarding profile:', error)
  }
}

export function isOnboardingComplete(userId: string): boolean {
  const profile = getOnboardingProfile(userId)
  return profile?.isOnboardingComplete ?? false
}

export function resetOnboarding(userId: string): void {
  try {
    localStorage.removeItem(`onboarding_${userId}`)
  } catch (error) {
    console.error('Error resetting onboarding:', error)
  }
}

// Generate context for task generation based on onboarding data
export function generateTaskContext(profile: CompanyProfile): string {
  const roleContext = profile.userRole === 'other' 
    ? profile.customRole || 'leadership role'
    : profile.userRole

  const focusContext = profile.primaryFocus === 'other'
    ? profile.customFocus || 'business growth'
    : profile.primaryFocus

  const experienceLevel = profile.teamExperience === 'guided' 
    ? 'needs detailed guidance and step-by-step instructions'
    : profile.teamExperience === 'balanced'
    ? 'appreciates clear direction with some autonomy'
    : 'prefers high-level strategic guidance with execution autonomy'

  const workingStyleContext = profile.workingStyle === 'structured'
    ? 'prefers detailed plans with clear timelines and systematic approaches'
    : profile.workingStyle === 'flexible'
    ? 'likes adaptable suggestions and options to modify as needed'
    : 'works in agile sprints with quick iterations and continuous feedback'

  return `
Company Profile Context:
- Role: ${roleContext} at a ${profile.companySize}-person company
- Business: ${profile.businessDescription}
- Team Experience: ${experienceLevel}
- Primary Focus: ${focusContext}
- Working Style: ${workingStyleContext}
- Weekly Commitment: ${profile.weeklyCommitment} hours per week
- Onboarding Completed: ${profile.onboardingCompletedAt ? formatDate(profile.onboardingCompletedAt) : 'Not completed'}

Task Generation Guidelines:
- Adjust complexity based on company size (${profile.companySize} people)
- Prioritize ${focusContext} initiatives
- Provide ${profile.teamExperience} level of detail in task descriptions
- Structure tasks for ${profile.workingStyle} workflow
- Consider ${profile.weeklyCommitment}h/week capacity when setting deadlines
  `.trim()
} 