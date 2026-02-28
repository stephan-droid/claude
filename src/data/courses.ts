import { CourseTemplate } from '@/lib/types'

/**
 * Kurs-Templates – Seed-Daten für das MVP.
 *
 * Die Kursinhalte nutzen Template-Variablen ({{variableName}}),
 * die zur Laufzeit mit den Fragebogen-Antworten personalisiert werden.
 *
 * Verfügbare Variablen:
 * - {{role}} – Berufliche Rolle des Nutzers
 * - {{industry}} – Branche
 * - {{goals}} – Ziele mit KI
 * - {{useCases}} – Gewünschte Anwendungsfälle
 * - {{experience}} – Erfahrungslevel
 * - {{toolName}} – Name des empfohlenen Tools
 */

const roleLabels: Record<string, string> = {
  management: 'Geschäftsführung / Management',
  marketing: 'Marketing / Kommunikation',
  vertrieb: 'Vertrieb / Sales',
  hr: 'Personalwesen / HR',
  it: 'IT / Technik',
  content: 'Content / Redaktion',
  design: 'Design / Kreativ',
  beratung: 'Beratung / Consulting',
  projektmanagement: 'Projektmanagement',
  assistenz: 'Assistenz / Office',
  bildung: 'Bildung / Training',
  recht: 'Recht / Compliance',
}

export { roleLabels }

/**
 * Generisches Kurs-Template, das für jedes Tool personalisiert wird.
 * Die tool-spezifischen Anpassungen erfolgen über die Variablen.
 */
