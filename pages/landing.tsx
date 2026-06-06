
import { Link } from "@/lib/next-compat";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "✦",
    title: "Distraction-free reading",
    desc: "Clean typography and zero clutter so you stay in the flow.",
  },
  {
    icon: "◈",
    title: "Curated voices",
    desc: "Hand-picked writers across technology, culture, science, and beyond.",
  },
  {
    icon: "⬡",
    title: "Deep discovery",
    desc: "Surface ideas you never knew you needed — no algorithmic noise.",
  },
];

const pills = [
  "Long-form essays",
  "Curated voices",
  "Distraction-free",
  "Deep thinking",
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle animated background orb that follows mouse */}
      <div
        ref={heroRef}
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background: mounted
            ? `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, color-mix(in srgb, var(--primary) 6%, transparent), transparent 70%)`
            : "none",
        }}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-8"
          style={{ animation: "fadeUp 600ms ease both" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Editorial Excellence
        </div>

        {/* Headline */}
        <h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.03em] leading-[1.02] text-foreground mb-6"
          style={{ animation: "fadeUp 700ms 100ms ease both" }}
        >
          Ideas worth
          <span className="block text-primary">reading.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto max-w-2xl text-xl md:text-2xl text-muted leading-relaxed mb-10"
          style={{
            fontFamily: "var(--font-newsreader)",
            animation: "fadeUp 700ms 200ms ease both",
          }}
        >
          A digital sanctuary for deep reading and focused writing. Discover
          stories, thinking, and expertise from writers on any topic.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
          style={{ animation: "fadeUp 700ms 300ms ease both" }}
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(26,137,23,0.55)]"
          >
            <span>Start Reading Free</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-surface hover:border-border-strong"
          >
            Sign In
          </Link>
        </div>

        {/* Pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-2"
          style={{ animation: "fadeUp 700ms 400ms ease both" }}
        >
          {pills.map(pill => (
            <span key={pill} className="zen-pill">
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* ── Feature cards ──────────────────────────────────── */}
      <section
        className="relative z-10 mx-auto max-w-5xl px-6 mb-24"
        style={{ animation: "fadeUp 700ms 500ms ease both" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-lg text-primary">
                {icon}
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA banner ──────────────────────────────── */}
      <section
        className="relative z-10 mx-auto max-w-3xl px-6 pb-24"
        style={{ animation: "fadeUp 700ms 600ms ease both" }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center">
          <div className="zen-hero-glow pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full opacity-50" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Join today
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Your next great read
            <br />
            is waiting.
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">
            Free to read. Free to write. No paywalls, no noise — just ideas.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(26,137,23,0.55)]"
          >
            Create your account →
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
