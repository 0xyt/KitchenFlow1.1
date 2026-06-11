import ingredients from '../data/ingredients.json'

function lookup(id) {
  return ingredients.find(i => i.id === id)
}

function nombre(id) {
  return lookup(id)?.nombre?.toLowerCase() || id
}

const ingredientGroups = {
  tomate:    ['fresco', 'salsa_base', 'jugoso', 'rojo'],
  cebolla:   ['aromatico', 'salsa_base', 'crujiente', 'bulbo'],
  ajo:       ['aromatico', 'intenso', 'salsa_base', 'bulbo'],
  zanahoria: ['raiz', 'dulce', 'crujiente', 'colorido'],
  lechuga:   ['fresco', 'hoja', 'crujiente', 'ligero'],
  espinaca:  ['fresco', 'hoja', 'hierro', 'vapor'],
  papa:      ['raiz', 'cremoso', 'neutro', 'base'],
  champiñón: ['umami', 'tierra', 'cremoso', 'salteado'],
  pimiento:  ['fresco', 'dulce', 'asado', 'color'],
  berenjena: ['asada', 'cremosa', 'parrilla', 'esponjosa'],
  calabacín: ['ligero', 'parrilla', 'crujiente', 'fresco'],
  brócoli:   ['vapor', 'fibra', 'nutritivo', 'crujiente'],
  coliflor:  ['vapor', 'asada', 'ligero', 'neutro'],
  espárrago: ['parrilla', 'fino', 'crujiente', 'vapor'],
  apio:      ['crujiente', 'base', 'caldo', 'fibroso'],
  puerro:    ['suave', 'base', 'crema', 'bulbo'],
  calabaza:  ['dulce', 'crema', 'asada', 'puré'],
  remolacha: ['raiz', 'dulce', 'color', 'asada'],
  maíz:      ['dulce', 'grano', 'hervido', 'parrilla'],
  alcachofa: ['hervida', 'asada', 'fondo', 'hojas'],
  pollo:     ['proteina_magra', 'cocido', 'versatil', 'ave'],
  res:       ['proteina_roja', 'parrilla', 'jugoso', 'intenso'],
  cerdo:     ['proteina', 'jugoso', 'versatil', 'graso'],
  cordero:   ['proteina_roja', 'intenso', 'guiso', 'graso'],
  pavo:      ['proteina_magra', 'horneado', 'jugoso', 'ave'],
  hígado:    ['proteina', 'intenso', 'hierro', 'paté'],
  chorizo:   ['graso', 'ahumado', 'picante', 'intenso'],
  huevo:     ['proteina', 'ligero', 'versatil', 'ligadura'],
  salmón:    ['pescado_graso', 'parrilla', 'omega3', 'jugoso'],
  atún:      ['pescado', 'parrilla', 'firme', 'versatil'],
  merluza:   ['pescado_blanco', 'suave', 'hervida', 'rebozada'],
  bacalao:   ['pescado_blanco', 'salado', 'firme', 'guiso'],
  queso:     ['lacteo', 'cremoso', 'graso', 'maduro'],
  arroz:     ['grano', 'neutro', 'absorbente', 'base'],
  frijol:    ['legumbre', 'cremoso', 'sabroso', 'fibra'],
  lenteja:   ['legumbre', 'guiso', 'fibra', 'tierra'],
  garbanzo:  ['legumbre', 'cremoso', 'guiso', 'neutro'],
  pan:       ['grano', 'base', 'crujiente', 'masa'],
  pasta:     ['grano', 'neutro', 'absorbente', 'base'],
  avena:     ['grano', 'cremosa', 'fibra', 'dulce'],
  limón:     ['ácido', 'fresco', 'zumo', 'aromático'],
  aguacate:  ['graso', 'cremoso', 'fresco', 'neutro'],
  manzana:   ['dulce', 'cruda', 'postre', 'ácida'],
  plátano:   ['dulce', 'cremoso', 'energía', 'postre'],
}

function getIngredientGroups(id) {
  const key = nombre(id)
  return ingredientGroups[key] || []
}

function getCategory(id) {
  const ing = lookup(id)
  if (!ing) return null
  const catMap = {
    verdura: 'vegetable',
    carne: 'protein',
    pescado: 'fish',
    especia: 'spice',
    líquido: 'liquid',
    carbohidrato: 'grain',
    fruta: 'fruit',
    lácteo: 'dairy',
    otro: 'other',
  }
  return catMap[ing.categoria] || null
}

