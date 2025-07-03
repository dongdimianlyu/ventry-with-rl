'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Trophy,
  AlertCircle,
  Lightbulb,
  Activity,
  Users,
  Timer
} from 'lucide-react'

interface AnalyticsData {
  completionRate: number
  priorityDistribution: Record<string, number>
  goalAlignment: Record<string, number>
  recommendations: string[]
  trends: {
    week: number[]
    month: number[]
  }
  insights: {
    productivity: string
    efficiency: string
    focus: string
  }
  teamMetrics?: {
    collaboration: number
    taskDistribution: Record<string, number>
    averageHours: number
  }
}

const mockAnalyticsData: AnalyticsData = {
  completionRate: 78,
  priorityDistribution: {
    high: 32,
    medium: 45,
    low: 23
  },
  goalAlignment: {
    'Q4 Revenue Target': 85,
    'Product Launch': 92,
    'Team Expansion': 67,
    'Market Research': 74
  },
  recommendations: [
    'Focus on high-priority tasks during peak energy hours (9-11 AM)',
    'Break down large goals into smaller, actionable tasks',
    'Allocate specific time blocks for strategic vs operational work',
    'Review and adjust goal timelines based on current progress velocity'
  ],
  trends: {
    week: [65, 72, 78, 85, 79, 82, 78],
    month: [68, 74, 76, 82, 78, 85, 79, 88, 84, 78, 82, 85]
  },
  insights: {
    productivity: 'Peak productivity occurs between 9-11 AM and 2-4 PM. Consider scheduling complex tasks during these windows.',
    efficiency: 'You complete 23% more tasks when they include specific success metrics and deadlines.',
    focus: 'Deep work sessions longer than 90 minutes show diminishing returns. Optimize for 60-90 minute focused blocks.'
  },
  teamMetrics: {
    collaboration: 84,
    taskDistribution: {
      'Marketing': 28,
      'Sales': 32,
      'Product': 25,
      'Operations': 15
    },
    averageHours: 6.5
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load data from localStorage to send to the API
        const savedTasks = localStorage.getItem('ventry-tasks');
        const savedGoals = localStorage.getItem('ventry-goals');
        const savedTeamTasks = localStorage.getItem('ventry-team-tasks');
        const userId = 'user-123'; // Using mock user ID as elsewhere

        if (!savedTasks || !savedGoals) {
          // If there's no data, we can't generate analytics.
          // We can either show an empty state or use the mock data as a fallback.
          throw new Error('No task or goal data available to generate analytics.');
        }

        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: JSON.parse(savedTasks),
            goals: JSON.parse(savedGoals),
            teamTasks: savedTeamTasks ? JSON.parse(savedTeamTasks) : [],
            userId
          })
        })

        if (!response.ok) {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.details || errorData.error || 'Failed to fetch analytics');
          } catch {
             console.error("Non-JSON error response:", errorText);
             throw new Error('Received an invalid response from the server.');
          }
        }

        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (err: unknown) {
        console.error('Analytics fetch error:', err)
        // Use mock data as fallback
        setAnalyticsData(mockAnalyticsData)
        setError('Using sample data - connect your analytics for real insights')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedTimeframe])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
          <p className="mt-1 text-sm text-gray-500">Start completing tasks to see your analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="mt-2 text-gray-600">Track your productivity and optimize your workflow</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('week')}
          >
            Week
          </Button>
          <Button
            variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.completionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Weekly Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                +{analyticsData.trends[selectedTimeframe].slice(-1)[0] - analyticsData.trends[selectedTimeframe].slice(-2)[0]}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Goal Alignment</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(Object.values(analyticsData.goalAlignment).reduce((a, b) => a + b, 0) / Object.values(analyticsData.goalAlignment).length)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.priorityDistribution.high}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            AI Insights
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Productivity Pattern</h4>
              <p className="text-sm text-gray-600 mt-1">{analyticsData.insights.productivity}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Efficiency</h4>
              <p className="text-sm text-gray-600 mt-1">{analyticsData.insights.efficiency}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Focus</h4>
              <p className="text-sm text-gray-600 mt-1">{analyticsData.insights.focus}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {analyticsData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                <p className="ml-3 text-sm text-gray-600">{rec}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Team Analytics (if available) */}
      {analyticsData.teamMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Collaboration
            </h3>
            <div className="text-3xl font-semibold text-gray-900 mb-2">
              {analyticsData.teamMetrics.collaboration}%
            </div>
            <p className="text-sm text-gray-600">Cross-functional task completion rate</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              Average Hours
            </h3>
            <div className="text-3xl font-semibold text-gray-900 mb-2">
              {analyticsData.teamMetrics.averageHours}h
            </div>
            <p className="text-sm text-gray-600">Daily focused work time per team member</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
            <div className="space-y-2">
              {Object.entries(analyticsData.teamMetrics.taskDistribution).map(([role, percentage]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{role}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 