import ingredientsData from '../data/ingredients.json'

const STYLE_META = {
  sandwich: { emoji: '🥪', label: 'Sandwich', basePrice: 7.50 },
  wrap:     { emoji: '🌯', label: 'Wrap',     basePrice: 7.00 },
  bowl:     { emoji: '🥣', label: 'Bowl',     basePrice: 8.50 },
  salad:    { emoji: '🥗', label: 'Ensalada', basePrice: 6.50 },
  pizza:    { emoji: '🍕', label: 'Pizza',    basePrice: 10.00 },
  pasta:    { emoji: '🍝', label: 'Pasta',    basePrice: 9.00 },
}

function getIngredient(id) {
  return ingredientsData.find(i => i.id === id)
}

export function detectPossibleStyles(ingredientIds) {
  if (!ingredientIds || ingredientIds.length === 0) {
    return [{
      style: 'salad',
      emoji: STYLE_META.salad.emoji,
      label: STYLE_META.salad.label,
      score: 50,
      basePrice: STYLE_META.salad.basePrice,
      reason: 'Ingredientes no especificados',
    }]
  }

  const ings = ingredientIds.map(getIngredient).filter(Boolean)

  const categories = new Set(ings.map(i => i.categoria))
  const keywords = new Set(ings.flatMap(i => i.palabrasClave || []))
  const names = ings.map(i => i.nombre.toLowerCase())

  const hasProtein = categories.has('carne') || categories.has('pescado')
  const hasDairy = categories.has('lácteo')
  const hasVeggie = categories.has('verdura')
  const hasCarbs = categories.has('carbohidrato')
  const hasFruit = categories.has('fruta')

  const hasBread = names.some(n => n.includes('pan')) || keywords.has('pan')
  const hasGrain = names.some(n =>
    ['arroz', 'quinoa', 'cuscús', 'avena', 'garbanzo', 'lenteja', 'frijol'].some(g => n.includes(g))
  ) || keywords.has('grano')
  const hasPasta = names.some(n =>
    ['pasta', 'fideo', 'espagueti', 'tallarín'].some(p => n.includes(p))
  ) || keywords.has('pasta') || keywords.has('italiana')
  const hasTomato = names.some(n => n.includes('tomate'))
  const hasCheese = names.some(n => n.includes('queso')) || hasDairy

  const results = []

  // Sandwich: bread + protein
  if (hasBread || hasCarbs) {
    let score = 40
    const reasons = []
    if (hasProtein) { score += 35; reasons.push('proteína') }
    if (hasVeggie) { score += 15; reasons.push('vegetales') }
    if (hasDairy) { score += 10; reasons.push('lácteo') }
    results.push({
      style: 'sandwich',
      emoji: STYLE_META.sandwich.emoji,
      label: STYLE_META.sandwich.label,
      score: Math.min(score, 100),
      basePrice: STYLE_META.sandwich.basePrice,
      reason: reasons.length ? `Ideal con ${reasons.join(', ')}` : 'Base de pan disponible',
    })
  }

  // Wrap: similar to sandwich but slightly different
  if ((hasBread || hasCarbs) && hasVeggie) {
    let score = 35
    const reasons = ['base + vegetales']
    if (hasProtein) { score += 30; reasons.push('proteína') }
    if (keywords.has('salsa') || keywords.has('cremoso')) { score += 15 }
    results.push({
      style: 'wrap',
      emoji: STYLE_META.wrap.emoji,
      label: STYLE_META.wrap.label,
      score: Math.min(score, 95),
      basePrice: STYLE_META.wrap.basePrice,
      reason: `Wrap: ${reasons.join(', ')}`,
    })
  }

  // Bowl: grain-based
  if (hasGrain || hasCarbs) {
    let score = 30
    const reasons = []
    if (hasGrain) { score += 25; reasons.push('grano') }
    if (hasProtein) { score += 20; reasons.push('proteína') }
    if (hasVeggie) { score += 15; reasons.push('vegetales') }
    if (keywords.has('salsa')) { score += 10; reasons.push('salsa') }
    results.push({
      style: 'bowl',
      emoji: STYLE_META.bowl.emoji,
      label: STYLE_META.bowl.label,
      score: Math.min(score, 100),
      basePrice: STYLE_META.bowl.basePrice,
      reason: reasons.length ? `Bowl con ${reasons.join(', ')}` : 'Base de carbohidrato',
    })
  }

  // Pasta: pasta ingredients
  if (hasPasta) {
    let score = 50
    const reasons = ['pasta']
    if (hasProtein) { score += 20; reasons.push('proteína') }
    if (hasTomato || keywords.has('salsa')) { score += 15; reasons.push('salsa') }
    if (hasCheese) { score += 15; reasons.push('queso') }
    results.push({
      style: 'pasta',
      emoji: STYLE_META.pasta.emoji,
      label: STYLE_META.pasta.label,
      score: Math.min(score, 100),
      basePrice: STYLE_META.pasta.basePrice,
      reason: `Pasta con ${reasons.join(', ')}`,
    })
  }

  // Pizza: tomato + cheese
  if (hasTomato && hasCheese) {
    let score = 30
    const reasons = ['tomate + queso']
    if (hasCarbs && names.some(n => n.includes('harina') || n.includes('pan'))) { score += 25; reasons.push('masa') }
    if (hasProtein) { score += 20; reasons.push('proteína') }
    if (keywords.has('pizza') || keywords.has('italiana')) { score += 15 }
    results.push({
      style: 'pizza',
      emoji: STYLE_META.pizza.emoji,
      label: STYLE_META.pizza.label,
      score: Math.min(score, 90),
      basePrice: STYLE_META.pizza.basePrice,
      reason: `Pizza: ${reasons.join(', ')}`,
    })
  }

  // Salad: default / veggie-based
  {
    let score = 25
    const reasons = []
    if (hasVeggie) { score += 30; reasons.push('vegetales') }
    if (hasFruit) { score += 15; reasons.push('fruta') }
    if (hasProtein) { score += 15; reasons.push('proteína') }
    if (hasDairy) { score += 10; reasons.push('queso') }
    if (keywords.has('ensalada') || keywords.has('aliño')) { score += 15 }
    if (!hasProtein && !hasCarbs) { score += 20; reasons.push('ligero') }
    results.push({
      style: 'salad',
      emoji: STYLE_META.salad.emoji,
      label: STYLE_META.salad.label,
      score: Math.min(score, 95),
      basePrice: STYLE_META.salad.basePrice,
      reason: reasons.length ? `Ensalada: ${reasons.join(', ')}` : 'Opción ligera',
    })
  }

  results.sort((a, b) => b.score - a.score)

  return results
}