export function generateCourseForTool(toolId: string, toolName: string): CourseTemplate {
  return {
    toolId,
    modules: [
      {
        id: 'intro',
        title: 'Einführung: Warum dieses Tool zu Ihnen passt',
        description: `Erfahren Sie, warum ${toolName} die beste Wahl für Ihre Bedürfnisse ist.`,
        order: 1,
        estimatedMinutes: 15,
        lessons: [
          {
            id: 'intro-1',
            title: 'Willkommen zu Ihrem personalisierten Kurs',
            type: 'text',
            content: `# Willkommen zu Ihrem ${toolName}-Kurs!\n\nDieser Kurs wurde speziell für Sie zusammengestellt – basierend auf Ihren Angaben im Bedarfsfragebogen.\n\n**Ihre Rolle:** {{role}}\n**Ihre Branche:** {{industry}}\n**Ihre Ziele:** {{goals}}\n\n## Warum ${toolName}?\n\nBasierend auf Ihren Anwendungsfällen ({{useCases}}) und Ihrem Erfahrungslevel ist ${toolName} die optimale Wahl für Sie. In diesem Kurs lernen Sie Schritt für Schritt, wie Sie das Tool effektiv in Ihrem Arbeitsalltag einsetzen.\n\n## Was Sie in diesem Kurs lernen\n\n- Wie Sie ${toolName} einrichten und konfigurieren\n- Die wichtigsten Grundlagen und Konzepte\n- Konkrete Workflows für Ihre Rolle\n- Praktische Prompt-Techniken und Vorlagen\n- Tipps für den täglichen Einsatz\n- Datenschutz und Best Practices`,
            templateVars: ['role', 'industry', 'goals', 'useCases'],
          },
          {
            id: 'intro-2',
            title: 'So nutzen Sie diesen Kurs optimal',
            type: 'checklist',
            content: `# So nutzen Sie diesen Kurs optimal\n\nDieser Kurs ist modular aufgebaut. Sie können die Module in der vorgegebenen Reihenfolge durcharbeiten oder direkt zu den für Sie relevantesten Themen springen.\n\n**Empfehlung basierend auf Ihrem Zeitbudget:**\n- Arbeiten Sie pro Woche 1-2 Module durch\n- Setzen Sie die Übungen direkt in Ihrem Arbeitsalltag um\n- Nutzen Sie die Checklisten zur Selbstkontrolle`,
            checklist: [
              { id: 'cl-1', text: `${toolName} Account erstellt / Zugang eingerichtet` },
              { id: 'cl-2', text: 'Ersten Anwendungsfall für meinen Arbeitsalltag identifiziert' },
              { id: 'cl-3', text: 'Zeitslot für regelmäßiges Lernen im Kalender geblockt' },
            ],
          },
        ],
      },
      {
        id: 'setup',
        title: 'Setup & Einstieg',
        description: `${toolName} einrichten und erste Schritte machen.`,
        order: 2,
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'setup-1',
            title: 'Account erstellen und einrichten',
            type: 'text',
            content: `# ${toolName} einrichten\n\n## Schritt 1: Account erstellen\n\nBesuchen Sie die Website von ${toolName} und erstellen Sie einen Account. Für den Einstieg genügt die kostenlose Version.\n\n## Schritt 2: Grundeinstellungen\n\nNach der Registrierung sollten Sie folgende Einstellungen prüfen:\n\n1. **Sprache:** Stellen Sie die Benutzeroberfläche auf Deutsch (falls verfügbar)\n2. **Datenschutz:** Prüfen Sie die Datenschutzeinstellungen\n3. **Profil:** Vervollständigen Sie Ihr Profil\n\n## Schritt 3: Erste Orientierung\n\nMachen Sie sich mit der Benutzeroberfläche vertraut:\n- Wo starte ich eine neue Konversation / ein neues Projekt?\n- Wo finde ich meine bisherigen Arbeiten?\n- Welche Einstellungen gibt es?`,
          },
          {
            id: 'setup-2',
            title: 'Die richtige Version wählen',
            type: 'text',
            content: `# Die richtige Version von ${toolName}\n\nJe nach Ihrem Budget und Ihren Anforderungen empfehlen wir:\n\n## Für den Einstieg\nStarten Sie mit der kostenlosen Version. So können Sie das Tool ohne Risiko testen und herausfinden, ob es zu Ihnen passt.\n\n## Für den professionellen Einsatz\nWenn Sie ${toolName} regelmäßig beruflich nutzen, lohnt sich ein Upgrade auf die bezahlte Version. Die Vorteile:\n- Höhere Nutzungslimits\n- Erweiterte Funktionen\n- Bessere Leistung\n- Oft besserer Datenschutz\n\n**Tipp:** Viele Tools bieten eine Testphase für Premium-Features an. Nutzen Sie diese, bevor Sie sich festlegen.`,
          },
        ],
      },
      {
        id: 'grundlagen',
        title: 'Grundlagen',
        description: `Die wichtigsten Konzepte und Funktionen von ${toolName} verstehen.`,
        order: 3,
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'grundlagen-1',
            title: 'Kernkonzepte verstehen',
            type: 'text',
            content: `# Kernkonzepte von ${toolName}\n\n## Wie KI-Tools arbeiten\n\nModerne KI-Tools wie ${toolName} basieren auf großen Sprachmodellen (Large Language Models). Das bedeutet:\n\n- **Kontextverständnis:** Das Tool versteht den Zusammenhang Ihrer Anfragen\n- **Generative Fähigkeiten:** Es kann neue Inhalte erstellen, nicht nur vorhandene suchen\n- **Lernfähigkeit im Gespräch:** Innerhalb einer Konversation kann das Tool auf vorherige Nachrichten aufbauen\n\n## Was ${toolName} besonders gut kann\n\n- Texte verstehen, zusammenfassen und generieren\n- Fragen beantworten und Informationen aufbereiten\n- Bei kreativen und analytischen Aufgaben unterstützen\n- Strukturierte Ausgaben erstellen\n\n## Wichtige Grenzen\n\n- KI kann Fehler machen (Halluzinationen)\n- Ergebnisse sollten immer geprüft werden\n- Vertrauliche Daten mit Bedacht eingeben\n- KI ersetzt kein Fachwissen, sie ergänzt es`,
          },
          {
            id: 'grundlagen-2',
            title: 'Die Benutzeroberfläche im Detail',
            type: 'text',
            content: `# Die ${toolName}-Oberfläche meistern\n\n## Hauptbereiche\n\n1. **Eingabefeld:** Hier geben Sie Ihre Anfragen (Prompts) ein\n2. **Ausgabebereich:** Hier erscheinen die Antworten\n3. **Verlauf:** Ihre bisherigen Konversationen\n4. **Einstellungen:** Konfiguration und Personalisierung\n\n## Tipps für effizientes Arbeiten\n\n- Nutzen Sie neue Konversationen für neue Themen\n- Benennen Sie wichtige Konversationen aussagekräftig\n- Speichern Sie hilfreiche Ergebnisse extern\n- Experimentieren Sie mit verschiedenen Formulierungen`,
          },
          {
            id: 'grundlagen-3',
            title: 'Grundlagen-Quiz',
            type: 'exercise',
            content: '# Überprüfen Sie Ihr Wissen\n\nBeantworten Sie für sich die folgenden Fragen, um Ihr Verständnis der Grundlagen zu überprüfen.',
            exercise: {
              instruction: `Öffnen Sie ${toolName} und führen Sie folgende Aufgaben durch:\n\n1. Starten Sie eine neue Konversation\n2. Stellen Sie dem Tool eine Frage zu Ihrem Fachgebiet\n3. Bitten Sie das Tool, die Antwort als Stichpunkte zusammenzufassen\n4. Geben Sie Feedback zur Antwort und bitten Sie um eine Verbesserung\n\nNotieren Sie sich, was gut funktioniert hat und was nicht.`,
              hint: 'Seien Sie möglichst spezifisch in Ihren Anfragen. Je klarer Ihre Frage, desto besser die Antwort.',
              exampleOutput: 'Beispiel: "Fasse mir die 5 wichtigsten Trends im Bereich [Ihre Branche] für 2025 als Stichpunkte zusammen, jeweils mit einem Satz Erklärung."',
            },
          },
        ],
      },
      {
        id: 'prompting',
        title: 'Effektives Prompting',
        description: 'Lernen Sie, wie Sie die besten Ergebnisse aus KI-Tools herausholen.',
        order: 4,
        estimatedMinutes: 35,
        lessons: [
          {
            id: 'prompting-1',
            title: 'Grundlagen des Prompt-Designs',
            type: 'text',
            content: `# Prompt-Design: So kommunizieren Sie effektiv mit ${toolName}\n\nEin Prompt ist Ihre Anweisung an das KI-Tool. Die Qualität Ihrer Ergebnisse hängt direkt von der Qualität Ihrer Prompts ab.\n\n## Die 5 Elemente eines guten Prompts\n\n### 1. Rolle\nGeben Sie dem Tool eine Rolle: "Du bist ein erfahrener Marketing-Experte..."\n\n### 2. Aufgabe\nBeschreiben Sie klar, was getan werden soll: "Erstelle einen Entwurf für..."\n\n### 3. Kontext\nLiefern Sie Hintergrund: "Für ein mittelständisches Unternehmen in der {{industry}}-Branche..."\n\n### 4. Format\nDefinieren Sie das gewünschte Ergebnis: "Als Tabelle mit 3 Spalten..."\n\n### 5. Einschränkungen\nSetzen Sie Grenzen: "Maximal 200 Wörter, in einfacher Sprache..."`,
            templateVars: ['industry'],
          },
          {
            id: 'prompting-2',
            title: 'Prompt-Vorlagen für Ihre Rolle',
            type: 'template',
            content: `# Prompt-Vorlagen für {{role}}\n\nHier finden Sie fertige Prompt-Vorlagen, die Sie direkt einsetzen können.\n\n## Vorlage 1: Zusammenfassung\n\`\`\`\nFasse den folgenden Text für eine Person in der Rolle {{role}} zusammen. Fokussiere auf die wichtigsten Handlungsempfehlungen und relevanten Fakten. Maximal 5 Stichpunkte.\n\n[Text hier einfügen]\n\`\`\`\n\n## Vorlage 2: E-Mail-Entwurf\n\`\`\`\nSchreibe eine professionelle E-Mail als {{role}} in der {{industry}}-Branche.\nThema: [Thema]\nTon: professionell, aber freundlich\nLänge: maximal 150 Wörter\n\`\`\`\n\n## Vorlage 3: Brainstorming\n\`\`\`\nIch arbeite als {{role}} und suche nach Ideen für [Thema]. Generiere 10 kreative Ansätze, die ich in meinem Arbeitsalltag umsetzen kann. Berücksichtige dabei die Besonderheiten der {{industry}}-Branche.\n\`\`\`\n\n## Vorlage 4: Analyse\n\`\`\`\nAnalysiere die folgenden Daten/Informationen aus der Perspektive einer Person in der {{role}}-Funktion. Identifiziere:\n- Die 3 wichtigsten Erkenntnisse\n- Mögliche Risiken\n- Konkrete nächste Schritte\n\n[Daten hier einfügen]\n\`\`\``,
            templateVars: ['role', 'industry'],
          },
          {
            id: 'prompting-3',
            title: 'Fortgeschrittene Techniken',
            type: 'text',
            content: `# Fortgeschrittene Prompt-Techniken\n\n## Chain of Thought\nBitten Sie das Tool, Schritt für Schritt zu denken:\n"Denke Schritt für Schritt nach und erkläre deinen Denkprozess."\n\n## Few-Shot-Prompting\nGeben Sie Beispiele, um das gewünschte Format zu zeigen:\n"Hier sind 2 Beispiele für das gewünschte Ergebnis: [Beispiel 1], [Beispiel 2]. Erstelle nun ein ähnliches Ergebnis für..."\n\n## Iteratives Verfeinern\nVerbessern Sie Ergebnisse schrittweise:\n1. Erster Prompt → erstes Ergebnis\n2. "Überarbeite das Ergebnis und füge mehr Details zu X hinzu"\n3. "Kürze den Text auf die Hälfte, behalte die Kernaussagen"\n\n## Persona-Technik\nKombinieren Sie Rollen für bessere Ergebnisse:\n"Du bist gleichzeitig ein erfahrener Texter und ein Experte für die {{industry}}-Branche. Bewerte den folgenden Text..."`,
            templateVars: ['industry'],
          },
        ],
      },
      {
        id: 'workflows',
        title: 'Konkrete Workflows für Ihren Arbeitsalltag',
        description: 'Praktische Arbeitsabläufe, die Sie sofort umsetzen können.',
        order: 5,
        estimatedMinutes: 40,
        lessons: [
          {
            id: 'workflows-1',
            title: 'Workflow 1: Tägliche Assistenz',
            type: 'text',
            content: `# Workflow: ${toolName} als täglicher Arbeitsassistent\n\n## Für Ihre Rolle als {{role}}\n\nSo integrieren Sie ${toolName} in Ihren täglichen Arbeitsablauf:\n\n### Morgen-Routine (10 Min.)\n1. Öffnen Sie ${toolName}\n2. Geben Sie eine kurze Zusammenfassung Ihrer heutigen Aufgaben ein\n3. Bitten Sie um Priorisierungsvorschläge\n4. Lassen Sie sich E-Mail-Entwürfe für wichtige Nachrichten erstellen\n\n### Bei Bedarf zwischendurch\n- Schnelle Recherche zu Fachthemen\n- Texte zusammenfassen\n- Ideen für Problemlösungen generieren\n- Protokolle und Notizen aufbereiten\n\n### Abend-Routine (5 Min.)\n- Tagesergebnisse zusammenfassen lassen\n- Aufgaben für morgen strukturieren`,
            templateVars: ['role'],
          },
          {
            id: 'workflows-2',
            title: 'Workflow 2: Content-Erstellung',
            type: 'text',
            content: `# Workflow: Content-Erstellung mit ${toolName}\n\n## Schritt 1: Themenrecherche\nFragen Sie das Tool nach relevanten Themen für Ihre {{industry}}-Branche.\n\n**Prompt:**\n"Welche Themen sind aktuell besonders relevant für {{role}} in der {{industry}}-Branche? Erstelle eine Liste mit 10 Content-Ideen."\n\n## Schritt 2: Gliederung erstellen\n"Erstelle eine Gliederung für einen Artikel zum Thema [gewähltes Thema]. Zielgruppe: Fachpublikum in der {{industry}}-Branche."\n\n## Schritt 3: Ersten Entwurf schreiben\n"Schreibe basierend auf der Gliederung einen ersten Entwurf. Ton: professionell, Länge: ca. 800 Wörter."\n\n## Schritt 4: Überarbeiten\n"Überarbeite den Text: Kürze redundante Stellen, stärke die Kernaussagen, füge ein konkretes Beispiel hinzu."\n\n## Schritt 5: Finalisieren\nLesen Sie den Text selbst durch, ergänzen Sie Ihr Fachwissen und finalisieren Sie den Inhalt.`,
            templateVars: ['role', 'industry'],
          },
          {
            id: 'workflows-3',
            title: 'Workflow 3: Analyse & Entscheidungshilfe',
            type: 'text',
            content: `# Workflow: Analyse und Entscheidungsunterstützung\n\n## Für {{role}} in der {{industry}}-Branche\n\n### Szenario: Sie müssen eine Entscheidung vorbereiten\n\n**Schritt 1: Situation beschreiben**\n"Ich muss als {{role}} eine Entscheidung treffen zu [Thema]. Hier sind die relevanten Fakten: [Fakten]"\n\n**Schritt 2: Pro-Contra-Analyse**\n"Erstelle eine Pro-Contra-Analyse für die Optionen A und B. Berücksichtige dabei: Kosten, Zeitaufwand, Risiken, und langfristigen Nutzen."\n\n**Schritt 3: Empfehlung einholen**\n"Basierend auf der Analyse: Welche Option würdest du empfehlen und warum? Welche Risiken sollte ich besonders beachten?"\n\n**Schritt 4: Präsentation vorbereiten**\n"Erstelle eine Zusammenfassung der Analyse als Vorlage für eine Entscheidungsvorlage / Präsentation."`,
            templateVars: ['role', 'industry'],
          },
          {
            id: 'workflows-4',
            title: 'Praxis-Übung: Eigener Workflow',
            type: 'exercise',
            content: '# Erstellen Sie Ihren eigenen Workflow',
            exercise: {
              instruction: `Entwickeln Sie einen eigenen ${toolName}-Workflow für eine Aufgabe, die Sie regelmäßig erledigen:\n\n1. Wählen Sie eine wiederkehrende Aufgabe aus Ihrem Arbeitsalltag\n2. Teilen Sie sie in 3–5 Schritte auf\n3. Formulieren Sie für jeden Schritt einen passenden Prompt\n4. Testen Sie den Workflow einmal komplett durch\n5. Notieren Sie, was gut funktioniert und was verbessert werden kann`,
              hint: 'Wählen Sie eine Aufgabe, die Sie mindestens einmal pro Woche erledigen – dort ist der Zeitgewinn am größten.',
            },
          },
        ],
      },
      {
        id: 'uebungen',
        title: 'Praktische Übungen',
        description: 'Festigen Sie Ihr Wissen mit gezielten Übungsaufgaben.',
        order: 6,
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'uebungen-1',
            title: 'Übung 1: E-Mail-Assistent',
            type: 'exercise',
            content: '# Übung: E-Mail-Assistent einrichten',
            exercise: {
              instruction: `Nutzen Sie ${toolName}, um drei typische E-Mails für Ihren Arbeitsalltag als {{role}} zu erstellen:\n\n1. Eine Antwort auf eine Kundenanfrage\n2. Eine interne Status-Update-Mail an Ihr Team\n3. Eine höfliche Absage oder Terminverschiebung\n\nVergleichen Sie die Ergebnisse mit Ihren üblichen E-Mails.`,
              hint: 'Geben Sie dem Tool den gewünschten Ton vor (z.B. "professionell, aber warmherzig") und eine maximale Länge.',
              exampleOutput: 'Beispiel-Prompt: "Schreibe eine professionelle Antwort auf die folgende Kundenanfrage. Ton: freundlich und lösungsorientiert. Maximal 100 Wörter."',
            },
            templateVars: ['role'],
          },
          {
            id: 'uebungen-2',
            title: 'Übung 2: Zusammenfassung',
            type: 'exercise',
            content: '# Übung: Texte zusammenfassen',
            exercise: {
              instruction: `Suchen Sie einen aktuellen Fachartikel aus der {{industry}}-Branche und lassen Sie ihn von ${toolName} zusammenfassen:\n\n1. Kopieren Sie den Artikel (oder einen Abschnitt)\n2. Bitten Sie um eine Zusammenfassung in 5 Stichpunkten\n3. Bitten Sie um eine Version für verschiedene Zielgruppen (z.B. Management, Fachteam)\n4. Vergleichen Sie die Versionen`,
              hint: 'Je länger der Originaltext, desto wertvoller wird die Zusammenfassungsfunktion.',
            },
            templateVars: ['industry'],
          },
          {
            id: 'uebungen-3',
            title: 'Übung 3: Kreatives Problemlösen',
            type: 'exercise',
            content: '# Übung: KI als Sparringspartner',
            exercise: {
              instruction: `Nutzen Sie ${toolName} als Sparringspartner für ein aktuelles berufliches Problem:\n\n1. Beschreiben Sie ein konkretes Problem aus Ihrem Arbeitsalltag\n2. Bitten Sie um 5 unkonventionelle Lösungsansätze\n3. Diskutieren Sie den vielversprechendsten Ansatz im Detail\n4. Lassen Sie einen Aktionsplan erstellen\n\nDokumentieren Sie den gesamten Dialog und bewerten Sie die Qualität der Vorschläge.`,
              hint: 'Seien Sie offen für ungewöhnliche Vorschläge – der Wert liegt oft in der neuen Perspektive.',
            },
          },
        ],
      },
      {
        id: 'fehler',
        title: 'Typische Fehler vermeiden',
        description: 'Lernen Sie aus häufigen Anfängerfehlern und werden Sie souveräner.',
        order: 7,
        estimatedMinutes: 15,
        lessons: [
          {
            id: 'fehler-1',
            title: 'Die 10 häufigsten Fehler',
            type: 'text',
            content: `# Die 10 häufigsten Fehler bei der Nutzung von ${toolName}\n\n## 1. Zu vage Prompts\n**Falsch:** "Schreib mir was über Marketing."\n**Besser:** "Erstelle 5 Social-Media-Post-Ideen für ein {{industry}}-Unternehmen auf LinkedIn. Ziel: Thought Leadership."\n\n## 2. Keine Iteration\nDie erste Antwort ist selten perfekt. Verfeinern Sie Ihre Anfragen.\n\n## 3. Blind vertrauen\nÜberprüfen Sie Fakten, Zahlen und Quellenangaben immer.\n\n## 4. Sensible Daten eingeben\nGeben Sie keine vertraulichen Kunden-, Personal- oder Finanzdaten ein.\n\n## 5. Keine Rolle vorgeben\nMit einer definierten Rolle liefert das Tool deutlich bessere Ergebnisse.\n\n## 6. Zu lange Konversationen\nStarten Sie für neue Themen eine neue Konversation.\n\n## 7. Kontext vergessen\nGeben Sie relevanten Kontext immer mit an.\n\n## 8. Format nicht definieren\nSagen Sie dem Tool, in welchem Format Sie die Antwort wollen.\n\n## 9. KI als alleinige Quelle nutzen\nKI ist ein Werkzeug, kein Ersatz für Ihr Fachwissen.\n\n## 10. Nicht experimentieren\nProbieren Sie verschiedene Formulierungen – kleine Änderungen können große Wirkung haben.`,
            templateVars: ['industry'],
          },
        ],
      },
      {
        id: 'datenschutz',
        title: 'Datenschutz & Best Practices',
        description: 'Sicherer und verantwortungsvoller Umgang mit KI-Tools im Beruf.',
        order: 8,
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'datenschutz-1',
            title: 'Datenschutz-Grundregeln',
            type: 'text',
            content: `# Datenschutz bei der Nutzung von ${toolName}\n\n## Goldene Regeln\n\n### 1. Keine sensiblen Daten eingeben\n- Keine Kundennamen oder -daten\n- Keine Personaldaten\n- Keine vertraulichen Finanzdaten\n- Keine Geschäftsgeheimnisse\n\n### 2. Datenschutzeinstellungen nutzen\n- Prüfen Sie, ob Ihre Eingaben für Trainingszwecke genutzt werden\n- Deaktivieren Sie die Trainingsdaten-Nutzung, wenn möglich\n- Nutzen Sie den Enterprise-/Team-Plan für besseren Datenschutz\n\n### 3. DSGVO beachten\n- Personenbezogene Daten nicht in KI-Tools eingeben\n- Interne Richtlinien für KI-Nutzung erstellen/befolgen\n- Auftragsverarbeitungsvertrag (AVV) prüfen bei Team-/Enterprise-Nutzung\n\n### 4. Unternehmensrichtlinien\n- Klären Sie mit Ihrer IT-Abteilung, welche Tools zugelassen sind\n- Halten Sie sich an bestehende Datenschutzrichtlinien\n- Dokumentieren Sie, welche KI-Tools Sie wofür nutzen`,
          },
          {
            id: 'datenschutz-2',
            title: 'Datenschutz-Checkliste',
            type: 'checklist',
            content: '# Datenschutz-Checkliste für den KI-Einsatz',
            checklist: [
              { id: 'ds-1', text: 'Datenschutzeinstellungen des Tools geprüft' },
              { id: 'ds-2', text: 'Trainingsdaten-Opt-out aktiviert (wenn verfügbar)' },
              { id: 'ds-3', text: 'Interne Richtlinien zur KI-Nutzung gelesen/erstellt' },
              { id: 'ds-4', text: 'Kolleg:innen über sichere Nutzung informiert' },
              { id: 'ds-5', text: 'Keine sensiblen Daten in Prompts verwendet' },
              { id: 'ds-6', text: 'Auftragsverarbeitungsvertrag geprüft (bei Team-Nutzung)' },
            ],
          },
        ],
      },
      {
        id: 'plan30',
        title: '30-Tage-Anwendungsplan',
        description: 'Ein strukturierter Plan für Ihre ersten 30 Tage mit dem Tool.',
        order: 9,
        estimatedMinutes: 15,
        lessons: [
          {
            id: 'plan30-1',
            title: 'Ihr 30-Tage-Plan',
            type: 'text',
            content: `# Ihr 30-Tage-Plan mit ${toolName}\n\n## Woche 1: Kennenlernen\n- **Tag 1–2:** Account einrichten, Oberfläche erkunden\n- **Tag 3–4:** Erste einfache Aufgaben (E-Mails, Zusammenfassungen)\n- **Tag 5–7:** Prompt-Techniken aus dem Kurs ausprobieren\n\n## Woche 2: Integration\n- **Tag 8–10:** ${toolName} für eine regelmäßige Aufgabe nutzen\n- **Tag 11–12:** Eigene Prompt-Vorlagen erstellen und speichern\n- **Tag 13–14:** Zeitersparnis messen und dokumentieren\n\n## Woche 3: Vertiefung\n- **Tag 15–17:** Fortgeschrittene Techniken testen\n- **Tag 18–19:** Workflow für Ihre wichtigste Aufgabe als {{role}} optimieren\n- **Tag 20–21:** Kolleg:innen die besten Tricks zeigen\n\n## Woche 4: Optimierung\n- **Tag 22–24:** Weitere Anwendungsfälle identifizieren\n- **Tag 25–27:** Eigene Best Practices dokumentieren\n- **Tag 28–30:** Bilanz ziehen, nächste Lernziele setzen\n\n## Erfolgsmessung\n- Wie viel Zeit sparen Sie pro Woche?\n- Welche Aufgaben gelingen besser mit KI?\n- Wo sehen Sie weiteres Potenzial?`,
            templateVars: ['role'],
          },
        ],
      },
      {
        id: 'abschluss',
        title: 'Abschluss & nächste Schritte',
        description: 'Zusammenfassung und Ausblick auf Ihre KI-Reise.',
        order: 10,
        estimatedMinutes: 10,
        lessons: [
          {
            id: 'abschluss-1',
            title: 'Zusammenfassung und Ausblick',
            type: 'text',
            content: `# Herzlichen Glückwunsch!\n\nSie haben den ${toolName}-Kurs abgeschlossen. Hier eine Zusammenfassung, was Sie gelernt haben:\n\n## Was Sie jetzt können\n- ${toolName} sicher einrichten und nutzen\n- Effektive Prompts formulieren\n- Das Tool in Ihren Arbeitsalltag als {{role}} integrieren\n- Datenschutz und Best Practices beachten\n\n## Nächste Schritte\n1. **Dranbleiben:** Nutzen Sie den 30-Tage-Plan als Leitfaden\n2. **Vertiefen:** Experimentieren Sie mit fortgeschrittenen Techniken\n3. **Teilen:** Zeigen Sie Ihrem Team, wie sie ebenfalls von ${toolName} profitieren können\n4. **Erweitern:** Entdecken Sie weitere KI-Tools für andere Anwendungsfälle\n\n## Bleiben Sie am Ball\nDie KI-Landschaft entwickelt sich rasant weiter. Planen Sie regelmäßig Zeit ein, um neue Features und Möglichkeiten zu entdecken.\n\n**Viel Erfolg bei Ihrer KI-Reise!**`,
            templateVars: ['role'],
          },
          {
            id: 'abschluss-2',
            title: 'Abschluss-Checkliste',
            type: 'checklist',
            content: '# Abschluss-Checkliste',
            checklist: [
              { id: 'ab-1', text: 'Account eingerichtet und konfiguriert' },
              { id: 'ab-2', text: 'Mindestens 3 Prompt-Vorlagen erstellt' },
              { id: 'ab-3', text: 'Einen eigenen Workflow entwickelt' },
              { id: 'ab-4', text: '30-Tage-Plan gestartet' },
              { id: 'ab-5', text: 'Datenschutz-Einstellungen geprüft' },
              { id: 'ab-6', text: 'Erstes konkretes Ergebnis mit KI-Unterstützung erzielt' },
            ],
          },
        ],
      },
    ],
  }
}

/**
 * Gibt die verfügbaren Kurs-Templates für ein Tool zurück
 */
export function getCourseForTool(toolId: string, toolName: string): CourseTemplate {
  return generateCourseForTool(toolId, toolName)
}
