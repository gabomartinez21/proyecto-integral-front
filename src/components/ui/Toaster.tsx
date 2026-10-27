import { useEffect } from 'react'
import { useToastStore } from '@/stores/toast.store'

const DURATION_MS = 4000

export function Toaster() {
  const { message, key, dismiss } = useToastStore()

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(dismiss, DURATION_MS)
    return () => clearTimeout(timer)
  }, [message, key, dismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-[26px] bottom-[26px] z-20 max-w-[90vw] rounded-[10px] bg-brand px-[22px] py-[15px] text-white shadow-[0_5px_25px_#15312233] empty:hidden print:hidden"
    >
      {message}
    </div>
  )
}
