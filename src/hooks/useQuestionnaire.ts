'use client'

import { useState, useCallback } from 'react'
import { QuestionnaireAnswers } from '@/lib/types'
import { questionnaireSteps } from '@/data/questions'
import { saveToStorage, loadFromStorage } from '@/lib/utils'

const STORAGE_KEY = 'ki-workshop-answers'

/**
 * Custom Hook für den Fragebogen-State
 */
export function useQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => {
    return loadFromStorage<QuestionnaireAnswers>(STORAGE_KEY) || {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = questionnaireSteps.length
  const currentStepData = questionnaireSteps.find((s) => s.step === currentStep)

  const setAnswer = useCallback((questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value }
      saveToStorage(STORAGE_KEY, next)
      return next
    })
    // Fehler für diese Frage entfernen
    setErrors((prev) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }, [])

  const validateStep = useCallback((): boolean => {
    if (!currentStepData) return true

    const newErrors: Record<string, string> = {}
    for (const question of currentStepData.questions) {
      if (question.required) {
        const answer = answers[question.id]
        if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'Bitte beantworten Sie diese Frage.'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentStepData, answers])

  const nextStep = useCallback(() => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [validateStep, currentStep, totalSteps])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      setErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const isComplete = useCallback((): boolean => {
    return currentStep === totalSteps && validateStep()
  }, [currentStep, totalSteps, validateStep])

  const reset = useCallback(() => {
    setCurrentStep(1)
    setAnswers({})
    setErrors({})
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    currentStep,
    totalSteps,
    currentStepData,
    answers,
    errors,
    setAnswer,
    nextStep,
    prevStep,
    validateStep,
    isComplete,
    reset,
  }
}
