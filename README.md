# FitFlow

Mobile-first Web-App fuer persoenliche Trainingsprogramme mit Tagesauswahl, generierten Uebungsbildern, Fortschrittskalender und flexiblen Timern.

## Features

**Neu in 2.2**
- Comeback-Modus: erkennt Trainingspausen ab 14 Tagen, startet mit 90/80/70 % und führt in größeren Schritten zurück zum alten Niveau
- Gefühl pro Satz (leicht/passt/hart), fließt in den Steigerungsvorschlag ein
- Scheibenrechner pro Seite, Stange und vorhandene Scheiben einstellbar
- Kraftkurve mit geschätztem 1RM (Epley), Top-Gewicht und Volumen
- Muskel-Heatmap (vorne/hinten) mit Sätzen pro Muskel und Hinweis auf vernachlässigte Muskeln
- Supersätze: Übungen im Editor verbinden, im Training abwechselnd ohne Pause
- Körperwerte: Gewicht und Umfänge mit Verlauf
- Teilbare Trainings-Karte als Bild nach dem Training
- Wochen-Duell René vs. Connie mit gemeinsamem Ziel
- Trainings-Erinnerungen als wiederkehrende Kalendertermine mit Alarm

- Satz-Log: Gewicht und Wiederholungen pro Satz, vorbefuellt mit dem letzten Mal
- Steigerungs-Vorschlag (doppelte Progression) und automatische Rekord-Erkennung
- Uebungs-Verlauf mit Diagramm, Bestwerten und letzten Einheiten
- Trainingsuebersicht vor dem Start mit geschaetzter Dauer und letzten Werten
- Wochenziel, Volumen-Statistik, Backup speichern/laden

- Auswahl zwischen Connie und Rene
- Drei Trainingstage pro Programm
- Mobile optimierte Trainingsansicht
- Einheitliche WebP-Bilder fuer Warm-up, Kraft, Core, Cardio und Cooldown
- Start- und Endpositionen fuer dynamische Kraft- und Core-Uebungen
- Fortschrittskalender mit Wochenwert und Trainingsserie
- Uebungen werden manuell als erledigt markiert
- Einstellbare Satz- und Uebungstimer mit Tonsignalen
- Eigene Programme und Videoverknuepfungen
- Ruhiges Design mit Archivo-Schrift (selbst gehostet, offline verfuegbar)
- Fluessige Uebungsanimationen (Vektor-Figur mit IK, 60 fps) fuer alle Uebungen, mit Atem-/Bewegungshinweisen und markierter Muskulatur
- Pruefansicht aller Animationen unter /?figures
- Statistik: Wochendiagramm (Trainings, Minuten, Saetze), Wochen in Folge, letzte Trainings
- Dark Mode (automatisch, hell oder dunkel umschaltbar)
- Trainingsansicht mit Timer-Ring, Satzanzeige und Vorschau auf die naechste Uebung
- Gesamtzeit laeuft automatisch mit, Zusammenfassung nach dem Training
- Timer laufen auch korrekt weiter, wenn das Handy kurz gesperrt ist
- Vite/React Deployment fuer Vercel

## Start

```bash
npm install
npm run dev
```
