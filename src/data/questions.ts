import { QuestionnaireStep } from '@/lib/types'

/**
 * Fragebogen-Struktur – Seed-Daten für das MVP.
 *
 * Die Schritte und Fragen können hier einfach angepasst und erweitert werden.
 * Jede Frage hat eine ID, die als Key in den Antworten verwendet wird.
 */
export const questionnaireSteps: QuestionnaireStep[] = [
  {
    step: 1,
    title: 'Über Sie',
    description: 'Erzählen Sie uns etwas über Ihre berufliche Situation.',
    questions: [
      {
        id: 'role',
        step: 1,
        title: 'Was beschreibt Ihre berufliche Rolle am besten?',
        type: 'single',
        required: true,
        options: [
          { value: 'management', label: 'Geschäftsführung / Management' },
          { value: 'marketing', label: 'Marketing / Kommunikation' },
          { value: 'vertrieb', label: 'Vertrieb / Sales' },
          { value: 'hr', label: 'Personalwesen / HR' },
          { value: 'it', label: 'IT / Technik / Entwicklung' },
          { value: 'content', label: 'Content / Redaktion / Text' },
          { value: 'design', label: 'Design / Kreativ' },
          { value: 'beratung', label: 'Beratung / Consulting' },
          { value: 'projektmanagement', label: 'Projektmanagement' },
          { value: 'assistenz', label: 'Assistenz / Office Management' },
          { value: 'bildung', label: 'Bildung / Training' },
          { value: 'recht', label: 'Recht / Compliance' },
        ],
      },
      {
        id: 'industry',
        step: 1,
        title: 'In welcher Branche arbeiten Sie?',
        type: 'single',
        required: true,
        options: [
          { value: 'tech', label: 'IT / Software / Tech' },
          { value: 'beratung', label: 'Beratung / Consulting' },
          { value: 'agentur', label: 'Agentur / Medien / Kreativ' },
          { value: 'finanzen', label: 'Finanzen / Versicherung' },
          { value: 'gesundheit', label: 'Gesundheit / Pharma' },
          { value: 'bildung', label: 'Bildung / Forschung' },
          { value: 'handel', label: 'Handel / E-Commerce' },
          { value: 'industrie', label: 'Industrie / Fertigung' },
          { value: 'recht', label: 'Recht / Kanzlei' },
          { value: 'oeffentlich', label: 'Öffentlicher Sektor' },
          { value: 'startup', label: 'Startup / Gründung' },
          { value: 'sonstiges', label: 'Andere Branche' },
        ],
      },
      {
        id: 'teamSize',
        step: 1,
        title: 'Wie groß ist Ihr Team / Unternehmen?',
        type: 'single',
        required: true,
        options: [
          { value: 'solo', label: 'Einzelperson / Freelancer' },
          { value: 'klein', label: 'Kleines Team (2–10 Personen)' },
          { value: 'mittel', label: 'Mittelgroß (11–50 Personen)' },
          { value: 'gross', label: 'Großes Unternehmen (50+ Personen)' },
          { value: 'konzern', label: 'Konzern (500+ Personen)' },
        ],
      },
    ],
  },
  {
    step: 2,
    title: 'Ziele & Herausforderungen',
    description: 'Was möchten Sie mit KI erreichen?',
    questions: [
      {
        id: 'goals',
        step: 2,
        title: 'Welche Ziele verfolgen Sie mit KI? (Mehrfachauswahl)',
        type: 'multi',
        required: true,
        options: [
          { value: 'zeit-sparen', label: 'Zeit sparen bei Routineaufgaben' },
          { value: 'qualitaet', label: 'Qualität meiner Arbeit verbessern' },
          { value: 'kreativitaet', label: 'Kreativer arbeiten' },
          { value: 'wettbewerb', label: 'Wettbewerbsfähig bleiben' },
          { value: 'kosten', label: 'Kosten senken' },
          { value: 'innovation', label: 'Neue Geschäftsmöglichkeiten entdecken' },
          { value: 'team', label: 'Mein Team produktiver machen' },
          { value: 'lernen', label: 'KI verstehen und kompetent nutzen' },
        ],
      },
      {
        id: 'painPoints',
        step: 2,
        title: 'Was sind aktuell Ihre größten Herausforderungen? (Mehrfachauswahl)',
        type: 'multi',
        required: true,
        options: [
          { value: 'zeitfresser', label: 'Zu viel Zeit für repetitive Aufgaben' },
          { value: 'content', label: 'Schwierigkeiten bei der Content-Erstellung' },
          { value: 'recherche', label: 'Aufwändige Recherche und Informationssuche' },
          { value: 'kommunikation', label: 'E-Mails und Kommunikation kosten zu viel Zeit' },
          { value: 'daten', label: 'Datenanalyse und Reporting sind mühsam' },
          { value: 'design', label: 'Visuelle Inhalte erstellen ohne Designer' },
          { value: 'prozesse', label: 'Manuelle Prozesse, die automatisiert werden könnten' },
          { value: 'wissen', label: 'Wissensmanagement und Dokumentation' },
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'Anwendungsfälle',
    description: 'Für welche konkreten Aufgaben möchten Sie KI einsetzen?',
    questions: [
      {
        id: 'useCases',
        step: 3,
        title: 'Welche Aufgaben möchten Sie mit KI unterstützen? (Mehrfachauswahl)',
        type: 'multi',
        required: true,
        options: [
          { value: 'text', label: 'Texte schreiben (Artikel, Berichte, Zusammenfassungen)' },
          { value: 'email', label: 'E-Mails verfassen und beantworten' },
          { value: 'recherche', label: 'Recherche und Faktensuche' },
          { value: 'praesentationen', label: 'Präsentationen erstellen' },
          { value: 'bilder', label: 'Bilder und Grafiken erstellen' },
          { value: 'datenverarbeitung', label: 'Daten analysieren und auswerten' },
          { value: 'automatisierung', label: 'Arbeitsabläufe automatisieren' },
          { value: 'programmierung', label: 'Code schreiben oder verstehen' },
          { value: 'wissensmanagement', label: 'Wissen organisieren und auffindbar machen' },
          { value: 'marketing', label: 'Marketing-Kampagnen und Social Media' },
          { value: 'kreativ', label: 'Kreative Ideen und Brainstorming' },
          { value: 'uebersetzung', label: 'Übersetzungen und mehrsprachige Inhalte' },
        ],
      },
    ],
  },
  {
    step: 4,
    title: 'Erfahrung & Tools',
    description: 'Wie ist Ihr bisheriger Stand mit KI-Tools?',
    questions: [
      {
        id: 'experience',
        step: 4,
        title: 'Wie viel Erfahrung haben Sie mit KI-Tools?',
        type: 'single',
        required: true,
        options: [
          { value: 'keine', label: 'Noch keine – ich bin komplett neu' },
          { value: 'wenig', label: 'Etwas ausprobiert, aber nicht regelmäßig' },
          { value: 'mittel', label: 'Nutze bereits gelegentlich KI-Tools' },
          { value: 'viel', label: 'Nutze KI-Tools regelmäßig und intensiv' },
        ],
      },
      {
        id: 'existingTools',
        step: 4,
        title: 'Welche Tools nutzen Sie bereits? (Mehrfachauswahl, optional)',
        type: 'multi',
        required: false,
        options: [
          { value: 'chatgpt', label: 'ChatGPT' },
          { value: 'claude', label: 'Claude' },
          { value: 'copilot', label: 'Microsoft Copilot' },
          { value: 'gemini', label: 'Google Gemini' },
          { value: 'perplexity', label: 'Perplexity' },
          { value: 'notion-ai', label: 'Notion AI' },
          { value: 'canva-ai', label: 'Canva AI' },
          { value: 'midjourney', label: 'Midjourney / DALL-E' },
          { value: 'zapier-ai', label: 'Zapier / Make' },
          { value: 'keine', label: 'Noch keines' },
        ],
      },
    ],
  },
  {
    step: 5,
    title: 'Rahmenbedingungen',
    description: 'Welche Anforderungen und Präferenzen haben Sie?',
    questions: [
      {
        id: 'budget',
        step: 5,
        title: 'Welches Budget haben Sie für KI-Tools?',
        type: 'single',
        required: true,
        options: [
          { value: 'kostenlos', label: 'Nur kostenlose Tools' },
          { value: 'guenstig', label: 'Bis 20 €/Monat' },
          { value: 'mittel', label: 'Bis 50 €/Monat' },
          { value: 'hoch', label: 'Über 50 €/Monat' },
          { value: 'unternehmen', label: 'Unternehmensbudget verfügbar' },
        ],
      },
      {
        id: 'datenschutz',
        step: 5,
        title: 'Wie wichtig ist Ihnen Datenschutz / DSGVO-Konformität?',
        type: 'single',
        required: true,
        options: [
          { value: 'egal', label: 'Nicht so wichtig' },
          { value: 'wichtig', label: 'Wichtig, aber pragmatisch' },
          { value: 'sehr-wichtig', label: 'Sehr wichtig – DSGVO-Konformität nötig' },
          { value: 'kritisch', label: 'Kritisch – strenge Compliance-Anforderungen' },
        ],
      },
      {
        id: 'language',
        step: 5,
        title: 'In welcher Sprache arbeiten Sie hauptsächlich?',
        type: 'single',
        required: true,
        options: [
          { value: 'deutsch', label: 'Deutsch' },
          { value: 'englisch', label: 'Englisch' },
          { value: 'beide', label: 'Deutsch und Englisch' },
          { value: 'andere', label: 'Andere / Mehrsprachig' },
        ],
      },
    ],
  },
  {
    step: 6,
    title: 'Lernpräferenzen',
    description: 'Wie möchten Sie KI-Tools am liebsten lernen?',
    questions: [
      {
        id: 'learningIntensity',
        step: 6,
        title: 'Wie intensiv möchten Sie sich einarbeiten?',
        type: 'single',
        required: true,
        options: [
          { value: 'schnell', label: 'Schnelleinstieg – direkt loslegen' },
          { value: 'normal', label: 'Solides Fundament – Schritt für Schritt' },
          { value: 'tief', label: 'Tiefgang – alles verstehen und beherrschen' },
        ],
      },
      {
        id: 'timebudget',
        step: 6,
        title: 'Wie viel Zeit können Sie pro Woche investieren?',
        type: 'single',
        required: true,
        options: [
          { value: 'wenig', label: '1–2 Stunden pro Woche' },
          { value: 'mittel', label: '3–5 Stunden pro Woche' },
          { value: 'viel', label: 'Mehr als 5 Stunden pro Woche' },
        ],
      },
      {
        id: 'format',
        step: 6,
        title: 'Welches Lernformat bevorzugen Sie?',
        type: 'single',
        required: true,
        options: [
          { value: 'selbstlernen', label: 'Selbstlernen im eigenen Tempo' },
          { value: 'strukturiert', label: 'Strukturierter Kurs mit klarem Ablauf' },
          { value: 'praxis', label: 'Praxis zuerst – Learning by Doing' },
          { value: 'mixed', label: 'Mix aus Theorie und Praxis' },
        ],
      },
    ],
  },
]

/**
 * Gibt die Gesamtanzahl der Schritte zurück
 */
export function getTotalSteps(): number {
  return questionnaireSteps.length
}

/**
 * Gibt einen bestimmten Schritt zurück
 */
export function getStep(stepNumber: number): QuestionnaireStep | undefined {
  return questionnaireSteps.find((s) => s.step === stepNumber)
}
