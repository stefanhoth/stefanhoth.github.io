# Plan: Obsidian Sync Headless → GitHub Repo → Cloudflare Workers

**Datum:** 2026-07-05
**Aktualisiert:** 2026-07-08 — Netlify-Annahmen durch den tatsächlichen Cloudflare-Workers-Flow ersetzt, CLI-Kommandos gegen die offizielle `obsidian-headless`-Doku verifiziert. Korrigiert: entgegen einer ersten (falschen) Version dieses Dokuments deployt Cloudflare bei Push auf `main` automatisch in Produktion, über die Cloudflare-GitHub-App ("Cloudflare Workers and Pages", Dashboard-Integration, kein Workflow in diesem Repo) — sichtbar als Check-Run `Workers Builds: stefanhoth-com`. Ein Vault-Sync auf `main` geht damit **automatisch live**, sobald Cloudflares eigener Build erfolgreich ist.
**Status:** Umgesetzt (Workflow `sync-vault.yml`) — Repository-Secrets angelegt (`OBSIDIAN_USER`/`PASS`/`VAULT`/`E2EE`).

---

## Ziel

Vault-Inhalte aus Obsidian Sync automatisch ins GitHub-Repository ziehen, ohne die Desktop-App öffnen zu müssen.

## Flow

```
Obsidian App (any device)
        ↓  bearbeiten
Obsidian Sync (Cloud)
        ↓  ob sync (GitHub Actions, alle 30 Min + manuell + Webhook)
GitHub Repo  →  vault/  (Commit auf main, nur wenn npm run build durchläuft)
        ↓
        Cloudflare Workers Builds (GitHub-App-Integration, kein Workflow
        in diesem Repo — baut + deployt automatisch bei jedem Push auf main)
stefanhoth.com  (live, sobald der Cloudflare-Build erfolgreich ist)
```

**Unterschied zum ursprünglichen Plan:** Das Repo lief beim Schreiben dieses Plans noch auf Netlify (Auto-Deploy bei jedem Push auf `main`). Seit PR #44 läuft es auf Cloudflare Workers — der Mechanismus dahinter hat sich geändert, das Verhalten aber nicht: Die Cloudflare-GitHub-App ("Cloudflare Workers and Pages") ist auf das Repo installiert und deployt bei jedem Push auf `main` automatisch nach Produktion (Check-Run `Workers Builds: stefanhoth-com`, sichtbar z. B. unter github.com/stefanhoth/stefanhoth.com/runs/&lt;id&gt;). Das läuft unabhängig von `ci.yml` (Lint/Build/Test) und `preview-deploy.yml` (nur bei PRs) — beide bleiben unverändert bestehen. Ein Vault-Sync, der auf `main` committet wird, geht also **automatisch live**, sobald Cloudflares eigener Build erfolgreich durchläuft. Das `npm run build`-Gate im Sync-Workflow (siehe unten) verhindert zusätzlich, dass kaputte Frontmatter überhaupt erst auf `main` landet — Cloudflares Build ist die zweite, nachgelagerte Absicherung.

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

```json
"sync:vault": "ob sync --path ./vault",
"sync:vault:setup": "ob sync-setup --path ./vault"
```

`obsidian-headless` als devDependency (statt global) — damit `npm ci` es reproduzierbar mitinstalliert und `ob` über `node_modules/.bin` verfügbar ist.

### 4. GitHub Actions Workflow

`.github/workflows/sync-vault.yml`

