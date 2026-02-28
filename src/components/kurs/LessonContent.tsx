'use client'

import { useState } from 'react'
import { Lesson, QuestionnaireAnswers } from '@/lib/types'
import { personalizeContent } from '@/lib/utils'
import { roleLabels } from '@/data/courses'

interface LessonContentProps {
  lesson: Lesson
  answers: QuestionnaireAnswers
}

/**
 * Rendert den personalisierten Inhalt einer Lektion.
 * Unterstützt Markdown-ähnliches Format (vereinfacht für MVP).
 */
export default function LessonContent({ lesson, answers }: LessonContentProps) {
  // Antwort-Labels für bessere Lesbarkeit
  const enrichedAnswers: QuestionnaireAnswers = {
    ...answers,
    role: roleLabels[answers.role as string] || (answers.role as string) || '',
  }

  const content = personalizeContent(lesson.content, enrichedAnswers)

  return (
    <div>
      {/* Main content */}
      <div className="prose prose-gray max-w-none mb-6">
        <SimpleMarkdown content={content} />
      </div>

      {/* Exercise */}
      {lesson.exercise && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-6">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Praktische Übung
          </h4>
          <div className="text-sm text-orange-800 mb-3 whitespace-pre-line">
            {personalizeContent(lesson.exercise.instruction, enrichedAnswers)}
          </div>
          {lesson.exercise.hint && (
            <div className="bg-orange-100/50 rounded-md p-3 text-sm text-orange-700">
              <span className="font-medium">Tipp:</span>{' '}
              {personalizeContent(lesson.exercise.hint, enrichedAnswers)}
            </div>
          )}
          {lesson.exercise.exampleOutput && (
            <div className="mt-3 bg-white rounded-md p-3 text-sm text-gray-700 border border-orange-200">
              <span className="font-medium text-orange-800">Beispiel:</span>{' '}
              {personalizeContent(lesson.exercise.exampleOutput, enrichedAnswers)}
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      {lesson.checklist && lesson.checklist.length > 0 && (
        <ChecklistComponent items={lesson.checklist} answers={enrichedAnswers} />
      )}
    </div>
  )
}

/**
 * Einfacher Markdown-Renderer für den MVP
 */
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-4">
            <code>{codeContent.trim()}</code>
          </pre>
        )
        codeContent = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += line + '\n'
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />)
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-gray-900 mb-4 mt-2">
          {line.slice(2)}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold text-gray-900 mb-3 mt-6">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-gray-800 mb-2 mt-4">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    // List items
    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 mb-1">
          <span className="text-primary-500 mt-1.5 flex-shrink-0">•</span>
          <span className="text-gray-700 text-sm leading-relaxed">
            <InlineFormat text={line.slice(2)} />
          </span>
        </div>
      )
      continue
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 mb-1">
          <span className="text-primary-600 font-semibold text-sm mt-0.5 flex-shrink-0 w-5 text-right">
            {numberedMatch[1]}.
          </span>
          <span className="text-gray-700 text-sm leading-relaxed">
            <InlineFormat text={numberedMatch[2]} />
          </span>
        </div>
      )
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-700 text-sm leading-relaxed mb-2">
        <InlineFormat text={line} />
      </p>
    )
  }

  return <>{elements}</>
}

/**
 * Inline-Formatierung (Bold, Code)
 */
function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-primary-700">
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/**
 * Interaktive Checkliste
 */
function ChecklistComponent({
  items,
  answers,
}: {
  items: { id: string; text: string }[]
  answers: QuestionnaireAnswers
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Checkliste
      </h4>
      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="flex items-center gap-3 w-full text-left text-sm"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isChecked
                    ? 'bg-purple-600 border-purple-600'
                    : 'border-purple-300 hover:border-purple-400'
                }`}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`${
                  isChecked ? 'text-purple-500 line-through' : 'text-purple-900'
                }`}
              >
                {personalizeContent(item.text, answers)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-purple-500">
        {checked.size} von {items.length} erledigt
      </div>
    </div>
  )
}
