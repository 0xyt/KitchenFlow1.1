import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'

const CATEGORY_COLORS = {
  verdura: { hex: '#10B981', label: 'Veggie' },
  carne: { hex: '#EF4444', label: 'Proteína' },
  pescado: { hex: '#3B82F6', label: 'Pescado' },
  especia: { hex: '#8B5CF6', label: 'Especia' },
  líquido: { hex: '#F97316', label: 'Salsa' },
  carbohidrato: { hex: '#92400E', label: 'Grano' },
  fruta: { hex: '#EC4899', label: 'Fruta' },
  lácteo: { hex: '#3B82F6', label: 'Lácteo' },
  otro: { hex: '#6B7280', label: 'Otro' },
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || { hex: '#8B5CF6', label: category }
}

function IngredientNode({ data }) {
  const [hovered, setHovered] = useState(false)
  const catInfo = getCategoryColor(data.category)
  const borderColor = catInfo.hex + '99'

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="flex flex-col items-center justify-center rounded-[12px] bg-card cursor-grab active:cursor-grabbing relative select-none"
      style={{
        width: 80,
        height: 80,
        border: `2px solid ${borderColor}`,
        boxShadow: hovered
          ? `0 0 20px ${catInfo.hex}44, 0 0 40px ${catInfo.hex}22`
          : `0 2px 8px ${catInfo.hex}22`,
      }}
    >
      <motion.span
        className="text-[32px] leading-none"
        animate={hovered ? { rotate: [0, -8, 8, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {data.emoji}
      </motion.span>
      <span
        className="text-[11px] font-semibold text-foreground text-center leading-tight mt-0.5 px-1 truncate max-w-[72px]"
      >
        {data.label}
      </span>

      <span
        className="absolute -top-1.5 -right-1.5 text-[7px] font-bold px-1.5 py-0.5 rounded-full border-2 border-card shadow-sm"
        style={{
          backgroundColor: catInfo.hex,
          color: '#FFFFFF',
          lineHeight: '1',
        }}
      >
        {data.emoji ? '' : catInfo.label.slice(0, 3)}
      </span>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !border-2 !border-white"
        style={{
          left: -6,
          backgroundColor: '#D1D5DB',
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{
          right: -7,
          backgroundColor: '#F59E0B',
          boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)',
          animation: 'pulse-amber 2s ease-in-out infinite',
        }}
      />
    </motion.div>
  )
}

export default memo(IngredientNode)
