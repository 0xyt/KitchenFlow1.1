import { collection, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const DEMO_DATA = {
  restaurant: {
    name: 'Pizzería Don Pepe',
    description: 'Cocina italiana casera desde 1985',
    ownerUid: null,
  },
  customIngredients: [
    { name: 'Pepperoni', emoji: '🍕', categoria: 'carne', precio: 3.50 },
    { name: 'Albahaca', emoji: '🌿', categoria: 'especia', precio: 1.00 },
    { name: 'Mozzarella', emoji: '🧀', categoria: 'lácteo', precio: 2.50 },
    { name: 'Orégano', emoji: '🌿', categoria: 'especia', precio: 0.50 },
    { name: 'Aceituna', emoji: '🫒', categoria: 'otro', precio: 1.50 },
  ],
  customRecipes: [
    {
      name: 'Pizza Pepperoni Don Pepe',
      emoji: '🍕',
      descripcion: 'Pizza artesanal horneada en horno de leña con pepperoni importado.',
      instrucciones: 'Estira la masa, añade salsa de tomate casera, mozzarella fresca, pepperoni y hornea a 300°C por 90 segundos.',
      modificadores: ['¿Con extra queso? (+$2)', '¿Sin pepperoni? (vegetariana)', '¿Borde relleno? (+$3)', '¿Doble salsa?'],
      precio: 12.90,
    },
    {
      name: 'Ensalada Caprese Don Pepe',
      emoji: '🥗',
      descripcion: 'Ensalada caprese con mozzarella de búfala y aceitunas.',
      instrucciones: 'Corta la mozzarella en rodajas, alterna con lechuga y aceitunas. Aliña con aceite de oliva, sal y albahaca.',
      modificadores: ['¿Con vinagre balsámico?', '¿Sin aceitunas?', '¿Con tomate cherry? (+$1.50)'],
      precio: 8.50,
    },
  ],
}

export async function seedDemoRestaurant() {
  if (!db) throw new Error('Firestore no disponible')

  const restRef = await addDoc(collection(db, 'restaurants'), {
    ...DEMO_DATA.restaurant,
    createdAt: serverTimestamp(),
  })

  const restId = restRef.id

  const ingIds = []
  for (const ing of DEMO_DATA.customIngredients) {
    const ref = await addDoc(collection(db, 'restaurants', restId, 'customIngredients'), {
      ...ing,
      createdAt: serverTimestamp(),
    })
    ingIds.push(ref.id)
  }

  const recipeIngredientIds = [
    [ingIds[0], ingIds[2], ingIds[1], ingIds[3]],
    [ingIds[4], ingIds[2], ingIds[1]],
  ]

  for (let i = 0; i < DEMO_DATA.customRecipes.length; i++) {
    const recipe = DEMO_DATA.customRecipes[i]
    await addDoc(collection(db, 'restaurants', restId, 'customRecipes'), {
      ...recipe,
      ingredientIds: recipeIngredientIds[i],
      createdAt: serverTimestamp(),
    })
  }

  return restId
}

export async function setUserRestaurantRole(userId, role = 'restaurant') {
  if (!db) throw new Error('Firestore no disponible')
  await setDoc(doc(db, 'users', userId), { role }, { merge: true })
}

export async function getUserProfile(userId) {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}

export async function publishDish(restaurantId, dish) {
  if (!db) throw new Error('Firestore no disponible')
  const ref = await addDoc(collection(db, 'restaurants', restaurantId, 'menu'), {
    ...dish,
    publishedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getMenuPlates(restaurantId) {
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'menu'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function publishCustomStyle(restaurantId, style) {
  if (!db) throw new Error('Firestore no disponible')
  const ref = await addDoc(collection(db, 'restaurants', restaurantId, 'dishStyles'), {
    ...style,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