- Trigger: `schedule` (alle 30 Minuten) + `workflow_dispatch` + `repository_dispatch` (Typ `sync-vault`) — Letzteres erlaubt einen On-Demand-Trigger von außen per Webhook: `POST /repos/stefanhoth/stefanhoth.com/dispatches` mit `{"event_type": "sync-vault"}`, authentifiziert mit einem PAT (classic: Scope `repo`; fine-grained: Permission `Contents: write`). Der eingebaute `GITHUB_TOKEN` kann diesen Endpunkt nicht selbst aufrufen — dafür ist ein separates, von Stefan verwaltetes PAT nötig, das nicht Teil dieses Workflows ist.
- Schritte: `npm ci` → Login → Vault verknüpfen (idempotent, da Runner jedes Mal frisch startet) → Pull-only-Modus setzen → Sync → **`npm run build` als Validierungs-Gate** → Commit & Push, nur wenn der Build durchläuft
- **Kein `[skip ci]`**: Ein direkter Push mit dem Standard-`GITHUB_TOKEN` löst laut GitHub ohnehin keine Folge-Workflows aus (Rekursionsschutz) — `ci.yml` würde auf diesem Commit gar nicht laufen. Deshalb läuft die Build-Validierung (das eigentliche Sicherheitsnetz für kaputte Frontmatter aus `docs/plans/2026-07-05-obsidian-cms-vault-struktur.md`) **innerhalb** des Sync-Jobs selbst, vor dem Commit — schlägt der Build fehl, wird nichts committet und der Job schlägt sichtbar fehl.
- **Deploy wird trotzdem getriggert**: Der `GITHUB_TOKEN`-Rekursionsschutz betrifft nur GitHub-Actions-Workflows im selben Repo. Cloudflares GitHub-App bekommt den Push-Webhook auch bei Bot-Pushes zugestellt ([bestätigt in GitHubs Community-Diskussion #25702](https://github.com/orgs/community/discussions/25702)) und deployt den Sync-Commit ganz normal — Content-Update und Deployment sind also **nicht** voneinander getrennt.
- Credentials aus Repository Secrets (werden nicht im Code gespeichert)
- `permissions: contents: write`, sonst nichts
- `checkout` mit `persist-credentials: false`: `npm ci` führt Postinstall-Skripte Dritter aus (u. a. für `better-sqlite3`, eine native Abhängigkeit von `obsidian-headless`); der schreibende `GITHUB_TOKEN` wird erst im letzten Schritt (Commit & Push) explizit in die Remote-URL eingesetzt, damit er während `npm ci` und den Obsidian-CLI-Schritten nicht im Git-Credential-Store liegt

---

## Voraussetzungen (einmalig manuell, durch Stefan)

1. Vault-Namen ermitteln:
   ```bash
   npx obsidian-headless ob login
   npx obsidian-headless ob sync-list-remote
   ```
2. GitHub Repository Secrets angelegt: `OBSIDIAN_USER`, `OBSIDIAN_PASS`, `OBSIDIAN_VAULT`
3. Optional: `OBSIDIAN_E2EE`, falls der Vault Ende-zu-Ende-verschlüsselt ist
4. Ersten Lauf manuell über `workflow_dispatch` anstoßen und Ergebnis prüfen, bevor man sich auf den 30-Minuten-Zeitplan verlässt. Dabei auch verifizieren:
   - dass der Sync-Commit auf `main` einen `Workers Builds: stefanhoth-com`-Check-Run auslöst (= Deploy läuft)
   - dass im Cloudflare-Dashboard (**Settings → Builds**) keine [Build Watch Paths](https://developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/) konfiguriert sind, die `vault/` ausschließen — sonst würde Cloudflare den Build für reine Vault-Commits überspringen und Content-Update und Deployment wären doch getrennt

---

## Offene Punkte

- **Session-Persistenz**: Die Doku von `obsidian-headless` spezifiziert nicht genau, wie/wo Login-Sessions gespeichert werden. Der Workflow loggt sich bei jedem Lauf frisch ein (Runner ist ephemer) — funktioniert, ist aber ggf. langsamer als ein persistenter Client. Sollte sich das nach den ersten Läufen als unzuverlässig erweisen (Rate-Limiting etc.), muss das CLI-Verhalten erneut geprüft werden.

## Hinweis

Obsidian Sync Headless und die Desktop-App sollten **nicht gleichzeitig auf demselben Device** gegen denselben Vault synchronisieren — das kann zu Konflikten führen. Der `pull-only`-Modus im Workflow reduziert dieses Risiko zusätzlich, da der Workflow niemals in den Vault zurückschreibt.

---

## Bestehende Infrastruktur bleibt unverändert

- Astro + Tailwind + Content Layer (Haupt-Site, seit PR #67)
- Cloudflare Workers Builds (automatisches Deployment bei Push auf `main`, über die Cloudflare-GitHub-App — unverändert seit PR #44, `npm run worker:deploy` bleibt zusätzlich für manuelle/lokale Deploys verfügbar)
- Kein Obsidian Publish Abonnement erforderlich
