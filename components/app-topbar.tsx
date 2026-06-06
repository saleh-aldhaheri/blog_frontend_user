
import { cn } from '@/lib/utils'

type AppTopbarProps = {
  left?: React.ReactNode
  right?: React.ReactNode
  fixed?: boolean
  className?: string
}

export default function AppTopbar({
  left,
  right,
  fixed = false,
  className,
}: AppTopbarProps) {
  return (
    <header className={cn('border-b border-border bg-surface', fixed && 'fixed top-0 z-50 w-full', className)}>
      <div className="flex w-full items-center justify-between px-3 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">{left}</div>
        <div className="flex items-center gap-2 md:gap-3">{right}</div>
      </div>
    </header>
  )
}
