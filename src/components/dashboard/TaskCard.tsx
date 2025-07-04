import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Target, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { formatCompactDateTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
}

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const priorityConfig = {
    high: {
      background: '#2F5249',
      textColor: 'text-white',
      badgeClasses: 'text-white',
      cardBorder: 'border-gray-200',
      cardBackground: 'bg-gradient-to-br from-white to-gray-50'
    },
    medium: {
      background: '#97B067',
      textColor: 'text-white',
      badgeClasses: 'text-white',
      cardBorder: 'border-gray-200',
      cardBackground: 'bg-gradient-to-br from-white to-gray-50'
    },
    low: {
      background: '#C9F223',
      textColor: 'text-black',
      badgeClasses: 'text-black',
      cardBorder: 'border-gray-200',
      cardBackground: 'bg-gradient-to-br from-white to-gray-50'
    }
  }

  const config = priorityConfig[task.priority]

  return (
    <Card className={`relative min-w-[320px] max-w-[380px] ${task.businessImpact ? 'h-[320px]' : 'h-[280px]'} flex flex-col ${task.completed ? 'opacity-60' : ''} ${config.cardBorder} ${config.cardBackground} border rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-sm font-semibold leading-tight mb-3 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.badgeClasses}`}
                  style={{ backgroundColor: config.background }}
                >
                  {task.priority.toUpperCase()}
                </span>
                <span className="text-xs text-gray-600">
                  {formatCompactDateTime(task.dueDate)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleComplete(task.id)}
                className="shrink-0 hover:bg-white/70 rounded-full p-1.5 h-auto transition-colors"
              >
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 hover:text-green-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
          {task.description}
        </p>
        
        {/* Task reasoning - matching team task format */}
        {task.explanation && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-auto">
            <div className="flex items-start space-x-2">
              <Target className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium line-clamp-2">{task.explanation}</p>
            </div>
          </div>
        )}

        {/* Business Impact */}
        {task.businessImpact && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-green-800 leading-relaxed font-medium line-clamp-2 mb-2">{task.businessImpact.description}</p>
                
                <div className="flex items-center justify-between text-xs text-green-700">
                  {task.businessImpact.estimatedValue && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">{task.businessImpact.estimatedValue}</span>
                    </div>
                  )}
                  
                  {task.businessImpact.timeframe && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.businessImpact.timeframe}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 