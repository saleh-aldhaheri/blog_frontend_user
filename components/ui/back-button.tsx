// src/components/ui/back-button.tsx

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/lib/next-compat";

function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back
    </button>
  );
}

export default BackButton;
