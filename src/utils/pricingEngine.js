import dishStyles from '../data/dishStyles.json'

const INGREDIENT_COST_MAP = {
  verdura: 0.40,
  carne: 1.20,
  pescado: 1.50,
  especia: 0.10,
  líquido: 0.15,
  carbohidrato: 0.30,
  fruta: 0.50,
  lácteo: 0.60,
  otro: 0.35,
}

export function calculatePrice(ingredients, styleId, customStyles = []) {
  const allStyles = [...dishStyles, ...customStyles]
  const style = allStyles.find(s => s.id === styleId)
  if (!style) return null

  const ingCost = ingredients.reduce((total, ing) => {
    const rate = INGREDIENT_COST_MAP[ing.categoria] || 0.30
    return total + rate
  }, 0)

  const basePrice = style.precioBase || 0
  const total = basePrice + ingCost

  return {
    styleName: style.nombre,
    styleEmoji: style.emoji,
    styleId: style.id,
    basePrice,
    ingredientCost: Math.round(ingCost * 100) / 100,
    total: Math.round(total * 100) / 100,
    tiempoEstimado: style.tiempoBase + ingredients.length * 1,
  }
}
