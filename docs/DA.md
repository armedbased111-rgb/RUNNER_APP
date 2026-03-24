# RUNNER — Direction Artistique

Référence : **Marathon (Bungie, 2026)** — UI in-game, écran Contrats

---

## Palette de couleurs

```
Background principal   #0f0f0f   — noir profond, fond de l'app
Surface card           #1a1a1a   — fond des cards contrats
Surface raised         #242424   — éléments surélevés, hover states
Border subtile         #2e2e2e   — bordures des cards, séparateurs

Accent vert neon       #aaff00   — titres actifs, badges faction, barres de progression
Accent teal            #00c8b4   — faction active (ex: CYAC sélectionnée), highlights
Accent rouge           #ff3b30   — abandon run, états d'erreur

Texte primaire         #e8e8e8   — corps de texte, descriptions
Texte secondaire       #888888   — labels muted, métadonnées
Texte sur vert         #0f0f0f   — texte sur fond accent vert

Locked / disabled      #3a3a3a   — tâches verrouillées, états inactifs
Progress bg            #2a2a2a   — fond des barres de progression
Progress fill          #aaff00   — remplissage des barres (même vert neon)
```

---

## Typographie

Style général : **terminal / CRT monospace** — tout est technique, pas de serif, pas de fantaisie.

```
Font principale : "Share Tech Mono" (Google Fonts, libre)
  → À défaut : "Courier Prime", "IBM Plex Mono", ou "JetBrains Mono"

Hiérarchie :
  Titre card (ex: "INTRODUCING: NUCALORIC")  → 13px, uppercase, bold, couleur vert neon
  Badge lieu (ex: "PERIMETER")               → 10px, uppercase, bg #2a2a2a, padding 2px 6px
  Corps texte description                    → 12px, regular, couleur texte primaire
  Label section (ex: "IN A SINGLE RUN:")     → 10px, uppercase, semibold, texte secondaire
  Tâche texte                                → 12px, regular
  Compteur (ex: "0/1")                       → 11px, monospace, texte secondaire
  Reward number (ex: "90")                   → 13px, bold, texte primaire
  Nav items (ex: "CONTRACTS")                → 11px, uppercase, letter-spacing large
```

---

## Layout général

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR — stats runner + tabs factions                     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │  MAIN CONTENT — cards 3 colonnes                │
│          │                                                  │
│ Avatar   │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ Rank/XP  │  │  CARD 1  │  │  CARD 2  │  │  CARD 3  │      │
│ ──────── │  │          │  │          │  │          │      │
│ AGENT    │  └──────────┘  └──────────┘  └──────────┘      │
│ CONTRACTS│                                                  │
│ UPGRADES │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## Composant : Top Bar

- Fond `#0f0f0f`, bordure bottom `#2e2e2e`
- Gauche : icône app + stats runner (icon bouclier + HP, icon monnaie)
- Centre : tabs factions — texte uppercase, tab active = bg vert neon + texte noir
- Droite : statut connexion, icônes

**Mapping RUNNER :**
- Stats → runs aujourd'hui, streak
- Tabs factions → filtrer les quêtes par faction

---

## Composant : Sidebar

- Fond `#111111`, width fixe ~180px
- Avatar : carré, teinté vert (filter CSS ou border vert neon)
- RANK + barre XP (barre fine, vert neon)
- Nav items : uppercase, letter-spacing, item actif = texte vert neon

**Mapping RUNNER :**
- AGENT → Dashboard / Quartier Général
- CONTRACTS → Vue quêtes + lancer une run
- UPGRADES → Paramètres / Historique

---

## Composant : Card Contrat

Structure verticale stricte, bordure `#2e2e2e`, fond `#1a1a1a` :

```
┌─────────────────────────────────────┐
│ [TITRE EN VERT NEON UPPERCASE]      │  ← header fond vert #aaff00, texte #0f0f0f
├─────────────────────────────────────┤
│ [BADGE LIEU]                        │  ← bg #2a2a2a, texte uppercase
│                                     │
│ Texte de description de la quête    │
│ sur plusieurs lignes si besoin.     │
│                                     │
│ IN A SINGLE RUN:                    │  ← label section, texte muted uppercase
│                                     │
│ Texte de la tâche 1                 │
│ [████░░░░░░░░░░░░░░░░] 0/1    [90] │  ← barre progression + compteur + reward
│                                     │
│ Texte de la tâche 2         [🔒]   │  ← tâche verrouillée (locked state)
│ [░░░░░░░░░░░░░░░░░░░░] 0/1    [60] │
│                                     │
├─────────────────────────────────────┤
│ Show Story & Rewards          [ⓘ]  │  ← footer, texte muted, icône cercle
└─────────────────────────────────────┘
```

**Badge "ACTIVE CONTRACT"** : label flottant au-dessus de la card active, fond `#2e2e2e`, texte uppercase.
**Badge "Active"** : petit pill en bas de card, fond transparent, border vert neon.

---

## Composant : Barre de progression

```
Hauteur : 3px
Fond    : #2a2a2a
Fill    : #aaff00 (vert neon)
Format  : [barre] [compteur 0/1] [espace] [reward number]
```

---

## États visuels

| État | Traitement |
|------|-----------|
| Faction active | Tab bg `#aaff00`, texte `#0f0f0f` |
| Card active (run en cours) | Border `#aaff00` 1px, badge "ACTIVE" |
| Tâche complétée | Texte barré, barre pleine verte |
| Tâche verrouillée | Texte `#3a3a3a`, icône 🔒, barre grisée |
| Hover card | Surface `#222222`, transition 100ms |

---

## Décisions arrêtées

| Sujet | Décision |
|-------|----------|
| Font | "Share Tech Mono" — à confirmer si font propriétaire Marathon |
| Factions | Les 6 du jeu : **CYAC, NUCAL, TRAXUS, MIDA, ARACHNE, SEKGEN** — catégories de quêtes |
| Avatar runner | Placeholder fixe — pas d'upload |
| Sons UI | Aucun son — zéro audio dans l'app |
