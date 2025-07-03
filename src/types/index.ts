export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  explanation: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  dueDate: Date
  createdAt: Date
  relatedGoalIds: string[]
}

export interface TeamMember {
  id: string
  name: string
  role: 'Marketing' | 'Sales' | 'Product' | 'Design' | 'Ops' | 'Custom'
  customRole?: string
}

export interface TeamTask {
  id: string
  title: string
  description: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  dueDate: Date
  assignedTo: string // TeamMember ID
}

export interface TeamSetup {
  id: string
  userId: string
  members: TeamMember[]
  isSetupComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  category: 'strategy' | 'operations' | 'growth' | 'retention' | 'sales' | 'role-templates' | 'frameworks' | 'planning' | 'workflows' | 'time-estimates' | 'best-practices' | 'operational-context'
  tags: string[]
}

export interface CompanyProfile {
  id: string
  userId: string
  userRole: 'founder' | 'ceo' | 'coo' | 'manager' | 'lead' | 'other'
  customRole?: string
  companySize: number
  businessDescription: string
  teamExperience: 'beginner' | 'intermediate' | 'advanced' | 'balanced'
  primaryFocus: 'growth' | 'operations' | 'product' | 'sales' | 'other'
  customFocus?: string
  workingStyle: 'structured' | 'flexible' | 'urgent'
  weeklyCommitment: number
  createdAt: Date
  updatedAt: Date
}

export interface TaskGenerationContext {
  goals: Goal[]
  previousTasks: Task[]
  knowledgeBase: KnowledgeBase[]
  timeframe: 'today' | 'week'
} 