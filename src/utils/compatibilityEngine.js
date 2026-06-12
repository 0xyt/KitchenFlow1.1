import ingredients from '../data/ingredients.json'
import recipeRules from '../data/recipeRules.json'

const nameToId = {}
ingredients.forEach(ing => {
  const key = ing.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  nameToId[key] = ing.id
})

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function getCompatibleIngredientIds(ingredientId) {
  const ing = ingredients.find(i => i.id === ingredientId)
  if (!ing) return []

  const ingName = normalize(ing.nombre)
  const compatibleIds = new Set()

  recipeRules.forEach(rule => {
    const matches = rule.ingredientes.some(rIng => normalize(rIng) === ingName)
    if (matches) {
      rule.ingredientes.forEach(rIng => {
        const matchedId = nameToId[normalize(rIng)]
        if (matchedId && matchedId !== ingredientId) {
          compatibleIds.add(matchedId)
        }
      })
    }
  })

  return Array.from(compatibleIds)
}

export function getCompatibilityCount(ingredientId) {
  return getCompatibleIngredientIds(ingredientId).length
}

export function getCompatibleIngredientNames(ingredientId) {
  const ids = getCompatibleIngredientIds(ingredientId)
  return ids.map(id => {
    const ing = ingredients.find(i => i.id === id)
    return ing ? ing.nombre : id
  })
}

export function getIngredientPrice(ing) {
  const basePrices = {
    verdura: 0.80,
    carne: 3.50,
    pescado: 3.00,
    especia: 0.50,
    líquido: 1.20,
    carbohidrato: 1.00,
    fruta: 1.20,
    lácteo: 2.00,
    otro: 1.00,
  }
  if (ing.price) return ing.price
  return basePrices[ing.categoria] || 1.00
}

export function getTotalCompatibility(ingredientIds) {
  const all = new Set()
  ingredientIds.forEach(id => {
    getCompatibleIngredientIds(id).forEach(cid => all.add(cid))
  })
  return all.size
}

export function getCompatibilityLevel(count) {
  if (count >= 30) return { label: 'Muy alta', color: 'text-emerald-600' }
  if (count >= 20) return { label: 'Alta', color: 'text-emerald-500' }
  if (count >= 10) return { label: 'Media', color: 'text-[var(--accent)]' }
  return { label: 'Baja', color: 'text-[var(--muted)]' }
}
