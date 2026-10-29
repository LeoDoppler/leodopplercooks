/* Leo Doppler cooks – lädt die Rezepte aus daten/rezepte.json und zeigt sie an.
   Inhalte werden über Pages CMS bearbeitet, hier muss man nichts ändern. */

const main = document.getElementById("inhalt");
let REZEPTE = [];
let EINST = {};
let EVENTS = [];
const F = { haupt: "Alle", gang: "", protein: "", zeit: "", q: "" };

const HAUPT = ["Österreichische Klassiker", "Mediterrane Küche", "Italienische Klassiker", "Schnelle Küche"];
const GANG = ["Suppen & Eintöpfe", "Hauptgerichte", "Desserts & Mehlspeisen", "Salate & Vorspeisen", "Snacks & Sandwiches"];
const PROTEIN = ["Rind", "Schwein", "Geflügel", "Fisch & Meeresfrüchte", "Vegetarisch"];
const ZEIT = ["Unter 30 Min", "30–60 Min", "Über 60 Min"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function slugify(t) {
  return t.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const bildPfad = (p) => (p ? p.replace(/^\//, "") : "");

// Links für @namen, E-Mails und Webadressen
function verlinke(html) {
  return html
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi, '$1<a href="mailto:$2">$2</a>')
    .replace(/(^|[\s(])@([a-z0-9_.]*[a-z0-9_])/gi, '$1<a class="at" href="https://www.instagram.com/$2/" target="_blank" rel="noopener">@$2</a>');
}
const absaetze = (t) => String(t || "").split(/\n\s*\n/).filter(Boolean).map((a) => `<p>${verlinke(esc(a)).replace(/\n/g, "<br>")}</p>`).join("");

function datumText(d) {
  const dt = new Date(d);
  return d && !isNaN(dt) ? dt.toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" }) : "";
}

/* ---------- Poster mit automatisch angepasster Schriftgröße ---------- */
function poster(r, gross = false, scharf = false) {
  const b = bildPfad(r.bild);
  // Rezeptseite: Foto scharf und ohne Text
  if (b && scharf) return `<div class="poster" data-kat="${esc(r.hauptkategorie)}"><img src="${esc(b)}" alt="${esc(r.titel)}"></div>`;
  const start = gross ? "5.2rem" : (r.titel.split(/\s+/).length > 4 ? "2.3rem" : "2.9rem");
  return `<div class="poster${b ? " mit-foto" : ""}" data-kat="${esc(r.hauptkategorie)}" aria-hidden="true">
      ${b ? `<img src="${esc(b)}" alt="">` : ""}
      <div class="poster-oben"><span>${esc(r.gang || "")}</span><span>${esc(r.zeit || "")}</span></div>
      <p class="poster-titel" style="--gr:${start}">${esc(r.titel)}</p>
    </div>`;
}
function passeTitelAn() {
  document.querySelectorAll(".poster-titel").forEach((el) => {
    el.style.fontSize = "";
    const box = el.parentElement;
    let gr = parseFloat(getComputedStyle(el).fontSize), n = 0;
    while ((el.scrollWidth > el.clientWidth + 1 || el.offsetTop + el.offsetHeight > box.clientHeight + 1 || el.offsetTop < 40) && gr > 11 && n++ < 60) {
      gr *= 0.94; el.style.fontSize = gr + "px";
    }
  });
}
let rt;
window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(passeTitelAn, 120); });
document.fonts && document.fonts.ready.then(passeTitelAn);

function kachel(r) {
  return `<a class="kachel" href="#/rezept/${r.slug}">
      ${poster(r)}
      <div class="kachel-text"><strong>${esc(r.titel)}</strong><span>${r.werbung ? `<b class="werbung-mini">Werbung</b> ` : ""}${esc(r.hauptkategorie)}</span></div>
    </a>`;
}

function setLinks() {
  document.querySelectorAll(".insta-link").forEach((a) => (a.href = EINST.instagram_url || "https://www.instagram.com/"));
  document.querySelectorAll(".mail-link").forEach((a) => (a.href = EINST.kontakt_email ? "mailto:" + EINST.kontakt_email : "#/impressum"));
}

function passt(r) {
  if (F.haupt !== "Alle") {
    const schnell = F.haupt === "Schnelle Küche" && r.zeitkategorie === "Unter 30 Min";
    if (r.hauptkategorie !== F.haupt && !schnell) return false;
  }
  if (F.gang && r.gang !== F.gang) return false;
  if (F.protein && r.protein !== F.protein) return false;
  if (F.zeit && r.zeitkategorie !== F.zeit) return false;
  if (F.q) {
    const text = [r.titel, r.teaser, r.serie, ...(r.zutaten || []).flatMap((z) => z.liste || []), ...(r.schritte || []).map((s) => s.text)].join(" ").toLowerCase();
    if (!text.includes(F.q.toLowerCase())) return false;
  }
  return true;
}

const auswahl = (name, label, werte) =>
  `<label><span class="unsichtbar">${label}</span><select data-f="${name}"><option value="">${label}: alle</option>${werte.map((w) => `<option${F[name] === w ? " selected" : ""}>${esc(w)}</option>`).join("")}</select></label>`;

/* ---------- Instagram-Video (lädt erst nach Klick, DSGVO) ---------- */
function instaEmbed(link) {
  const m = String(link || "").match(/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return "";
  const typ = m[1] === "p" ? "p" : m[1] === "tv" ? "tv" : "reel";
  return `https://www.instagram.com/${typ}/${m[2]}/embed/`;
}
function videoBox(r, embed) {
  const b = bildPfad(r.bild);
  return `<div class="video-box" data-embed="${esc(embed)}">
      ${b ? `<img src="${esc(b)}" alt="">` : ""}
      <button class="video-start" type="button">
        <span class="video-play" aria-hidden="true">▶</span>
        <span class="video-label">Video ansehen</span>
        <span class="video-hinweis">Beim Abspielen wird Instagram geladen.</span>
      </button>
    </div>`;
}
function videoAktivieren() {
  main.querySelectorAll(".video-box").forEach((box) => {
    box.querySelector(".video-start")?.addEventListener("click", () => {
      box.classList.add("laeuft");
      box.innerHTML = `<iframe src="${box.dataset.embed}" title="Instagram-Video" allowfullscreen loading="lazy" scrolling="no"></iframe>`;
    });
  });
}

/* ---------- Aktuelles & Termine ---------- */
function heute() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function eventsGeteilt() {
  const h = heute();
  const kommend = EVENTS.filter((e) => e.datum && e.datum >= h).sort((a, b) => a.datum.localeCompare(b.datum));
  const vergangen = EVENTS.filter((e) => !e.datum || e.datum < h).sort((a, b) => (b.datum || "").localeCompare(a.datum || ""));
  return { kommend, vergangen };
}
function eventZeile(e) {
  const dt = e.datum ? new Date(e.datum) : null;
  const ok = dt && !isNaN(dt);
  const tag = ok ? dt.getDate() : "";
  const monat = ok ? dt.toLocaleDateString("de-AT", { month: "short" }).replace(".", "") : "";
  const jahr = ok ? dt.getFullYear() : "";
  const infos = [e.art, e.uhrzeit, e.ort].filter(Boolean).map(esc).join(" · ");
  const bild = bildPfad(e.bild);
  const galerie = (Array.isArray(e.galerie) ? e.galerie : []).filter(Boolean).map(bildPfad);
  return `<li class="event${bild ? " mit-bild" : ""}">
      <div class="event-datum" aria-hidden="true"><span class="event-tag">${tag}</span><span>${esc(monat)} ${jahr}</span></div>
      <div class="event-text">
        ${infos ? `<p class="event-infos">${infos}</p>` : ""}
        <h3>${esc(e.titel)}</h3>
        ${ok ? `<p class="unsichtbar">${datumText(e.datum)}</p>` : ""}
        ${e.text ? absaetze(e.text) : ""}
        ${e.link ? `<a class="event-link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(e.link_text || "Mehr erfahren")} →</a>` : ""}
        ${galerie.length ? `<div class="galerie">${galerie.map((g) => `<a href="${esc(g)}" target="_blank" rel="noopener"><img src="${esc(g)}" alt="Eindruck: ${esc(e.titel)}" loading="lazy"></a>`).join("")}</div>` : ""}
      </div>
      ${bild ? `<img class="event-bild" src="${esc(bild)}" alt="">` : ""}
    </li>`;
}
function eventsBlock(maxVergangen) {
  const { kommend, vergangen } = eventsGeteilt();
  if (!kommend.length && !vergangen.length) return "";
  const v = maxVergangen ? vergangen.slice(0, maxVergangen) : vergangen;
  return `
    ${kommend.length ? `<h3 class="event-gruppe">Demnächst</h3><ul class="events">${kommend.map(eventZeile).join("")}</ul>` : ""}
    ${v.length ? `<h3 class="event-gruppe">Aktuelles</h3><ul class="events">${v.map(eventZeile).join("")}</ul>` : ""}
    ${maxVergangen && vergangen.length > maxVergangen ? `<a class="knopf knopf-leise" href="#/aktuelles">Alles anzeigen</a>` : ""}`;
}

function seiteAktuelles() {
  const inhalt = eventsBlock(0);
  main.innerHTML = `<div class="abschnitt">
      <h1 class="abschnitt-titel">Aktuelles &amp; Termine</h1>
      ${inhalt || `<p class="leer">Gerade gibt es keine Neuigkeiten. Schau bald wieder vorbei oder folge Leo auf Instagram.</p>`}
    </div>`;
  document.title = `Aktuelles – ${EINST.name || "Leo Doppler cooks"}`;
  window.scrollTo(0, 0);
}

/* ---------- Seiten ---------- */
function seiteStart(scrollZu) {
  const neu = REZEPTE[0];
  const anz = (k) => (k === "Alle" ? REZEPTE.length : REZEPTE.filter((r) => r.hauptkategorie === k || (k === "Schnelle Küche" && r.zeitkategorie === "Unter 30 Min")).length);

  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>${esc(EINST.titelzeile || "Klassiker in unter 60 Sekunden.")}</h1>
        <p class="hero-unter">${esc(EINST.untertitel || "")}</p>
        <div class="knoepfe">
          <a class="knopf" href="#/rezepte">Alle Rezepte</a>
          <a class="knopf knopf-leise insta-link" href="${esc(EINST.instagram_url || "#")}" target="_blank" rel="noopener">${esc(EINST.instagram_name || "Instagram")}</a>
        </div>
      </div>
      ${neu ? `<a class="hero-neu" href="#/rezept/${neu.slug}">
        ${poster(neu, true)}
        <div class="hero-neu-label"><span>Neu${neu.datum ? ` am ${datumText(neu.datum)}` : ""}</span><span>Zum Rezept</span></div>
      </a>` : ""}
    </section>

    <section class="abschnitt" id="rezepte" aria-labelledby="alle-titel">
      <h2 class="abschnitt-titel" id="alle-titel">Rezepte</h2>
      <div class="filter">
        <div class="chips" role="group" aria-label="Nach Kategorie filtern">
          ${["Alle", ...HAUPT].map((k) => `<button class="chip" type="button" data-k="${esc(k)}" aria-pressed="${k === F.haupt}">${esc(k)}<small>${anz(k)}</small></button>`).join("")}
        </div>
        <div class="filter-zeile">
          ${auswahl("gang", "Gang", GANG)}
          ${auswahl("protein", "Ernährung", PROTEIN)}
          ${auswahl("zeit", "Zeit", ZEIT)}
          <label style="flex:1 1 14rem;display:flex"><span class="unsichtbar">Rezepte durchsuchen</span>
            <input type="search" placeholder="Suchen, z. B. Knödel oder Speck" value="${esc(F.q)}"></label>
        </div>
      </div>
      <p class="treffer" aria-live="polite"></p>
      <div class="raster"></div>
    </section>

    ${EVENTS.length ? `<section class="abschnitt" id="aktuelles" aria-labelledby="akt-titel">
      <h2 class="abschnitt-titel" id="akt-titel">Aktuelles &amp; Termine</h2>
      ${eventsBlock(3)}
    </section>` : ""}

    <section class="ueber" id="ueber" aria-labelledby="ueber-titel">
      <div class="abschnitt ueber-innen${EINST.foto ? " mit-foto" : ""}">
        ${EINST.foto ? `<img class="ueber-foto" src="${esc(bildPfad(EINST.foto))}" alt="Leo Doppler">` : ""}
        <div>
          <h2 class="abschnitt-titel" id="ueber-titel">Über Leo</h2>
          ${absaetze(EINST.ueber)}
          <div class="knoepfe">
            <a class="knopf" href="${esc(EINST.instagram_url || "#")}" target="_blank" rel="noopener">${esc(EINST.instagram_name || "Instagram")} folgen</a>
            ${(EINST.kooperation_email || EINST.kontakt_email) ? `<a class="knopf knopf-leise" href="mailto:${esc(EINST.kooperation_email || EINST.kontakt_email)}">Für Kooperationen</a>` : ""}
          </div>
        </div>
      </div>
    </section>`;

  const raster = main.querySelector(".raster");
  const treffer = main.querySelector(".treffer");
  const zeichne = () => {
    const liste = REZEPTE.filter(passt);
    treffer.textContent = liste.length === REZEPTE.length ? "" : `${liste.length} von ${REZEPTE.length} Rezepten`;
    raster.innerHTML = liste.length ? liste.map(kachel).join("")
      : `<p class="leer">Kein Rezept passt zu diesen Filtern. Entferne einen Filter oder wähle „Alle“.</p>`;
    passeTitelAn();
  };
  zeichne();

  main.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    F.haupt = c.dataset.k;
    main.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
    zeichne();
  }));
  main.querySelectorAll("select[data-f]").forEach((s) => s.addEventListener("change", () => { F[s.dataset.f] = s.value; zeichne(); }));
  main.querySelector('input[type="search"]').addEventListener("input", (e) => { F.q = e.target.value; zeichne(); });

  document.title = EINST.name || "Leo Doppler cooks";
  if (scrollZu) document.getElementById(scrollZu)?.scrollIntoView();
  else window.scrollTo(0, 0);
}

