'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Clock, 
  Target,
  AlertCircle,
  TrendingUp,
  ClipboardList
} from 'lucide-react'
import { TeamMember, Goal, TeamTask, TaskSuggestion, TeamTaskSuggestion, AutoModeSettings } from '@/types'
import { TeamTaskCard } from '@/components/dashboard/TeamTaskCard'
import { TaskSuggestionModal } from '@/components/dashboard/TaskSuggestionModal'
import { AutoModeToggle } from '@/components/ui/AutoModeToggle'
import { knowledgeBase } from '@/data/knowledge-base'

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [teamTasks, setTeamTasks] = useState<Record<string, TeamTask[]>>({})
  const [showAddMember, setShowAddMember] = useState(false)
  const [generatingTasks, setGeneratingTasks] = useState(false)
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
  
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Marketing' as TeamMember['role'],
    customRole: ''
  })

  // Load data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)
    
    // Load team members
    const savedTeamMembers = localStorage.getItem(`team_${user.id}`)
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }

    // Load goals
    const savedGoals = localStorage.getItem(`goals_${user.id}`)
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }

    // Load team tasks from sessionStorage (only persist during session)
    const savedTeamTasks = sessionStorage.getItem(`employeeTasks_${user.id}`)
    if (savedTeamTasks) {
      setTeamTasks(JSON.parse(savedTeamTasks))
    }
  }, [])

  const generateTaskSuggestions = async () => {
    if (teamMembers.length === 0) {
      setTaskError('Please add team members before generating tasks.')
      return
    }

    if (goals.length === 0) {
      setTaskError('Please add goals before generating team tasks.')
      return
    }

    setGeneratingTasks(true)
    setTaskError(null)
    setShowTaskSuggestionModal(true)

    try {
      // Use unified API endpoint for suggestions
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goals,
          previousTasks: [],
          knowledgeBase,
          timeframe: 'today',
          teamMembers,
          generateForTeam: true,
          suggestionMode: true,
          previousTeamTasks: teamTasks,
          userId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : null
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || 'Failed to generate task suggestions');
        } catch {
          console.error("Non-JSON error response:", errorText);
          throw new Error('Received an invalid response from the server when generating task suggestions.');
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
      setGeneratingTasks(false)
    }
  }

  const handleTaskSelectionConfirm = (selectedCeoTasks: TaskSuggestion[], selectedTeamTasks: Record<string, TeamTaskSuggestion[]>) => {
    const userData = localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    // Convert selected CEO tasks to actual tasks
    if (selectedCeoTasks.length > 0) {
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

      // Add CEO tasks to existing tasks
      const existingTasks = sessionStorage.getItem(`tasks_${user.id}`)
      const currentTasks = existingTasks ? JSON.parse(existingTasks) : []
      const updatedTasks = [...currentTasks, ...newCeoTasks]
      sessionStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
    }

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

    // Merge with existing team tasks
    const existingTeamTasks = sessionStorage.getItem(`employeeTasks_${user.id}`)
    const currentTeamTasks = existingTeamTasks ? JSON.parse(existingTeamTasks) : {}
    const updatedTeamTasks = { ...currentTeamTasks, ...newTeamTasks }
    
    setTeamTasks(updatedTeamTasks)
    sessionStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(updatedTeamTasks))

    // Reset modal state
    setShowTaskSuggestionModal(false)
    setTaskSuggestions([])
    setTeamTaskSuggestions({})
  }

  const addTeamMember = () => {
    if (!newMember.name.trim()) {
      alert('Please enter a name for the team member.')
      return
    }

    if (newMember.role === 'Custom' && !newMember.customRole.trim()) {
      alert('Please specify a custom role.')
      return
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role,
      customRole: newMember.role === 'Custom' ? newMember.customRole.trim() : undefined
    }

    const updatedMembers = [...teamMembers, member]
    setTeamMembers(updatedMembers)
    
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      localStorage.setItem(`team_${user.id}`, JSON.stringify(updatedMembers))
    }

    // Reset form
    setNewMember({
      name: '',
      role: 'Marketing',
      customRole: ''
    })
    setShowAddMember(false)
  }

  const removeTeamMember = (memberId: string) => {
    const memberToRemove = teamMembers.find(m => m.id === memberId)
    if (!memberToRemove) return

    const updatedMembers = teamMembers.filter(member => member.id !== memberId)
    setTeamMembers(updatedMembers)
    
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      localStorage.setItem(`team_${user.id}`, JSON.stringify(updatedMembers))
    }

    // Remove tasks assigned to this member
    const memberKey = `${memberToRemove.name} - ${memberToRemove.role === 'Custom' ? memberToRemove.customRole : memberToRemove.role}`
    const updatedTasks = { ...teamTasks }
    delete updatedTasks[memberKey]
    setTeamTasks(updatedTasks)
    
    if (userData) {
      const user = JSON.parse(userData)
      sessionStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(updatedTasks))
    }
  }

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = { ...teamTasks }
    Object.keys(updatedTasks).forEach(memberKey => {
      updatedTasks[memberKey] = updatedTasks[memberKey].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    })
    setTeamTasks(updatedTasks)
    
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      sessionStorage.setItem(`employeeTasks_${user.id}`, JSON.stringify(updatedTasks))
    }
  }

  // Calculate stats
  const allTasks = Object.values(teamTasks).flat()
  const completedTasks = allTasks.filter(task => task.completed)
  const pendingTasks = allTasks.filter(task => !task.completed)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your team and track collaborative tasks</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <AutoModeToggle 
              onSettingsChange={setAutoModeSettings}
              className="mr-3"
            />
          </div>
          <Button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
          <Button
            onClick={generateTaskSuggestions}
            disabled={generatingTasks || teamMembers.length === 0 || goals.length === 0}
            className="brand-gradient text-white hover:opacity-90 flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {generatingTasks ? 'Generating...' : 'Get Recommendations'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {taskError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Task Generation Error</h3>
              <p className="text-sm text-red-700 mt-1">{taskError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="refined-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="refined-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{allTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="refined-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="refined-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-[#9B0E8D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monday.com Style Team Layout */}
      {teamMembers.length === 0 ? (
        <Card className="refined-card text-center py-16 bg-gradient-to-br from-white to-gray-50">
          <CardContent>
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No team members yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Start building your team to generate collaborative tasks and track progress.
            </p>

          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teamMembers.map(member => {
            const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
            const memberTasks = teamTasks[memberKey] || []
            
            return (
              <Card key={member.id} className="refined-card bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-[#9B0E8D] rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">{member.name}</CardTitle>
                        <p className="text-sm text-gray-600">{member.role === 'Custom' ? member.customRole : member.role}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{memberTasks.length} tasks</span>
                        <span>•</span>
                        <span>{memberTasks.filter(t => t.completed).length} completed</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeTeamMember(member.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {memberTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks assigned yet</p>
                      {goals.length > 0 && (
                        <p className="text-xs mt-1">Generate tasks to assign work to {member.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {memberTasks
                        .sort((a, b) => {
                          const priorityOrder = { high: 0, medium: 1, low: 2 }
                          return priorityOrder[a.priority] - priorityOrder[b.priority]
                        })
                        .map(task => (
                          <TeamTaskCard
                            key={task.id}
                            task={{ ...task, memberName: member.name, memberRole: member.role === 'Custom' ? member.customRole || 'Custom' : member.role }}
                            onToggleComplete={toggleTaskCompletion}
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ 
                    ...prev, 
                    role: e.target.value as TeamMember['role'],
                    customRole: e.target.value === 'Custom' ? prev.customRole : ''
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Ops">Operations</option>
                  <option value="Custom">Custom Role</option>
                </select>
              </div>

              {newMember.role === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Role
                  </label>
                  <input
                    type="text"
                    value={newMember.customRole}
                    onChange={(e) => setNewMember(prev => ({ ...prev, customRole: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Data Scientist, Customer Success"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowAddMember(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={addTeamMember}
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Suggestion Modal */}
      <TaskSuggestionModal
        isOpen={showTaskSuggestionModal}
        onClose={() => setShowTaskSuggestionModal(false)}
        ceoSuggestions={taskSuggestions}
        teamSuggestions={teamTaskSuggestions}
        teamMembers={teamMembers}
        autoModeSettings={autoModeSettings}
        onConfirm={handleTaskSelectionConfirm}
        isLoading={generatingTasks}
      />
    </div>
  )
} 