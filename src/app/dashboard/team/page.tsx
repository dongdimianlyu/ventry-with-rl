'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeamMember, User, TeamTask, Goal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Eye, Check, Plus, Calendar, MoreVertical, Target } from 'lucide-react'

interface TeamSetupData {
  members: TeamMember[]
  isSetupComplete: boolean
}

export default function TeamPage() {
  const [user, setUser] = useState<User | null>(null)
  const [teamSize, setTeamSize] = useState(1)
  const [teamMembers, setTeamMembers] = useState<Omit<TeamMember, 'id'>[]>([])
  const [teamSetup, setTeamSetup] = useState<TeamSetupData | null>(null)
  const [teamTasks, setTeamTasks] = useState<Record<string, TeamTask[]>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load existing team setup
    const savedTeamSetup = localStorage.getItem(`teamSetup_${parsedUser.id}`)
    if (savedTeamSetup) {
      const setup = JSON.parse(savedTeamSetup)
      setTeamSetup(setup)
      if (setup.isSetupComplete) {
        // Load team tasks
        const savedTasks = localStorage.getItem(`teamTasks_${parsedUser.id}`)
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks)
          // Convert date strings back to Date objects
          const tasksWithDates: Record<string, TeamTask[]> = {}
          Object.entries(parsedTasks).forEach(([memberKey, tasks]) => {
            if (Array.isArray(tasks)) {
              tasksWithDates[memberKey] = tasks.map((task: any) => ({
                ...task,
                dueDate: new Date(task.dueDate)
              }))
            }
          })
          setTeamTasks(tasksWithDates)
        }
      }
    } else {
      // Initialize with default member for setup
      setTeamMembers([{ name: '', role: 'Marketing' as const }])
    }

    // Load goals for task generation
    const savedGoals = localStorage.getItem(`goals_${parsedUser.id}`)
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [router])

  useEffect(() => {
    // Update team members array when team size changes
    setTeamMembers(prev => {
      const currentLength = prev.length
      if (teamSize > currentLength) {
        const newMembers = Array(teamSize - currentLength).fill(null).map(() => ({
          name: '',
          role: 'Marketing' as const
        }))
        return [...prev, ...newMembers]
      } else if (teamSize < currentLength) {
        return prev.slice(0, teamSize)
      }
      return prev
    })
  }, [teamSize])

  const handleMemberChange = (index: number, field: keyof Omit<TeamMember, 'id'>, value: string) => {
    const updated = [...teamMembers]
    updated[index] = { ...updated[index], [field]: value }
    setTeamMembers(updated)
  }

  const getMockTasks = (role: string): TeamTask[] => {
    const roleTasks: Record<string, Omit<TeamTask, 'id' | 'assignedTo' | 'dueDate'>[]> = {
      'Marketing': [
        { title: "Plan Instagram content calendar", description: "Create 2-week content schedule with captions and hashtags", reason: "Increase brand visibility and engagement", priority: 'high' as const, completed: false },
        { title: "Draft email newsletter", description: "Write and design monthly newsletter for customer retention", reason: "Improve customer retention and engagement", priority: 'medium' as const, completed: false },
        { title: "Analyze campaign performance", description: "Review last month's marketing metrics and create improvement plan", reason: "Optimize marketing ROI and strategy", priority: 'medium' as const, completed: false }
      ],
      'Sales': [
        { title: "Follow up with warm leads", description: "Call 10 prospects from last week's demo requests", reason: "Convert prospects to paying customers", priority: 'high' as const, completed: false },
        { title: "Update CRM pipeline", description: "Clean and update all deal stages and contact information", reason: "Maintain accurate sales forecasting", priority: 'medium' as const, completed: false },
        { title: "Prepare Q4 sales deck", description: "Update presentation with new features and case studies", reason: "Close more deals with compelling pitch", priority: 'high' as const, completed: false }
      ],
      'Product': [
        { title: "Review user feedback", description: "Analyze support tickets and feature requests from last 2 weeks", reason: "Identify improvement opportunities", priority: 'high' as const, completed: false },
        { title: "Update product roadmap", description: "Reprioritize features based on market feedback and goals", reason: "Align development with market needs", priority: 'medium' as const, completed: false },
        { title: "Conduct user interviews", description: "Schedule and run 3 user interviews for feature validation", reason: "Validate product-market fit", priority: 'high' as const, completed: false }
      ],
      'Design': [
        { title: "Create mobile wireframes", description: "Design responsive layouts for key user flows", reason: "Improve user experience on mobile", priority: 'high' as const, completed: false },
        { title: "Update brand guidelines", description: "Refine color palette and typography for consistency", reason: "Ensure visual consistency across touchpoints", priority: 'medium' as const, completed: false },
        { title: "Design onboarding flow", description: "Create intuitive first-time user experience", reason: "Reduce user drop-off and increase activation", priority: 'high' as const, completed: false }
      ],
      'Ops': [
        { title: "Review team workflows", description: "Audit current processes and identify bottlenecks", reason: "Increase operational efficiency", priority: 'high' as const, completed: false },
        { title: "Analyze team metrics", description: "Prepare weekly productivity and performance report", reason: "Data-driven team optimization", priority: 'medium' as const, completed: false },
        { title: "Optimize tools stack", description: "Evaluate and streamline software subscriptions", reason: "Reduce costs and improve productivity", priority: 'medium' as const, completed: false }
      ]
    }

    const baseTasks = roleTasks[role] || [
      { title: "Review weekly objectives", description: "Go through goals and adjust priorities for the week", reason: "Stay aligned with company objectives", priority: 'medium' as const, completed: false },
      { title: "Complete project tasks", description: "Focus on highest-priority deliverables", reason: "Meet deadlines and project milestones", priority: 'high' as const, completed: false }
    ]

    return baseTasks.map((task, index) => ({
      ...task,
      id: `mock-${role.toLowerCase()}-${index}`,
      assignedTo: 'mock-member',
      dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000) // Staggered due dates
    }))
  }

  const handleConfirmTeam = async () => {
    if (!user) return

    setIsConfirming(true)

    // Validate all members have names
    const validMembers = teamMembers.filter(member => member.name.trim() !== '')
    if (validMembers.length === 0) {
      alert('Please add at least one team member with a name.')
      setIsConfirming(false)
      return
    }

    // Create team with IDs
    const teamWithIds: TeamMember[] = validMembers.map((member, index) => ({
      ...member,
      id: `member-${Date.now()}-${index}`
    }))

    // Create team setup data
    const setupData: TeamSetupData = {
      members: teamWithIds,
      isSetupComplete: true
    }

    // Save team setup
    localStorage.setItem(`teamSetup_${user.id}`, JSON.stringify(setupData))
    setTeamSetup(setupData)

    // Generate initial tasks for each team member
    const initialTasks: Record<string, TeamTask[]> = {}
    teamWithIds.forEach(member => {
      const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
      const mockTasks = getMockTasks(member.role === 'Custom' ? member.customRole || 'Marketing' : member.role)
      initialTasks[memberKey] = mockTasks.map(task => ({
        ...task,
        id: `initial-${member.id}-${task.id}`,
        assignedTo: member.id
      }))
    })

    // Save to localStorage with date serialization
    const tasksForStorage = JSON.stringify(initialTasks, (key, value) => {
      if (key === 'dueDate' && value instanceof Date) {
        return value.toISOString()
      }
      return value
    })
    localStorage.setItem(`teamTasks_${user.id}`, tasksForStorage)
    setTeamTasks(initialTasks)

    setTimeout(() => {
      setIsConfirming(false)
    }, 1000)
  }

  const generateTeamTasks = async () => {
    if (!user || !teamSetup) return

    setIsGeneratingTasks(true)

    try {
      // Call API to generate new tasks
      const response = await fetch('/api/tasks/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamMembers: teamSetup.members,
          goals: goals
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate team tasks')
      }

      const { teamTasks: newTasks } = await response.json()

      // Transform API response to include proper types and merge with existing tasks
      const transformedTasks: Record<string, TeamTask[]> = {}
      Object.entries(newTasks).forEach(([memberKey, tasks]) => {
        if (Array.isArray(tasks)) {
          transformedTasks[memberKey] = tasks.map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate)
          }))
        }
      })

      // Merge with existing tasks
      const updatedTasks = { ...teamTasks }
      Object.keys(transformedTasks).forEach(memberKey => {
        if (updatedTasks[memberKey]) {
          updatedTasks[memberKey] = [...updatedTasks[memberKey], ...transformedTasks[memberKey]]
        } else {
          updatedTasks[memberKey] = transformedTasks[memberKey]
        }
      })

      // Save to localStorage with date serialization
      const tasksForStorage = JSON.stringify(updatedTasks, (key, value) => {
        if (key === 'dueDate' && value instanceof Date) {
          return value.toISOString()
        }
        return value
      })
      localStorage.setItem(`teamTasks_${user.id}`, tasksForStorage)
      setTeamTasks(updatedTasks)

    } catch (error) {
      console.error('Error generating team tasks:', error)
      // Fallback to local generation if API fails
      const newTasks: Record<string, TeamTask[]> = {}
      
      teamSetup.members.forEach(member => {
        const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
        const roleTasks = getMockTasks(member.role === 'Custom' ? member.customRole || 'Marketing' : member.role)
        
        newTasks[memberKey] = roleTasks.map((task, index) => ({
          ...task,
          id: `fallback-${member.id}-${index}-${Date.now()}`,
          assignedTo: member.id,
          dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
        }))
      })

      // Merge with existing tasks
      const updatedTasks = { ...teamTasks }
      Object.keys(newTasks).forEach(memberKey => {
        if (updatedTasks[memberKey]) {
          updatedTasks[memberKey] = [...updatedTasks[memberKey], ...newTasks[memberKey]]
        } else {
          updatedTasks[memberKey] = newTasks[memberKey]
        }
      })

      // Save to localStorage with date serialization
      const tasksForStorage = JSON.stringify(updatedTasks, (key, value) => {
        if (key === 'dueDate' && value instanceof Date) {
          return value.toISOString()
        }
        return value
      })
      localStorage.setItem(`teamTasks_${user.id}`, tasksForStorage)
      setTeamTasks(updatedTasks)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const toggleTaskComplete = (memberKey: string, taskId: string) => {
    const updatedTasks = { ...teamTasks }
    if (updatedTasks[memberKey]) {
      updatedTasks[memberKey] = updatedTasks[memberKey].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
      setTeamTasks(updatedTasks)
      if (user) {
        // Save to localStorage with date serialization
        const tasksForStorage = JSON.stringify(updatedTasks, (key, value) => {
          if (key === 'dueDate' && value instanceof Date) {
            return value.toISOString()
          }
          return value
        })
        localStorage.setItem(`teamTasks_${user.id}`, tasksForStorage)
      }
    }
  }

  const formatDate = (date: Date | string) => {
    const validDate = new Date(date)
    if (isNaN(validDate.getTime())) {
      return 'Invalid date'
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(validDate)
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isFormValid = teamMembers.some(member => member.name.trim() !== '')

  if (!user) {
    return <div>Loading...</div>
  }

  // If team setup is complete, show board view
  if (teamSetup?.isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-full mx-auto px-6">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Team Board</h1>
                <span className="text-sm text-gray-500">
                  {teamSetup.members.length} member{teamSetup.members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={generateTeamTasks}
                  disabled={isGeneratingTasks}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingTasks ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Generate Tasks</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Board View */}
        <div className="p-6">
          <div className="space-y-4">
            {teamSetup.members.map(member => {
              const memberKey = `${member.name} - ${member.role === 'Custom' ? member.customRole : member.role}`
              const memberTasks = teamTasks[memberKey] || []
              const completedTasks = memberTasks.filter(task => task.completed).length
              
              return (
                <div key={member.id} className="bg-white rounded-lg border shadow-sm">
                  {/* Member Row Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500">
                          {member.role === 'Custom' ? member.customRole : member.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{completedTasks}/{memberTasks.length} completed</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasks Row - Horizontal Scroll */}
                  <div className="p-4">
                    {memberTasks.length > 0 ? (
                      <div className="flex space-x-4 overflow-x-auto pb-2" style={{ minHeight: '200px' }}>
                        {memberTasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`w-80 flex-shrink-0 border rounded-lg p-4 bg-white transition-all duration-200 hover:shadow-md ${
                              task.completed ? 'bg-gray-50 opacity-75' : ''
                            }`}
                          >
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTaskComplete(memberKey, task.id)}
                                  className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </h4>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Task Details */}
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600">{task.description}</p>
                              
                              {/* Reason */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-blue-800 mb-1">Why this matters</p>
                                    <p className="text-sm text-blue-700">{task.reason}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(task.dueDate)}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No tasks assigned yet</p>
                        <p className="text-sm">Click "Generate Tasks" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Setup flow UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Team Setup</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Size Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How many people are on your team?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <label htmlFor="teamSize" className="text-sm font-medium text-gray-700">
                Team size:
              </label>
              <input
                type="number"
                id="teamSize"
                min="1"
                max="10"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">(max 10)</span>
            </div>
          </CardContent>
        </Card>

        {/* Team Member Forms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Team Member Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Member {index + 1}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        placeholder="Enter team member name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={member.role}
                        onChange={(e) => handleMemberChange(index, 'role', e.target.value as TeamMember['role'])}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Ops">Ops</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    {member.role === 'Custom' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Role
                        </label>
                        <input
                          type="text"
                          value={member.customRole || ''}
                          onChange={(e) => handleMemberChange(index, 'customRole', e.target.value)}
                          placeholder="Enter custom role"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preview Team Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </Button>

              {showPreview && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Preview how your team board will look with sample tasks
                  </p>
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    {teamMembers
                      .filter(member => member.name.trim() !== '')
                      .map((member, index) => {
                        const mockTasks = getMockTasks(member.role === 'Custom' ? member.customRole || 'Marketing' : member.role)
                        return (
                          <div key={index} className="bg-white rounded-lg border">
                            {/* Member Row Header */}
                            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-medium">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                                  <p className="text-sm text-gray-500">
                                    {member.role === 'Custom' ? member.customRole : member.role}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                0/{mockTasks.length} completed
                              </div>
                            </div>

                            {/* Sample Tasks */}
                            <div className="p-4">
                              <div className="flex space-x-3 overflow-x-auto">
                                {mockTasks.slice(0, 2).map(task => (
                                  <div key={task.id} className="w-64 flex-shrink-0 border rounded-lg p-3 bg-white">
                                    <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
                                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                      <p className="text-xs text-blue-700">{task.reason}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confirm Team */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirmTeam}
            disabled={!isFormValid || isConfirming}
            className="flex items-center space-x-2 px-8 py-3"
            size="lg"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up team...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Confirm Team Setup</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 