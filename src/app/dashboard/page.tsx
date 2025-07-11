'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Goal, Task, User, TeamMember, TeamTask, TaskSuggestion, TeamTaskSuggestion, AutoModeSettings, RLTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { RLTaskCard } from '@/components/dashboard/RLTaskCard'
import AddGoalForm from '@/components/dashboard/AddGoalForm'
import { TaskSuggestionModal } from '@/components/dashboard/TaskSuggestionModal'
import { AutoModeToggle } from '@/components/ui/AutoModeToggle'
import { Sparkles, LogOut, Calendar, Target, TrendingUp, Plus, AlertCircle, Clock, CheckCircle, BarChart3, Building2, ClipboardList, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { knowledgeBase } from '@/data/knowledge-base'
import { KnowledgeBase } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [rlTasks, setRlTasks] = useState<RLTask[]>([])
  const [pendingRlTasks, setPendingRlTasks] = useState<RLTask[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [, setTeamTasks] = useState<Record<string, TeamTask[]>>({})
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [isSimulatingRL, setIsSimulatingRL] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [pendingSlackApproval, setPendingSlackApproval] = useState<any>(null)
  const [slackStatus, setSlackStatus] = useState<string>('')
  const [lastSyncCheck, setLastSyncCheck] = useState<string>(new Date().toISOString())
  
  // New states for task suggestion modal
  const [showTaskSuggestionModal, setShowTaskSuggestionModal] = useState(false)
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([])
  const [teamTaskSuggestions, setTeamTaskSuggestions] = useState<Record<string, TeamTaskSuggestion[]>>({})
  const [autoModeSettings, setAutoModeSettings] = useState<AutoModeSettings>({
    enabled: false,
    maxTasksPerPerson: 3,
    prioritizeHighImpact: true,
    ensureDiversity: true
  })
  
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

    // Clean up existing stored tasks from localStorage (move to session-based storage)
    localStorage.removeItem(`tasks_${parsedUser.id}`)
    localStorage.removeItem(`rlTasks_${parsedUser.id}`)
    localStorage.removeItem(`employeeTasks_${parsedUser.id}`)

    // Load goals and team from localStorage (persistent across sessions)
    const savedGoals = localStorage.getItem(`goals_${parsedUser.id}`)
    const savedTeam = localStorage.getItem(`team_${parsedUser.id}`)

    // Load tasks and team tasks from sessionStorage (only persist during session)
    const savedTasks = sessionStorage.getItem(`tasks_${parsedUser.id}`)
    const savedTeamTasks = sessionStorage.getItem(`employeeTasks_${parsedUser.id}`)

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

    // Load approved RL tasks and check for pending approvals
    loadApprovedRLTasks(parsedUser.id)
    checkPendingSlackApprovals()
    
    // Set up periodic sync for Slack status updates
    const syncInterval = setInterval(() => {
      syncSlackStatus()
    }, 10000) // Check every 10 seconds
    
    return () => clearInterval(syncInterval)
  }, [router, lastSyncCheck])

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
    setShowAddGoal(false)
  }

  const handleDeleteGoal = (goalId: string) => {
    if (!user) return

    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      const updatedGoals = goals.filter(goal => goal.id !== goalId)
      setGoals(updatedGoals)
      localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals))
    }
  }

  const generateTaskSuggestions = async () => {
    if (!user || goals.length === 0) {
      alert('Please add at least one goal before generating tasks.')
      return
    }

    setIsGeneratingTasks(true)
    setTaskError(null)
    setShowTaskSuggestionModal(true)

    try {
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goals,
          previousTasks: tasks,
          knowledgeBase: knowledgeBase as KnowledgeBase[],
          timeframe: 'today',
          teamMembers: team,
          generateForTeam: team.length > 0,
          suggestionMode: true,
          previousTeamTasks: sessionStorage.getItem(`employeeTasks_${user.id}`) ? JSON.parse(sessionStorage.getItem(`employeeTasks_${user.id}`) || '{}') : {},
          userId: user.id
        })
      }).catch((networkError) => {
        console.error('Network error during fetch:', networkError)
        throw new Error('Network connection failed. Please check your internet connection and try again.')
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', response.status, errorText)
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || `HTTP ${response.status}: Failed to generate task suggestions`);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          throw new Error(`HTTP ${response.status}: Server error occurred. Please try again later.`);
        }
      }

      const data = await response.json()
      
      if (data.ceoSuggestions && Array.isArray(data.ceoSuggestions)) {
        setTaskSuggestions(data.ceoSuggestions)
        
        if (data.teamSuggestions && Object.keys(data.teamSuggestions).length > 0) {
          setTeamTaskSuggestions(data.teamSuggestions)
        }
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error: unknown) {
      console.error('Error generating task suggestions:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setTaskError(errorMessage)
      setShowTaskSuggestionModal(false)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const handleTaskSelectionConfirm = (selectedCeoTasks: TaskSuggestion[], selectedTeamTasks: Record<string, TeamTaskSuggestion[]>) => {
    if (!user) return

    // Convert selected CEO tasks to actual tasks
    const newCeoTasks = selectedCeoTasks.map((suggestion, index) => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      userId: user.id,
      title: suggestion.title,
      description: suggestion.description,
      explanation: suggestion.explanation,
      priority: suggestion.priority,
      completed: false,
      dueDate: new Date(),
      createdAt: new Date(),
      relatedGoalIds: suggestion.relatedGoalIds
    }))

    // Add new CEO tasks to existing tasks
    const updatedTasks = [...tasks, ...newCeoTasks]
    setTasks(updatedTasks)
    sessionStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))

    // Convert selected team tasks to actual team tasks
    const newTeamTasks: Record<string, TeamTask[]> = {}
    Object.entries(selectedTeamTasks).forEach(([memberKey, memberTasks]) => {
      newTeamTasks[memberKey] = memberTasks.map((suggestion, index) => ({
        id: `team-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        title: suggestion.title,
        description: suggestion.description,
        reason: suggestion.reason,
        priority: suggestion.priority,
        completed: false,
        dueDate: new Date(),
        assignedTo: suggestion.assignedTo
      }))
    })

    // Save new team tasks
    if (Object.keys(newTeamTasks).length > 0) {
      setTeamTasks(newTeamTasks)
      sessionStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(newTeamTasks))
    }

    // Reset modal state
    setShowTaskSuggestionModal(false)
    setTaskSuggestions([])
    setTeamTaskSuggestions({})
  }

  const handleToggleTaskComplete = (taskId: string) => {
    if (!user) return

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    sessionStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
  }

  const loadApprovedRLTasks = async (userId: string) => {
    try {
      const response = await fetch(`/api/rl/approved-tasks?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.tasks && data.tasks.length > 0) {
          setRlTasks(data.tasks)
          // Don't save to localStorage - these should only show when freshly approved
        }
      }
    } catch (error) {
      console.error('Error loading approved RL tasks:', error)
    }
  }

  const checkPendingSlackApprovals = async () => {
    try {
      const response = await fetch('/api/rl/pending-approvals')
      if (response.ok) {
        const data = await response.json()
        if (data.hasPendingApproval) {
          setPendingSlackApproval(data.pendingApproval)
          setSlackStatus('pending')
        } else {
          setPendingSlackApproval(null)
          setSlackStatus('')
        }
      }
    } catch (error) {
      console.error('Error checking pending Slack approvals:', error)
    }
  }

  const syncSlackStatus = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/rl/sync-status?userId=${user.id}&lastCheck=${lastSyncCheck}`)
      if (response.ok) {
        const data = await response.json()
        
        if (data.hasUpdates) {
          // Add new approved tasks from Slack
          if (data.newApprovals.length > 0) {
            setRlTasks(prev => [...prev, ...data.newApprovals])
            setSlackStatus(`✅ ${data.newApprovals.length} task(s) approved via Slack`)
          }
          
          // Remove pending tasks if they were rejected via Slack
          if (data.newRejections.length > 0) {
            setPendingRlTasks(prev => prev.filter(task => 
              !data.newRejections.some((rejection: any) => 
                task.action === rejection.recommendation?.action && 
                task.quantity === rejection.recommendation?.quantity
              )
            ))
            setSlackStatus(`❌ ${data.newRejections.length} task(s) rejected via Slack`)
          }
          
          // Clear pending approvals if they're resolved
          if (data.pendingCleared) {
            setPendingSlackApproval(null)
          }
          
          // Update last sync time
          setLastSyncCheck(data.timestamp)
        }
      }
    } catch (error) {
      console.error('Error syncing Slack status:', error)
    }
  }

  const handleRLApprove = async (taskId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/rl/dual-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', taskId, userId: user.id, source: 'UI' })
      })

      if (response.ok) {
        // Move task from pending to approved
        const taskToApprove = pendingRlTasks.find(task => task.id === taskId)
        if (taskToApprove) {
          const approvedTask = { ...taskToApprove, approved: true }
          const updatedPendingTasks = pendingRlTasks.filter(task => task.id !== taskId)
          const updatedApprovedTasks = [...rlTasks, approvedTask]
          
          setPendingRlTasks(updatedPendingTasks)
          setRlTasks(updatedApprovedTasks)
          
          // Don't save RL tasks to localStorage
          
          setSlackStatus('Task approved via UI - notification sent to Slack')
        }
      }
    } catch (error) {
      console.error('Error approving RL task:', error)
    }
  }

  const handleRLReject = async (taskId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/rl/dual-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', taskId, userId: user.id, source: 'UI' })
      })

      if (response.ok) {
        // Remove task from pending
        const updatedPendingTasks = pendingRlTasks.filter(task => task.id !== taskId)
        setPendingRlTasks(updatedPendingTasks)
        
        // Don't save RL tasks to localStorage
        
        setSlackStatus('Task rejected via UI - notification sent to Slack')
      }
    } catch (error) {
      console.error('Error rejecting RL task:', error)
    }
  }

  const handleRLComplete = async (taskId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/rl/approved-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', taskId })
      })

      if (response.ok) {
        // Remove the completed task from the list entirely
        const updatedRlTasks = rlTasks.filter(task => task.id !== taskId)
        setRlTasks(updatedRlTasks)
        
        // Don't save RL tasks to sessionStorage
      }
    } catch (error) {
      console.error('Error completing RL task:', error)
    }
  }

  const simulateRLEvent = async () => {
    if (!user) return

    setIsSimulatingRL(true)
    setSlackStatus('')
    try {
      const response = await fetch('/api/rl/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.rlTask) {
          // Add the new pending task to the UI
          const newPendingTasks = [...pendingRlTasks, data.rlTask]
          setPendingRlTasks(newPendingTasks)
          
          // Don't save RL tasks to localStorage
        }
        
        if (data.slackStatus === 'sent') {
          setSlackStatus('Recommendation sent to Slack for approval - you can also approve here in the UI')
          // Check for pending approvals after sending
          setTimeout(() => checkPendingSlackApprovals(), 1000)
        } else if (data.slackStatus === 'failed') {
          setSlackStatus(`Slack notification failed, but you can still approve in the UI: ${data.slackError}`)
        }
      }
    } catch (error) {
      console.error('Error simulating RL event:', error)
      setSlackStatus('Error simulating RL event')
    } finally {
      setIsSimulatingRL(false)
    }
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
            <Building2 className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.completed)

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
              <div className="relative">
                <AutoModeToggle 
                  onSettingsChange={setAutoModeSettings}
                  className="mr-3"
                />
              </div>
              <Button
                onClick={() => setShowAddGoal(true)}
                className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
              <Button
                onClick={generateTaskSuggestions}
                disabled={isGeneratingTasks || goals.length === 0}
                className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isGeneratingTasks ? 'Generating...' : 'Get Recommendations'}
              </Button>
              <Button
                onClick={simulateRLEvent}
                disabled={isSimulatingRL}
                className="bg-[#9B0E8D] hover:bg-[#9B0E8D]/90 text-white smooth-transition shadow-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isSimulatingRL ? 'analysing...' : 'Run Agent Suggestion'}
              </Button>
              <Button
                onClick={() => {
                  if (user) {
                    loadApprovedRLTasks(user.id)
                    checkPendingSlackApprovals()
                    syncSlackStatus()
                  }
                }}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh
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
              <p className="text-gray-600 mt-1 accent-dot">Your daily focus backed by data</p>
            </div>
          </div>
          <div className="subtle-divider mt-4" />
        </div>

        {/* Error Alert */}
        {taskError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Task Generation Error</h3>
                <p className="text-sm text-red-700 mt-1">{taskError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tasks Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  Your tasks
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                  <TrendingUp className="h-4 w-4" />
                  <span>{completedTasks.length} of {tasks.length} completed</span>
                </div>
              </div>



              {/* Pending Agent Suggestions (Need Approval) */}
              {pendingRlTasks.length > 0 && (
                <div className="space-y-6 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    Pending Approval (Approve in Slack or UI)
                  </h4>
                  <div className="space-y-6 transition-all duration-500">
                    {pendingRlTasks.map((rlTask) => (
                      <div key={rlTask.id} className="transition-all duration-500">
                        <RLTaskCard 
                          task={rlTask} 
                          onApprove={handleRLApprove}
                          onReject={handleRLReject}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Agent Suggestions */}
              {rlTasks.length > 0 && (
                <div className="space-y-6 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    Approved Tasks
                  </h4>
                  <div className="space-y-6 transition-all duration-500">
                    {rlTasks.map((rlTask) => (
                      <div key={rlTask.id} className="transition-all duration-500">
                        <RLTaskCard 
                          task={rlTask} 
                          onComplete={handleRLComplete}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(tasks.length === 0 && rlTasks.length === 0 && pendingRlTasks.length === 0) ? (
                <Card className="refined-card text-center py-16 bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                                      <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-brand-primary" />
                  </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tasks generated yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      {goals.length === 0 
                        ? "Add some goals first, then get your daily recommendations or run agent suggestions"
                        : "Click 'Get Recommendations' to get your data-driven daily focus or 'Run Agent Suggestion' for demo recommendations"
                      }
                    </p>

                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6 transition-all duration-500">
                  {tasks
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 }
                      return priorityOrder[a.priority] - priorityOrder[b.priority]
                    })
                    .map((task) => (
                      <div key={task.id} className="transition-all duration-500">
                        <TaskCard 
                          task={task} 
                          onToggleComplete={() => handleToggleTaskComplete(task.id)}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>


          </div>

          {/* Goals Sidebar */}
          <div className="space-y-6">
            <Card className="refined-card bg-gradient-to-br from-white to-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-white" />
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
                      <div key={goal.id} className="border border-blue-100 rounded-xl p-4 bg-white/60 backdrop-blur-sm relative group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 flex-1 pr-2">{goal.title}</h4>
                          <Button
                            onClick={() => handleDeleteGoal(goal.id)}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

            <AddGoalForm 
              onSubmit={handleAddGoal}
              onCancel={() => setShowAddGoal(false)}
            />

            {/* Progress Overview */}
            <Card className="refined-card bg-gradient-to-br from-white to-[#9B0E8D]/5 border-[#9B0E8D]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-[#9B0E8D] rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">Today&apos;s Tasks</span>
                      <span className="font-bold text-brand-primary">{completedTasks.length}/{tasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="brand-gradient h-3 rounded-full smooth-transition shadow-sm" 
                        style={{ 
                          width: tasks.length > 0 ? `${(completedTasks.length / tasks.length) * 100}%` : '0%' 
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

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
            <AddGoalForm 
              onSubmit={handleAddGoal}
              onCancel={() => setShowAddGoal(false)}
            />
          </div>
        </div>
      )}

      {/* Task Suggestion Modal */}
      <TaskSuggestionModal
        isOpen={showTaskSuggestionModal}
        onClose={() => setShowTaskSuggestionModal(false)}
        ceoSuggestions={taskSuggestions}
        teamSuggestions={teamTaskSuggestions}
        teamMembers={team}
        autoModeSettings={autoModeSettings}
        onConfirm={handleTaskSelectionConfirm}
        isLoading={isGeneratingTasks}
      />
    </div>
  )
} 