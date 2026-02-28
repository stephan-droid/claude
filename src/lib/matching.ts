import { AiTool, QuestionnaireAnswers, MatchResult, MatchingResult, UserProfile } from './types'
import { aiTools } from '@/data/tools'

/**
 * Regelbasierte Matching-Engine für KI-Tool-Empfehlungen.
 *
 * Die Gewichtung der Kriterien:
 * - Use-Case-Fit: 30%
 * - Rolle/Branche: 15%
 * - Erfahrungslevel: 15%
 * - Budget: 15%
 * - Datenschutz: 15%
 * - Sprachunterstützung: 10%
 *
 * Architekturhinweis: Diese regelbasierte Engine kann später durch einen
 * LLM-basierten Recommender ergänzt werden. Die Schnittstelle (Eingabe: Antworten,
 * Ausgabe: MatchingResult) bleibt identisch.
 */

const WEIGHTS = {
  useCase: 0.30,
  roleIndustry: 0.15,
  experience: 0.15,
  budget: 0.15,
  datenschutz: 0.15,
  language: 0.10,
}

/**
 * Extrahiert ein UserProfile aus den Fragebogen-Antworten
 */
function extractUserProfile(answers: QuestionnaireAnswers): UserProfile {
  return {
    role: (answers.role as string) || '',
    industry: (answers.industry as string) || '',
    teamSize: (answers.teamSize as string) || '',
    goals: (answers.goals as string[]) || [],
    painPoints: (answers.painPoints as string[]) || [],
    useCases: (answers.useCases as string[]) || [],
    experience: (answers.experience as string) || 'keine',
    budget: (answers.budget as string) || 'kostenlos',
    datenschutz: (answers.datenschutz as string) || 'egal',
    learningIntensity: (answers.learningIntensity as string) || 'normal',
    timebudget: (answers.timebudget as string) || 'mittel',
    language: (answers.language as string) || 'deutsch',
    format: (answers.format as string) || 'mixed',
  }
}

/**
 * Berechnet den Use-Case-Fit-Score (0–1)
 */
function scoreUseCase(tool: AiTool, profile: UserProfile): number {
  if (profile.useCases.length === 0) return 0.5
  const matches = profile.useCases.filter((uc) => tool.useCases.includes(uc))
  return matches.length / profile.useCases.length
}

/**
 * Berechnet den Rollen-/Branchen-Fit-Score (0–1)
 */
function scoreRoleIndustry(tool: AiTool, profile: UserProfile): number {
  let score = 0
  // Rolle
  if (tool.targetRoles.includes(profile.role)) {
    score += 0.5
  } else if (tool.targetRoles.includes('alle')) {
    score += 0.3
  }
  // Branche
  if (tool.targetIndustries.includes(profile.industry)) {
    score += 0.5
  } else if (tool.targetIndustries.includes('alle')) {
    score += 0.3
  }
  return score
}

/**
 * Berechnet den Erfahrungslevel-Score (0–1)
 * Niedrige Lernkurve = gut für Anfänger, hohe Lernkurve = gut für Erfahrene
 */
function scoreExperience(tool: AiTool, profile: UserProfile): number {
  const experienceMap: Record<string, number> = {
    'keine': 1,
    'wenig': 2,
    'mittel': 3,
    'viel': 4,
  }
  const curveMap: Record<string, number> = {
    'niedrig': 1,
    'mittel': 2,
    'hoch': 3,
  }
  const userExp = experienceMap[profile.experience] || 1
  const toolCurve = curveMap[tool.learningCurve] || 2

  // Perfekter Match: niedrige Lernkurve für Anfänger, hohe für Experten
  if (userExp <= 2 && toolCurve === 1) return 1.0
  if (userExp === 3 && toolCurve <= 2) return 1.0
  if (userExp >= 3 && toolCurve === 3) return 0.9
  // Mismatch: hohe Lernkurve für komplette Anfänger
  if (userExp === 1 && toolCurve === 3) return 0.2
  return 0.6
}

/**
 * Berechnet den Budget-Score (0–1)
 */
function scoreBudget(tool: AiTool, profile: UserProfile): number {
  const budgetOrder = ['kostenlos', 'günstig', 'mittel', 'premium']
  const userBudgetMap: Record<string, number> = {
    'kostenlos': 0,
    'guenstig': 1,
    'mittel': 2,
    'hoch': 3,
    'unternehmen': 3,
  }
  const toolBudgetIdx = budgetOrder.indexOf(tool.budgetLevel)
  const userBudgetIdx = userBudgetMap[profile.budget] ?? 1

  if (toolBudgetIdx <= userBudgetIdx) return 1.0
  if (toolBudgetIdx === userBudgetIdx + 1) return 0.5
  return 0.2
}

/**
 * Berechnet den Datenschutz-Score (0–1)
 */
function scoreDatenschutz(tool: AiTool, profile: UserProfile): number {
  const privacyOrder = ['basic', 'mittel', 'hoch', 'sehr-hoch']
  const userRequirementMap: Record<string, number> = {
    'egal': 0,
    'wichtig': 1,
    'sehr-wichtig': 2,
    'kritisch': 3,
  }
  const toolLevel = privacyOrder.indexOf(tool.datenschutz)
  const userReq = userRequirementMap[profile.datenschutz] ?? 1

  if (toolLevel >= userReq) return 1.0
  if (toolLevel === userReq - 1) return 0.6
  return 0.2
}

