'use client'

import { MatchResult } from '@/lib/types'

interface ToolCardProps {
  matchResult: MatchResult
  isTopPick?: boolean
  onStartCourse: () => void
}

export default function ToolCard({ matchResult, isTopPick, onStartCourse }: ToolCardProps) {
  const { tool, score, reasons, shortTermBenefit, notSuitableFor } = matchResult

  const learningCurveLabel: Record<string, { text: string; color: string }> = {
    niedrig: { text: 'Einfach', color: 'text-green-700 bg-green-50' },
    mittel: { text: 'Mittel', color: 'text-yellow-700 bg-yellow-50' },
    hoch: { text: 'Fortgeschritten', color: 'text-orange-700 bg-orange-50' },
  }

  const curve = learningCurveLabel[tool.learningCurve] || learningCurveLabel.mittel

  return (
    <div
      className={`rounded-xl border-2 p-6 ${
        isTopPick
          ? 'border-primary-500 bg-white shadow-lg'
          : 'border-gray-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`font-bold ${isTopPick ? 'text-2xl' : 'text-xl'} text-gray-900`}>
              {tool.name}
            </h3>
            {isTopPick && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                Beste Wahl
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{tool.category}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isTopPick ? 'text-primary-600' : 'text-gray-700'}`}>
            {score}%
          </div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm leading-relaxed">{tool.description}</p>

      {/* Reasons */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Warum dieses Tool passt:</h4>
        <ul className="space-y-1">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Short-term benefit */}
      <div className="bg-accent-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-accent-800">
          <span className="font-semibold">Kurzfristiger Nutzen:</span>{' '}
          {shortTermBenefit}
        </p>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${curve.color}`}>
          Lernkurve: {curve.text}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 bg-gray-100">
          {tool.pricingModel.split(',')[0]}
        </span>
      </div>

      {/* Not suitable hint */}
      <p className="text-xs text-gray-400 mb-4">
        <span className="font-medium">Einschränkung:</span> {notSuitableFor}
      </p>

      {/* CTA */}
      <button
        onClick={onStartCourse}
        className={isTopPick ? 'btn-primary w-full' : 'btn-secondary w-full'}
      >
        Kurs starten
        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  )
}
