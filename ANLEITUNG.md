# Leo Doppler cooks – so geht die Seite online

Du brauchst dafür nur **einen kostenlosen GitHub-Account**. Hosting und Bearbeiten kosten nichts. Nur eine eigene Domain kostet etwas (ca. 10–20 € im Jahr) und ist optional.

## 1. GitHub-Account anlegen

Auf [github.com](https://github.com) registrieren. Merk dir deinen Benutzernamen, der kommt gleich in der Adresse vor.

## 2. Neues Repository anlegen

1. Oben rechts auf **+** und dann **New repository** klicken.
2. Name: `leodopplercooks`.
3. **Public** auswählen (nur öffentliche Repositorys sind bei GitHub Pages gratis).
4. Auf **Create repository** klicken.

## 3. Dateien hochladen

1. Entpacke die ZIP-Datei auf deinem Computer.
2. Im neuen Repository auf **uploading an existing file** klicken.
3. Den **Inhalt** des Ordners hineinziehen, also `index.html`, `style.css`, `app.js` sowie die Ordner `daten`, `bilder` und `schrift`. Nicht den Ordner selbst hineinziehen.
4. Unten auf **Commit changes** klicken.

**Wichtig:** Die Dateien `.pages.yml` und `.nojekyll` beginnen mit einem Punkt und sind deshalb oft unsichtbar. Prüfe nach dem Hochladen, ob `.pages.yml` im Repository zu sehen ist. Falls nicht:

1. **Add file** und dann **Create new file** wählen.
2. Als Namen `.pages.yml` eingeben.
3. Den Inhalt aus der Datei hineinkopieren (in einem Texteditor öffnen) und speichern.

Für `.nojekyll` genauso vorgehen, nur mit leerem Inhalt.

## 4. Website einschalten

1. Im Repository auf **Settings** und dann links auf **Pages** gehen.
2. Bei **Source** die Option **Deploy from a branch** wählen.
3. Als Branch **main** und als Ordner **/ (root)** einstellen.
4. Auf **Save** klicken.

Nach 1–2 Minuten ist die Seite online unter
`https://DEIN-BENUTZERNAME.github.io/leodopplercooks/`

## 5. Bearbeiten einrichten (der „Login“)

1. Geh auf [app.pagescms.org](https://app.pagescms.org).
2. Melde dich mit GitHub an.
3. Erlaube Pages CMS den Zugriff auf das Repository `leodopplercooks`.
4. Öffne das Repository. Links siehst du jetzt **Rezepte** und **Seiten-Texte & Impressum**.

Ganz unten auf der Website gibt es außerdem den Link **Seite bearbeiten**. Er führt direkt dorthin.

### Neues Gericht eintragen

1. In Pages CMS **Rezepte** öffnen und ein neues Element hinzufügen.
2. Ausfüllen: Titel, Teaser, **Datum**, Kategorien, Zeit, Schwierigkeit, Portionen. Das Datum ist wichtig, denn das neueste Rezept erscheint automatisch groß auf der Startseite.
3. **Zutaten**: pro Gruppe eine Überschrift (z. B. „Für die Sauce“), darunter die Zutaten mit Menge.
4. **Zubereitung**: pro Schritt eine kurze Überschrift und eine Beschreibung. Die Nummern kommen automatisch dazu.
5. **Leos Tipp** ausfüllen.
6. Optional: Foto hochladen und den Link zum Instagram-Video einfügen.
7. Speichern. Nach 1–2 Minuten ist das Rezept auf der Seite.

Fotos am besten im Hochformat (4:5, wie bei Instagram) und unter 500 KB. Ohne Foto erscheint automatisch ein farbiges Poster mit dem Namen des Gerichts.

## 6. Vor dem Teilen prüfen

- **Mengenangaben**: In vielen Original-Posts standen keine Mengen. Diese sind ergänzt und sollten von Leo gegengecheckt werden.
- **Impressum**: Verlinkt aktuell auf Leos Impressum bei zemanek.agency, so wie in seinem Instagram-Profil. Kurz mit Leo bzw. der Agentur abklären, ob das für die Website passt.
- **Über Leo**: Der Text ist ein Vorschlag. Am besten schreibt Leo ihn selbst in seinen Worten.

## 7. Eigene Domain verbinden (optional)

1. Domain kaufen, z. B. bei World4You, easyname oder Namecheap.
2. In GitHub unter **Settings** und dann **Pages** bei **Custom domain** die Domain eintragen, z. B. `leodopplercooks.at`.
3. Beim Domain-Anbieter in den DNS-Einstellungen eintragen:
   - Vier **A-Einträge** für `@` mit den Werten:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Einen **CNAME-Eintrag** für `www`, der auf `DEIN-BENUTZERNAME.github.io` zeigt.
4. Warten. Das kann ein paar Stunden dauern.
5. Danach in GitHub **Enforce HTTPS** anhaken.

## Seite lokal ansehen

Wenn du `index.html` einfach doppelt anklickst, erscheint nur „Rezepte konnten nicht geladen werden“. Das ist normal, denn die Seite funktioniert erst online oder über einen lokalen Server.
