import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modal accesible basado en `<dialog>` nativo (foco atrapado y cierre con Esc). */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className="m-auto max-h-[90vh] w-[min(650px,94vw)] rounded-[17px] border border-line p-[27px] text-ink shadow-[0_30px_100px_#16372233] print:hidden"
    >
      {open && (
        <>
          <div className="flex items-center justify-between gap-[15px]">
            <h2 id="modal-title">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-[22px] leading-none hover:bg-canvas"
            >
              ×
            </button>
          </div>
          {children}
        </>
      )}
    </dialog>
  )
}
