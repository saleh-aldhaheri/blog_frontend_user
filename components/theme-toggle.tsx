
import { useSyncExternalStore } from 'react'
import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const themes = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Laptop },
] as const

type ThemeToggleProps = {
  compact?: boolean
  className?: string
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <div className={cn('flex items-center gap-1 rounded-full border border-border bg-surface p-1', className)}>
      {themes.map((item) => {
        const Icon = item.icon
        const active = isClient && theme === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setTheme(item.key)}
            aria-label={`Set ${item.label.toLowerCase()} mode`}
            className={[
              'inline-flex items-center rounded-full text-xs font-medium transition-colors',
              compact ? 'h-7 w-7 justify-center px-0' : 'gap-1.5 px-2.5 py-1',
              active ? 'bg-primary text-primary-contrast' : 'text-muted-foreground hover:bg-muted',
            ].join(' ')}
          >
            <Icon className="size-3.5" />
            {!compact ? item.label : null}
          </button>
        )
      })}
    </div>
  )
}
