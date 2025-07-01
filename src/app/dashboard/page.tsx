'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Goal, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { AddGoalForm } from '@/components/dashboard/AddGoalForm'
import { Sparkles, LogOut, Calendar, Target, Brain } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load goals and tasks from localStorage
    const savedGoals = localStorage.getItem(`goals_${parsedUser.id}`)
    const savedTasks = localStorage.getItem(`tasks_${parsedUser.id}`)

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: Task & { dueDate: string; createdAt: string }) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt)
      }))
      setTasks(parsedTasks)
    }
  }, [router])

  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newGoal: Goal = {
      id: Date.now().toString(),
      userId: user.id,
      ...goalData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedGoals = [...goals, newGoal]
    setGoals(updatedGoals)
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals))
  }

  const generateDailyTasks = async () => {
    if (!user || goals.length === 0) return

    setIsGeneratingTasks(true)

    // Simulate AI task generation with realistic delay
    setTimeout(() => {
      const newTasks: Task[] = [
        {
          id: Date.now().toString(),
          userId: user.id,
          title: "Review Q4 sales pipeline and identify top 5 leads",
          description: "Analyze current pipeline, prioritize high-value prospects, and create follow-up plan for this week.",
          explanation: "Based on your revenue growth goal, focusing on pipeline acceleration is critical. Sales data shows that concentrated follow-up efforts increase close rates by 35%.",
          priority: 'high' as const,
          completed: false,
          dueDate: new Date(),
          createdAt: new Date(),
          relatedGoalIds: goals.filter(g => g.title.toLowerCase().includes('revenue') || g.title.toLowerCase().includes('sales')).map(g => g.id)
        },
        {
          id: (Date.now() + 1).toString(),
          userId: user.id,
          title: "Conduct customer retention analysis",
          description: "Review churn data from last month, identify patterns, and create action plan for at-risk customers.",
          explanation: "Your retention goals align with industry best practices showing that reducing churn by 5% can increase profitability by 25-95%. Early intervention is key.",
          priority: 'high' as const,
          completed: false,
          dueDate: new Date(),
          createdAt: new Date(),
          relatedGoalIds: goals.filter(g => g.title.toLowerCase().includes('retention')).map(g => g.id)
        },
        {
          id: (Date.now() + 2).toString(),
          userId: user.id,
          title: "Schedule team 1:1s for goal alignment",
          description: "Book individual meetings with each team member to discuss quarterly objectives and address any blockers.",
          explanation: "Strategic planning research shows teams with clear goal alignment achieve 2.5x better performance. This directly supports your operational efficiency goals.",
          priority: 'medium' as const,
          completed: false,
          dueDate: new Date(),
          createdAt: new Date(),
          relatedGoalIds: goals.map(g => g.id)
        }
      ]

      const updatedTasks = [...tasks, ...newTasks]
      setTasks(updatedTasks)
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
      setIsGeneratingTasks(false)
    }, 2000)
  }

  const handleToggleTaskComplete = (taskId: string) => {
    if (!user) return

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate)
    const today = new Date()
    return taskDate.toDateString() === today.toDateString()
  })

  const completedTasks = todaysTasks.filter(task => task.completed)
  const pendingTasks = todaysTasks.filter(task => !task.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Ventry</h1>
              <div className="hidden sm:block text-gray-500">|</div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateDailyTasks}
                disabled={isGeneratingTasks || goals.length === 0}
                className="flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}</span>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{formatDate(new Date())}</h2>
          </div>
          <p className="text-gray-600 mt-1">Your AI-generated daily focus</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  Today&apos;s Priority Tasks
                </h3>
                <div className="text-sm text-gray-500">
                  {completedTasks.length} of {todaysTasks.length} completed
                </div>
              </div>

              {todaysTasks.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-500 mb-4">
                      {goals.length === 0 
                        ? "Add some goals first, then generate your daily tasks"
                        : "Click &apos;Generate Tasks&apos; to get your AI-powered daily priorities"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleTaskComplete}
                    />
                  ))}
                  
                  {completedTasks.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Completed Today</h4>
                      <div className="space-y-3">
                        {completedTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleTaskComplete}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Goals Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Your Goals
              </h3>
              
              <div className="space-y-4">
                {goals.map(goal => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {goal.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className="text-xs text-gray-500 capitalize">{goal.timeframe}</div>
                    </CardContent>
                  </Card>
                ))}
                
                <AddGoalForm onAddGoal={handleAddGoal} />
              </div>
            </div>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Goals</span>
                    <span className="font-medium">{goals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tasks Completed Today</span>
                    <span className="font-medium">{completedTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-medium">
                      {todaysTasks.length > 0 
                        ? Math.round((completedTasks.length / todaysTasks.length) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}