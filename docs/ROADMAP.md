# RUNNER — Roadmap

## Phase 0 — Fondations & DA (actuel)
**Objectif : définir ce qu'on construit avant de coder**

- [x] Vision produit
- [x] Terminologie / univers
- [x] Features v1
- [x] Stack technique
- [ ] DA : référentiel Marathon (couleurs, typo, layouts, cards)
- [ ] DA : maquettes wireframe des 5 écrans principaux
- [ ] DA : définir les factions et leurs assets visuels
- [ ] Décisions techniques finalisées

---

## Phase 1 — Scaffold & Core Timer
**Objectif : une run qui tourne**

- [ ] Init projet Tauri + React + TypeScript
- [ ] Setup base SQLite (schema : runs, quêtes, contrats)
- [ ] Écran PREP : formulaire quête + contrat
- [ ] Écran ACTIVE : timer 25min, affichage quête/contrat
- [ ] Écran DEBRIEF : bilan + sauvegarde run
- [ ] Navigation entre les 3 états
- [ ] Aucun style — fonctionnel d'abord

---

## Phase 2 — DA Marathon
**Objectif : l'app ressemble à ce qu'elle doit être**

- [ ] Système de design (tokens couleurs, typo, spacing)
- [ ] Cards style Marathon pour les contrats
- [ ] Identité visuelle des factions
- [ ] Écran ACTIVE immersif (HUD)
- [ ] Animations / transitions
- [ ] Icône app + splash

---

## Phase 3 — Quêtes & Notes
**Objectif : l'organisation complète**

- [ ] CRUD quêtes complet
- [ ] Association faction ↔ quête
- [ ] Éditeur markdown natif dans les quêtes
- [ ] Notes liées aux runs (pré + post run)
- [ ] Liens internes `[[wikilinks]]` entre notes

---

## Phase 4 — Dashboard & Historique
**Objectif : voir sa progression**

- [ ] Dashboard "Quartier Général"
- [ ] Journal de bord (liste des runs)
- [ ] Filtres par faction / quête / date
- [ ] Statistiques : streak, total runs, runs/jour

---

## Phase 5 — Distribution
**Objectif : app installable sur win/mac**

- [ ] GitHub Actions : build win + mac via tauri-action
- [ ] Auto-updater Tauri
- [ ] Apple notarization
- [ ] Windows code signing (optionnel v1)
- [ ] Page de release GitHub soignée

---

## Backlog futur (post v1)

- Sync cloud (optionnel)
- Import/export des notes (format Obsidian compatible)
- Thèmes alternatifs
- Statistiques avancées
- Intégrations (GitHub Issues, etc.)