function getIngredientName(id) {
  return lookup(id)?.nombre || id
}

function getIngredientEmoji(id) {
  return lookup(id)?.emoji || '🥘'
}

const starRecipes = {
  'ajo+tomate': {
    name: 'Pan con tomate y ajo',
    emoji: '🥖',
    description: 'Clásico mediterráneo: pan frotado con ajo y tomate.',
    instructions: 'Tuesta el pan, frótalo con medio diente de ajo y medio tomate, añade aceite y sal.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: la combinación clásica de ajo y tomate.',
  },
  'cebolla+tomate': {
    name: 'Ensalada básica',
    emoji: '🥗',
    description: 'Ensalada fresca de tomate y cebolla.',
    instructions: 'Lava y corta el tomate y la cebolla en rodajas, mezcla y aliña con aceite de oliva y sal.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: la combinación clásica de tomate y cebolla.',
  },
  'cebolla+pollo+zanahoria': {
    name: 'Pollo guisado',
    emoji: '🍗',
    description: 'Pollo guisado con cebolla y zanahoria.',
    instructions: 'Sofríe la cebolla y la zanahoria picadas, añade el pollo en trozos y cocina a fuego lento hasta que esté tierno.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: pollo con verduras de cocción lenta.',
  },
  'queso+tomate': {
    name: 'Ensalada caprese',
    emoji: '🧀',
    description: 'Tomate con queso, un clásico italiano.',
    instructions: 'Corta el tomate y el queso en rodajas, alterna en un plato y añade un toque de aceite de oliva.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: tomate y queso, la base de una caprese.',
  },
  'arroz+frijol': {
    name: 'Gallo pinto',
    emoji: '🍛',
    description: 'Arroz con frijoles, el clásico centroamericano.',
    instructions: 'Mezcla arroz cocido con frijoles refritos o cocidos, saltea con cebolla y culantro.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: arroz y frijol, un dúo infalible.',
  },
  'huevo+queso': {
    name: 'Revuelto de queso',
    emoji: '🍳',
    description: 'Huevos revueltos con queso derretido.',
    instructions: 'Bate los huevos, añade queso rallado y cocina a fuego lento hasta que el queso se derrita.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: huevo y queso, cremosidad asegurada.',
  },
  'huevo+arroz': {
    name: 'Arroz frito con huevo',
    emoji: '🍚',
    description: 'Arroz salteado con huevo revuelto.',
    instructions: 'Sofríe arroz cocido en un sartén caliente, añade huevo batido y revuelve hasta integrar.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: arroz con huevo, un clásico de aprovechamiento.',
  },
  'pollo+arroz': {
    name: 'Arroz con pollo',
    emoji: '🍚',
    description: 'Arroz cocido con pollo y verduras.',
    instructions: 'Sofríe el pollo, añade arroz y caldo, cocina hasta que el arroz esté listo.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: pollo y arroz, el matrimonio perfecto.',
  },
  'lechuga+tomate': {
    name: 'Ensalada verde',
    emoji: '🥗',
    description: 'Ensalada fresca de lechuga y tomate.',
    instructions: 'Lava y corta la lechuga y el tomate, aliña al gusto.',
    explanation: 'Coincidencia exacta con nuestra receta estrella: lechuga y tomate, la base de toda ensalada.',
  },
}

