import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20 active:scale-[0.97]',
        secondary: 'bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.97]',
        outline: 'border border-border bg-transparent text-foreground hover:bg-primary/5 hover:border-primary/40 active:scale-[0.97]',
        ghost: 'text-muted-foreground hover:bg-muted active:scale-[0.97]',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm shadow-danger/20 active:scale-[0.97]',
        amber: 'bg-amber text-amber-foreground hover:bg-amber/90 shadow-sm shadow-amber/20 active:scale-[0.97]',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs rounded-[8px]',
        default: 'px-4 py-2 rounded-[8px]',
        lg: 'px-6 py-3 text-base rounded-[12px]',
        icon: 'p-2 rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
