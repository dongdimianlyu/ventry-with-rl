'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, ZapOff, Settings } from 'lucide-react'
import { AutoModeSettings } from '@/types'

interface AutoModeToggleProps {
  onSettingsChange: (settings: AutoModeSettings) => void
  className?: string
}

export function AutoModeToggle({ onSettingsChange, className = '' }: AutoModeToggleProps) {
  const [settings, setSettings] = useState<AutoModeSettings>({
    enabled: false,
    maxTasksPerPerson: 3,
    prioritizeHighImpact: true,
    ensureDiversity: true
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoModeSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        onSettingsChange(parsed)
      } catch (error) {
        console.error('Error loading auto mode settings:', error)
      }
    }
  }, [onSettingsChange])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('autoModeSettings', JSON.stringify(settings))
    onSettingsChange(settings)
  }, [settings, onSettingsChange])

  const toggleAutoMode = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
  }

  const updateSetting = (key: keyof AutoModeSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Toggle */}
      <Button
        onClick={toggleAutoMode}
        variant={settings.enabled ? "default" : "outline"}
        size="sm"
        className={`relative transition-all duration-200 ${
          settings.enabled 
                    ? 'bg-gradient-to-r from-[#9B0E8D] to-blue-600 hover:from-[#9B0E8D]/90 hover:to-blue-700 text-white shadow-lg'
        : 'border-gray-300 hover:border-[#9B0E8D]/40 hover:bg-[#9B0E8D]/5'
        }`}
      >
        {settings.enabled ? (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Auto Mode ON
          </>
        ) : (
          <>
            <ZapOff className="h-4 w-4 mr-2" />
            Auto Mode OFF
          </>
        )}
      </Button>

      {/* Advanced Settings Toggle */}
      <Button
        onClick={() => setShowAdvanced(!showAdvanced)}
        variant="ghost"
        size="sm"
        className="text-gray-500 hover:text-gray-700"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
          <h4 className="font-semibold text-gray-900 mb-3">Auto Mode Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max tasks per person
              </label>
              <select
                value={settings.maxTasksPerPerson}
                onChange={(e) => updateSetting('maxTasksPerPerson', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9B0E8D] text-sm"
              >
                <option value={1}>1 task</option>
                <option value={2}>2 tasks</option>
                <option value={3}>3 tasks</option>
                <option value={4}>4 tasks</option>
                <option value={5}>5 tasks</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.prioritizeHighImpact}
                  onChange={(e) => updateSetting('prioritizeHighImpact', e.target.checked)}
                  className="rounded border-gray-300 text-[#9B0E8D] focus:ring-[#9B0E8D]"
                />
                <span className="ml-2 text-sm text-gray-700">Prioritize high-impact tasks</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.ensureDiversity}
                  onChange={(e) => updateSetting('ensureDiversity', e.target.checked)}
                  className="rounded border-gray-300 text-[#9B0E8D] focus:ring-[#9B0E8D]"
                />
                <span className="ml-2 text-sm text-gray-700">Ensure task diversity</span>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              When enabled, tasks will be automatically selected based on priority and your preferences.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 