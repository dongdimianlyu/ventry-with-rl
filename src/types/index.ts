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