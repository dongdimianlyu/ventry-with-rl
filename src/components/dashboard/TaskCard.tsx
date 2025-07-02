import { Task } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Clock, AlertCircle, Lightbulb } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
}

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const priorityConfig = {
    high: {
      colors: 'border-red-100 bg-gradient-to-br from-red-50 to-orange-50',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      badge: 'bg-red-100 text-red-700 border-red-200'
    },
    medium: {
      colors: 'border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      badge: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    low: {
      colors: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50',
      icon: <Circle className="h-4 w-4 text-emerald-500" />,
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  }

  const config = priorityConfig[task.priority]

  return (
    <Card className={`refined-card smooth-transition ${task.completed ? 'opacity-60' : ''} ${config.colors} border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {config.icon}
            <div className="flex-1">
              <CardTitle className={`text-lg font-semibold leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </CardTitle>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
                  {task.priority} priority
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(task.dueDate)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(task.id)}
            className="shrink-0 hover:bg-white/50 rounded-full p-2 smooth-transition"
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-brand-primary" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-brand-primary" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <CardDescription className="text-sm text-gray-600 leading-relaxed">
          {task.description}
        </CardDescription>
        
        <div className="subtle-divider" />
        
        {/* Task Explanation - the key feature */}
        <div className="bg-gradient-to-r from-brand-accent-muted to-transparent border border-brand-accent/20 rounded-xl p-4 relative overflow-hidden">
          {/* Decorative dots */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
            <div className="w-1 h-1 bg-brand-accent rounded-full opacity-60" />
            <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-primary mb-2 accent-dot">Why this matters</p>
              <p className="text-sm text-gray-700 leading-relaxed">{task.explanation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 