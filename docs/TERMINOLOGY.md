# RUNNER — Terminologie

Tous les termes de l'app sont calqués sur l'univers de Marathon (Bungie, 2026).

---

## Entités principales

### Runner
L'utilisateur. Il effectue des runs, accumule un historique, progresse dans ses quêtes.

### Faction
Reprise directement des factions de Marathon. Utilisée comme **catégorie de projet / contexte de travail** (ex: un client, un projet perso, un domaine). Purement DA — les factions ont leur identité visuelle propre (couleurs, emblèmes).

> Les factions disponibles sont celles du jeu : à définir après review des assets Marathon 2026.

### Quête
L'**objectif principal** d'une run ou d'une série de runs. Une quête a :
- Un titre
- Une faction associée
- Des notes liées (markdown)
- Un statut (active, complétée, abandonnée)
- Un historique des runs qui y ont contribué

### Contrat
Les **tâches concrètes** à accomplir pendant une run. Présentées sous forme de cards, style interface Marathon. Un contrat par run peut contenir plusieurs items.

Structure d'un contrat :
- [ ] Tâche 1
- [ ] Tâche 2
- [ ] Tâche 3

### Run
Une session de travail de **25 minutes fixes**. Elle contient :
- Une quête associée
- Un contrat (liste de tâches)
- Une note optionnelle pré-run (intention)
- Un bilan post-run (résultat)
- Un timestamp (date, heure de début, heure de fin)
- Un statut : `completed` / `abandoned`

---

## États d'une Run

```
PREP → ACTIVE → (25min) → DEBRIEF → LOGGED
```

- **PREP** : écran de préparation. Sélection quête + rédaction contrat.
- **ACTIVE** : timer en cours. Vue focus.
- **DEBRIEF** : post-run. Bilan rapide, marquage des contrats accomplis.
- **LOGGED** : run archivée dans l'historique.

---

## Vocabulaire UI

| Terme UI | Signification |
|----------|--------------|
| "Lancer une run" | Démarrer une session de 25 min |
| "Préparer le contrat" | Définir les tâches avant la run |
| "Débrief" | Écran post-run de bilan |
| "Journal de bord" | Historique de toutes les runs |
| "Quartier général" | Dashboard principal |
