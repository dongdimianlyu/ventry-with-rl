'use client'

import { useState } from 'react'
import { Goal } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, Sparkles } from 'lucide-react'

interface AddGoalFormProps {
  onAddGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export function AddGoalForm({ onAddGoal }: AddGoalFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('quarter')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAddGoal({
      title: title.trim(),
      description: description.trim(),
      timeframe,
      priority
    })

    // Reset form
    setTitle('')
    setDescription('')
    setTimeframe('quarter')
    setPriority('medium')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Card 
        className="border-dashed border-2 border-gray-200 hover:border-brand-primary smooth-transition cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:from-brand-accent-muted hover:to-white" 
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex space-x-1">
                <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
                <div className="w-1 h-1 bg-brand-accent rounded-full opacity-60" />
                <div className="w-1 h-1 bg-brand-accent rounded-full opacity-40" />
              </div>
              <Plus className="h-8 w-8 text-brand-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Goal</h3>
            <p className="text-gray-600 accent-dot">Tell Ventry what you want to achieve</p>
          </div>
        </CardContent>
      </Card>
    )
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
          Tell us what you're trying to achieve, and we'll generate daily tasks to help you get there.
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition"
              placeholder="e.g., Grow revenue by 20% this quarter"
              required
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary smooth-transition resize-none"
              placeholder="Provide more context about this goal..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="timeframe" className="text-sm font-semibold text-gray-700">
                Timeframe
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
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
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
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
              <Sparkles className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
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