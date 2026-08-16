# 🐶 Bar à Chiens — prototype idle/clicker

Prototype jouable pour valider la boucle de jeu, avant portage Android
(Capacitor ou moteur de jeu).

## Jouer

Ouvrir `index.html` dans un navigateur, c'est tout (aucun build, aucun serveur).
Sur mobile : le jeu est responsive, testable via le navigateur du téléphone.

## Boucle de jeu

Le bar est une scène vivante : des **clients** entrent par la porte,
s'installent près d'un chien, commandent une boisson, **paient** (pièce animée
vers le compteur) et repartent. Plus le bar a de chiens — et plus ils sont
« charmants » (races rares, accessoires) — plus les clients arrivent vite.
Le revenu moyen affiché « +N /s » = fréquence des clients × ce qu'ils paient.

- L'argent vient des clients attirés par les chiens.
- **Adopter** : ouvre le choix des races. 11 races dessinées avec des revenus
  croissants (×1 à ×1024, du Chiot au Chien magique ✨) ; les races avancées se
  débloquent avec des pièces (🔒), puis chaque adoption a un coût croissant.
  On nomme le chien à l'adoption.
- **Fiche d'un chien** (toucher son nom ✏️) : renommer + acheter 7 accessoires
  — balle (+25 %, le chien va la chercher !), gamelle (+25 %), nœud et chapeau
  de fête (cosmétiques), panier (+50 %), lunettes de soleil (+25 %), os doré
  (+75 %). Tous dessinés sur le chien.
- **Missions** : objectifs successifs (adopter, caresser, servir des clients,
  débloquer des races…) avec récompenses à réclamer — toujours un prochain but.
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
| `ui.js` | Rendu DOM (scène, coussins, chiens), popups, effets visuels. |
| `customers.js` | Clients animés : entrée, commande, paiement, sortie. |
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
