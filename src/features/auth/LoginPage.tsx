import type { ReactNode } from 'react'
import { HeroArt } from '@/components/icons/HeroArt'
import { Eyebrow } from '@/components/layout'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

/** Layout de las pantallas públicas (login y registro). */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="hidden flex-col justify-center bg-brand p-[70px] text-[#f4f0df] md:flex">
        <Eyebrow className="text-[#c8d5b8]">Sabores de Barbarita · Surquillo</Eyebrow>
        <h1 className="my-[35px] font-serif text-[55px] leading-[1.2] font-normal tracking-normal">
          Tu cocina,
          <br />
          mejor organizada.
        </h1>
        <p className="leading-[1.8] text-[#c1d0bf]">
          Cada pedido en su lugar.
          <br />
          Cada ingrediente, justo a tiempo.
        </p>
        <HeroArt className="h-[120px] w-[200px] shrink-0" />
      </section>
      <section className="grid place-items-center p-[35px]">{children}</section>
    </div>
  )
}

export const LoginPage = () => (
  <AuthLayout>
    <LoginForm />
  </AuthLayout>
)

export const RegisterPage = () => (
  <AuthLayout>
    <RegisterForm />
  </AuthLayout>
)