/**
 * Berechnet den Sprach-Score (0–1)
 */
function scoreLanguage(tool: AiTool, profile: UserProfile): number {
  if (tool.languages.includes('multilingual')) return 1.0
  if (profile.language === 'deutsch' && tool.languages.includes('deutsch')) return 1.0
  if (profile.language === 'englisch' && tool.languages.includes('englisch')) return 1.0
  if (profile.language === 'beide') {
    if (tool.languages.includes('deutsch') || tool.languages.includes('englisch')) return 0.9
  }
  return 0.4
}

/**
 * Generiert eine Begründung für die Empfehlung
 */
function generateReasons(tool: AiTool, profile: UserProfile): string[] {
  const reasons: string[] = []
  const useCaseMatches = profile.useCases.filter((uc) => tool.useCases.includes(uc))
  if (useCaseMatches.length > 0) {
    reasons.push(`Passt zu Ihren Anwendungsfällen: ${useCaseMatches.slice(0, 3).join(', ')}`)
  }
  if (tool.targetRoles.includes(profile.role)) {
    reasons.push(`Bewährt für Ihre Rolle im Bereich ${profile.role}`)
  }
  if (profile.experience === 'keine' && tool.learningCurve === 'niedrig') {
    reasons.push('Einfacher Einstieg – ideal für KI-Neulinge')
  }
  if (profile.datenschutz === 'sehr-wichtig' || profile.datenschutz === 'kritisch') {
    if (tool.datenschutz === 'hoch' || tool.datenschutz === 'sehr-hoch') {
      reasons.push('Erfüllt Ihre Datenschutzanforderungen')
    }
  }
  if (tool.strengths.length > 0) {
    reasons.push(tool.strengths[0])
  }
  return reasons.slice(0, 4)
}

/**
 * Generiert den kurzfristigen Nutzen-Hinweis
 */
function generateShortTermBenefit(tool: AiTool, profile: UserProfile): string {
  const benefitMap: Record<string, string> = {
    'text': 'Innerhalb einer Woche können Sie Texte doppelt so schnell erstellen.',
    'recherche': 'Sofort deutlich schnellere und fundiertere Rechercheergebnisse.',
    'email': 'Ab Tag 1 deutlich weniger Zeit für E-Mails aufwenden.',
    'automatisierung': 'In 2 Wochen erste Workflows automatisiert und Routineaufgaben reduziert.',
    'bilder': 'Bereits nach wenigen Tagen professionelle visuelle Inhalte erstellen.',
    'praesentationen': 'In wenigen Minuten ansprechende Präsentationen generieren.',
    'wissensmanagement': 'Wissen in Ihrem Team schneller auffindbar und nutzbar machen.',
    'marketing': 'Marketing-Content in einem Bruchteil der bisherigen Zeit erstellen.',
  }
  for (const uc of profile.useCases) {
    if (benefitMap[uc]) return benefitMap[uc]
  }
  return 'Innerhalb der ersten Woche spürbar produktiver arbeiten.'
}

/**
 * Generiert den Hinweis, für wen das Tool weniger geeignet ist
 */
function generateNotSuitableFor(tool: AiTool): string {
  if (tool.limitations.length > 0) {
    return tool.limitations[0]
  }
  return 'Für hochspezialisierte Fachanwendungen ggf. eingeschränkt.'
}

/**
 * Hauptfunktion: Berechnet das Matching-Ergebnis
 */
export function calculateMatching(answers: QuestionnaireAnswers): MatchingResult {
  const profile = extractUserProfile(answers)

  // Bereits genutzte Tools herausfiltern (optional: niedrigere Priorität)
  const existingTools = (answers.existingTools as string[]) || []

  const scored: MatchResult[] = aiTools.map((tool) => {
    let score =
      scoreUseCase(tool, profile) * WEIGHTS.useCase +
      scoreRoleIndustry(tool, profile) * WEIGHTS.roleIndustry +
      scoreExperience(tool, profile) * WEIGHTS.experience +
      scoreBudget(tool, profile) * WEIGHTS.budget +
      scoreDatenschutz(tool, profile) * WEIGHTS.datenschutz +
      scoreLanguage(tool, profile) * WEIGHTS.language

    // Bereits genutzte Tools leicht abwerten (Nutzer will vermutlich etwas Neues)
    if (existingTools.includes(tool.id)) {
      score *= 0.7
    }

    return {
      tool,
      score: Math.round(score * 100),
      reasons: generateReasons(tool, profile),
      shortTermBenefit: generateShortTermBenefit(tool, profile),
      notSuitableFor: generateNotSuitableFor(tool),
    }
  })

  // Sortieren nach Score (absteigend)
  scored.sort((a, b) => b.score - a.score)

  return {
    topRecommendation: scored[0],
    alternatives: scored.slice(1, 3),
    userProfile: profile,
  }
}
