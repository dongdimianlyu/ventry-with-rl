'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Clock, 
  Target,
  AlertCircle,
  Brain,
  TrendingUp
} from 'lucide-react'
import { TeamMember, Goal, TeamTask } from '@/types'

interface TeamTaskWithMember extends TeamTask {
  memberName: string
  memberRole: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [teamTasks, setTeamTasks] = useState<TeamTaskWithMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [generatingTasks, setGeneratingTasks] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Marketing' as TeamMember['role'],
    customRole: ''
  })

  // Mock user ID - in a real app, this would come from authentication
  // const userId = 'user-123'

  useEffect(() => {
    // Load team members from localStorage
    const savedTeamMembers = localStorage.getItem('ventry-team-members')
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }

    // Load goals from localStorage
    const savedGoals = localStorage.getItem('ventry-goals')
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }

    // Load team tasks from localStorage
    const savedTeamTasks = localStorage.getItem('ventry-team-tasks')
    if (savedTeamTasks) {
      setTeamTasks(JSON.parse(savedTeamTasks))
    }
  }, [])

  const generateTeamTasks = async () => {
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

    try {
      const response = await fetch('/api/tasks/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamMembers,
          goals
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || 'Failed to generate team tasks');
        } catch (e) {
          console.error("Non-JSON error response:", errorText);
          throw new Error('Received an invalid response from the server when generating team tasks.');
        }
      }

      const data = await response.json()
      
      if (data.teamTasks) {
        // Transform the nested task structure to flat array with member info
        const flatTasks: TeamTaskWithMember[] = []
        
        Object.entries(data.teamTasks).forEach(([memberKey, tasks]) => {
          const member = teamMembers.find(m => memberKey.includes(m.name))
          if (member && Array.isArray(tasks)) {
            (tasks as TeamTask[]).forEach((task: TeamTask, index: number) => {
              flatTasks.push({
                ...task,
                id: `team-task-${Date.now()}-${index}`,
                assignedTo: member.id,
                memberName: member.name,
                memberRole: member.role === 'Custom' ? member.customRole || 'Custom' : member.role,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                completed: false
              })
            })
          }
        })

        setTeamTasks(flatTasks)
        localStorage.setItem('ventry-team-tasks', JSON.stringify(flatTasks))
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error: unknown) {
      console.error('Error generating team tasks:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setTaskError(errorMessage)
    } finally {
      setGeneratingTasks(false)
    }
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
    localStorage.setItem('ventry-team-members', JSON.stringify(updatedMembers))

    // Reset form
    setNewMember({
      name: '',
      role: 'Marketing',
      customRole: ''
    })
    setShowAddMember(false)
  }

  const removeTeamMember = (memberId: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== memberId)
    setTeamMembers(updatedMembers)
    localStorage.setItem('ventry-team-members', JSON.stringify(updatedMembers))

    // Remove tasks assigned to this member
    const updatedTasks = teamTasks.filter(task => task.assignedTo !== memberId)
    setTeamTasks(updatedTasks)
    localStorage.setItem('ventry-team-tasks', JSON.stringify(updatedTasks))
  }

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = teamTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTeamTasks(updatedTasks)
    localStorage.setItem('ventry-team-tasks', JSON.stringify(updatedTasks))
  }

  const completedTasks = teamTasks.filter(task => task.completed)
  const pendingTasks = teamTasks.filter(task => !task.completed)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-gray-600">Manage your team and generate AI-powered collaborative tasks</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
          <Button
            onClick={generateTeamTasks}
            disabled={generatingTasks || teamMembers.length === 0 || goals.length === 0}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Brain className="h-4 w-4" />
            {generatingTasks ? 'Generating...' : 'Generate Team Tasks'}
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
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{teamTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Members</h2>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start building your team to generate collaborative tasks.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddMember(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add First Team Member
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">
                      {member.role === 'Custom' ? member.customRole : member.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {teamTasks.filter(task => task.assignedTo === member.id).length} tasks
                    </span>
                    <Button
                      onClick={() => removeTeamMember(member.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Team Tasks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Tasks</h2>
          
          {teamTasks.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team tasks yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {teamMembers.length === 0 
                  ? "Add team members first, then generate collaborative tasks." 
                  : goals.length === 0
                  ? "Add goals first, then generate team tasks."
                  : "Generate AI-powered team tasks to boost collaboration."
                }
              </p>
              <div className="mt-6">
                {teamMembers.length === 0 ? (
                  <Button onClick={() => setShowAddMember(true)} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Team Members
                  </Button>
                ) : (
                  <Button 
                    onClick={generateTeamTasks} 
                    disabled={generatingTasks || goals.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {generatingTasks ? 'Generating...' : 'Generate Team Tasks'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {teamTasks.map(task => (
                <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Assigned to: {task.memberName} ({task.memberRole})
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleTaskCompletion(task.id)}
                      variant={task.completed ? "default" : "outline"}
                      size="sm"
                      className={task.completed ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {task.completed ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                  {task.reason && (
                    <p className="text-xs text-gray-500 italic mt-2">{task.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

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
    </div>
  )
} 