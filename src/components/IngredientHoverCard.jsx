import { getCompatibleIngredientNames, getCompatibilityCount, getCompatibilityLevel } from '../utils/compatibilityEngine'

export default function IngredientHoverCard({ ingredient }) {
  const compatibleNames = getCompatibleIngredientNames(ingredient.id)
  const count = getCompatibilityCount(ingredient.id)
  const level = getCompatibilityLevel(count)
  const tags = ingredient.palabrasClave || ingredient.keywords || []

  return (
    <div className="animate-in">
      <div className="bg-white rounded-[12px] shadow-[0_8px_32px_rgba(28,25,23,0.12)] border border-[#E5E0D5] p-4 min-w-[220px] max-w-[280px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{ingredient.emoji}</span>
          <div>
            <p className="font-medium text-[13px] text-[#1C1917]">{ingredient.nombre}</p>
            <span className={`label-sm ${level.color}`}>{level.label}</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="compatibility-tag">{tag}</span>
            ))}
          </div>
        )}

        <div>
          <p className="label-sm text-muted mb-1.5">
            Compatibilidad: combina bien con
          </p>
          <div className="flex flex-wrap gap-1">
            {compatibleNames.slice(0, 5).map((name, i) => (
              <span key={i} className="chip chip-primary text-[11px] px-2 py-0.5">
                {name}
              </span>
            ))}
            {compatibleNames.length > 5 && (
              <span className="text-[11px] text-muted">
                +{compatibleNames.length - 5} más
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
