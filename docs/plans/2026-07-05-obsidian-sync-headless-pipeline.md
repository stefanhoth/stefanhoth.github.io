# Plan: Obsidian Sync Headless → GitHub Repo → Cloudflare Workers

**Datum:** 2026-07-05
**Aktualisiert:** 2026-07-08 — Netlify-Annahmen durch den tatsächlichen Cloudflare-Workers-Flow ersetzt, CLI-Kommandos gegen die offizielle `obsidian-headless`-Doku verifiziert. Korrigiert: entgegen einer ersten (falschen) Version dieses Dokuments deployt Cloudflare bei Push auf `main` automatisch in Produktion, über die Cloudflare-GitHub-App ("Cloudflare Workers and Pages", Dashboard-Integration, kein Workflow in diesem Repo) — sichtbar als Check-Run `Workers Builds: stefanhoth-com`. Ein Vault-Sync, der auf `main` landet, geht damit **automatisch live**, sobald Cloudflares eigener Build erfolgreich ist.
**Zweite Korrektur (nach dem ersten echten Lauf):** Direkter Push auf `main` wird von einer aktiven Repository-Ruleset ("Protect main") abgelehnt — PR Pflicht, 4 grüne Status-Checks (Lint/Build/Test/E2E gegen Preview) und ein erfolgreiches `preview`-Deployment sind Voraussetzung fürs Mergen (0 Approvals nötig). Der Workflow committet daher auf einen festen Branch `chore/sync-vault`, öffnet/aktualisiert dort einen PR und aktiviert Auto-Merge, statt direkt auf `main` zu pushen.
**Status:** Umgesetzt (Workflow `sync-vault.yml`) — Repository-Secrets angelegt (`OBSIDIAN_USER`/`PASS`/`VAULT`/`E2EE`, `GH_COMMIT_PAT`).

---

## Ziel

Vault-Inhalte aus Obsidian Sync automatisch ins GitHub-Repository ziehen, ohne die Desktop-App öffnen zu müssen.

## Flow

```
Obsidian App (any device)
        ↓  bearbeiten
Obsidian Sync (Cloud)
        ↓  ob sync (GitHub Actions, alle 30 Min + manuell + Webhook)
Branch chore/sync-vault  (force-gepusht, nur wenn npm run build durchläuft)
        ↓  PR main ← chore/sync-vault (per PAT geöffnet, damit Checks überhaupt laufen)
ci.yml (Lint/Build/Test) + preview-deploy.yml (Preview-Deployment + E2E)
        ↓  alle 4 Checks grün + erfolgreiches preview-Deployment
Auto-Merge (squash) → main
        ↓
        Cloudflare Workers Builds (GitHub-App-Integration, kein Workflow
        in diesem Repo — baut + deployt automatisch bei jedem Push auf main)
stefanhoth.com  (live, sobald der Cloudflare-Build erfolgreich ist)
```

**Unterschied zum ursprünglichen Plan:** Das Repo lief beim Schreiben dieses Plans noch auf Netlify (Auto-Deploy bei jedem Push auf `main`). Seit PR #44 läuft es auf Cloudflare Workers — der Mechanismus dahinter hat sich geändert, das Verhalten aber nicht: Die Cloudflare-GitHub-App ("Cloudflare Workers and Pages") ist auf das Repo installiert und deployt bei jedem Push auf `main` automatisch nach Produktion (Check-Run `Workers Builds: stefanhoth-com`). Das läuft unabhängig von `ci.yml` und `preview-deploy.yml` — beide bleiben unverändert bestehen.

**Zweite, wichtigere Abweichung:** Ein direkter Bot-Push auf `main` — egal ob mit dem Standard-`GITHUB_TOKEN` oder einem PAT — wird von der Repository-Ruleset "Protect main" abgelehnt (siehe unten). Der Workflow geht deshalb über einen PR, nicht über einen direkten Commit auf `main`. Das hat einen erwünschten Nebeneffekt: Vault-Syncs durchlaufen jetzt dieselben Qualitäts-Gates (Lint/Build/Test/E2E gegen eine echte Preview-Deployment) wie jede von Hand gemachte Änderung — nicht nur das repo-interne `npm run build`.

### Warum PR statt Direct-Push (Repository-Ruleset)

Die aktive Ruleset **„Protect main"** (`gh api repos/stefanhoth/stefanhoth.com/rulesets/18674761`) verlangt für `main`:
- Änderungen nur per Pull Request (0 Approvals nötig, keine Code-Owner-Pflicht)
- 4 grüne Status-Checks: `Lint`, `Build`, `Test`, `E2E against preview` (alle aus `ci.yml`/`preview-deploy.yml`)
- Ein erfolgreiches Deployment ins Environment `preview` (aus `preview-deploy.yml`)
- Linear History (nur Squash-Merge ist im Repo überhaupt erlaubt — passt zusammen)

