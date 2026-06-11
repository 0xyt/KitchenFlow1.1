import { useState, createContext, useContext, useCallback } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext({ value: '', onValueChange: () => {} })

function Tabs({ value: controlledValue, onValueChange, defaultValue, className, children, ...props }) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  const setValue = useCallback((val) => {
    if (!isControlled) setUncontrolledValue(val)
    onValueChange?.(val)
  }, [isControlled, onValueChange])

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children, ...props }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-[12px] bg-muted p-1', className)} {...props}>
      {children}
    </div>
  )
}

function TabsTrigger({ value, className, children, ...props }) {
  const { value: selected, onValueChange } = useContext(TabsContext)
  const isActive = selected === value

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-3 py-1.5 text-sm font-semibold transition-all',
        isActive
          ? 'bg-card text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, className, children, ...props }) {
  const { value: selected } = useContext(TabsContext)
  if (selected !== value) return null
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
