import { useContext } from 'react'
import { getBezierPath, EdgeLabelRenderer } from 'reactflow'
import ValidEdgesContext from './ValidEdgesContext'

const CATEGORY_GRADIENTS = {
  verdura: ['#10B981', '#34D399'],
  carne: ['#EF4444', '#F87171'],
  pescado: ['#3B82F6', '#60A5FA'],
  especia: ['#8B5CF6', '#A78BFA'],
  líquido: ['#F97316', '#FB923C'],
  carbohidrato: ['#92400E', '#B45309'],
  fruta: ['#EC4899', '#F472B6'],
  lácteo: ['#3B82F6', '#60A5FA'],
  otro: ['#6B7280', '#9CA3AF'],
}

export default function ConnectionLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}) {
  const validEdgeIds = useContext(ValidEdgesContext)
  const isValid = validEdgeIds.has(id)

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const sourceCat = data?.sourceCategory || 'otro'
  const targetCat = data?.targetCategory || 'otro'
  const gradient = CATEGORY_GRADIENTS[sourceCat] || ['#8B5CF6', '#A78BFA']
  const gradientId = `cat-grad-${id}`

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="50%" stopColor={gradient[1]} />
          <stop offset="100%" stopColor={CATEGORY_GRADIENTS[targetCat]?.[0] || '#8B5CF6'} />
        </linearGradient>
      </defs>
      <path
        id={id}
        d={edgePath}
        className={`react-flow__edge-path ${isValid ? 'valid-combination' : ''}`}
        style={{
          stroke: isValid ? '#10B981' : `url(#${gradientId})`,
          strokeWidth: selected ? 4 : 2.5,
          fill: 'none',
          strokeDasharray: isValid ? '6 3' : '8 4',
          animation: isValid ? 'dashFlow 0.5s linear infinite' : 'dashFlow 1s linear infinite',
          filter: isValid ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' : 'none',
          ...style,
        }}
        markerEnd={markerEnd}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
              pointerEvents: 'none',
            }}
            className="text-[10px] font-bold bg-card text-primary px-2 py-0.5 rounded-full shadow-md border border-border"
          >
            ⚡
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
