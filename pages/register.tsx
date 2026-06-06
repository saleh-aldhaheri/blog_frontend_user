
import { Link } from "@/lib/next-compat";
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from "@/lib/next-compat"
import axios from 'axios'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/src/v1/api/auth.api'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [pending, setPending] = useState(false)

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== passwordConfirmation) {
      const mismatchMessage = 'Password confirmation does not match.'
      toast.error(mismatchMessage)
      return
    }

    setPending(true)

    try {
      await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      toast.success('Account created successfully. You can now sign in.')
      router.replace('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message
        toast.error(message)
      } else {
        toast.error('Something went wrong while creating your account.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-10 text-center">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Join the flow state.</h1>
        <p className="zen-muted mx-auto max-w-[320px] font-[var(--font-newsreader)] text-xl">
          Discover a refined space for editorial depth and intellectual clarity.
        </p>
      </header>

      <div className="relative flex items-center gap-4">
        <div className="zen-divider flex-grow" />
        <span className="zen-muted text-xs font-semibold uppercase tracking-[0.2em]">Email sign up</span>
        <div className="zen-divider flex-grow" />
      </div>

      <form className="space-y-6 text-left" onSubmit={handleRegister}>
        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="name">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
            placeholder="Your name"
          />
        </label>

        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
            placeholder="your@email.com"
          />
        </label>

        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>

        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="passwordConfirmation">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="passwordConfirmation"
              type={showPasswordConfirmation ? 'text' : 'password'}
              required
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              disabled={pending}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
            >
              {showPasswordConfirmation ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-primary text-primary-contrast hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <footer className="space-y-8 text-center">
        <p className="zen-muted text-sm">
          Already have an account?{' '}
          <Link className="font-bold text-primary hover:underline" href="/login">
            Sign In
          </Link>
        </p>
        <p className="text-xs leading-relaxed text-zinc-400">
          By clicking “Create Account”, you agree to Zenith&apos;s Terms of Service
          and acknowledge that Zenith&apos;s Privacy Policy applies to you.
        </p>
      </footer>
    </div>
  )
}
