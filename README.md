# KI-Workshop Finder – MVP

Eine deutschsprachige Web-App, die Nutzern individuell zugeschnittene KI-Tool-Empfehlungen und personalisierte Onlinekurse bietet.

## Schnellstart

```bash
npm install
npm run dev
```

Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Architektur

```
src/
├── app/                    # Next.js App Router Seiten
│   ├── page.tsx            # Landingpage
│   ├── fragebogen/         # Mehrstufiger Fragebogen
│   ├── ergebnis/           # Empfehlungsseite
│   └── kurs/
│       └── [toolId]/       # Kurs-Dashboard
│           └── [moduleId]/ # Lektionsseite
├── components/
│   ├── ui/                 # Wiederverwendbare UI-Komponenten
│   ├── fragebogen/         # Fragebogen-Komponenten
│   ├── ergebnis/           # Ergebnis-Komponenten
│   └── kurs/               # Kurs-Komponenten
├── data/                   # Seed-Daten (Tools, Fragen, Kurse)
├── hooks/                  # Custom React Hooks
└── lib/                    # Logik, Typen, Utilities
```

## Tech-Stack

- **Next.js 14** mit App Router
- **TypeScript**
- **Tailwind CSS**
- **localStorage** für MVP-Datenhaltung

## Wo was anpassen?

### Neue KI-Tools hinzufügen
**Datei:** `src/data/tools.ts`

Neuen Eintrag im `aiTools`-Array anlegen mit allen Metadaten (ID, Name, Kategorie, Use-Cases, Zielrollen, etc.).

### Fragebogen-Fragen ändern
**Datei:** `src/data/questions.ts`

Schritte und Fragen im `questionnaireSteps`-Array anpassen. Jede Frage braucht eine eindeutige `id`.

### Matching-Regeln anpassen
**Datei:** `src/lib/matching.ts`

Die Gewichtung der Kriterien steht im `WEIGHTS`-Objekt. Die einzelnen Score-Funktionen können unabhängig angepasst werden.

### Kursinhalte bearbeiten
**Datei:** `src/data/courses.ts`

Die `generateCourseForTool()`-Funktion enthält alle Module und Lektionen. Template-Variablen im Format `{{variableName}}` werden mit Fragebogen-Antworten personalisiert.

**Verfügbare Template-Variablen:**
- `{{role}}` – Berufliche Rolle
- `{{industry}}` – Branche
- `{{goals}}` – Ziele mit KI
- `{{useCases}}` – Anwendungsfälle
- `{{experience}}` – Erfahrungslevel

### Styling anpassen
**Datei:** `tailwind.config.ts` – Farben, Schriften, etc.
**Datei:** `src/app/globals.css` – Globale Styles und Komponenten-Klassen

## Produktfluss

1. **Landingpage** → Nutzer erfährt den Mehrwert
2. **Fragebogen** (6 Schritte) → Erfasst Rolle, Ziele, Erfahrung, Rahmenbedingungen
3. **Ergebnisseite** → Top-Empfehlung + 2 Alternativen mit Begründung
4. **Kurs-Dashboard** → Modulübersicht mit Fortschrittsanzeige
5. **Lektionen** → Personalisierte Inhalte, Übungen, Checklisten

## Matching-Engine

Die regelbasierte Engine bewertet Tools nach gewichteten Kriterien:

| Kriterium | Gewichtung |
|-----------|-----------|
| Use-Case-Fit | 30% |
| Rolle/Branche | 15% |
| Erfahrungslevel | 15% |
| Budget | 15% |
| Datenschutz | 15% |
| Sprache | 10% |

Bereits genutzte Tools werden mit Faktor 0.7 abgewertet.

## Spätere Erweiterungen (vorbereitet)

Die Architektur ist so angelegt, dass folgende Features ergänzt werden können:

- **Login / Nutzerkonten** – localStorage durch DB ersetzen
- **LLM-basierter Recommender** – `calculateMatching()` durch API-Aufruf ergänzen
- **CMS für Tools/Kurse** – Seed-Daten durch Admin-API ersetzen
- **Zahlungsfunktion** – Stripe/Paddle-Integration
- **E-Mail-Onboarding** – Newsletter-Anbindung
- **Persistente DB** – Prisma + SQLite/PostgreSQL

## Annahmen im MVP

- Datenhaltung über localStorage (kein Backend nötig)
- Kursinhalte werden per Template-Logik personalisiert (kein LLM-Aufruf)
- 10 KI-Tools als Seed-Daten
- Generisches Kurs-Template, das für jedes Tool angepasst wird
- Keine Authentifizierung
