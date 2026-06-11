import { Sun, Moon } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ThemeToggle({ isDark, toggle }) {
  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2 rounded-[8px] transition-all',
        'hover:bg-primary/10 text-muted-foreground hover:text-primary',
        'focus:outline-none focus:ring-2 focus:ring-primary/50'
      )}
      aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
