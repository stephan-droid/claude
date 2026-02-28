import Link from 'next/link'

const steps = [
  {
    number: '1',
    title: 'Fragebogen ausfüllen',
    description: 'Beantworten Sie in wenigen Minuten Fragen zu Ihrer Rolle, Ihren Zielen und Rahmenbedingungen.',
  },
  {
    number: '2',
    title: 'Persönliche Empfehlung',
    description: 'Unsere Matching-Engine findet das KI-Tool, das am besten zu Ihnen passt.',
  },
  {
    number: '3',
    title: 'Kurs starten',
    description: 'Starten Sie Ihren personalisierten Onlinekurs und lernen Sie das Tool Schritt für Schritt.',
  },
]

const benefits = [
  {
    title: 'Individuell zugeschnitten',
    description: 'Kein generischer Kurs, sondern exakt auf Ihre Rolle, Branche und Ziele abgestimmt.',
    icon: (
      <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: 'Sofort umsetzbar',
    description: 'Praktische Workflows, Prompt-Vorlagen und Übungen für Ihren Arbeitsalltag.',
    icon: (
      <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Fundierte Empfehlung',
    description: 'Transparente Matching-Logik statt Black Box – Sie verstehen, warum ein Tool passt.',
    icon: (
      <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Datenschutz-bewusst',
    description: 'Wir berücksichtigen Ihre DSGVO-Anforderungen und Compliance-Bedürfnisse.',
    icon: (
      <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Kostenlos starten – in 5 Minuten zur Empfehlung
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Finden Sie das{' '}
              <span className="text-primary-600">passende KI-Tool</span>{' '}
              für Ihren Arbeitsalltag
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Beantworten Sie wenige Fragen und erhalten Sie eine personalisierte Empfehlung
              mit einem maßgeschneiderten Onlinekurs – abgestimmt auf Ihre Rolle, Branche
              und Ziele.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/fragebogen" className="btn-primary text-lg px-8 py-4">
                Jetzt Fragebogen starten
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            So funktioniert es
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            In drei einfachen Schritten zum passenden KI-Tool und Ihrem personalisierten Kurs.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Warum KI-Workshop Finder?
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Keine generischen Empfehlungen – wir analysieren Ihre konkreten Anforderungen.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="card text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary-50 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Bereit, das passende KI-Tool zu finden?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Der Fragebogen dauert nur 5 Minuten. Starten Sie jetzt und erhalten Sie
            Ihre personalisierte Empfehlung.
          </p>
          <Link href="/fragebogen" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-lg hover:bg-primary-50 transition-colors duration-200">
            Fragebogen starten
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
