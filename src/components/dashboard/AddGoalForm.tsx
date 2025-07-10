'use client'

import { useState } from 'react'
import { Goal } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Building2 } from 'lucide-react'

interface AddGoalFormProps {
  onSubmit: (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function AddGoalForm({ onSubmit, onCancel }: AddGoalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeframe: 'month' as Goal['timeframe'],
    priority: 'medium' as Goal['priority']
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        timeframe: formData.timeframe,
        priority: formData.priority
      })
    }
  }

  return (
    <Card className="refined-card bg-gradient-to-br from-white to-blue-50 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <Target className="h-4 w-4 text-white" />
          </div>
          Add New Goal
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Tell us what you&apos;re trying to achieve, and we&apos;ll generate daily tasks to help you get there.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Goal Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition ${
                errors.title ? 'border-red-300' : ''
              }`}
              placeholder="e.g., Grow revenue by 20% this quarter"
              required
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition resize-none ${
                errors.description ? 'border-red-300' : ''
              }`}
              placeholder="Provide more context about this goal..."
              rows={3}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="timeframe" className="text-sm font-semibold text-gray-700">
                Timeframe
              </label>
              <select
                id="timeframe"
                value={formData.timeframe}
                onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Goal['timeframe'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="subtle-divider" />

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="brand-gradient text-white hover:opacity-90 smooth-transition shadow-sm accent-glow"
            >
                          <Building2 className="h-4 w-4 mr-2" />
            Add Goal
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 