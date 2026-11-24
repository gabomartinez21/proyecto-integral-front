import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { ROUTES } from '@/app/navigation'
import { Brand } from '@/components/layout'
import { Button, FormError, Input } from '@/components/ui'
import { errorMessage } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'

interface RegisterValues {
  fullName: string
  username: string
  password: string
  confirm: string
}

export function RegisterForm() {
  const registerUser = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<RegisterValues>()

  const onSubmit = handleSubmit(async ({ fullName, username, password, confirm }) => {
    setError(null)
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    try {
      await registerUser({ fullName, username, password })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[340px]">
      <Brand />
      <h2>Crea tu cuenta</h2>
      <p className="leading-relaxed text-muted">Regístrate para empezar a organizar tu cocina.</p>
      <label className="my-5 block">
        Nombre completo
        <Input
          className="mt-2"
          required
          maxLength={120}
          autoComplete="name"
          autoFocus
          {...register('fullName')}
        />
      </label>
      <label className="my-5 block">
        Usuario
        <Input
          className="mt-2"
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
          {...register('username')}
        />
      </label>
      <label className="my-5 block">
        Contraseña
        <Input
          className="mt-2"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          {...register('password')}
        />
      </label>
      <label className="my-5 block">
        Repetir contraseña
        <Input
          className="mt-2"
          type="password"
          required
          autoComplete="new-password"
          {...register('confirm')}
        />
      </label>
      <Button type="submit" variant="primary" className="w-full" disabled={formState.isSubmitting}>
        Crear cuenta →
      </Button>
      <FormError message={error} />
      <p className="mt-5 text-center text-[13px] text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.login} className="font-semibold text-brand underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
