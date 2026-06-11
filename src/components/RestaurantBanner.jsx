import { useState } from 'react'
import { Button } from './ui/button'
import { seedDemoRestaurant } from '../lib/restaurantService'

export default function RestaurantBanner({ onFollowDemo, isFollowing }) {
  const [seeding, setSeeding] = useState(false)

  if (isFollowing) return null

  const handleClick = async () => {
    setSeeding(true)
    await seedDemoRestaurant().catch(() => {})
    onFollowDemo()
    setSeeding(false)
  }

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Button
        onClick={handleClick}
        disabled={seeding}
        className="bg-gradient-to-br from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-[12px]"
      >
        <span className="text-lg">🍕</span>
        <div className="text-left">
          <p className="text-xs font-bold">{seeding ? 'Preparando...' : 'Probar restaurante demo'}</p>
          <p className="text-[10px] opacity-80">Pizzería Don Pepe</p>
        </div>
      </Button>
    </div>
  )
}