Ein Push mit dem Standard-`GITHUB_TOKEN` scheiterte im ersten echten Testlauf direkt an dieser Regel (`GH013: Repository rule violations`). Zusätzlich gilt: Ereignisse, die mit dem Standard-`GITHUB_TOKEN` ausgelöst werden, lösen laut GitHub **keine** Folge-Workflows aus — das betrifft nicht nur `push`, sondern auch `pull_request`. Ein mit `GITHUB_TOKEN` geöffneter PR hätte also nie die geforderten Checks laufen lassen. Deshalb verwendet der Workflow für Branch-Push **und** PR-Erstellung ein separates PAT (`GH_COMMIT_PAT`), das wie ein normaler externer Akteur behandelt wird und `ci.yml`/`preview-deploy.yml` ganz normal auslöst.

Erwogene Alternative: den GitHub-Actions-Bot als Bypass-Actor in die Ruleset eintragen. Verworfen, weil Rulesets keine Ausnahme pro Workflow erlauben — nur pro Rolle/Team/Integration. Ein Bypass für die Actions-Integration (der Default-`GITHUB_TOKEN` läuft unter dieser Integration) hätte die Regel für **jeden** Workflow im Repo ausgehebelt, nicht nur für `sync-vault.yml`.

## Tool

`obsidian-headless` — offizielles npm-CLI von Obsidian (`npm install -g obsidian-headless`, Node ≥ 22, bin heißt `ob`).
Quellen: [obsidian.md/help/sync/headless](https://obsidian.md/help/sync/headless), [github.com/obsidianmd/obsidian-headless](https://github.com/obsidianmd/obsidian-headless).

Benötigt: aktives Obsidian Sync Abonnement.

2FA/MFA für das verwendete Sync-Konto ist **deaktiviert** (Entscheidung von Stefan) — nicht-interaktiver Login ist damit unproblematisch.

Relevante Kommandos (verifiziert):
- `ob login --email <email> --password <password>` — nicht-interaktiver Login.
- `ob sync-list-remote` — Remote-Vaults auflisten (einmalig zur Namensermittlung).
- `ob sync-setup --vault "<Name>" --path ./vault --device-name github-action-website-publish [--password <e2ee-pw>]` — lokalen Ordner mit Remote-Vault verknüpfen.
- `ob sync-config --path ./vault --mode pull-only` — zusätzlich zum ursprünglich vorgesehenen 3-Schritte-Flow ergänzt, beschränkt Sync auf reine Pull-Richtung, damit der Workflow niemals versehentlich etwas in den Obsidian-Vault zurückschreibt.
- `ob sync --path ./vault` — einmaliger Sync-Lauf.

---

## Umgesetzte Änderungen am Repository

### 1. Vault-Verzeichnis

`vault/` existiert bereits seit PR #67 (Content-Layer-Ingestion).

### 2. `.gitignore`

Lokale Obsidian-Sync-Metadaten vom Repo ausgeschlossen (Config-Dir-Default ist `.obsidian`, wird bei jedem CI-Lauf frisch angelegt und nicht committet):

```
vault/.obsidian/
```

### 3. `package.json`

`obsidian-headless` als devDependency (statt global) — damit `npm ci` es reproduzierbar mitinstalliert und `ob` über `node_modules/.bin` verfügbar ist. Bewusst **keine** `sync:vault*`-Scripts: Der Workflow ruft `ob` direkt mit vollen Flags auf, und als lokale Convenience wären sie kaum mehr als eine dünne Hülle (`sync-setup` bräuchte den Vault-Namen ohnehin bei jedem Aufruf per `-- --vault "..."`). Für einen manuellen Lauf: `node_modules/.bin/ob sync-setup --vault "<Name>" --path ./vault`.

### 4. GitHub Actions Workflow

`.github/workflows/sync-vault.yml`

- Trigger: `schedule` (alle 30 Minuten) + `workflow_dispatch` + `repository_dispatch` (Typ `sync-vault`) — Letzteres erlaubt einen On-Demand-Trigger von außen per Webhook: `POST /repos/stefanhoth/stefanhoth.com/dispatches` mit `{"event_type": "sync-vault"}`, authentifiziert mit einem PAT (classic: Scope `repo`; fine-grained: Permission `Contents: write`). Der eingebaute `GITHUB_TOKEN` kann diesen Endpunkt nicht selbst aufrufen.
- Schritte: `npm ci` → Login → Vault verknüpfen (idempotent, da Runner jedes Mal frisch startet) → Pull-only-Modus setzen → Sync → **`npm run build` als erste Validierung** → nur bei Änderungen: Branch `chore/sync-vault` von aktuellem `main` neu aufbauen, force-pushen, PR öffnen (falls noch keiner offen ist) und Auto-Merge (Squash) aktivieren
- Branch-Strategie: fester, wiederverwendeter Branch `chore/sync-vault` statt ein Branch pro Lauf — jeder Lauf baut ihn frisch von `main` aus neu auf (`git switch -c` + `--force`-Push). Dadurch bleibt ein offener PR immer der vollständige, aktuelle Vault-Stand, auch wenn mehrere 30-Minuten-Zyklen vergehen, bevor die Checks durchlaufen. Nach dem Merge löscht GitHub den Branch automatisch (`deleteBranchOnMerge` ist an), der nächste Lauf legt ihn neu an.
- Push und PR-Erstellung laufen über `secrets.GH_COMMIT_PAT`, nicht über `GITHUB_TOKEN` — siehe Begründung oben (sonst laufen `ci.yml`/`preview-deploy.yml` gar nicht an, und ein Push auf `main` würde ohnehin an der Ruleset scheitern).
- `permissions: contents: read` — der Job schreibt nichts mit dem Default-Token, alles Schreibende läuft über das PAT.
- `checkout` mit `persist-credentials: false`: reines Vorsichtsprinzip, da `npm ci` Postinstall-Skripte Dritter ausführt (u. a. für `better-sqlite3`, eine native Abhängigkeit von `obsidian-headless`).
- `gh pr list --head chore/sync-vault --state open --json number --jq '.[0].number // empty'` statt `--jq '.[0].number' | grep -q .` — bei leerem Ergebnis-Array liefert `.[0].number` sonst den String `"null"` zurück, der `grep -q .` fälschlich als "PR existiert schon" durchgehen lässt (beim allerersten Lauf würde nie ein PR angelegt). Mit `// empty` bleibt die Variable bei keinem Treffer tatsächlich leer.

---

## Voraussetzungen (einmalig manuell, durch Stefan)

1. Vault-Namen ermitteln (das Paket exportiert nur ein Binary namens `ob`, nicht `obsidian-headless` — daher `npx -p obsidian-headless`, nicht `npx obsidian-headless`):
   ```bash
   npx -p obsidian-headless ob login
   npx -p obsidian-headless ob sync-list-remote
   ```
2. GitHub Repository Secrets angelegt: `OBSIDIAN_USER`, `OBSIDIAN_PASS`, `OBSIDIAN_VAULT`
3. Optional: `OBSIDIAN_E2EE`, falls der Vault Ende-zu-Ende-verschlüsselt ist
4. `GH_COMMIT_PAT` angelegt: ein PAT mit Schreibrechten auf `Contents` und `Pull requests` für dieses Repo (fine-grained, auf dieses eine Repo beschränkt — kein Admin/Owner-Scope nötig, da die Ruleset für normale PRs 0 Approvals verlangt)
5. Ersten Lauf manuell über `workflow_dispatch` anstoßen und Ergebnis prüfen, bevor man sich auf den 30-Minuten-Zeitplan verlässt. Dabei auch verifizieren:
   - dass der PR tatsächlich aufgeht und `ci.yml` + `preview-deploy.yml` darauf laufen (nicht nur `workflow_dispatch`/`repository_dispatch` selbst)
   - dass Auto-Merge sich nach allen 4 grünen Checks + erfolgreichem `preview`-Deployment tatsächlich auslöst
   - dass der gemergte Commit auf `main` einen `Workers Builds: stefanhoth-com`-Check-Run auslöst (= Cloudflare-Deploy läuft)

---

## Offene Punkte

- **Session-Persistenz**: Die Doku von `obsidian-headless` spezifiziert nicht genau, wie/wo Login-Sessions gespeichert werden. Der Workflow loggt sich bei jedem Lauf frisch ein (Runner ist ephemer) — funktioniert, ist aber ggf. langsamer als ein persistenter Client. Sollte sich das nach den ersten Läufen als unzuverlässig erweisen (Rate-Limiting etc.), muss das CLI-Verhalten erneut geprüft werden.
- **Laufzeit von CI/E2E vs. 30-Minuten-Takt**: Falls `ci.yml` + `preview-deploy.yml` (inkl. E2E gegen die Preview) länger als ein paar Minuten brauchen, könnte der nächste Sync-Lauf schon wieder auf `chore/sync-vault` force-pushen, während der vorherige PR noch auf Checks wartet — GitHubs `strict_required_status_checks_policy` verlangt dann ohnehin einen aktuellen Branch-Stand, sodass sich das über den nächsten Zyklus von selbst auflöst. Noch nicht über mehrere reale Zyklen hinweg beobachtet.

## Hinweis

Obsidian Sync Headless und die Desktop-App sollten **nicht gleichzeitig auf demselben Device** gegen denselben Vault synchronisieren — das kann zu Konflikten führen. Der `pull-only`-Modus im Workflow reduziert dieses Risiko zusätzlich, da der Workflow niemals in den Vault zurückschreibt.

---

## Bestehende Infrastruktur bleibt unverändert

- Astro + Tailwind + Content Layer (Haupt-Site, seit PR #67)
- Cloudflare Workers Builds (automatisches Deployment bei Push auf `main`, über die Cloudflare-GitHub-App — unverändert seit PR #44, `npm run worker:deploy` bleibt zusätzlich für manuelle/lokale Deploys verfügbar)
- Kein Obsidian Publish Abonnement erforderlich
