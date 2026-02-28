'use client'

import { Question } from '@/lib/types'

interface QuestionRendererProps {
  question: Question
  value: string | string[] | number | undefined
  error?: string
  onChange: (questionId: string, value: string | string[] | number) => void
}

export default function QuestionRenderer({ question, value, error, onChange }: QuestionRendererProps) {
  const handleSingleSelect = (optionValue: string) => {
    onChange(question.id, optionValue)
  }

  const handleMultiSelect = (optionValue: string) => {
    const current = (value as string[]) || []
    if (current.includes(optionValue)) {
      onChange(question.id, current.filter((v) => v !== optionValue))
    } else {
      onChange(question.id, [...current, optionValue])
    }
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {question.title}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      {question.description && (
        <p className="text-sm text-gray-500 mb-3">{question.description}</p>
      )}

      {question.type === 'single' && question.options && (
        <div className="grid gap-2">
          {question.options.map((option) => {
            const isSelected = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSingleSelect(option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-primary-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                {option.description && (
                  <p className="text-xs text-gray-500 ml-8 mt-1">{option.description}</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'multi' && question.options && (
        <div className="grid gap-2">
          {question.options.map((option) => {
            const isSelected = Array.isArray(value) && value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMultiSelect(option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm resize-none"
          rows={3}
          placeholder="Ihre Antwort..."
          value={(value as string) || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
