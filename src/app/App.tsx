import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui'
import { router } from './router'

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
