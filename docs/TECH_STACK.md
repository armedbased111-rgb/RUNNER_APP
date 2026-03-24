# RUNNER — Stack Technique

## Framework Desktop

**Tauri v2** (Rust + WebView natif)
- Binaires légers (~5-15MB vs ~150MB Electron)
- Performances natives
- Releases GitHub win/mac via tauri-action
- Sécurité meilleure qu'Electron (pas de Node dans le renderer)

---

## Frontend

**React + TypeScript**
- Pas de lib de composants — tout custom pour coller à la DA Marathon
- Routing : TanStack Router (type-safe)

**Tailwind CSS**
- Utility-first pour itérer vite sur la DA
- Config custom (tokens couleurs Marathon, typo, spacing) dans `tailwind.config.ts`
- Pas de composant UI tiers — classes Tailwind + composants React maison

**Zustand**
- State global léger : run active, timer, quête courante, navigation
- Stores séparés par domaine : `runStore`, `questStore`, `noteStore`

---

## Données (local)

**SQLite + Drizzle ORM**
- SQLite via `tauri-plugin-sql`
- Drizzle pour le schéma TypeScript-first et les migrations
- Toutes les données locales : runs, quêtes, contrats, notes
- Pas de cloud en v1

**Schéma (grandes lignes) :**
```
factions      — id, name, color, icon
quests        — id, title, faction_id, status, created_at
runs          — id, quest_id, started_at, ended_at, status, debrief_note
contracts     — id, run_id, content (JSON checklist)
notes         — id, quest_id, run_id?, title, body (markdown), updated_at
```

---

## Notes Markdown

**CodeMirror 6**
- Même éditeur qu'Obsidian — hautement customisable
- Extensions : markdown syntax highlighting, keymaps vim-optionnel, wikilinks `[[...]]`
- Rendu markdown : `@codemirror/lang-markdown` + preview custom React

---

## Distribution

- **tauri-action** (GitHub Actions) — build automatique win/mac sur chaque release tag
- Auto-updater Tauri intégré
- Apple notarization à prévoir
- Windows code signing (optionnel v1)

---

## Dev Tooling

- **Vite** — bundler frontend (inclus dans Tauri scaffold)
- **pnpm** — package manager
- **ESLint + Prettier** — lint & format
- **Rust toolchain stable** — pour les commandes Tauri côté backend

---

## Décisions arrêtées

| Sujet | Décision |
|-------|----------|
| Police | Share Tech Mono |
| Factions | CYAC, NUCAL, TRAXUS, MIDA, ARACHNE, SEKGEN (les 6) |
| Avatar | Placeholder fixe |
| Audio | Aucun son |
