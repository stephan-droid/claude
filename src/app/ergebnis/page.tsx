'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MatchingResult } from '@/lib/types'
import { loadFromStorage, saveToStorage } from '@/lib/utils'
import ToolCard from '@/components/ergebnis/ToolCard'

export default function ErgebnisPage() {
  const router = useRouter()
  const [result, setResult] = useState<MatchingResult | null>(null)

  useEffect(() => {
    const stored = loadFromStorage<MatchingResult>('ki-workshop-matching')
    if (!stored) {
      router.push('/fragebogen')
      return
    }
    setResult(stored)
  }, [router])

  const handleStartCourse = (toolId: string) => {
    // Kurs-Progress initialisieren
    const progress = {
      toolId,
      completedLessons: [],
      currentModuleId: 'intro',
      currentLessonId: 'intro-1',
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      answers: loadFromStorage('ki-workshop-answers') || {},
    }
    saveToStorage('ki-workshop-progress', progress)
    router.push(`/kurs/${toolId}`)
  }

  if (!result) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Ergebnis wird geladen...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
            <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Ihre persönliche Empfehlung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Basierend auf Ihren Angaben haben wir das passende KI-Tool und zwei Alternativen für Sie identifiziert.
          </p>
        </div>

        {/* Top Recommendation */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Top-Empfehlung
          </div>
          <ToolCard
            matchResult={result.topRecommendation}
            isTopPick
            onStartCourse={() => handleStartCourse(result.topRecommendation.tool.id)}
          />
        </div>

        {/* Alternatives */}
        <div className="mb-10">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Alternativen
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {result.alternatives.map((alt) => (
              <ToolCard
                key={alt.tool.id}
                matchResult={alt}
                onStartCourse={() => handleStartCourse(alt.tool.id)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 mb-4">
            Nicht das Richtige dabei?
          </p>
          <Link href="/fragebogen" className="btn-outline text-sm">
            Fragebogen erneut ausfüllen
          </Link>
        </div>
      </div>
    </div>
  )
}
