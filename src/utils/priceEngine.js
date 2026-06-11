import plateStyles from '../data/plateStyles.json'
import dishStyles from '../data/dishStyles.json'

const MARKUP = 1.5

const CATEGORY_COST = {
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

function getDifficultyExtra(count) {
  if (count <= 3) return 0
  if (count <= 5) return 1.00
  return 2.00
}

function getTimeExtra(totalTime) {
  if (totalTime > 20) return 1.50
  if (totalTime > 10) return 0.50
  return 0
}

export function calculateFinalPrice(ingredients, styleId, customStyles = []) {
  const allStyles = [...plateStyles, ...dishStyles, ...customStyles]
  const style = allStyles.find(s => s.id === styleId)
  if (!style) return null

  const ingCost = ingredients.reduce((sum, ing) => {
    const rate = CATEGORY_COST[ing.categoria] || 0.30
    return sum + rate
  }, 0)

  const ingCostWithMarkup = ingCost * MARKUP
  const basePrice = style.precioBase || 0
  const difficultyExtra = getDifficultyExtra(ingredients.length)
  const totalTime = style.tiempoBase + ingredients.length * 2
  const timeExtra = getTimeExtra(totalTime)
  const total = basePrice + ingCostWithMarkup + difficultyExtra + timeExtra

  return {
    styleName: style.nombre,
    styleEmoji: style.emoji,
    styleId: style.id,
    basePrice,
    ingredientCost: Math.round(ingCost * 100) / 100,
    ingredientCostWithMarkup: Math.round(ingCostWithMarkup * 100) / 100,
    difficultyExtra,
    timeExtra,
    totalTime,
    total: Math.round(total * 100) / 100,
    breakdown: `$${basePrice.toFixed(2)} (estilo) + $${ingCostWithMarkup.toFixed(2)} (ingredientes×${MARKUP}) + $${difficultyExtra.toFixed(2)} (dificultad) + $${timeExtra.toFixed(2)} (tiempo) = $${Math.round(total * 100) / 100}`,
  }
}
