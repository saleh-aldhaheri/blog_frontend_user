
import AnimatedLoadingText from '@/components/animated-loading-text'

type FullPageLoaderProps = {
  label?: string
}

export default function FullPageLoader({
  label = 'Preparing your experience...',
}: FullPageLoaderProps) {
  const messages = [
    label,
    'Setting up your space...',
    'Almost there...',
  ]

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-border" />
          <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <p className="text-xl font-bold tracking-tight text-foreground">Zenith</p>
        <AnimatedLoadingText messages={messages} />
      </div>
    </div>
  )
}
