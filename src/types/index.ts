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
  reason: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  category: 'strategy' | 'operations' | 'growth' | 'retention' | 'sales'
  tags: string[]
}

export interface TaskGenerationContext {
  goals: Goal[]
  previousTasks: Task[]
  knowledgeBase: KnowledgeBase[]
  timeframe: 'today' | 'week'
} 