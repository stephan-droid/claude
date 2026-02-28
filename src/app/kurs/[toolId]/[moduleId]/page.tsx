'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CourseTemplate, CourseProgress, QuestionnaireAnswers, Lesson, CourseModule } from '@/lib/types'
import { getToolById } from '@/data/tools'
import { getCourseForTool, roleLabels } from '@/data/courses'
import { loadFromStorage, saveToStorage, personalizeContent } from '@/lib/utils'
import LessonContent from '@/components/kurs/LessonContent'

export default function LessonPage({
  params,
}: {
  params: { toolId: string; moduleId: string }
}) {
  const { toolId, moduleId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson')

  const [course, setCourse] = useState<CourseTemplate | null>(null)
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null)

  useEffect(() => {
    const tool = getToolById(toolId)
    if (!tool) {
      router.push('/')
      return
    }

    const courseData = getCourseForTool(toolId, tool.name)
    setCourse(courseData)

    const mod = courseData.modules.find((m) => m.id === moduleId)
    setCurrentModule(mod || null)

    if (mod) {
      const lesson = lessonId
        ? mod.lessons.find((l) => l.id === lessonId) || mod.lessons[0]
        : mod.lessons[0]
      setCurrentLesson(lesson)
    }

    const storedProgress = loadFromStorage<CourseProgress>('ki-workshop-progress')
    if (storedProgress) {
      setProgress(storedProgress)
    }

    const storedAnswers = loadFromStorage<QuestionnaireAnswers>('ki-workshop-answers')
    if (storedAnswers) setAnswers(storedAnswers)
  }, [toolId, moduleId, lessonId, router])

  const markComplete = useCallback(() => {
    if (!currentLesson || !progress || !course) return

    const updated = {
      ...progress,
      completedLessons: progress.completedLessons.includes(currentLesson.id)
        ? progress.completedLessons
        : [...progress.completedLessons, currentLesson.id],
      lastAccessedAt: new Date().toISOString(),
    }

    // Finde nächste Lektion
    const allLessons: { moduleId: string; lesson: Lesson }[] = []
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        allLessons.push({ moduleId: mod.id, lesson })
      }
    }

    const currentIdx = allLessons.findIndex((l) => l.lesson.id === currentLesson.id)
    if (currentIdx < allLessons.length - 1) {
      const next = allLessons[currentIdx + 1]
      updated.currentModuleId = next.moduleId
      updated.currentLessonId = next.lesson.id
    }

    saveToStorage('ki-workshop-progress', updated)
    setProgress(updated)
  }, [currentLesson, progress, course])

  const navigateToLesson = useCallback(
    (direction: 'prev' | 'next') => {
      if (!course || !currentLesson) return

      const allLessons: { moduleId: string; lesson: Lesson }[] = []
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          allLessons.push({ moduleId: mod.id, lesson })
        }
      }

      const currentIdx = allLessons.findIndex((l) => l.lesson.id === currentLesson.id)
      const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1

      if (targetIdx >= 0 && targetIdx < allLessons.length) {
        const target = allLessons[targetIdx]
        router.push(`/kurs/${toolId}/${target.moduleId}?lesson=${target.lesson.id}`)
      }
    },
    [course, currentLesson, router, toolId]
  )

  if (!course || !currentModule || !currentLesson || !progress) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Lektion wird geladen...</div>
      </div>
    )
  }

  const tool = getToolById(toolId)!
  const isCompleted = progress.completedLessons.includes(currentLesson.id)

  // Calculate prev/next availability
  const allLessons: { moduleId: string; lesson: Lesson }[] = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({ moduleId: mod.id, lesson })
    }
  }
  const currentIdx = allLessons.findIndex((l) => l.lesson.id === currentLesson.id)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allLessons.length - 1

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href={`/kurs/${toolId}`} className="hover:text-primary-600">
            {tool.name}-Kurs
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">{currentModule.title}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{personalizeContent(currentLesson.title, answers)}</span>
        </nav>

        {/* Lesson content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentLesson.type === 'exercise'
                ? 'bg-orange-50 text-orange-700'
                : currentLesson.type === 'checklist'
                ? 'bg-purple-50 text-purple-700'
                : currentLesson.type === 'template'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-700'
            }`}>
              {currentLesson.type === 'exercise' ? 'Übung' :
               currentLesson.type === 'checklist' ? 'Checkliste' :
               currentLesson.type === 'template' ? 'Vorlage' : 'Lektion'}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Abgeschlossen
              </span>
            )}
          </div>

          <LessonContent lesson={currentLesson} answers={answers} />
        </div>

        {/* Mark complete + Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToLesson('prev')}
            disabled={!hasPrev}
            className="btn-outline disabled:opacity-0 disabled:pointer-events-none order-2 sm:order-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Zurück
          </button>

          <button
            type="button"
            onClick={() => {
              markComplete()
              if (hasNext) {
                navigateToLesson('next')
              } else {
                router.push(`/kurs/${toolId}`)
              }
            }}
            className={`btn-primary order-1 sm:order-2 ${isCompleted ? 'bg-accent-600 hover:bg-accent-700' : ''}`}
          >
            {isCompleted
              ? hasNext
                ? 'Nächste Lektion'
                : 'Zum Dashboard'
              : hasNext
              ? 'Abschließen & Weiter'
              : 'Kurs abschließen'}
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