const semanticRecipes = [
  {
    id: 'ensalada_hojas',
    signature: ['fresco', 'hoja', 'crujiente'],
    minSimilarity: 0.45,
    name: 'Ensalada de hojas frescas',
    emoji: '🥗',
    description: 'Ensalada ligera con base de hojas verdes y vegetales crujientes.',
    instructions: 'Lava bien los ingredientes, corta en trozos pequeños y aliña con aceite, vinagre y sal.',
    explanationTemplate: (items) => {
      const names = items.map(i => i.nombre).join(' y ')
      return `Detecté ingredientes frescos y crujientes (${names}), perfil típico de una ensalada de hojas.`
    },
  },
  {
    id: 'salsa_fresca',
    signature: ['salsa_base', 'fresco', 'jugoso'],
    minSimilarity: 0.4,
    name: 'Salsa fresca',
    emoji: '🌮',
    description: 'Salsa fresca sin cocción, ideal para acompañar carnes o botanas.',
    instructions: 'Pica finamente todos los ingredientes, mezcla con sal y limón al gusto. Deja reposar 10 minutos.',
    explanationTemplate: (items) => {
      const names = items.map(i => i.nombre).join(' + ')
      return `Detecté una base de ingredientes jugosos ideales para salsa fresca (${names}), típico de un pico de gallo o salsa mexicana.`
    },
  },
  {
    id: 'salteado_rapido',
    signature: ['versatil', 'aromatico', 'crujiente'],
    minSimilarity: 0.35,
    name: 'Salteado rápido',
    emoji: '🥘',
    description: 'Salteado de vegetales y proteína en wok, cocción rápida y sabrosa.',
    instructions: 'Corta todo en trozos pequeños. Calienta aceite en un wok o sartén grande, saltea los aromáticos primero, luego el resto a fuego alto.',
    explanationTemplate: (items) => {
      const proteinNames = ['pollo', 'res', 'cerdo', 'huevo']
      const hasProtein = items.some(i => proteinNames.includes(nombre(i.id)))
      return hasProtein
        ? `Detecté una base de aromáticos con proteína, método típico de un salteado wok.`
        : `Detecté vegetales con aromáticos, perfil de un salteado rápido de verduras.`
    },
  },
  {
    id: 'guiso_lento',
    signature: ['bulbo', 'raiz', 'proteina_magra', 'aromatico'],
    minSimilarity: 0.3,
    name: 'Guiso casero',
    emoji: '🍲',
    description: 'Guiso cocido a fuego lento con proteína, raíces y aromáticos.',
    instructions: 'Sofríe la cebolla y el ajo, añade la proteína dorada y las raíces en cubos. Cubre con caldo y cocina a fuego bajo 30-40 minutos.',
    explanationTemplate: (items) => {
      return `Detecté una base de bulbo y raíces con proteína, perfil clásico de un guiso de cocción lenta.`
    },
  },
  {
    id: 'plato_grano_proteina',
    signature: ['grano', 'proteina_magra', 'versatil'],
    minSimilarity: 0.35,
    name: 'Base de grano con proteína',
    emoji: '🍚',
    description: 'Plato completo con granos y proteína, nutritivo y equilibrado.',
    instructions: 'Cocina el grano según las instrucciones. Cocina la proteína por separado y sirve sobre la cama de grano.',
    explanationTemplate: (items) => {
      const grain = items.find(i => getCategory(i.id) === 'grain')
      const proteinNames = ['pollo', 'res', 'cerdo', 'huevo']
      const protein = items.find(i => proteinNames.includes(nombre(i.id)))
      return `Detecté la combinación de ${grain?.nombre || 'grano'} con ${protein?.nombre || 'proteína'}, perfil de un plato fuerte equilibrado.`
    },
  },
  {
    id: 'crema_suave',
    signature: ['lacteo', 'cremoso', 'cocido'],
    minSimilarity: 0.35,
    name: 'Crema suave',
    emoji: '🥣',
    description: 'Crema espesa y suave, ideal como entrada o plato ligero.',
    instructions: 'Cocina los ingredientes principales, licúa con el lácteo hasta obtener una textura cremosa. Salpimienta al gusto.',
    explanationTemplate: (items) => {
      return `Detecté ingredientes con perfil cremoso combinados con un lácteo, base perfecta para una crema o puré suave.`
    },
  },
  {
    id: 'plato_ligero',
    signature: ['ligero', 'fresco', 'proteina', 'versatil'],
    minSimilarity: 0.3,
    name: 'Plato ligero de proteína',
    emoji: '🥗',
    description: 'Combinación ligera de proteína con vegetales frescos, baja en grasas.',
    instructions: 'Cocina la proteína a la plancha o hervida. Sirve con los vegetales frescos cortados y aliña ligeramente.',
    explanationTemplate: (items) => {
      return `Detecté proteína ligera con vegetales frescos, perfil de un plato bajo en calorías pero nutritivo.`
    },
  },
  {
    id: 'aromatic_base',
    signature: ['aromatico', 'salsa_base', 'bulbo'],
    minSimilarity: 0.4,
    name: 'Sofrito base',
    emoji: '🍳',
    description: 'Sofrito tradicional, base para innumerables recetas.',
    instructions: 'Pica finamente los ingredientes y sofríe en aceite de oliva a fuego medio hasta que estén transparentes y fragantes.',
    explanationTemplate: () => {
      return `Detecté una combinación de aromáticos y salsa base, perfil del clásico sofrito que sirve como base para guisos, sopas y arroces.`
    },
  },
  {
    id: 'legumbre_cremosa',
    signature: ['legumbre', 'cremoso', 'bulbo', 'aromatico'],
    minSimilarity: 0.35,
    name: 'Legumbre guisada',
    emoji: '🫘',
    description: 'Legumbres cocidas a fuego lento con aromáticos.',
    instructions: 'Si usas legumbres secas, remójalas 8 horas. Sofríe los aromáticos, añade las legumbres y cubre con agua. Cocina hasta que estén tiernas.',
    explanationTemplate: (items) => {
      return `Detecté legumbre con aromáticos, perfil clásico de un guiso de frijoles o legumbres.`
    },
  },
  {
    id: 'tortilla',
    signature: ['proteina', 'versatil', 'crujiente', 'ligadura'],
    minSimilarity: 0.35,
    name: 'Tortilla de verduras',
    emoji: '🍳',
    description: 'Tortilla esponjosa con vegetales, perfecta para cualquier comida.',
    instructions: 'Bate los huevos, mezcla con los vegetales picados y cocina en sartén con aceite caliente hasta que esté dorada por ambos lados.',
    explanationTemplate: (items) => {
      return `Detecté huevo (ingrediente de ligadura) combinado con vegetales, perfil perfecto para una tortilla.`
    },
  },
]

