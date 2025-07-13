import { RLTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, TrendingUp, Target, Sparkles, BarChart3, Settings, ShoppingCart, Megaphone, DollarSign, Tag, Cog } from 'lucide-react'
import { formatCompactDateTime } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface RLTaskCardProps {
  task: RLTask
  onComplete?: (taskId: string) => void
  onApprove?: (taskId: string) => void
  onReject?: (taskId: string) => void
}

export function RLTaskCard({ task, onComplete, onApprove, onReject }: RLTaskCardProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [shouldHide, setShouldHide] = useState(false)
  const [showPercentage, setShowPercentage] = useState(true)

  useEffect(() => {
    // Load initial setting
    const showPct = localStorage.getItem('show_roi_percentage')
    setShowPercentage(showPct === null || showPct === 'true')

    // Listen for changes
    const handlePreferencesChange = () => {
      const showPct = localStorage.getItem('show_roi_percentage')
      setShowPercentage(showPct === null || showPct === 'true')
    }

    window.addEventListener('displayPreferencesChanged', handlePreferencesChange)
    return () => window.removeEventListener('displayPreferencesChanged', handlePreferencesChange)
  }, [])

  const handleCardClick = () => {
    setShowOverlay(true)
  }

  const handleOverlayClose = () => {
    setShowOverlay(false)
  }

  const handleComplete = (taskId: string) => {
    setIsCompleting(true)
    setTimeout(() => {
      setShouldHide(true)
      if (onComplete) {
        onComplete(taskId)
      }
    }, 500) // 500ms delay for fade animation
  }

  const getConfidenceColor = (confidence: string) => {
    const conf = confidence.toLowerCase()
    if (conf === 'high') return 'text-green-600 bg-green-50 border-green-200'
    if (conf === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getApprovalStatus = () => {
    if (task.approved === true) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'Approved' }
    if (task.approved === false) return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Rejected' }
    return null
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'inventory': return <ShoppingCart className="h-4 w-4" />
      case 'marketing': return <Megaphone className="h-4 w-4" />
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'pricing': return <Tag className="h-4 w-4" />
      case 'operational': return <Cog className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'inventory': return 'bg-blue-100 text-blue-800'
      case 'marketing': return 'bg-purple-100 text-purple-800'
      case 'financial': return 'bg-green-100 text-green-800'
      case 'pricing': return 'bg-orange-100 text-orange-800'
      case 'operational': return 'bg-gray-100 text-gray-800'
      default: return 'bg-indigo-100 text-indigo-800'
    }
  }

  const formatROIDisplay = () => {
    const profit = `≈$${task.predicted_profit_usd?.toLocaleString() || '0'}`
    if (showPercentage) {
      return `${task.predicted_roi} (${profit})`
    } else {
      return profit
    }
  }

  const approvalStatus = getApprovalStatus()

  // Don't render if the card should be hidden
  if (shouldHide) {
    return null
  }

  return (
    <>
      {/* Main Card - Compact View */}
      <div 
        className={`relative cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
          task.completed || isCompleting ? 'opacity-0 transform scale-95 pointer-events-none' : ''
        } border-2 border-[#9B0E8D]/20 bg-gradient-to-br from-[#9B0E8D]/5 via-white to-[#9B0E8D]/10 rounded-xl flex flex-col w-full min-h-[280px] overflow-hidden`}
        onClick={handleCardClick}
      >
        <Card className="h-full border-none bg-transparent shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#9B0E8D] text-white rounded-full text-xs font-semibold">
                  <Settings className="h-3 w-3" />
                  Smart Suggestion
                </div>
                {task.category && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {getCategoryIcon(task.category)}
                    <span className="capitalize">{task.category}</span>
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  {formatCompactDateTime(task.dueDate)}
                </span>
              </div>
              <CardTitle className={`text-lg font-semibold leading-tight mb-4 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </CardTitle>
              
              {/* Status Badge */}
              {approvalStatus && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${approvalStatus.bg} ${approvalStatus.border} border`}>
                  <approvalStatus.icon className={`h-3 w-3 ${approvalStatus.color}`} />
                  <span className={approvalStatus.color}>{approvalStatus.text}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4 flex-1 flex flex-col relative">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {task.description}
          </p>
          
          {/* RL Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-700 font-medium">Predicted ROI</p>
                  <p className="text-sm font-bold text-green-800">
                    {formatROIDisplay()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`border rounded-lg p-3 ${getConfidenceColor(task.confidence_score)}`}>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <div>
                  <p className="text-xs font-medium">Confidence</p>
                  <p className="text-sm font-bold capitalize">{task.confidence_score}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Positioned at bottom-right */}
          {task.approved === null && onApprove && onReject && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(task.id)
                }}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove(task.id)
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          )}
          {task.approved === true && !task.completed && onComplete && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleComplete(task.id)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          )}
          
          {/* Add padding to bottom to make room for buttons */}
          <div className="pb-12"></div>
        </CardContent>
        </Card>
      </div>

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
            <Card className="shadow-2xl border-2 border-[#9B0E8D]/20 bg-gradient-to-br from-[#9B0E8D]/5 via-white to-[#9B0E8D]/10">
              <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#9B0E8D] text-white rounded-full text-xs font-semibold">
                        <Settings className="h-3 w-3" />
                        Smart Suggestion
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatCompactDateTime(task.dueDate)}
                      </span>
                      {approvalStatus && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${approvalStatus.bg} ${approvalStatus.border} border`}>
                          <approvalStatus.icon className={`h-3 w-3 ${approvalStatus.color}`} />
                          <span className={approvalStatus.color}>{approvalStatus.text}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className={`text-xl font-bold leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOverlayClose}
                    className="hover:bg-gray-100 rounded-full p-2"
                  >
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Task Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Action Details</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {task.description}
                  </p>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                
                {/* AI Analysis Section */}
                <div className="bg-gradient-to-r from-[#9B0E8D]/5 to-[#9B0E8D]/10 border border-[#9B0E8D]/20 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#9B0E8D] rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#9B0E8D] mb-3">AI Analysis</h3>
                      <p className="text-base text-[#9B0E8D]/80 leading-relaxed mb-4">{task.explanation}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">Predicted ROI</p>
                              <p className="text-lg font-bold text-green-800">
                                {formatROIDisplay()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${getConfidenceColor(task.confidence_score)}`}>
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium">AI Confidence</p>
                              <p className="text-lg font-bold capitalize">{task.confidence_score}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons in Modal - Bottom-right positioning */}
                <div className="flex justify-end">
                  {task.approved === null && onApprove && onReject && (
                    <div className="flex gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onReject(task.id)
                          handleOverlayClose()
                        }}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onApprove(task.id)
                          handleOverlayClose()
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Execute
                      </Button>
                    </div>
                  )}
                  {task.approved === true && !task.completed && onComplete && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComplete(task.id)
                        handleOverlayClose()
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
} 