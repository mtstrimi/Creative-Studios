# Content Kalender – Agentur-Dashboard

Individuelles Planungs-Dashboard, das Notion nur als Datenquelle nutzt.
Layout: fester Header, feste Kunden-Sidebar links, drei nebeneinander-
liegende Monatskalender rechts. **Die Farbe eines Eintrags zeigt die
Content-Art** (Reel/Beitrag/Story), **Logo (oder Farbpunkt) + Name
zeigen den Kunden** — beides auf einen Blick erkennbar. Klick auf einen
Eintrag öffnet den passenden Notion-Datensatz in einem neuen Tab.
Gedacht zum Deployen (z. B. Vercel) und anschließenden Einbetten per
Notion-"Embed"-Block .

Alle Schritte unten sind so geschrieben, dass sie ohne Programmierkenntnisse
durchführbar sind.

## Datenmodell: drei verknüpfte Datenbanken

```
Content  --Client (Relation)-->  Clients  --Paket (Relation)-->  Packages
```

### 1. "Packages"

   | Spalte | Typ |
   |---|---|
   | `Paket-Name` | Titel |
   | `Typ` | Auswahl: `Fest` oder `Custom` |
   | `Reels` / `Beiträge` / `Stories` | Zahl |
   | `Preis` | Zahl (€) |
   | `Mindestlaufzeit-Monate` | Zahl |

3 feste Pakete (z. B. Basic/Standard/Premium) + **eine Zeile "Custom"**
mit `Typ = Custom` und leeren Reels/Beiträge/Stories. Die Custom-Zeile
ist nur ein Platzhalter/Kategorie-Marker — die tatsächlichen Zahlen für
einen Custom-Kunden trägst du direkt beim Kunden ein (siehe unten).
Preise und Mengen der festen Pakete kannst du jederzeit anpassen, das
Dashboard zieht sie automatisch bei jedem Laden.

### 2. "Clients"

   | Spalte | Typ |
   |---|---|
   | `Name` | Titel |
   | `Logo` | Dateien & Medien |
   | `E-Mail` | E-Mail |
   | `Telefon` | Telefonnummer |
   | `Rechnungsnummer` | Text |
   | `Paket` | Relation → Packages |
   | `Custom Reels` / `Custom Beiträge` / `Custom Stories` | Zahl |

Die drei `Custom ...`-Felder trägst du **nur** ein, wenn der Kunde das
Paket "Custom" gewählt hat — das Dashboard nutzt dann automatisch diese
Werte statt der (leeren) Zahlen aus der Packages-Tabelle. Bei einem
festen Paket bleiben diese drei Felder einfach leer.

`Logo` einmal hochladen (Bild-Datei oder externer Link) — es erscheint
danach automatisch in der Sidebar und auf jedem Kalendereintrag dieses
Kunden.

### 3. "Content"

   | Spalte | Typ |
   |---|---|
   | `Content-Titel` | Titel |
   | `Content-Art` | Auswahl: `Reel`, `Beitrag`, `Story` |
   | `Posting-Datum` | Datum |
   | `Client` | Relation → Clients |

Alle drei Datenbanken am besten auf derselben übergeordneten Seite
anlegen, damit ihr sie leicht wiederfindet — sie öffnen sich aber
jeweils als eigene Seite.

## 2. Notion-Integration & API-Verbindung einrichten

1. Gehe zu **https://www.notion.so/my-integrations** → **"+ New integration"**.
2. Name z. B. "Content Kalender Dashboard", Workspace auswählen, **Submit**.
3. Kopiere den angezeigten **"Internal Integration Secret"** – das ist dein `NOTION_TOKEN`.
4. Öffne **alle drei** Datenbanken (Content, Clients, Packages) → jeweils oben rechts auf **"..."** → **"Verbindungen"** → deine Integration hinzufügen. Ohne diesen Schritt bekommt die API einen 403-Fehler!
5. Kopiere die **Datenbank-ID** von allen drei Datenbanken aus der jeweiligen URL (der 32-stellige Teil vor `?v=`).

Diese Werte werden **serverseitig** verwendet, nicht im Browser. Dein Notion-Token ist also nie öffentlich einsehbar.

## 3. Dashboard deployen (Vercel, kostenlos)

**Voraussetzung:** ein kostenloser GitHub- und Vercel-Account.

1. Erstelle ein neues, leeres GitHub-Repository.
2. Lade den kompletten Ordner-Inhalt dieses Projekts dort hoch.
3. Gehe zu **https://vercel.com** → **"Add New" → "Project"** → das Repo auswählen → **"Import"**.
4. Bei "Environment Variables" fünf Einträge hinzufügen:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID` = ID der Content-Datenbank
   - `NOTION_CLIENTS_DATABASE_ID` = ID der Clients-Datenbank
   - `NOTION_PACKAGES_DATABASE_ID` = ID der Packages-Datenbank
   - `DASHBOARD_PASSWORD` = ein frei gewähltes Passwort für dein Team
5. **Deploy** klicken. Nach ca. 1 Minute bekommst du eine kostenlose Live-URL (z. B. `dein-projekt.vercel.app`) — keine eigene Domain nötig.

Änderungen an Environment Variables erfordern ein erneutes Deployment
(Vercel → Projekt → "Deployments" → "Redeploy").

## 4. Per Embed in Notion einfügen

1. Öffne die Notion-Seite, auf der das Dashboard erscheinen soll.
2. Tippe `/embed` und wähle den Block **"Embed"**.
3. Füge deine Vercel-URL ein und bestätige.
4. Zieh den unteren Rand des Embed-Blocks nach unten (empfohlen: mindestens 700–800px Höhe).

## Farblogik

- **Hintergrundfarbe des Eintrags** = Content-Art, fest definiert in `lib/helpers.js` (`CONTENT_ART_COLORS`).
- **Logo (oder ersatzweise Farbpunkt) + Name** im Eintrag = der Kunde. Ist ein Logo hinterlegt, wird das gezeigt; ohne Logo greift automatisch ein aus dem Namen berechneter Farbpunkt.

## Zugriffsschutz

Die App fragt bei jedem Aufruf ein gemeinsames Passwort ab (`DASHBOARD_PASSWORD`)
und merkt sich das per Cookie für 30 Tage — ein geteiltes Passwort fürs
Team, kein Login mit einzelnen Accounts.

## Lokale Entwicklung (optional)

```bash
npm install
cp .env.local.example .env.local   # Werte eintragen
npm run dev
```

## Projektstruktur

```
pages/
  _app.js             Globale Styles einbinden
  index.js            Das eigentliche Dashboard (Sidebar + 3 Kalender)
  api/events.js        Fragt Content ab, löst Client-Relation zu Name + Logo auf
  api/clients.js        Fragt Clients ab, löst Paket-Relation auf (inkl. Custom-Logik)
components/
  MonthCalendar.js     Ein einzelner Monatskalender
  ClientCard.js         Eine Kunden-Karte in der Sidebar
lib/helpers.js          Datum/Farb-Hilfsfunktionen
styles/globals.css       Design-System (Farben, Typografie, Layout)
```
