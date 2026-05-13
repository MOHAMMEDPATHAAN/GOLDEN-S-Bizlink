'use client'

import { useState } from 'react'
import { Building2, Users, Briefcase, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void
}

const roles: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'company_owner',
    label: 'Company Owner',
    description: 'Full control over your company profile, products, and team',
    icon: <Building2 className="w-8 h-8" />,
  },
  {
    value: 'company_manager',
    label: 'Company Manager',
    description: 'Manage products, respond to inquiries, and handle operations',
    icon: <Briefcase className="w-8 h-8" />,
  },
  {
    value: 'salesman',
    label: 'Salesman',
    description: 'Browse products, connect with companies, and build networks',
    icon: <Users className="w-8 h-8" />,
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Explore products and companies without making connections',
    icon: <Eye className="w-8 h-8" />,
  },
]

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 border-b-4 border-foreground">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black">
            <span className="golden-text">GOLDEN&apos;S</span>{' '}
            <span className="text-foreground">BIZLINK</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Select Your Role
            </h2>
            <p className="text-muted-foreground">
              Choose how you want to use Bizlink
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid gap-4 mb-8">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={cn(
                  'w-full p-4 text-left transition-all',
                  'border-4 border-foreground',
                  'flex items-center gap-4',
                  selectedRole === role.value
                    ? 'bg-primary text-primary-foreground shadow-[6px_6px_0px_0px] shadow-foreground translate-x-[-3px] translate-y-[-3px]'
                    : 'bg-card text-card-foreground hover:bg-accent shadow-[4px_4px_0px_0px] shadow-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px]'
                )}
              >
                <div className={cn(
                  'p-3 border-4',
                  selectedRole === role.value
                    ? 'border-primary-foreground bg-primary-foreground/10'
                    : 'border-foreground bg-muted'
                )}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{role.label}</h3>
                  <p className={cn(
                    'text-sm',
                    selectedRole === role.value
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  )}>
                    {role.description}
                  </p>
                </div>
                <div className={cn(
                  'w-6 h-6 border-4 flex items-center justify-center',
                  selectedRole === role.value
                    ? 'border-primary-foreground bg-primary-foreground'
                    : 'border-foreground'
                )}>
                  {selectedRole === role.value && (
                    <div className="w-3 h-3 bg-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={cn(
              'brutalist-btn w-full text-center text-lg',
              !selectedRole && 'opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px]'
            )}
          >
            Continue
          </button>

          {/* Info Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            You can change your role later in settings
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t-4 border-foreground text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-bold golden-text">Golden techS</span>
        </p>
      </footer>
    </div>
  )
}
