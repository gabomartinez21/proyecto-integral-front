import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { ROUTES } from '@/app/navigation'
import { Brand } from '@/components/layout'
import { Button, FormError, Input } from '@/components/ui'
import { errorMessage } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'

interface LoginValues {
  username: string
  password: string
}

export function LoginForm() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<LoginValues>()

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setError(null)
    try {
      await login(username, password)
      navigate(ROUTES.dashboard, { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[340px]">
      <Brand />
      <h2>Bienvenido a tu cocina</h2>
      <p className="leading-relaxed text-muted">Ingresa para organizar tu día.</p>
      <label className="my-5 block">
        Usuario
        <Input
          className="mt-2"
          required
          autoComplete="username"
          autoFocus
          {...register('username')}
        />
      </label>
      <label className="my-5 block">
        Contraseña
        <Input
          className="mt-2"
          type="password"
          required
          autoComplete="current-password"
          {...register('password')}
        />
      </label>
      <Button type="submit" variant="primary" className="w-full" disabled={formState.isSubmitting}>
        Iniciar sesión →
      </Button>
      <FormError message={error} />
      <p className="mt-5 text-center text-[13px] text-muted">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.register} className="font-semibold text-brand underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