const categoryRules = [
  {
    match: (categories) => {
      const vegCount = categories.filter(c => c === 'vegetable').length
      return vegCount >= 2 && !categories.includes('protein')
    },
    generate: (items) => ({
      name: 'Ensalada mixta',
      emoji: '🥗',
      description: 'Ensalada variada elaborada con verduras frescas.',
      instructions: 'Lava y corta todas las verduras en trozos, mezcla en un bowl y aliña con aceite de oliva, vinagre y sal al gusto.',
      explanation: `Detecté ${items.length} verduras sin proteína animal, típico de una ensalada o plato vegetariano.`,
    }),
  },
  {
    match: (categories) => {
      const vegCount = categories.filter(c => c === 'vegetable').length
      return vegCount >= 1 && categories.includes('protein')
    },
    generate: (items) => {
      const protein = items.find(i => getCategory(i.id) === 'protein')
      const vegs = items.filter(i => getCategory(i.id) === 'vegetable').map(i => i.nombre)
      return {
        name: `${protein?.nombre || 'Proteína'} salteado con verduras`,
        emoji: '🥘',
        description: 'Salteado de proteína con verduras frescas.',
        instructions: 'Corta la proteína y las verduras en trozos. Saltea en un wok con aceite caliente, primero la proteína y luego las verduras. Sazona al gusto.',
        explanation: `Detecté una base de ${vegs.join(' y ')} con ${protein?.nombre || 'proteína'}, perfil de un salteado o platillo principal.`,
      }
    },
  },
  {
    match: (categories) => {
      const hasProtein = categories.includes('protein')
      const hasGrain = categories.includes('grain')
      return hasProtein && hasGrain
    },
    generate: (items) => {
      const protein = items.find(i => getCategory(i.id) === 'protein')
      const grain = items.find(i => getCategory(i.id) === 'grain')
      return {
        name: `${protein?.nombre || 'Proteína'} con ${grain?.nombre || 'grano'}`,
        emoji: '🍚',
        description: 'Plato fuerte con proteína y carbohidrato, equilibrado y completo.',
        instructions: `Cocina el ${grain?.nombre || 'grano'} según instrucciones. Cocina ${protein?.nombre || 'la proteína'} y sirve sobre el grano. Acompaña con vegetales.`,
        explanation: `Detecté proteína (${protein?.nombre}) + carbohidrato (${grain?.nombre}), composición de un plato fuerte completo y equilibrado.`,
      }
    },
  },
  {
    match: (categories) => {
      const hasDairy = categories.includes('dairy')
      const hasVeg = categories.some(c => c === 'vegetable' || c === 'fruit')
      return hasDairy && hasVeg
    },
    generate: (items) => ({
      name: 'Combinación cremosa',
      emoji: '🧀',
      description: 'Vegetales frescos con un toque lácteo cremoso.',
      instructions: 'Prepara los vegetales, frescos o cocidos, y combínalos con el lácteo. Puedes gratinar en el horno si lo deseas.',
      explanation: 'Detecté vegetales con un lácteo, perfil de una combinación cremosa o gratinado ligero.',
    }),
  },
]

