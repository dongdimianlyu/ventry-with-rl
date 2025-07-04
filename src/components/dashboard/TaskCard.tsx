import { Task } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, X, Lightbulb, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { formatCompactDateTime } from '@/lib/utils'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
}

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const [showOverlay, setShowOverlay] = useState(false)

  const priorityConfig = {
    high: {
      background: '#2F5249',
      textColor: 'text-white',
      badgeClasses: 'text-white',
      cardBorder: 'border-gray-200'
    },
    medium: {
      background: '#97B067',
      textColor: 'text-white',
      badgeClasses: 'text-white',
      cardBorder: 'border-gray-200'
    },
    low: {
      background: '#C9F223',
      textColor: 'text-black',
      badgeClasses: 'text-black',
      cardBorder: 'border-gray-200'
    }
  }

  const config = priorityConfig[task.priority]

  const handleCardClick = () => {
    setShowOverlay(true)
  }

  const handleOverlayClose = () => {
    setShowOverlay(false)
  }

  return (
    <>
      {/* Main Card - Collapsed View */}
      <Card 
        className={`refined-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${task.completed ? 'opacity-60' : ''} ${config.cardBorder} border rounded-xl`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-lg font-semibold leading-tight mb-3 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </CardTitle>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClasses}`}
                    style={{ backgroundColor: config.background }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatCompactDateTime(task.dueDate)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleComplete(task.id)
                  }}
                  className="shrink-0 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-green-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Expandable Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleOverlayClose}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card className="refined-card shadow-2xl border-2 border-gray-200">
              <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClasses}`}
                        style={{ backgroundColor: config.background }}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCompactDateTime(task.dueDate)}
                      </span>
                    </div>
                    <CardTitle className={`text-xl font-bold leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleComplete(task.id)
                      }}
                      className="hover:bg-gray-100 rounded-full p-2"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOverlayClose}
                      className="hover:bg-gray-100 rounded-full p-2"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Task Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Instructions</h3>
                  <CardDescription className="text-base text-gray-700 leading-relaxed">
                    {task.description}
                  </CardDescription>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                
                {/* Why This Matters Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Why this matters</h3>
                      <p className="text-base text-blue-800 leading-relaxed">{task.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Business Impact Section */}
                {task.businessImpact && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-900 mb-3">Business Impact</h3>
                          <p className="text-base text-green-800 leading-relaxed mb-4">{task.businessImpact.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.businessImpact.estimatedValue && (
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <DollarSign className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-900">Estimated Value</p>
                                  <p className="text-sm text-green-700">{task.businessImpact.estimatedValue}</p>
                                </div>
                              </div>
                            )}
                            
                            {task.businessImpact.timeframe && (
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-900">Expected Timeframe</p>
                                  <p className="text-sm text-green-700">{task.businessImpact.timeframe}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
} 