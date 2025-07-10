'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Check, 
  Clock, 
  Target, 
  Users, 
  Settings,
  BarChart3,
  User,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { TaskSuggestion, TeamTaskSuggestion, AutoModeSettings, TeamMember } from '@/types'

interface TaskSuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  ceoSuggestions: TaskSuggestion[]
  teamSuggestions: Record<string, TeamTaskSuggestion[]>
  teamMembers: TeamMember[]
  autoModeSettings: AutoModeSettings
  onConfirm: (selectedCeo: TaskSuggestion[], selectedTeam: Record<string, TeamTaskSuggestion[]>) => void
  isLoading?: boolean
}

export function TaskSuggestionModal({
  isOpen,
  onClose,
  ceoSuggestions,
  teamSuggestions,
  autoModeSettings,
  onConfirm,
  isLoading = false
}: TaskSuggestionModalProps) {
  const [selectedCeoTasks, setSelectedCeoTasks] = useState<TaskSuggestion[]>([])
  const [selectedTeamTasks, setSelectedTeamTasks] = useState<Record<string, TeamTaskSuggestion[]>>({})
  const [currentView, setCurrentView] = useState<'ceo' | string>('ceo')
  const [isAnimating, setIsAnimating] = useState(false)

  // Initialize selections based on auto mode
  useEffect(() => {
    if (autoModeSettings.enabled) {
      // Auto-select CEO tasks
      const sortedCeoTasks = [...ceoSuggestions].sort((a, b) => {
        // Priority ranking: high = 3, medium = 2, low = 1
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        const aScore = priorityWeight[a.priority] + (a.rank || 0)
        const bScore = priorityWeight[b.priority] + (b.rank || 0)
        return bScore - aScore
      })
      setSelectedCeoTasks(sortedCeoTasks.slice(0, autoModeSettings.maxTasksPerPerson))

      // Auto-select team tasks
      const autoSelectedTeam: Record<string, TeamTaskSuggestion[]> = {}
      Object.entries(teamSuggestions).forEach(([memberKey, suggestions]) => {
        const sortedSuggestions = [...suggestions].sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 }
          const aScore = priorityWeight[a.priority] + (a.rank || 0)
          const bScore = priorityWeight[b.priority] + (b.rank || 0)
          return bScore - aScore
        })
        autoSelectedTeam[memberKey] = sortedSuggestions.slice(0, autoModeSettings.maxTasksPerPerson)
      })
      setSelectedTeamTasks(autoSelectedTeam)
    } else {
      // Manual mode - start with empty selections
      setSelectedCeoTasks([])
      setSelectedTeamTasks({})
    }
  }, [ceoSuggestions, teamSuggestions, autoModeSettings])

  const toggleCeoTask = (task: TaskSuggestion) => {
    setSelectedCeoTasks(prev => {
      const isSelected = prev.some(t => t.id === task.id)
      if (isSelected) {
        return prev.filter(t => t.id !== task.id)
      } else if (prev.length < autoModeSettings.maxTasksPerPerson) {
        return [...prev, task]
      }
      return prev
    })
  }

  const toggleTeamTask = (memberKey: string, task: TeamTaskSuggestion) => {
    setSelectedTeamTasks(prev => {
      const currentMemberTasks = prev[memberKey] || []
      const isSelected = currentMemberTasks.some(t => t.id === task.id)
      
      if (isSelected) {
        return {
          ...prev,
          [memberKey]: currentMemberTasks.filter(t => t.id !== task.id)
        }
      } else if (currentMemberTasks.length < autoModeSettings.maxTasksPerPerson) {
        return {
          ...prev,
          [memberKey]: [...currentMemberTasks, task]
        }
      }
      return prev
    })
  }

  const handleViewChange = (newView: 'ceo' | string) => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentView(newView)
      setIsAnimating(false)
    }, 150)
  }

  const handleConfirm = () => {
    // Validation: Check if at least one CEO task is selected
    if (selectedCeoTasks.length === 0) {
      alert('Please select at least one task for yourself before confirming.')
      return
    }

    // Validation: Check if at least one task is selected for each team member
    const teamMemberKeys = Object.keys(teamSuggestions)
    const missingSelections: string[] = []
    
    teamMemberKeys.forEach(memberKey => {
      const memberTasks = selectedTeamTasks[memberKey] || []
      if (memberTasks.length === 0) {
        const memberName = memberKey.split(' - ')[0]
        missingSelections.push(memberName)
      }
    })

    if (missingSelections.length > 0) {
      const memberList = missingSelections.join(', ')
      alert(`Please select at least one task for: ${memberList}`)
      return
    }

    onConfirm(selectedCeoTasks, selectedTeamTasks)
    onClose()
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
    }
  }

  const getTotalSelected = () => {
    const ceoCount = selectedCeoTasks.length
    const teamCount = Object.values(selectedTeamTasks).reduce((sum, tasks) => sum + tasks.length, 0)
    return ceoCount + teamCount
  }

  const getViewOptions = () => {
    const options = [{ key: 'ceo', label: 'CEO Tasks', icon: User }]
    Object.keys(teamSuggestions).forEach(memberKey => {
      const memberName = memberKey.split(' - ')[0]
      options.push({ key: memberKey, label: memberName, icon: Users })
    })
    return options
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Smart Suggestions</h2>
                <p className="text-white/80">
                  {autoModeSettings.enabled ? 'Auto-selected based on your preferences' : 'Choose up to 3 tasks per person'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {autoModeSettings.enabled && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Auto Mode</span>
                </div>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getViewOptions().map((option) => (
                <Button
                  key={option.key}
                  onClick={() => handleViewChange(option.key)}
                  variant={currentView === option.key ? "default" : "ghost"}
                  size="sm"
                  className={`transition-all duration-200 ${
                    currentView === option.key 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                  {option.key === 'ceo' && (
                    <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                      {selectedCeoTasks.length}
                    </span>
                  )}
                  {option.key !== 'ceo' && (
                    <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                      {selectedTeamTasks[option.key]?.length || 0}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {getTotalSelected()} tasks selected
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
                <p className="text-gray-600">Analyzing data for recommendations...</p>
              </div>
            </div>
          ) : (
            <div className={`transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {currentView === 'ceo' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ceoSuggestions.map((task) => {
                const isSelected = selectedCeoTasks.some(t => t.id === task.id)
                const canSelect = selectedCeoTasks.length < autoModeSettings.maxTasksPerPerson

                return (
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-brand-primary bg-brand-accent-soft' 
                        : 'hover:ring-1 hover:ring-brand-primary/30'
                    } ${!canSelect && !isSelected ? 'opacity-50' : ''}`}
                    onClick={() => !autoModeSettings.enabled && toggleCeoTask(task)}
                  >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                  {task.priority}
                                </span>
                                {task.estimatedHours && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedHours}h
                                    </span>
                                  </>
                                )}
                              </div>
                              <CardTitle className="text-lg font-semibold leading-tight">
                                {task.title}
                              </CardTitle>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center ml-2">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800 font-medium line-clamp-2">
                                  {task.explanation}
                                </p>
                              </div>
                            </div>
                            
                            {/* Business Impact */}
                            {task.businessImpact && (
                              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-green-800 font-medium line-clamp-2 mb-2">
                                      {task.businessImpact.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-green-700">
                                      {task.businessImpact.estimatedValue && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" />
                                          <span className="font-medium">{task.businessImpact.estimatedValue}</span>
                                        </div>
                                      )}
                                      {task.businessImpact.timeframe && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{task.businessImpact.timeframe}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamSuggestions[currentView]?.map((task) => {
                    const isSelected = selectedTeamTasks[currentView]?.some(t => t.id === task.id) || false
                    const canSelect = (selectedTeamTasks[currentView]?.length || 0) < autoModeSettings.maxTasksPerPerson
                    
                    return (
                      <Card
                        key={task.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isSelected 
                            ? 'ring-2 ring-brand-primary bg-brand-accent-soft' 
                            : 'hover:ring-1 hover:ring-brand-primary/30'
                        } ${!canSelect && !isSelected ? 'opacity-50' : ''}`}
                        onClick={() => !autoModeSettings.enabled && toggleTeamTask(currentView, task)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                  {task.priority}
                                </span>
                                {task.estimatedHours && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedHours}h
                                    </span>
                                  </>
                                )}
                              </div>
                              <CardTitle className="text-lg font-semibold leading-tight">
                                {task.title}
                              </CardTitle>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center ml-2">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800 font-medium line-clamp-2">
                                  {task.reason}
                                </p>
                              </div>
                            </div>
                            
                            {/* Business Impact */}
                            {task.businessImpact && (
                              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-green-800 font-medium line-clamp-2 mb-2">
                                      {task.businessImpact.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-green-700">
                                      {task.businessImpact.estimatedValue && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" />
                                          <span className="font-medium">{task.businessImpact.estimatedValue}</span>
                                        </div>
                                      )}
                                      {task.businessImpact.timeframe && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{task.businessImpact.timeframe}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }) || []}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {autoModeSettings.enabled ? (
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand-primary" />
                  Tasks auto-selected based on priority and diversity
                </span>
              ) : (
                <span>
                  Select up to {autoModeSettings.maxTasksPerPerson} tasks per person • {getTotalSelected()} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={getTotalSelected() === 0}
                className="bg-brand-primary hover:bg-brand-primary-light text-white"
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 