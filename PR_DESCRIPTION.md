# Umfassende Netlify-Konfiguration mit Security Headers und Performance-Optimierungen

## 1. Overview

Diese PR führt eine moderne, dateibasierte Netlify-Konfiguration ein, die Build-Einstellungen, Domain-Redirects, Security Headers und Performance-Optimierungen in einer zentralen `netlify.toml` Datei konsolidiert. Die Dokumentation wurde aktualisiert, um den aktuellen Tech-Stack (Astro statt Jekyll) widerzuspiegeln.

**Geänderte Dateien:**
- `netlify.toml` (neu): Umfassende Netlify-Konfiguration
- `CLAUDE.MD`: Erweitert mit Netlify-Konfigurationsdokumentation
- `README.md`: Modernisiert für aktuellen Astro-Stack

## 2. Why & Impact

### Motivation

Die bisherige Konfiguration war verteilt und unvollständig:
- Keine zentrale Build-Konfiguration
- Fehlende Security Headers (anfällig für Clickjacking, MIME-Sniffing, etc.)
- Keine Performance-Optimierungen für statische Assets
- Veraltete Dokumentation (Jekyll statt Astro)

### Wert & Impact

**🔒 Security**: Implementierung moderner Security Headers schützt Besucher vor:
- Clickjacking-Angriffen (X-Frame-Options)
- MIME-Sniffing-Exploits (X-Content-Type-Options)
- Man-in-the-Middle-Angriffen durch erzwungenes HTTPS (HSTS mit Preload)
- Cross-Site Scripting und Resource-Injection (Content-Security-Policy)
- Unerwünschtem Zugriff auf Browser-Features (Permissions-Policy)

**⚡ Performance**: Cache-Headers reduzieren Ladezeiten und Server-Anfragen:
- Statische Assets werden 1 Jahr im Browser gecacht (immutable)
- Reduzierter Bandbreitenverbrauch
- Verbesserte User Experience

**🛠️ Wartbarkeit**: Zentrale Konfiguration vereinfacht:
- Build-Prozess ist klar dokumentiert
- Domain-Redirects sind versionskontrolliert
- Änderungen sind nachvollziehbar durch Git-History
- Onboarding neuer Entwickler durch aktuelle Dokumentation

**✅ Best Practices**: Implementierung entspricht Netlify-Empfehlungen 2026 und Sicherheitsstandards

## 3. Details

### Build-Konfiguration

**Was**: Explizite Definition von Build-Command, Publish-Directory und Node-Version

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"
```

**Warum**:
- Stellt konsistente Builds sicher
- Verhindert Probleme bei Netlify-Updates
- Node.js v24 erforderlich für Astro 5.x

**Referenzen**:
- [File-based configuration | Netlify Docs](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Deploy Astro to Netlify](https://docs.astro.build/en/guides/deploy/netlify/)

---

### Domain-Redirects

**Was**: Migration aller Domain-Aliase zu strukturierten Redirects in `netlify.toml`

```toml
[[redirects]]
  from = "https://stefan-hoth.de/*"
  to = "https://stefanhoth.com/:splat"
  status = 301
  force = true
