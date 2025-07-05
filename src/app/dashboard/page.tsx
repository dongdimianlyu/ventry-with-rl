'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Goal, Task, User, TeamMember, TeamTask, TaskSuggestion, TeamTaskSuggestion, AutoModeSettings } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/dashboard/TaskCard'
import AddGoalForm from '@/components/dashboard/AddGoalForm'
import { TaskSuggestionModal } from '@/components/dashboard/TaskSuggestionModal'
import { AutoModeToggle } from '@/components/ui/AutoModeToggle'
import { Sparkles, LogOut, Calendar, Target, Brain, TrendingUp, Plus, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { knowledgeBase } from '@/data/knowledge-base'
import { KnowledgeBase } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [, setTeamTasks] = useState<Record<string, TeamTask[]>>({})
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  
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
    setShowAddGoal(false)
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
          previousTeamTasks: localStorage.getItem(`employeeTasks_${user.id}`) ? JSON.parse(localStorage.getItem(`employeeTasks_${user.id}`) || '{}') : {},
          userId: user.id
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || 'Failed to generate task suggestions');
        } catch {
          console.error("Non-JSON error response:", errorText);
          throw new Error('Received an invalid response from the server. Check the server logs for more details.');
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
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))

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
      localStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(newTeamTasks))
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
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
              <Button
                onClick={generateTaskSuggestions}
                disabled={isGeneratingTasks || goals.length === 0}
                className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}
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
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  CEO Tasks
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                  <TrendingUp className="h-4 w-4" />
                  <span>{completedTasks.length} of {tasks.length} completed</span>
                </div>
              </div>

              {tasks.length === 0 ? (
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

                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {tasks
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 }
                      return priorityOrder[a.priority] - priorityOrder[b.priority]
                    })
                    .map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggleComplete={() => handleToggleTaskComplete(task.id)}
                      />
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

            <AddGoalForm 
              onSubmit={handleAddGoal}
              onCancel={() => setShowAddGoal(false)}
            />

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