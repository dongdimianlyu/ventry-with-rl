import { TeamTask } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Clock, AlertCircle, Target, User } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TeamTaskCardProps {
  task: TeamTask & { memberName?: string; memberRole?: string }
  onToggleComplete: (taskId: string) => void
}

export function TeamTaskCard({ task, onToggleComplete }: TeamTaskCardProps) {
  const priorityConfig = {
    high: {
      colors: 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50',
      dot: 'bg-red-500',
      badge: 'bg-red-100 text-red-700 border-red-200'
    },
    medium: {
      colors: 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50',
      dot: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    low: {
      colors: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50',
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  }

  const config = priorityConfig[task.priority]

  return (
    <Card className={`relative min-w-[320px] max-w-[380px] h-fit ${task.completed ? 'opacity-60' : ''} ${config.colors} border hover:shadow-md transition-all duration-200`}>
      {/* Priority indicator dot */}
      <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${config.dot}`} />
      
      <CardHeader className="pb-3 pl-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-sm font-semibold leading-tight mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </CardTitle>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
                {task.priority}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleComplete(task.id)}
                className="shrink-0 hover:bg-white/50 rounded-full p-1.5 h-auto"
              >
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 hover:text-emerald-500" />
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
        
        {/* Due date */}
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          Due {formatTime(task.dueDate)}
        </div>
        
        {/* Task reasoning */}
        {task.reason && (
          <div className="bg-white/60 border border-white/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Target className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">{task.reason}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 