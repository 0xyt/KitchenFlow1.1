export function findMatches(selectedIngredients, recipeRules) {
  if (!selectedIngredients?.length || !recipeRules?.length) return []

  const selected = selectedIngredients.map(s => s.toLowerCase().trim())
  const scored = recipeRules.map(rule => {
    const ruleIngs = rule.ingredientes.map(i => i.toLowerCase().trim())
    const matches = ruleIngs.filter(ri => selected.includes(ri)).length
    const ratio = matches / ruleIngs.length
    return { rule, ratio, matches, total: ruleIngs.length }
  })

  return scored
    .filter(s => s.ratio >= 0.7)
    .sort((a, b) => b.ratio - a.ratio || b.matches - a.matches)
    .map(s => ({
      ...s.rule,
      matchRatio: s.ratio,
      matchCount: s.matches,
    }))
}
