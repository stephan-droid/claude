// ============================================================
// Zentrale TypeScript-Typen für das KI-Workshop MVP
// ============================================================

// --- Fragebogen ---

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface Question {
  id: string
  step: number
  title: string
  description?: string
  type: 'single' | 'multi' | 'text' | 'scale'
  options?: QuestionOption[]
  required: boolean
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: { min: string; max: string }
}

export interface QuestionnaireStep {
  step: number
  title: string
  description: string
  questions: Question[]
}

export type QuestionnaireAnswers = Record<string, string | string[] | number>

// --- KI-Tools ---

export interface AiTool {
  id: string
  name: string
  category: string
  description: string
  useCases: string[]
  targetRoles: string[]
  targetIndustries: string[]
  learningCurve: 'niedrig' | 'mittel' | 'hoch'
  pricingModel: string
  budgetLevel: 'kostenlos' | 'günstig' | 'mittel' | 'premium'
  datenschutz: 'basic' | 'mittel' | 'hoch' | 'sehr-hoch'
  complianceFeatures: string[]
  strengths: string[]
  limitations: string[]
  integrations: string[]
  outputTypes: string[]
  languages: string[]
  courseModuleIds: string[]
  iconName: string
  website: string
}

// --- Matching ---

export interface MatchResult {
  tool: AiTool
  score: number
  reasons: string[]
  shortTermBenefit: string
  notSuitableFor: string
}

export interface MatchingResult {
  topRecommendation: MatchResult
  alternatives: MatchResult[]
  userProfile: UserProfile
}

export interface UserProfile {
  role: string
  industry: string
  teamSize: string
  goals: string[]
  painPoints: string[]
  useCases: string[]
  experience: string
  budget: string
  datenschutz: string
  learningIntensity: string
  timebudget: string
  language: string
  format: string
}

// --- Kurse ---

export interface CourseModule {
  id: string
  title: string
  description: string
  order: number
  estimatedMinutes: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  type: 'text' | 'exercise' | 'checklist' | 'template'
  content: string
  // Template-Variablen werden zur Laufzeit ersetzt
  templateVars?: string[]
  exercise?: Exercise
  checklist?: ChecklistItem[]
}

export interface Exercise {
  instruction: string
  hint?: string
  exampleOutput?: string
}

export interface ChecklistItem {
  id: string
  text: string
  checked?: boolean
}

export interface CourseProgress {
  toolId: string
  completedLessons: string[]
  currentModuleId: string
  currentLessonId: string
  startedAt: string
  lastAccessedAt: string
  answers: QuestionnaireAnswers
}

// --- Kurs-Template ---

export interface CourseTemplate {
  toolId: string
  modules: CourseModule[]
}
