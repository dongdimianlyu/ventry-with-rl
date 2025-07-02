'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Goal, Task, User, TeamMember, TeamTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { AddGoalForm } from '@/components/dashboard/AddGoalForm'
import { Sparkles, LogOut, Calendar, Target, Brain, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [teamTasks, setTeamTasks] = useState<Record<string, TeamTask[]>>({})
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

    // Load goals, tasks, team, and team tasks from localStorage
    const savedGoals = localStorage.getItem(`goals_${parsedUser.id}`)
    const savedTasks = localStorage.getItem(`tasks_${parsedUser.id}`)
    const savedTeam = localStorage.getItem(`team_${parsedUser.id}`)
    const savedTeamTasks = localStorage.getItem(`employeeTasks_${parsedUser.id}`)

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
    if (savedTeam) {
      setTeam(JSON.parse(savedTeam))
    }
    if (savedTeamTasks) {
      setTeamTasks(JSON.parse(savedTeamTasks))
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

    try {
      // Generate CEO tasks
      const ceoResponse = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          previousTasks: tasks,
          taskType: 'individual'
        })
      })

      const ceoData = await ceoResponse.json()
      
      // Transform API response to Task objects
      const newTasks: Task[] = ceoData.tasks.map((task: Omit<Task, 'id' | 'userId' | 'createdAt'>, index: number) => ({
        id: (Date.now() + index).toString(),
        userId: user.id,
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date()
      }))

      // Generate team tasks if team exists
      let newTeamTasks: Record<string, TeamTask[]> = {}
      if (team.length > 0) {
        try {
          const teamResponse = await fetch('/api/tasks/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goals,
              teamMembers: team,
              taskType: 'team'
            })
          })

          const teamData = await teamResponse.json()
          newTeamTasks = teamData.teamTasks || {}
        } catch (error) {
          console.error('Failed to generate team tasks:', error)
          // Fallback to local generation
          team.forEach((member, index) => {
            const memberKey = `${member.name} - ${member.role}`
            newTeamTasks[memberKey] = generateTasksForRole(member.role, index)
          })
        }
      }

      // Update state
      const updatedTasks = [...tasks, ...newTasks]
      setTasks(updatedTasks)
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
      
      if (Object.keys(newTeamTasks).length > 0) {
        setTeamTasks(newTeamTasks)
        localStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(newTeamTasks))
      }
      
    } catch (error) {
      console.error('Failed to generate tasks:', error)
      
      // Fallback to mock data
      const fallbackTasks: Task[] = [
        {
          id: Date.now().toString(),
          userId: user.id,
          title: "Review quarterly objectives and key results",
          description: "Assess progress on current OKRs and identify areas needing attention.",
          explanation: "Regular OKR reviews ensure strategic alignment and help identify course corrections early.",
          priority: 'high' as const,
          completed: false,
          dueDate: new Date(),
          createdAt: new Date(),
          relatedGoalIds: goals.map(g => g.id)
        }
      ]
      
      const updatedTasks = [...tasks, ...fallbackTasks]
      setTasks(updatedTasks)
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
    }

    setIsGeneratingTasks(false)
  }

  const generateTasksForRole = (role: string, index: number): TeamTask[] => {
    const roleTasks: Record<string, TeamTask[]> = {
      'Marketing': [
        { id: `marketing-${index}-1`, title: "Plan Instagram content for the week", reason: "Increase brand visibility and engagement", priority: 'high' as const, completed: false },
        { id: `marketing-${index}-2`, title: "Draft monthly email newsletter", reason: "Improve customer retention through communication", priority: 'medium' as const, completed: false },
        { id: `marketing-${index}-3`, title: "Analyze social media performance metrics", reason: "Optimize content strategy based on data", priority: 'low' as const, completed: false }
      ],
      'Sales': [
        { id: `sales-${index}-1`, title: "Follow up with warm leads from last week", reason: "Convert prospects into paying customers", priority: 'high' as const, completed: false },
        { id: `sales-${index}-2`, title: "Update CRM with recent customer interactions", reason: "Maintain accurate sales pipeline data", priority: 'medium' as const, completed: false },
        { id: `sales-${index}-3`, title: "Schedule demo calls for qualified prospects", reason: "Move opportunities through the sales funnel", priority: 'high' as const, completed: false }
      ],
      'Product': [
        { id: `product-${index}-1`, title: "Review user feedback from latest feature release", reason: "Identify improvement opportunities", priority: 'high' as const, completed: false },
        { id: `product-${index}-2`, title: "Update product roadmap based on customer requests", reason: "Align development with market needs", priority: 'medium' as const, completed: false },
        { id: `product-${index}-3`, title: "Conduct competitive analysis", reason: "Stay ahead of market trends", priority: 'low' as const, completed: false }
      ],
      'Design': [
        { id: `design-${index}-1`, title: "Create wireframes for mobile app redesign", reason: "Improve user experience and engagement", priority: 'high' as const, completed: false },
        { id: `design-${index}-2`, title: "Update brand guidelines documentation", reason: "Ensure consistent visual identity", priority: 'medium' as const, completed: false },
        { id: `design-${index}-3`, title: "Design new landing page for campaign", reason: "Support marketing conversion goals", priority: 'high' as const, completed: false }
      ],
      'Ops': [
        { id: `ops-${index}-1`, title: "Review and optimize current workflows", reason: "Increase operational efficiency", priority: 'high' as const, completed: false },
        { id: `ops-${index}-2`, title: "Analyze team productivity metrics", reason: "Identify bottlenecks and improvements", priority: 'medium' as const, completed: false },
        { id: `ops-${index}-3`, title: "Update company policies and procedures", reason: "Ensure compliance and clarity", priority: 'low' as const, completed: false }
      ]
    }

    return roleTasks[role] || [
      { id: `custom-${index}-1`, title: "Review weekly objectives", reason: "Stay aligned with team goals", priority: 'medium' as const, completed: false },
      { id: `custom-${index}-2`, title: "Complete assigned project tasks", reason: "Meet project deadlines", priority: 'high' as const, completed: false }
    ]
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
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
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks generated yet</h3>
                    <p className="text-gray-500 mb-6">
                      {goals.length === 0 
                        ? "Add some goals first, then generate your daily tasks"
                        : "Click 'Generate Tasks' to get your AI-powered daily focus"
                      }
                    </p>
                    {goals.length > 0 && (
                      <Button 
                        onClick={generateDailyTasks}
                        disabled={isGeneratingTasks}
                        className="flex items-center space-x-2 mx-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}</span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todaysTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggleComplete={() => handleToggleTaskComplete(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Team Tasks Section */}
            {team.length > 0 && Object.keys(teamTasks).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    Team Tasks
                  </h3>
                </div>
                <div className="grid gap-6">
                  {Object.entries(teamTasks).map(([memberKey, tasks]) => {
                    const [name, role] = memberKey.split(' - ')
                    return (
                      <Card key={memberKey}>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 text-sm font-medium">
                                {name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-gray-900">{name}</div>
                              <div className="text-sm text-gray-500 font-normal">{role}</div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {tasks.map((task) => (
                              <div key={task.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{task.reason}</p>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Goals Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <p className="text-gray-500 text-sm">No goals set yet. Add your first goal to get started.</p>
                  ) : (
                    goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {goal.timeframe}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {goal.priority} priority
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <AddGoalForm onAddGoal={handleAddGoal} />

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today&apos;s Tasks</span>
                    <span className="font-medium">{completedTasks.length}/{todaysTasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: todaysTasks.length > 0 ? `${(completedTasks.length / todaysTasks.length) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Goals</span>
                    <span className="font-medium">{goals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Team Members</span>
                    <span className="font-medium">{team.length}</span>
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