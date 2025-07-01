import { Task } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
}

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  }

  const priorityIcons = {
    high: <AlertCircle className="h-4 w-4 text-red-600" />,
    medium: <Clock className="h-4 w-4 text-yellow-600" />,
    low: <Circle className="h-4 w-4 text-green-600" />
  }

  return (
    <Card className={`transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''} ${priorityColors[task.priority]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {priorityIcons[task.priority]}
            <CardTitle className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(task.id)}
            className="shrink-0"
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="capitalize">{task.priority} priority</span>
          <span>Due: {formatTime(task.dueDate)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-3">
          {task.description}
        </CardDescription>
        
        {/* Task Explanation - the key feature */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Why this matters:</p>
              <p className="text-sm text-blue-800">{task.explanation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 