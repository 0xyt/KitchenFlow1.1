import { useCallback, useRef, useState, useMemo, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Background,
} from 'reactflow'
import 'reactflow/dist/style.css'

import IngredientNode from '../IngredientNode'
import IngredientSidebar from '../Sidebar'
import RecipeResultCard from '../RecipeResultCard'
import ConnectionLine from './ConnectionLine'
import RestaurantBanner from '../RestaurantBanner'
import { evaluateCombination } from '../../lib/semanticEngine'
import ValidEdgesContext from './ValidEdgesContext'

const nodeTypes = { ingredient: IngredientNode }
const edgeTypes = { connection: ConnectionLine }

const defaultEdgeOptions = {
  type: 'connection',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
}

function Flow({ user, onSaveFavorite, sounds, restaurantCtx }) {
  const reactFlowWrapper = useRef(null)
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [showResult, setShowResult] = useState(true)
  const [flashKey, setFlashKey] = useState(0)
  const [showResultPanel, setShowResultPanel] = useState(false)
  const [activeIngredients, setActiveIngredients] = useState([])

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []
  )

  const restaurant = restaurantCtx?.restaurant
  const customIngredients = restaurantCtx?.customIngredients || []
  const customRecipes = (restaurantCtx?.customRecipes || []).map(r => ({
    ...r,
    restaurantName: restaurant?.name || 'Restaurante',
  }))
  const customStyles = restaurantCtx?.customStyles || []
  const isFollowing = restaurantCtx?.isFollowing || false

  const result = useMemo(() => {
    if (edges.length === 0 || nodes.length === 0) return null

    const adj = {}
    nodes.forEach(n => { adj[n.id] = [] })
    edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target)
      if (adj[e.target]) adj[e.target].push(e.source)
    })

    const visited = new Set()
    const components = []
    nodes.forEach(n => {
      if (visited.has(n.id)) return
      const comp = []
      const stack = [n.id]
      while (stack.length) {
        const id = stack.pop()
        if (visited.has(id)) continue
        visited.add(id)
        comp.push(id)
        if (adj[id]) adj[id].forEach(nb => { if (!visited.has(nb)) stack.push(nb) })
      }
      components.push(comp)
    })

    const evaluated = components
      .map(comp => {
        const ids = comp
          .map(id => nodes.find(n => n.id === id))
          .filter(Boolean)
          .map(n => n.data.ingredientId)
        return ids.length >= 2 ? evaluateCombination(ids, customRecipes, customIngredients) : null
      })
      .filter(Boolean)

    if (evaluated.length === 0) return null

    return evaluated.reduce((a, b) =>
      a.ingredients.length >= b.ingredients.length ? a : b
    )
  }, [nodes, edges, customRecipes])

  const validEdgeIds = useMemo(() => {
    if (!result) return new Set()
    const ingIdsInBest = new Set(result.ingredients.map(i => i.ingredientId || i.id))
    const validIds = new Set()
    edges.forEach(e => {
      const sNode = nodes.find(n => n.id === e.source)
      const tNode = nodes.find(n => n.id === e.target)
      if (sNode && tNode) {
        const sId = sNode.data.ingredientId
        const tId = tNode.data.ingredientId
        if (ingIdsInBest.has(sId) && ingIdsInBest.has(tId)) {
          validIds.add(e.id)
        }
      }
    })
    return validIds
  }, [result, edges, nodes])

  const prevRecipeKeyRef = useRef(null)
  useEffect(() => {
    if (!result) return
    const key = `${result.name}|${result.ingredients.map(i => i.id).sort().join(',')}`
    if (key !== prevRecipeKeyRef.current) {
      prevRecipeKeyRef.current = key
      setFlashKey(n => n + 1)
      sounds?.playDing?.()
    }
  }, [result, sounds])

  const onConnect = useCallback((connection) => {
    if (!user) return
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#8B5CF6',
        strokeWidth: 2,
        opacity: 0.6,
      },
    }, eds))
    sounds?.playClick?.()
    const connectedNodeIds = nodes.map(n => n.id)
    if (connectedNodeIds.length >= 2) {
      setShowResultPanel(true)
      setActiveIngredients(connectedNodeIds)
    }
  }, [nodes, user, sounds])

  const onDragOver = useCallback((event) => {
    if (!user) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [user])

  const onDrop = useCallback(
    (event) => {
      if (!user) return
      event.preventDefault()
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow'))
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const newNode = {
        id: `${data.id}-${Date.now()}`,
        type: 'ingredient',
        position,
        data: {
          label: data.nombre,
          emoji: data.emoji,
          category: data.category,
          ingredientId: data.id,
        },
      }
      setNodes((nds) => nds.concat(newNode))
      setShowResult(true)
      sounds?.playPop?.()
    },
    [screenToFlowPosition, setNodes, user, sounds]
  )

  const handleClear = useCallback(() => setShowResult(false), [])

  const handleClearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setShowResult(false)
  }, [setNodes, setEdges])

  const handleClearEdges = useCallback(() => {
    setEdges([])
  }, [setEdges])

  const handleSave = useCallback(() => {
    if (result) onSaveFavorite(result)
  }, [result, onSaveFavorite])

  return (
    <ValidEdgesContext.Provider value={validEdgeIds}>
      <div className="flex h-full">
        <IngredientSidebar
          user={user}
          customIngredients={customIngredients}
          restaurantName={restaurant?.name}
          disabledIngredientIds={restaurantCtx?.disabledIngredientIds}
        />
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {!user && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center glass-panel">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🧑‍🍳
              </motion.span>
              <p className="font-title text-xl font-extrabold text-primary mb-2">
                Inicia sesión para empezar a cocinar
              </p>
              <p className="text-sm text-muted-foreground">
                Arrastra ingredientes y conéctalos para descubrir nuevas recetas
              </p>
            </div>
          )}

          {user && (
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              <button
                onClick={handleClearCanvas}
                className="px-3 py-1.5 text-xs font-semibold glass-panel-strong text-primary rounded-[8px] hover:bg-primary/10 transition-all card-shadow"
              >
                Limpiar todo
              </button>
              <button
                onClick={handleClearEdges}
                className="px-3 py-1.5 text-xs font-semibold glass-panel-strong text-muted-foreground rounded-[8px] hover:bg-muted transition-all card-shadow"
              >
                Limpiar conexiones
              </button>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode="Delete"
            connectOnClick
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background variant="dots" color="#DDD8F5" gap={16} size={1.5} />
            <Controls showInteractive={false} />
          </ReactFlow>

          <RestaurantBanner
            onFollowDemo={restaurantCtx?.followDemo || (() => {})}
            isFollowing={isFollowing}
          />

          {showResultPanel && (
            <div className="absolute right-4 top-4 z-10 rounded-[12px] p-4 max-w-xs border border-[#DDD8F5] shadow-lg"
              style={{ background: 'rgba(139, 92, 246, 0.08)', backdropFilter: 'blur(8px)' }}>
              <h4 className="text-sm font-bold text-[#1C1917] mb-2">¡Combinación detectada! 🎉</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeIngredients.map(id => {
                  const n = nodes.find(n => n.id === id)
                  return n ? (
                    <span key={id} className="text-xs text-text bg-white/60 px-2 py-1 rounded-full border border-[#E5E0F5]">
                      {n.data.emoji} {n.data.label}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {result && showResult && (
            <div className="absolute bottom-4 right-4 z-10">
              <RecipeResultCard
                recipe={result}
                user={user}
                onSave={handleSave}
                onClear={handleClear}
                flashKey={flashKey}
                customStyles={customStyles}
              />
            </div>
          )}
        </div>
      </div>
    </ValidEdgesContext.Provider>
  )
}

export default function FlowCanvas({ user, onSaveFavorite, sounds, restaurantCtx }) {
  return (
    <ReactFlowProvider>
      <Flow
        user={user}
        onSaveFavorite={onSaveFavorite}
        sounds={sounds}
        restaurantCtx={restaurantCtx}
      />
    </ReactFlowProvider>
  )
}
