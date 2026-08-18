# Weinakademie Rickenbach – Deploy-Anleitung (Netlify)

Interaktive Lernplattform mit einer **zentralen Mediathek**: Besucher können eigene
YouTube-Videos (mit Gebiet/Segment) und Lese-Quellen hinzufügen. Die Einträge werden
über eine **Netlify-Function** in **Netlify Blobs** gespeichert und sind sofort **für alle sichtbar**.

## Was ist drin?

```
index.html                     – die komplette Website (ein File)
netlify/functions/media.mjs    – Serverless-Funktion (GET/POST/DELETE) für die Mediathek
netlify.toml                   – Netlify-Konfiguration
package.json                   – Abhängigkeit @netlify/blobs
```

## Wichtig: Warum nicht per Drag-&-Drop?

Die zentrale Speicherung braucht die Netlify-Function. Damit Netlify die Funktion baut
und die Abhängigkeit installiert, muss die Seite **über ein Git-Repo (Build)** deployt werden –
nicht über den einfachen „Drop"-Upload. Das ist einmalig etwas mehr Aufwand, danach genügt
ein `git push`, um Änderungen zu veröffentlichen.

## Schritt für Schritt

### 1. Repo anlegen
- Auf GitHub ein neues Repository erstellen (Visibility: **Private** empfohlen; Public geht auch).
- „Add README", „.gitignore" und „license" beim Erstellen **leer lassen** – so entsteht ein leeres Repo.
- Den **gesamten Inhalt dieses Ordners** ins Repo laden (index.html, netlify/, netlify.toml, package.json).
  - Ohne Git-Kenntnisse: Im Repo „Add file → Upload files" und Dateien inkl. Unterordner hochladen.

### 2. Mit Netlify verbinden
- In Netlify: **Add new site → Import an existing project** → dein Repo wählen.
- Build-Einstellungen: **Build command** leer lassen, **Publish directory** = `.`
  (die `netlify.toml` setzt das ohnehin schon richtig). **Deploy** klicken.
- Netlify installiert automatisch `@netlify/blobs` und veröffentlicht die Funktion.

### 3. Netlify Blobs aktivieren
- In der Regel ist **Blobs automatisch aktiv**. Falls die Mediathek nicht speichert:
  Site → **Configuration → Blobs** (bzw. „Data") prüfen. Es ist keine externe Datenbank nötig.

### 4. Admin-Passwort setzen (zum Löschen)
- Site → **Configuration → Environment variables** → neue Variable:
  - **Key:** `ADMIN_TOKEN`
  - **Value:** ein Passwort deiner Wahl (z. B. `Rickenbach2026!`)
- Danach **einmal neu deployen** (Deploys → Trigger deploy), damit die Variable aktiv wird.
- Auf der Seite: Mediathek → unten **„🔧 Admin-Modus"** → Passwort eingeben → jetzt erscheinen
  die Lösch-Buttons (✕) auf den Community-Einträgen. Das Löschen gilt zentral für alle.
- Ohne gesetztes `ADMIN_TOKEN` ist das Löschen offen (nicht empfohlen für den öffentlichen Betrieb).

### 5. Fertig
- Deine Seite läuft z. B. unter `dein-name.netlify.app` (Name änderbar unter Site configuration).
- Neue Videos/Quellen, die jemand hinzufügt, sind sofort für alle Besucher sichtbar.

## Lokal testen (optional, für Entwickler)
```
npm install
npx netlify dev
```
Dann `http://localhost:8888` öffnen. `netlify dev` stellt Blobs lokal bereit.

## Hinweise
- Der Lernfortschritt (Quiz, Level, Badges) wird bewusst pro Sitzung gehalten – nur die Mediathek ist zentral.
- Die Funktion validiert Eingaben (gültige YouTube-ID bzw. http-Link, Längenbegrenzung) und kappt die Liste bei 500 Einträgen.
- API-Endpunkt: `/.netlify/functions/media` (auch als `/api/media` erreichbar).
