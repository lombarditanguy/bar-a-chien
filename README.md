# 🐶 Bar à Chiens — prototype idle/clicker

Prototype jouable minimal pour valider la boucle de jeu centrale, avant un
éventuel portage vers un moteur de jeu pour Android.

## Jouer

Ouvrir `index.html` dans un navigateur, c'est tout (aucun build, aucun serveur).
Sur mobile : le jeu est responsive, testable via le navigateur du téléphone.

## Boucle de jeu

- Chaque chien génère automatiquement des pièces par seconde.
- **Adopter** (coût croissant) : ajoute un chien dans un emplacement libre — on
  lui donne un nom à l'adoption (renommable en touchant son nom ✏️).
- **Croquettes** : +1 pièce/s par chien à chaque niveau.
- **Agrandir** : +2 emplacements (max 20).
- Toucher un chien = caresse = petit bonus immédiat (+ animation).
- Progression sauvegardée en `localStorage` ; gains hors-ligne au retour
  (50 % du revenu, plafonné à 8 h) avec popup « Bon retour ».

## Structure du code

| Fichier | Rôle |
|---|---|
| `config.js` | Données & équilibrage (races, coûts, revenus, réglages). Pour itérer, c'est ici. |
| `state.js` | État de la partie + sauvegarde/chargement `localStorage`. |
| `game.js` | Logique pure (revenus, coûts, actions, tick, gains hors-ligne) — zéro DOM. |
| `ui.js` | Rendu DOM, formatage des nombres, popups, effets visuels. |
| `main.js` | Démarrage + boucle de jeu (`requestAnimationFrame`) + autosauvegarde. |
| `style.css` | Style cartoon (placeholder emoji en attendant de vrais assets). |

Scripts classiques (pas de modules ES) pour rester jouable en `file://`.
La séparation logique/UI est volontaire : elle facilitera le portage vers un
moteur (Godot, ou un wrapper type Capacitor).

## Prévu dans l'architecture (non implémenté)

- `state.boosts.incomeMultiplier` + `boostEndsAt` : hook pour la pub
  récompensée (« ×2 pendant 30 min »).
- `state.premiumCredits` : monnaie premium.
- `CONFIG.breeds` : liste extensible (coût de déblocage par race, revenu propre,
  accessoires… à ajouter).
