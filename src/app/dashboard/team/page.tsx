'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeamMember, User, TeamTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Eye, Check } from 'lucide-react'

export default function TeamPage() {
  const [user, setUser] = useState<User | null>(null)
  const [teamSize, setTeamSize] = useState(1)
  const [teamMembers, setTeamMembers] = useState<Omit<TeamMember, 'id'>[]>([])
  const [existingTeam, setExistingTeam] = useState<TeamMember[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load existing team
    const savedTeam = localStorage.getItem(`team_${parsedUser.id}`)
    if (savedTeam) {
      const team = JSON.parse(savedTeam)
      setExistingTeam(team)
      setTeamSize(team.length)
      setTeamMembers(team.map((member: TeamMember) => ({
        name: member.name,
        role: member.role,
        customRole: member.customRole
      })))
    } else {
      // Initialize with default member
      setTeamMembers([{ name: '', role: 'Marketing' as const }])
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
    const roleTasks: Record<string, TeamTask[]> = {
      'Marketing': [
        { id: 'mock-1', title: "Plan Instagram content", reason: "Increase brand visibility", priority: 'high' as const, completed: false },
        { id: 'mock-2', title: "Draft email newsletter", reason: "Improve customer retention", priority: 'medium' as const, completed: false }
      ],
      'Sales': [
        { id: 'mock-1', title: "Follow up with warm leads", reason: "Convert prospects to customers", priority: 'high' as const, completed: false },
        { id: 'mock-2', title: "Update CRM data", reason: "Maintain accurate pipeline", priority: 'medium' as const, completed: false }
      ],
      'Product': [
        { id: 'mock-1', title: "Review user feedback", reason: "Identify improvement opportunities", priority: 'high' as const, completed: false },
        { id: 'mock-2', title: "Update product roadmap", reason: "Align with market needs", priority: 'medium' as const, completed: false }
      ],
      'Design': [
        { id: 'mock-1', title: "Create wireframes for mobile", reason: "Improve user experience", priority: 'high' as const, completed: false },
        { id: 'mock-2', title: "Update brand guidelines", reason: "Ensure visual consistency", priority: 'medium' as const, completed: false }
      ],
      'Ops': [
        { id: 'mock-1', title: "Review current workflows", reason: "Increase efficiency", priority: 'high' as const, completed: false },
        { id: 'mock-2', title: "Analyze team metrics", reason: "Identify bottlenecks", priority: 'medium' as const, completed: false }
      ]
    }

    return roleTasks[role] || [
      { id: 'mock-1', title: "Review weekly objectives", reason: "Stay aligned with goals", priority: 'medium' as const, completed: false },
      { id: 'mock-2', title: "Complete project tasks", reason: "Meet deadlines", priority: 'high' as const, completed: false }
    ]
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

    // Save team
    localStorage.setItem(`team_${user.id}`, JSON.stringify(teamWithIds))
    setExistingTeam(teamWithIds)

    setTimeout(() => {
      setIsConfirming(false)
      router.push('/dashboard')
    }, 1000)
  }

  const isFormValid = teamMembers.some(member => member.name.trim() !== '')

  if (!user) {
    return <div>Loading...</div>
  }

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
        {existingTeam.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  Current Team ({existingTeam.length} members)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingTeam.map((member) => (
                    <div key={member.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">
                            {member.role === 'Custom' ? member.customRole : member.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            <CardTitle>Preview Team Layout</CardTitle>
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
                    Preview how your dashboard will look with team members
                  </p>
                  <div className="overflow-x-auto">
                    <div className="flex space-x-4 pb-4" style={{ minWidth: 'max-content' }}>
                      {teamMembers
                        .filter(member => member.name.trim() !== '')
                        .map((member, index) => (
                        <div key={index} className="w-80 flex-shrink-0">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center text-lg">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 text-sm font-medium">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-500 font-normal">
                                    {member.role === 'Custom' ? member.customRole : member.role}
                                  </div>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {getMockTasks(member.role).map((task) => (
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
                        </div>
                      ))}
                    </div>
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
                <span>Saving Team...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Confirm Team</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 