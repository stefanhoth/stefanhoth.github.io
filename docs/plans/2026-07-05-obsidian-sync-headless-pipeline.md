# Plan: Obsidian Sync Headless → GitHub Repo → Netlify

**Datum:** 2026-07-05
**Status:** In Planung

---

## Ziel

Vault-Inhalte aus Obsidian Sync automatisch ins GitHub-Repository ziehen, ohne die Desktop-App öffnen zu müssen. Netlify baut die Astro-Site dann wie bisher aus dem Repo.

## Flow

```
Obsidian App (any device)
        ↓  bearbeiten
Obsidian Sync (Cloud)
        ↓  ob sync (GitHub Actions, geplant)
GitHub Repo  →  vault/
        ↓  push auf main
Netlify (auto-deploy)
        ↓
stefanhoth.com
```

## Tool

`obsidian-headless` — offizielles npm-CLI von Obsidian (open beta).
Dokumentation: https://obsidian.md/help/sync/headless

Benötigt: aktives Obsidian Sync Abonnement.

---

## Geplante Änderungen am Repository

### 1. Vault-Verzeichnis

```
vault/    ← neue Ablage für die gesyncten Markdown-Dateien
```

### 2. `.gitignore`

Lokale Obsidian-Metadaten vom Repo ausschließen:

```
vault/.obsidian/workspace.json
vault/.obsidian/workspace-mobile.json
vault/.obsidian/cache
vault/.obsidian/plugins/
vault/.obsidian/themes/
vault/.obsidian/snippets/
```

### 3. `package.json`

Neue Scripts:

```json
"sync:vault": "ob sync --path vault/",
"sync:vault:setup": "ob sync-setup --vault \"<VAULT-NAME>\" --path vault/"
```

`obsidian-headless` als devDependency.

### 4. GitHub Actions Workflow

Neue Datei: `.github/workflows/sync-vault.yml`

- Trigger: Zeitplan (alle 30 Minuten) + manuell (`workflow_dispatch`)
- Schritte: Login → Vault verknüpfen → Sync → Commit & Push
- Commit-Message enthält `[skip ci]` um Endlosschleifen zu vermeiden
- Credentials kommen aus Repository Secrets (werden nicht im Code gespeichert)

---

## Voraussetzungen (einmalig manuell)

1. Vault-Namen ermitteln:
   ```bash
   npx obsidian-headless ob login
   npx obsidian-headless ob sync-list-remote
   ```
2. GitHub Repository Secrets anlegen (Names: `OBSIDIAN_EMAIL`, `OBSIDIAN_PASSWORD`, `OBSIDIAN_VAULT_NAME`)
3. Optional: E2EE-Passwort als Secret, falls der Vault end-to-end verschlüsselt ist

---

## Hinweis

Obsidian Sync Headless und die Desktop-App sollten **nicht gleichzeitig auf demselben Device** gegen denselben Vault synchronisieren — das kann zu Konflikten führen.

---

## Bestehende Infrastruktur bleibt unverändert

- Astro + Tailwind (Haupt-Site)
- Netlify (Deployment)
- Kein Obsidian Publish Abonnement erforderlich