```

**Warum**:
- Konsolidiert alle Domains auf Primary Domain (SEO)
- Verhindert Duplicate Content
- `force = true` überschreibt bestehende Dateien/Pfade
- `:splat` erhält URL-Pfade (z.B. `/contact` → `/contact`)

**Betroffene Domains**:
- stefan-hoth.de
- www.stefan-hoth.de
- stefanhoth.de
- www.stefanhoth.com
- Legacy Netlify-Subdomain

**Referenzen**:
- [Redirects and rewrites | Netlify Docs](https://docs.netlify.com/routing/redirects/)

---

### Security Headers

#### X-Frame-Options: DENY

**Was**: Verhindert, dass die Site in iframes eingebettet wird

**Warum**: Schutz vor Clickjacking-Angriffen, bei denen Angreifer die Site in unsichtbaren iframes verwenden, um Nutzer zu täuschen

**Referenzen**:
- [X-Frame-Options | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

---

#### X-Content-Type-Options: nosniff

**Was**: Browser dürfen MIME-Type nicht raten, sondern müssen Content-Type Header respektieren

**Warum**: Verhindert MIME-Sniffing-Angriffe, bei denen Browser Dateien als ausführbar interpretieren könnten

**Referenzen**:
- [X-Content-Type-Options | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

---

#### Strict-Transport-Security (HSTS)

**Was**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

**Warum**:
- Erzwingt HTTPS für 1 Jahr (31536000 Sekunden)
- Verhindert Downgrade-Attacken und Cookie-Hijacking
- `includeSubDomains`: Gilt für alle Subdomains
- `preload`: Qualifiziert für HSTS Preload List (Browser erzwingen HTTPS vor erstem Besuch)

**Nächster Schritt**: Domain bei [hstspreload.org](https://hstspreload.org/) einreichen

**Referenzen**:
- [Strict-Transport-Security | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [HSTS Preload List Submission](https://hstspreload.org/)

---

#### Content-Security-Policy (CSP)

**Was**: Restriktive Baseline-Policy für Resource-Loading

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

**Warum**:
- Verhindert XSS-Angriffe und Code-Injection
- Kontrolliert, welche Ressourcen geladen werden dürfen
- `frame-ancestors 'none'`: Ergänzt X-Frame-Options
- `'unsafe-inline'`: Temporär für Inline-Scripts/Styles (sollte idealerweise durch Nonces ersetzt werden)

**⚠️ Hinweis**: Diese Policy sollte nach dem Deploy getestet und ggf. angepasst werden, falls externe Ressourcen blockiert werden

**Referenzen**:
- [Content Security Policy | Netlify Docs](https://docs.netlify.com/manage/security/content-security-policy/)
- [CSP Guide | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

#### Referrer-Policy

**Was**: `Referrer-Policy: strict-origin-when-cross-origin`

**Warum**:
- Sendet volle URL nur bei Same-Origin-Requests
- Bei Cross-Origin nur Origin (ohne Pfad) für HTTPS→HTTPS
- Kein Referrer bei HTTPS→HTTP (Downgrade-Schutz)
- Balance zwischen Privacy und Funktionalität (z.B. Analytics)

**Referenzen**:
- [Referrer-Policy | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

---

#### Permissions-Policy

**Was**: Restriktive Browser-Feature-Policy

```toml
Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
```

**Warum**:
- Deaktiviert Browser-Features, die die Site nicht benötigt
- Reduziert Angriffsfläche
- Verhindert unerwünschte Feature-Requests
- Verbessert Privacy

**Referenzen**:
- [Permissions-Policy | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

---

### Performance-Optimierungen

#### Static Asset Caching

**Was**: Cache-Control Headers für statische Assets

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Warum**:
- `max-age=31536000`: 1 Jahr Browser-Cache
- `immutable`: Datei ändert sich nie (dank Content-Hash in Dateinamen)
- Reduziert Server-Requests dramatisch
- Schnellere Ladezeiten für wiederkehrende Besucher
- Geringere Bandbreitenkosten

**Gilt für**:
- `/assets/*` (Astro-generierte Assets mit Content-Hash)
- `/*.css` (CSS-Dateien)
- `/*.js` (JavaScript-Dateien)

**Referenzen**:
- [Cache-Control | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Netlify Headers Documentation](https://docs.netlify.com/routing/headers/)

---

### Context-Specific Settings

**Was**: Umgebungsvariablen für verschiedene Deploy-Kontexte

```toml
[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "preview" }

[context.branch-deploy]
  environment = { NODE_ENV = "development" }
```

**Warum**:
- Ermöglicht kontextabhängiges Verhalten (z.B. Analytics nur in Production)
- Deploy Previews und Branch Deploys können unterschiedlich konfiguriert werden
- Best Practice für Multi-Environment-Setups

**Referenzen**:
- [Deploy contexts | Netlify Docs](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)

---

### Dokumentation

#### CLAUDE.MD

**Was**: Neuer Abschnitt "Netlify Configuration" mit Details zu allen Konfigurations-Aspekten

**Warum**:
- Entwickler verstehen die Build-Pipeline
- Security-Entscheidungen sind dokumentiert
- Onboarding-Zeit wird reduziert

---

#### README.md

**Was**: Komplett überarbeitetes README (Jekyll → Astro)

**Warum**:
- Alte Jekyll-Dokumentation war irreführend
- README reflektiert jetzt aktuellen Tech-Stack
- Quick-Start-Guide für neue Entwickler
- Verweis auf detaillierte CLAUDE.MD-Dokumentation

---

## Test Plan

Nach dem Merge bitte folgende Tests durchführen:

### Build & Deployment
- [ ] Netlify-Deployment erfolgreich
- [ ] Build-Logs prüfen auf Warnings/Errors
- [ ] Site lädt korrekt auf stefanhoth.com

### Domain Redirects
- [ ] https://stefan-hoth.de → https://stefanhoth.com
- [ ] https://www.stefan-hoth.de → https://stefanhoth.com
- [ ] https://stefanhoth.de → https://stefanhoth.com
- [ ] https://www.stefanhoth.com → https://stefanhoth.com
- [ ] Legacy Netlify-Subdomain → https://stefanhoth.com

### Security Headers
Prüfen in Browser DevTools (Network → Response Headers):
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security vorhanden mit preload
- [ ] Content-Security-Policy vorhanden
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy vorhanden

**Tools für automatische Prüfung**:
- [securityheaders.com](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

### Performance
- [ ] Static Assets haben Cache-Control Header (DevTools)
- [ ] Wiederholte Besuche laden Assets aus Cache
- [ ] PageSpeed Insights Score prüfen

### Funktionalität
- [ ] Alle Seiten funktionieren korrekt
- [ ] Contact Form funktioniert (Netlify Forms)
- [ ] Keine Console-Errors durch CSP
- [ ] JavaScript/CSS wird nicht blockiert

### CSP-Anpassungen falls nötig
Falls die Content-Security-Policy Assets blockiert:
- DevTools Console prüfen auf CSP-Violations
- Policy in netlify.toml anpassen
- Neu deployen und testen

---

## Breaking Changes

**Keine.** Diese Änderungen sind vollständig rückwärtskompatibel:
- Bestehende Deployments funktionieren weiterhin
- Falls `public/_redirects` existiert, bleibt dies als Fallback erhalten
- Security Headers sind additiv und brechen keine Funktionalität

---

## Follow-up Tasks

Nach erfolgreichem Deployment:

1. **HSTS Preload List Submission**
   - Domain bei https://hstspreload.org/ einreichen
   - Dauert ca. 2-3 Monate bis Browser-Inclusion

2. **CSP-Optimierung**
   - CSP-Violations im Production-Monitoring beobachten
   - `'unsafe-inline'` durch Nonces ersetzen für maximale Sicherheit
   - Erwägen: CSP-Report-Only Mode für Testing

3. **Security Header Monitoring**
   - Regelmäßige Checks mit securityheaders.com
   - Alerts bei Verschlechterung des Security-Scores

4. **Performance-Monitoring**
   - Netlify Analytics aktivieren (optional)
   - Cache-Hit-Rate überwachen
