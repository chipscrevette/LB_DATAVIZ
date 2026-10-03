# LeBron James 2017-18

La saison 2017-18 de LeBron James racontée match par match : 104 matchs (82 de saison régulière, 22 de playoffs), points, rebonds et passes, comparés à la moyenne des dix meilleurs joueurs de la ligue dans chaque catégorie.

- **Récit défilant** : un seul grand graphique, trois courbes (points, rebonds, passes) qui s’allument match par match au fil du scroll, avec des pauses sur onze moments de la saison (57 points à Washington, le trou d'air de janvier, le tir au buzzer contre Toronto, les 51 points en finale…).
- **Bilan** : combien de soirs au niveau de l'élite, saison régulière contre playoffs, chiffres clés.
- **Tableau** des 104 matchs pour qui veut les chiffres bruts.

Survolez le graphique pour le détail d'un match.

## Lancer

Site statique sans build. Ouvrez `index.html`, ou servez le dossier :

```sh
python3 -m http.server
```

## Structure

```
index.html         la page
assets/styles.css  mise en page, thèmes clair et sombre
assets/data.js     feuille de match, référence Top 10, chapitres du récit
assets/main.js     graphiques (D3 v7) et logique de défilement
```

## Données

Feuilles de match officielles NBA 2017-18. Les moyennes recalculées retombent sur les chiffres officiels : 27,5 pts / 8,6 reb / 9,1 pas en saison régulière, 34,0 / 9,1 / 9,0 en playoffs.

Conception et réalisation : Kévin Lu Cong Sang.
