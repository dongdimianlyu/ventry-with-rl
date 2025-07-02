'use client'

import { Target, TrendingUp, Users, CheckCircle2, Clock, BarChart3, Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 polka-background">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm mr-4">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Analytics</h1>
              <p className="text-sm text-gray-600">Track your team's productivity and performance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Card */}
        <Card className="refined-card bg-gradient-to-br from-white to-purple-50 border-purple-100 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
                  <div className="w-1 h-1 bg-brand-accent rounded-full opacity-60" />
                  <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
                </div>
                <BarChart3 className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                Track your team's productivity, goal completion rates, and performance metrics with detailed insights and beautiful visualizations.
              </p>
              <div className="inline-flex items-center space-x-2 text-sm text-purple-600 bg-purple-100 px-4 py-2 rounded-full border border-purple-200">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Feature in development</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Productivity Metrics */}
          <Card className="refined-card bg-gradient-to-br from-white to-blue-50 border-blue-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Productivity Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Task Completion Rate</span>
                  <span className="font-bold text-brand-primary">--</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-0"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly Goals Met</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card className="refined-card bg-gradient-to-br from-white to-emerald-50 border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Team Members</span>
                  <span className="font-bold text-brand-primary">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top Performer</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collaboration Score</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="subtle-divider" />
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500">Team insights coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Tracking */}
          <Card className="refined-card bg-gradient-to-br from-white to-amber-50 border-amber-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Goal Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Goals Completed</span>
                  <span className="font-bold text-brand-primary">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-900">--%</span>
                </div>
                <div className="subtle-divider" />
                <div className="flex items-center justify-center space-x-2 py-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-500">Goal insights coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Features */}
        <Card className="refined-card bg-gradient-to-br from-white to-gray-50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Coming Soon Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 accent-dot">Performance Insights</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Individual productivity trends</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Team collaboration metrics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Goal completion forecasting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Time tracking and efficiency</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 accent-dot">Advanced Reports</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Weekly and monthly summaries</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Custom dashboard widgets</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Export and sharing options</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-brand-accent rounded-full" />
                    <span>Automated insights and recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 