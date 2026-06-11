import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { cn } from '../../lib/utils'

const DialogContext = createContext({ open: false, onOpenChange: () => {} })

function Dialog({ open: controlledOpen, onOpenChange, children, ...props }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = useCallback((val) => {
    if (!isControlled) setUncontrolledOpen(val)
    onOpenChange?.(val)
  }, [isControlled, onOpenChange])

  return (
    <DialogContext.Provider value={{ open, onOpenChange: setOpen }} {...props}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ asChild, children, ...props }) {
  const { onOpenChange } = useContext(DialogContext)
  return (
    <span onClick={() => onOpenChange(true)} {...props}>
      {children}
    </span>
  )
}

function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = useContext(DialogContext)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        ref={ref}
        className={cn(
          'relative z-50 w-full max-w-lg rounded-2xl border border-primary/20 bg-white dark:bg-gray-800 p-6 shadow-xl',
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-gray-800 dark:text-gray-100', className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <p className={cn('text-xs text-gray-500 dark:text-gray-400', className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('flex items-center justify-end gap-2 mt-4', className)} {...props} />
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
