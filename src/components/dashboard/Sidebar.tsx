'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, Users, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Tasks',
    href: '/dashboard',
    icon: CheckSquare,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },

  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img 
              src="/ventry-logo.png" 
              alt="Ventry Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to icon if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 brand-gradient rounded-lg items-center justify-center hidden">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tight">Ventry</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col p-4 polka-background">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-xl p-3 text-sm font-medium smooth-transition relative',
                    isActive
                      ? 'bg-brand-accent-soft text-brand-primary shadow-sm accent-glow'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-accent rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 smooth-transition',
                      isActive ? 'text-brand-primary' : 'text-gray-400 group-hover:text-brand-primary'
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Bottom decorative element */}
        <div className="mt-auto pt-4">
          <div className="subtle-divider mb-4" />
        </div>
      </nav>
    </div>
  )
} 