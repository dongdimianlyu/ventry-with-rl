'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Goal, Task, User, TeamMember, TeamTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { AddGoalForm } from '@/components/dashboard/AddGoalForm'
import { Sparkles, LogOut, Calendar, Target, Brain, Users, TrendingUp } from 'lucide-react'
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
        { 
          id: `marketing-${index}-1`, 
          title: "Plan Instagram content for the week", 
          description: "Create a detailed content calendar with posts, captions, and hashtags for the upcoming week",
          reason: "Increase brand visibility and engagement", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `marketing-${index}-2`, 
          title: "Draft monthly email newsletter", 
          description: "Write and design the monthly newsletter with company updates and customer stories",
          reason: "Improve customer retention through communication", 
          priority: 'medium' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `marketing-${index}-3`, 
          title: "Analyze social media performance metrics", 
          description: "Review engagement rates, reach, and conversion metrics from last month's campaigns",
          reason: "Optimize content strategy based on data", 
          priority: 'low' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        }
      ],
      'Sales': [
        { 
          id: `sales-${index}-1`, 
          title: "Follow up with warm leads from last week", 
          description: "Call or email prospects who showed interest in our product during demos",
          reason: "Convert prospects into paying customers", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `sales-${index}-2`, 
          title: "Update CRM with recent customer interactions", 
          description: "Log all customer touchpoints and update deal stages in the CRM system",
          reason: "Maintain accurate sales pipeline data", 
          priority: 'medium' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `sales-${index}-3`, 
          title: "Schedule demo calls for qualified prospects", 
          description: "Book product demonstrations with leads who meet our ideal customer profile",
          reason: "Move opportunities through the sales funnel", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        }
      ],
      'Product': [
        { 
          id: `product-${index}-1`, 
          title: "Review user feedback from latest feature release", 
          description: "Analyze support tickets and user reviews to identify improvement opportunities",
          reason: "Identify improvement opportunities", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `product-${index}-2`, 
          title: "Update product roadmap based on customer requests", 
          description: "Prioritize features based on customer feedback and business impact",
          reason: "Align development with market needs", 
          priority: 'medium' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `product-${index}-3`, 
          title: "Conduct competitive analysis", 
          description: "Research competitor features and pricing to inform our product strategy",
          reason: "Stay ahead of market trends", 
          priority: 'low' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        }
      ],
      'Design': [
        { 
          id: `design-${index}-1`, 
          title: "Create wireframes for mobile app redesign", 
          description: "Design low-fidelity wireframes for key user flows in the mobile app",
          reason: "Improve user experience and engagement", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `design-${index}-2`, 
          title: "Update brand guidelines documentation", 
          description: "Refine color palette, typography, and logo usage guidelines",
          reason: "Ensure consistent visual identity", 
          priority: 'medium' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `design-${index}-3`, 
          title: "Design new landing page for campaign", 
          description: "Create high-converting landing page designs for upcoming marketing campaign",
          reason: "Support marketing conversion goals", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        }
      ],
      'Ops': [
        { 
          id: `ops-${index}-1`, 
          title: "Review and optimize current workflows", 
          description: "Audit existing processes and identify bottlenecks or inefficiencies",
          reason: "Increase operational efficiency", 
          priority: 'high' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `ops-${index}-2`, 
          title: "Analyze team productivity metrics", 
          description: "Review team performance data and create improvement recommendations",
          reason: "Identify bottlenecks and improvements", 
          priority: 'medium' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        },
        { 
          id: `ops-${index}-3`, 
          title: "Update company policies and procedures", 
          description: "Review and update employee handbook and operational procedures",
          reason: "Ensure compliance and clarity", 
          priority: 'low' as const, 
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          assignedTo: `member-${index}`
        }
      ]
    }

    return roleTasks[role] || [
      { 
        id: `custom-${index}-1`, 
        title: "Review weekly objectives", 
        description: "Go through weekly goals and adjust priorities based on current progress",
        reason: "Stay aligned with team goals", 
        priority: 'medium' as const, 
        completed: false,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        assignedTo: `member-${index}`
      },
      { 
        id: `custom-${index}-2`, 
        title: "Complete assigned project tasks", 
        description: "Focus on highest-priority deliverables for current projects",
        reason: "Meet project deadlines", 
        priority: 'high' as const, 
        completed: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedTo: `member-${index}`
      }
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate)
    const today = new Date()
    return taskDate.toDateString() === today.toDateString()
  })

  const completedTasks = todaysTasks.filter(task => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 polka-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">{user.name?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-brand-primary">{user.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={generateDailyTasks}
                disabled={isGeneratingTasks || goals.length === 0}
                className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span>{isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-gray-200 hover:bg-gray-50">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brand-primary">{formatDate(new Date())}</h2>
              <p className="text-gray-600 mt-1 accent-dot">Your AI-generated daily focus</p>
            </div>
          </div>
          <div className="subtle-divider mt-4" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tasks Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center mr-3">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  Today's Priority Tasks
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                  <TrendingUp className="h-4 w-4" />
                  <span>{completedTasks.length} of {todaysTasks.length} completed</span>
                </div>
              </div>

              {todaysTasks.length === 0 ? (
                <Card className="refined-card text-center py-16 bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                    <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Brain className="h-8 w-8 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tasks generated yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      {goals.length === 0 
                        ? "Add some goals first, then generate your daily tasks"
                        : "Click 'Generate Tasks' to get your AI-powered daily focus"
                      }
                    </p>
                    {goals.length > 0 && (
                      <Button 
                        onClick={generateDailyTasks}
                        disabled={isGeneratingTasks}
                        className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span>{isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}</span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Team Tasks
                  </h3>
                </div>
                <div className="grid gap-6">
                  {Object.entries(teamTasks).map(([memberKey, tasks]) => {
                    const [name, role] = memberKey.split(' - ')
                    return (
                      <Card key={memberKey} className="refined-card bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center text-lg">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                              <span className="text-emerald-600 text-sm font-bold">
                                {name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-gray-900 font-semibold">{name}</div>
                              <div className="text-sm text-gray-600 font-normal">{role}</div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {tasks.map((task) => (
                              <div key={task.id} className="border border-white/50 rounded-xl p-4 bg-white/60 backdrop-blur-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{task.reason}</p>
                                  </div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-4 shrink-0 ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-gray-100 text-gray-700 border border-gray-200'
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
            <Card className="refined-card bg-gradient-to-br from-white to-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">No goals set yet. Add your first goal to get started.</p>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <div key={goal.id} className="border border-blue-100 rounded-xl p-4 bg-white/60 backdrop-blur-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{goal.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-medium">
                            {goal.timeframe}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                            goal.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                            goal.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
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
            <Card className="refined-card bg-gradient-to-br from-white to-purple-50 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">Today's Tasks</span>
                      <span className="font-bold text-brand-primary">{completedTasks.length}/{todaysTasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="brand-gradient h-3 rounded-full smooth-transition shadow-sm" 
                        style={{ 
                          width: todaysTasks.length > 0 ? `${(completedTasks.length / todaysTasks.length) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="subtle-divider" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Goals</span>
                      <span className="font-semibold text-gray-900">{goals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Team Members</span>
                      <span className="font-semibold text-gray-900">{team.length}</span>
                    </div>
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