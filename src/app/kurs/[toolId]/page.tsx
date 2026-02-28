'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CourseTemplate, CourseProgress, QuestionnaireAnswers } from '@/lib/types'
import { getToolById } from '@/data/tools'
import { getCourseForTool, roleLabels } from '@/data/courses'
import { loadFromStorage, saveToStorage, calculateProgress, formatDuration, personalizeContent } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'

export default function KursDashboardPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = use(params)
  const router = useRouter()
  const [course, setCourse] = useState<CourseTemplate | null>(null)
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})

  useEffect(() => {
    const tool = getToolById(toolId)
    if (!tool) {
      router.push('/')
      return
    }

    const courseData = getCourseForTool(toolId, tool.name)
    setCourse(courseData)

    const storedProgress = loadFromStorage<CourseProgress>('ki-workshop-progress')
    if (storedProgress && storedProgress.toolId === toolId) {
      setProgress(storedProgress)
    } else {
      const newProgress: CourseProgress = {
        toolId,
        completedLessons: [],
        currentModuleId: courseData.modules[0]?.id || '',
        currentLessonId: courseData.modules[0]?.lessons[0]?.id || '',
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        answers: loadFromStorage('ki-workshop-answers') || {},
      }
      saveToStorage('ki-workshop-progress', newProgress)
      setProgress(newProgress)
    }

    const storedAnswers = loadFromStorage<QuestionnaireAnswers>('ki-workshop-answers')
    if (storedAnswers) setAnswers(storedAnswers)
  }, [toolId, router])

  if (!course || !progress) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Kurs wird geladen...</div>
      </div>
    )
  }

  const tool = getToolById(toolId)!
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedCount = progress.completedLessons.length
  const progressPercent = calculateProgress(completedCount, totalLessons)
  const roleName = roleLabels[answers.role as string] || (answers.role as string) || 'Ihrem Bereich'

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {tool.name} – Ihr Kurs
              </h1>
              <p className="text-gray-600">
                Personalisiert für {roleName}
              </p>
            </div>
            <Link href="/ergebnis" className="btn-outline text-sm self-start">
              Zurück zur Empfehlung
            </Link>
          </div>

          <ProgressBar current={completedCount} total={totalLessons} label={`Fortschritt: ${completedCount} von ${totalLessons} Lektionen`} />

          {progressPercent === 100 && (
            <div className="mt-4 bg-accent-50 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-accent-800">
                Herzlichen Glückwunsch! Sie haben den Kurs abgeschlossen.
              </span>
            </div>
          )}
        </div>

        {/* Module list */}
        <div className="space-y-4">
          {course.modules.map((module, moduleIdx) => {
            const moduleLessons = module.lessons
            const completedInModule = moduleLessons.filter((l) =>
              progress.completedLessons.includes(l.id)
            ).length
            const isModuleComplete = completedInModule === moduleLessons.length
            const isCurrentModule = module.id === progress.currentModuleId

            return (
              <div
                key={module.id}
                className={`bg-white rounded-xl border p-6 ${
                  isCurrentModule ? 'border-primary-300 shadow-md' : 'border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        isModuleComplete
                          ? 'bg-accent-100 text-accent-700'
                          : isCurrentModule
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isModuleComplete ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        moduleIdx + 1
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {formatDuration(module.estimatedMinutes)}
                  </span>
                </div>

                {/* Lesson list */}
                <div className="ml-11 space-y-2">
                  {moduleLessons.map((lesson) => {
                    const isCompleted = progress.completedLessons.includes(lesson.id)
                    const isCurrent =
                      lesson.id === progress.currentLessonId &&
                      module.id === progress.currentModuleId

                    return (
                      <Link
                        key={lesson.id}
                        href={`/kurs/${toolId}/${module.id}?lesson=${lesson.id}`}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isCurrent
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : isCompleted
                            ? 'text-gray-500 hover:bg-gray-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                            </svg>
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-primary-500 bg-primary-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span>{personalizeContent(lesson.title, answers)}</span>
                        <span className="text-xs text-gray-400 ml-auto capitalize">{lesson.type}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Module progress */}
                <div className="ml-11 mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${calculateProgress(completedInModule, moduleLessons.length)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