function jaccardSimilarity(groupsA, groupsB) {
  const setA = new Set(groupsA)
  const setB = new Set(groupsB)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

function findSemanticMatch(inputGroups) {
  let bestMatch = null
  let bestScore = 0

  for (const recipe of semanticRecipes) {
    const score = jaccardSimilarity(inputGroups, recipe.signature)
    if (score >= recipe.minSimilarity && score > bestScore) {
      bestScore = score
      bestMatch = recipe
    }
  }

  return bestMatch
}

function findCategoryMatch(ingredientItems) {
  const categories = ingredientItems.map(i => getCategory(i.id)).filter(Boolean)

  const sortedMatches = categoryRules
    .map(rule => ({ score: rule.match(categories) ? 1 : 0, rule }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)

  if (sortedMatches.length > 0) {
    return sortedMatches[0].rule.generate(ingredientItems)
  }

  return null
}

export function evaluateCombination(ingredientIds, customRecipes = [], customIngredients = []) {
  if (!ingredientIds || ingredientIds.length < 2) return null

  const sortedIds = [...ingredientIds].sort()
  const nombreKey = sortedIds.map(id => nombre(id)).sort().join('+')

  const allIngredients = [...ingredients, ...customIngredients]

  const matchedIngredients = sortedIds
    .map(id => {
      const ing = allIngredients.find(i => i.id === id)
      return ing ? { ...ing, ingredientId: id } : null
    })
    .filter(Boolean)

  const inputGroups = matchedIngredients.flatMap(i => getIngredientGroups(i.id))

  if (starRecipes[nombreKey]) {
    return {
      ...starRecipes[nombreKey],
      ingredients: matchedIngredients,
      matchType: 'estrella',
    }
  }

  if (customRecipes.length > 0) {
    const customKey = sortedIds.join('+')
    const customMatch = customRecipes.find(r => {
      const recipeKey = [...r.ingredientIds].sort().join('+')
      return recipeKey === customKey
    })
    if (customMatch) {
      return {
        name: customMatch.name,
        emoji: customMatch.emoji,
        description: customMatch.description,
        instructions: customMatch.instructions,
        explanation: `🍽️ Receta exclusiva del restaurante: "${customMatch.name}" combina exactamente estos ingredientes.`,
        ingredients: matchedIngredients,
        modifiers: customMatch.modifiers || [],
        price: customMatch.price,
        styleId: customMatch.styleId || null,
        matchType: 'restaurante',
        restaurantName: customMatch.restaurantName,
      }
    }
  }

  const semanticMatch = findSemanticMatch(inputGroups)
  if (semanticMatch) {
    return {
      name: semanticMatch.name,
      emoji: semanticMatch.emoji,
      description: semanticMatch.description,
      instructions: semanticMatch.instructions,
      explanation: semanticMatch.explanationTemplate(matchedIngredients),
      ingredients: matchedIngredients,
      matchType: 'semantica',
    }
  }

  const categoryMatch = findCategoryMatch(matchedIngredients)
  if (categoryMatch) {
    return {
      ...categoryMatch,
      ingredients: matchedIngredients,
      matchType: 'categoria',
    }
  }

  return {
    name: 'Combinación libre: ¡nombra tu creación!',
    emoji: '✨',
    description: 'No reconocí esta combinación en mi base de recetas. ¡Puedes ser el primero en darle nombre!',
    instructions: 'Anímate a experimentar: mezcla los ingredientes a tu gusto, ajusta sazón y texturas. ¡La cocina es creatividad!',
    explanation: 'No encontré una receta conocida para esta combinación. Es una mezcla original, ideal para crear un plato nuevo.',
    ingredients: matchedIngredients,
    matchType: 'libre',
  }
}
