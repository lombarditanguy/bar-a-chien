# 🐶 Bar à Chiens — prototype idle/clicker

Prototype jouable pour valider la boucle de jeu, avant portage Android
(Capacitor ou moteur de jeu).

## Jouer

Ouvrir `index.html` dans un navigateur, c'est tout (aucun build, aucun serveur).
Sur mobile : le jeu est responsive, testable via le navigateur du téléphone.

## Boucle de jeu

- Chaque chien génère automatiquement des pièces par seconde.
- **Adopter** : ouvre le choix des races. 5 races avec des revenus croissants
  (×1 à ×16) ; les races avancées se débloquent avec des pièces (🔒), puis
  chaque adoption a un coût croissant. On nomme le chien à l'adoption.
- **Fiche d'un chien** (toucher son nom ✏️) : renommer + acheter des
  accessoires — 🎾 balle (+25 %), 🥣 gamelle (+25 %), 🛏️ panier (+50 %),
  🎀 nœud (purement cosmétique, « pour le style ! »). Les accessoires
  s'affichent sur la carte du chien.
- **Croquettes** : +1 pièce/s de base par chien à chaque niveau (multiplié
  par la race et les accessoires).
- **Agrandir** : +2 emplacements (max 20).
- Toucher un chien = caresse = petit bonus immédiat (+ « wouf » + animation).
- Sons synthétisés en WebAudio (aucun fichier audio), coupables avec 🔊/🔇.
- Progression sauvegardée en `localStorage` (compatible avec les sauvegardes
  du premier prototype) ; gains hors-ligne au retour (50 % du revenu,
  plafonné à 8 h) avec popup « Bon retour ».

## Structure du code

| Fichier | Rôle |
|---|---|
| `config.js` | Données & équilibrage (races, accessoires, coûts, revenus). Pour itérer, c'est ici. |
| `state.js` | État de la partie + sauvegarde/chargement `localStorage` + migration des vieilles sauvegardes. |
| `game.js` | Logique pure (revenus, coûts, actions, tick, gains hors-ligne) — zéro DOM. |
| `audio.js` | Petits sons synthétisés (WebAudio). |
| `ui.js` | Rendu DOM, popups (adoption, fiche chien), effets visuels. |
| `main.js` | Démarrage + boucle de jeu (`requestAnimationFrame`) + autosauvegarde. |
| `style.css` | Style cartoon (placeholder emoji en attendant de vrais assets). |

Scripts classiques (pas de modules ES) pour rester jouable en `file://`.
La séparation logique/UI est volontaire : elle facilitera le portage
(Capacitor garde tout ce code tel quel ; un moteur ne reprendrait que `game.js`).

## Formule de revenu

`revenu d'un chien = (1 + niveau croquettes) × multiplicateur de race × (1 + somme des bonus d'accessoires)`

## Prévu dans l'architecture (non implémenté)

- `state.boosts.incomeMultiplier` + `boostEndsAt` : hook pour la pub
  récompensée (« ×2 pendant 30 min »).
- `state.premiumCredits` : monnaie premium.
