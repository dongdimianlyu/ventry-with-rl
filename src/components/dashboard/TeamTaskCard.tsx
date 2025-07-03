import { TeamTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Target } from 'lucide-react'
import { formatCompactDateTime } from '@/lib/utils'

interface TeamTaskCardProps {
  task: TeamTask & { memberName?: string; memberRole?: string }
  onToggleComplete: (taskId: string) => void
}

export function TeamTaskCard({ task, onToggleComplete }: TeamTaskCardProps) {
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
    <Card className={`relative min-w-[320px] max-w-[380px] h-fit ${task.completed ? 'opacity-60' : ''} ${config.cardBorder} ${config.cardBackground} border rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
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
      
      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          {task.description}
        </p>
        
        {/* Task reasoning */}
        {task.reason && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Target className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">{task.reason}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 