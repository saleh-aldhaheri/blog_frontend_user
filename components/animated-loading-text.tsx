
import { useEffect, useState } from "react";

type AnimatedLoadingTextProps = {
  messages?: string[];
  intervalMs?: number;
};

const defaultMessages = [
  "Checking your session...",
  "Preparing your reading space...",
  "Just a quiet moment...",
];

export default function AnimatedLoadingText({
  messages = defaultMessages,
  intervalMs = 2200,
}: AnimatedLoadingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const tickTimer = window.setTimeout(
      () => setIndex(prev => (prev + 1) % messages.length),
      intervalMs,
    );
    return () => window.clearTimeout(tickTimer);
  }, [index, intervalMs, messages.length]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p
        key={messages[index]}
        className="animate-[zenFadeUp_500ms_ease] text-sm text-muted-foreground"
      >
        {messages[index]}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60 [animation-delay:180ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60 [animation-delay:360ms]" />
      </div>
    </div>
  );
}
