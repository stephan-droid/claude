import { QuestionnaireAnswers } from './types'

/**
 * Ersetzt Template-Variablen in Texten basierend auf Fragebogen-Antworten.
 * Variablen im Format {{variableName}} werden durch die entsprechenden Werte ersetzt.
 */
export function personalizeContent(
  template: string,
  answers: QuestionnaireAnswers
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = answers[key]
    if (value === undefined) return match
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  })
}

/**
 * Berechnet den Fortschritt in Prozent
 */
export function calculateProgress(
  completed: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Formatiert Minuten als lesbaren String
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) return `${hours} Std.`
  return `${hours} Std. ${remaining} Min.`
}

/**
 * Gibt ein freundliches Label für das Erfahrungslevel zurück
 */
export function experienceLabel(level: string): string {
  const labels: Record<string, string> = {
    'keine': 'KI-Einsteiger',
    'wenig': 'Grundkenntnisse',
    'mittel': 'Fortgeschritten',
    'viel': 'KI-Experte',
  }
  return labels[level] || level
}

/**
 * Speichert Daten im localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.warn('localStorage nicht verfügbar')
  }
}

/**
 * Liest Daten aus dem localStorage
 */
export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

/**
 * Generiert eine einfache ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
