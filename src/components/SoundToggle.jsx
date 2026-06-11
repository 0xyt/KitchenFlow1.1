import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '../lib/utils'

export default function SoundToggle({ muted, toggle }) {
  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2 rounded-[8px] transition-all',
        'hover:bg-primary/10 text-muted-foreground hover:text-primary',
        'focus:outline-none focus:ring-2 focus:ring-primary/50'
      )}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  )
}
