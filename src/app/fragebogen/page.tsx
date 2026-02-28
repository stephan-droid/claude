'use client'

import { useRouter } from 'next/navigation'
import { useQuestionnaire } from '@/hooks/useQuestionnaire'
import ProgressBar from '@/components/ui/ProgressBar'
import QuestionRenderer from '@/components/fragebogen/QuestionRenderer'
import { calculateMatching } from '@/lib/matching'
import { saveToStorage } from '@/lib/utils'

export default function FragebogenPage() {
  const router = useRouter()
  const {
    currentStep,
    totalSteps,
    currentStepData,
    answers,
    errors,
    setAnswer,
    nextStep,
    prevStep,
    validateStep,
  } = useQuestionnaire()

  const handleSubmit = () => {
    if (!validateStep()) return

    // Matching berechnen und speichern
    const result = calculateMatching(answers)
    saveToStorage('ki-workshop-matching', result)
    saveToStorage('ki-workshop-answers', answers)

    router.push('/ergebnis')
  }

  const isLastStep = currentStep === totalSteps

  if (!currentStepData) return null

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Schritt {currentStep} von {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% abgeschlossen
            </span>
          </div>
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        {/* Step header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          {currentStepData.questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={answers[question.id]}
              error={errors[question.id]}
              onChange={setAnswer}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-outline disabled:opacity-0 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Zurück
          </button>

          {isLastStep ? (
            <button type="button" onClick={handleSubmit} className="btn-primary">
              Empfehlung erhalten
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button type="button" onClick={nextStep} className="btn-primary">
              Weiter
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