function seiteRezept(slug) {
  const r = REZEPTE.find((x) => x.slug === slug);
  if (!r) {
    main.innerHTML = `<div class="abschnitt"><h1 class="abschnitt-titel">Dieses Rezept gibt es nicht mehr.</h1><a class="knopf" href="#/rezepte">Zu allen Rezepten</a></div>`;
    return;
  }
  const tags = [r.hauptkategorie, r.gang, r.protein].filter(Boolean);
  const zutaten = (r.zutaten || []).filter((g) => g && (g.liste || []).length);
  const schritte = (r.schritte || []).filter((s) => s && (s.titel || s.text));
  const weitere = REZEPTE.filter((x) => x !== r && x.hauptkategorie === r.hauptkategorie).slice(0, 4);

  main.innerHTML = `
    <article class="rezept">
      <a class="zurueck" href="#/rezepte">← Alle Rezepte</a>
      <header class="rezept-kopf">
        <div>
          ${r.werbung ? `<p class="werbung">${esc(r.werbung)}</p>` : ""}
          <ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <h1>${esc(r.titel)}</h1>
          ${r.teaser ? `<p class="teaser">${verlinke(esc(r.teaser))}</p>` : ""}
          <dl class="steckbrief">
            <div><dt>Zeit</dt><dd>${esc(r.zeit || r.zeitkategorie || "–")}</dd></div>
            <div><dt>Schwierigkeit</dt><dd>${esc(r.schwierigkeit || "–")}</dd></div>
            <div><dt>Portionen</dt><dd>${esc(r.portionen || "–")}</dd></div>
          </dl>
          <div class="knoepfe">
            <a class="knopf" href="${esc(r.instagram || EINST.instagram_url || "#")}" target="_blank" rel="noopener">${r.instagram ? "Video auf Instagram" : "Leo auf Instagram"}</a>
            <button class="knopf knopf-leise" type="button" onclick="window.print()">Drucken</button>
          </div>
          ${r.serie ? `<p class="serie">${esc(r.serie)}${r.datum ? `, ${datumText(r.datum)}` : ""}</p>` : ""}
        </div>
        ${instaEmbed(r.instagram) ? videoBox(r, instaEmbed(r.instagram)) : poster(r, true, true)}
      </header>

      <div class="rezept-koerper">
        <aside class="zutaten-box" aria-labelledby="z-titel">
          <h2 id="z-titel">Zutaten</h2>
          ${zutaten.map((g) => `${g.gruppe ? `<h3>${esc(g.gruppe)}</h3>` : ""}<ul>${g.liste.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>`).join("")}
        </aside>
        <div class="zubereitung">
          <h2>Zubereitung</h2>
          <ol class="schritte">${schritte.map((s) => `<li><h3>${esc(s.titel || "")}</h3><p>${verlinke(esc(s.text || ""))}</p></li>`).join("")}</ol>
          ${r.tipp ? `<aside class="tipp"><h2>Leos Tipp</h2><p>${verlinke(esc(r.tipp))}</p></aside>` : ""}
        </div>
      </div>

      ${weitere.length ? `<section class="weitere" aria-labelledby="w-titel">
        <h2 class="abschnitt-titel" id="w-titel">Mehr ${esc(r.hauptkategorie)}</h2>
        <div class="raster">${weitere.map(kachel).join("")}</div>
      </section>` : ""}
    </article>`;
  passeTitelAn();
  videoAktivieren();
  document.title = `${r.titel} – ${EINST.name || "Leo Doppler cooks"}`;
  window.scrollTo(0, 0);
}

function seiteImpressum() {
  main.innerHTML = `<div class="abschnitt recht">
      <h1>Impressum &amp; Datenschutz</h1>
      <h2>Impressum</h2>${absaetze(EINST.impressum)}
      <h2>Datenschutz</h2>${absaetze(EINST.datenschutz)}
    </div>`;
  document.title = `Impressum – ${EINST.name || "Leo Doppler cooks"}`;
  window.scrollTo(0, 0);
}

/* ---------- Statistik mit Umami (ohne Cookies) ---------- */
let statistikBereit = false;
function statistikLaden() {
  const id = (EINST.umami_id || "").trim();
  if (!id) return;
  const sc = document.createElement("script");
  sc.src = "https://cloud.umami.is/script.js";
  sc.defer = true;
  sc.dataset.websiteId = id;
  sc.dataset.autoTrack = "false";
  sc.onload = () => { statistikBereit = true; zaehle(); };
  document.head.appendChild(sc);
}
function zaehle() {
  if (!statistikBereit || !window.umami) return;
  const h = location.hash.replace(/^#\/?/, "");
  const pfad = "/" + h;
  try { window.umami.track((p) => ({ ...p, url: pfad, title: document.title })); } catch (e) {}
}

function route() {
  const h = location.hash.replace(/^#\/?/, "");
  if (h.startsWith("rezept/")) seiteRezept(decodeURIComponent(h.slice(7)));
  else if (h === "impressum") seiteImpressum();
  else if (h === "aktuelles") seiteAktuelles();
  else if (h === "ueber" || h === "rezepte") seiteStart(h);
  else seiteStart();
  zaehle();
}

async function start() {
  try {
    const [rz, es] = await Promise.all([
      fetch("daten/rezepte.json", { cache: "no-cache" }).then((r) => r.json()),
      fetch("daten/einstellungen.json", { cache: "no-cache" }).then((r) => r.json()),
    ]);
    EINST = es || {};
    try {
      const ev = await fetch("daten/events.json", { cache: "no-cache" }).then((r) => r.json());
      EVENTS = (Array.isArray(ev) ? ev : []).filter((e) => e && e.titel);
    } catch (e) { EVENTS = []; }
    // Rezepte mit Datum zuerst (neueste oben), danach die ohne Datum in Datei-Reihenfolge
    const liste = (rz || []).filter((r) => r && r.titel).map((r, i) => ({ ...r, _i: i }));
    liste.sort((a, b) => (a.datum && b.datum ? b.datum.localeCompare(a.datum) : a.datum ? -1 : b.datum ? 1 : a._i - b._i));
    const vergeben = {};
    REZEPTE = liste.map((r) => {
      let s = slugify(r.titel) || "rezept";
      vergeben[s] = (vergeben[s] || 0) + 1;
      if (vergeben[s] > 1) s += "-" + vergeben[s];
      return { ...r, slug: s };
    });
    setLinks();
    route();
    statistikLaden();
  } catch (e) {
    main.innerHTML = `<p class="laden">Die Rezepte konnten nicht geladen werden. Lade die Seite neu. Wenn du sie lokal als Datei geöffnet hast: Sie funktioniert erst online.</p>`;
    console.error(e);
  }
}

window.addEventListener("hashchange", route);
start();
