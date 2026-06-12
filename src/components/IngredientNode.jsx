import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'

const CATEGORY_COLORS = {
  verdura: '#10B981',
  proteina: '#EF4444',
  salsa: '#F97316',
  lacteo: '#3B82F6',
  especia: '#8B5CF6',
  carbohidrato: '#F59E0B',
  fruta: '#EC4899',
  liquido: '#06B6D4',
  otro: '#78716C',
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#8B5CF6'
}

function IngredientNode({ data }) {
  const [hovered, setHovered] = useState(false)
  const categoryColor = getCategoryColor(data.category)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing relative select-none"
      style={{
        width: 80,
        height: 80,
        background: '#FFFFFF',
        border: '1px solid #E5E0F5',
        borderLeft: `3px solid ${categoryColor}`,
        borderRadius: 10,
        boxShadow: hovered
          ? `0 4px 20px rgba(139,92,246,0.15)`
          : '0 2px 8px rgba(139,92,246,0.08)',
      }}
    >
      <motion.span
        className="text-[32px] leading-none"
        animate={hovered ? { rotate: [0, -8, 8, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {data.emoji}
      </motion.span>
      <span className="text-[11px] font-semibold text-text text-center leading-tight mt-0.5 px-1 truncate max-w-[72px]">
        {data.label}
      </span>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          left: -6,
          background: '#FFFFFF',
          borderColor: '#C4B5FD',
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          right: -6,
          background: '#8B5CF6',
          borderColor: '#FFFFFF',
        }}
      />
    </motion.div>
  )
}

export default memo(IngredientNode)
