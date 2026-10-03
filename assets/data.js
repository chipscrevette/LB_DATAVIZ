// Feuille de match de LeBron James, saison 2017-18 (82 matchs de saison régulière + 22 de playoffs).
// Vérifiée match par match ; les moyennes retombent sur les chiffres officiels
// (27,5 / 8,6 / 9,1 en saison, 34,0 / 9,1 / 9,0 en playoffs).
// Colonnes : n° de match, date, adversaire, à domicile ?, minutes, points, rebonds, passes, playoffs ?
const GAMES = [
  [1, '2017-10-17', 'BOS', true, 41, 29, 16, 9, false],
  [2, '2017-10-20', 'MIL', false, 37, 24, 5, 8, false],
  [3, '2017-10-21', 'ORL', true, 31, 22, 4, 2, false],
  [4, '2017-10-24', 'CHI', true, 37, 34, 2, 13, false],
  [5, '2017-10-25', 'BKN', false, 41, 29, 10, 13, false],
  [6, '2017-10-28', 'NOP', false, 31, 18, 3, 8, false],
  [7, '2017-10-29', 'NYK', true, 39, 16, 10, 7, false],
  [8, '2017-11-01', 'IND', true, 37, 33, 6, 11, false],
  [9, '2017-11-03', 'WAS', false, 43, 57, 11, 7, false],
  [10, '2017-11-05', 'ATL', true, 41, 26, 5, 13, false],
  [11, '2017-11-07', 'MIL', true, 37, 30, 8, 9, false],
  [12, '2017-11-09', 'HOU', false, 40, 33, 4, 7, false],
  [13, '2017-11-11', 'DAL', false, 42, 19, 11, 4, false],
  [14, '2017-11-13', 'NYK', false, 36, 23, 9, 12, false],
  [15, '2017-11-15', 'CHA', false, 37, 31, 6, 8, false],
  [16, '2017-11-17', 'LAC', true, 46, 39, 14, 6, false],
  [17, '2017-11-20', 'DET', false, 27, 18, 2, 8, false],
  [18, '2017-11-22', 'BKN', true, 33, 33, 6, 5, false],
  [19, '2017-11-24', 'CHA', true, 40, 27, 16, 13, false],
  [20, '2017-11-27', 'PHI', false, 31, 30, 14, 6, false],
  [21, '2017-11-28', 'MIA', true, 28, 21, 12, 6, false],
  [22, '2017-11-30', 'ATL', false, 38, 24, 6, 12, false],
  [23, '2017-12-02', 'MEM', true, 39, 34, 2, 12, false],
  [24, '2017-12-04', 'CHI', false, 34, 23, 7, 6, false],
  [25, '2017-12-06', 'SAC', true, 41, 32, 11, 9, false],
  [26, '2017-12-08', 'IND', false, 39, 29, 10, 8, false],
  [27, '2017-12-09', 'PHI', true, 39, 30, 13, 13, false],
  [28, '2017-12-12', 'ATL', true, 35, 25, 7, 17, false],
  [29, '2017-12-14', 'LAL', true, 39, 25, 12, 12, false],
  [30, '2017-12-16', 'UTA', true, 37, 29, 11, 10, false],
  [31, '2017-12-17', 'WAS', false, 41, 20, 11, 15, false],
  [32, '2017-12-19', 'MIL', false, 34, 39, 1, 7, false],
  [33, '2017-12-21', 'CHI', true, 39, 34, 6, 9, false],
  [34, '2017-12-25', 'GSW', false, 40, 20, 6, 6, false],
  [35, '2017-12-27', 'SAC', false, 38, 16, 10, 14, false],
  [36, '2017-12-30', 'UTA', false, 37, 29, 8, 6, false],
  [37, '2018-01-02', 'POR', true, 34, 24, 6, 8, false],
  [38, '2018-01-03', 'BOS', false, 33, 19, 7, 6, false],
  [39, '2018-01-06', 'ORL', false, 37, 33, 10, 9, false],
  [40, '2018-01-08', 'MIN', false, 27, 10, 8, 5, false],
  [41, '2018-01-11', 'TOR', false, 32, 26, 3, 1, false],
  [42, '2018-01-12', 'IND', false, 40, 27, 8, 11, false],
  [43, '2018-01-15', 'GSW', true, 36, 32, 8, 6, false],
  [44, '2018-01-18', 'ORL', true, 35, 16, 5, 6, false],
  [45, '2018-01-20', 'OKC', true, 38, 18, 3, 7, false],
  [46, '2018-01-23', 'SAS', false, 38, 28, 9, 7, false],
  [47, '2018-01-26', 'IND', true, 40, 26, 10, 11, false],
  [48, '2018-01-28', 'DET', true, 38, 25, 8, 14, false],
  [49, '2018-01-30', 'DET', false, 38, 21, 6, 7, false],
  [50, '2018-01-31', 'MIA', true, 38, 24, 11, 5, false],
  [51, '2018-02-03', 'HOU', true, 31, 11, 9, 9, false],
  [52, '2018-02-06', 'ORL', false, 33, 25, 10, 5, false],
  [53, '2018-02-07', 'MIN', true, 48, 37, 10, 15, false],
  [54, '2018-02-09', 'ATL', false, 41, 22, 12, 19, false],
  [55, '2018-02-11', 'BOS', false, 28, 24, 8, 10, false],
  [56, '2018-02-13', 'OKC', false, 40, 37, 8, 8, false],
  [57, '2018-02-22', 'WAS', true, 37, 32, 9, 8, false],
  [58, '2018-02-23', 'MEM', false, 37, 18, 14, 11, false],
  [59, '2018-02-25', 'SAS', true, 40, 33, 13, 9, false],
  [60, '2018-02-27', 'BKN', true, 39, 31, 12, 11, false],
  [61, '2018-03-01', 'PHI', true, 39, 30, 9, 8, false],
  [62, '2018-03-03', 'DEN', true, 42, 25, 10, 15, false],
  [63, '2018-03-05', 'DET', true, 29, 31, 7, 7, false],
  [64, '2018-03-07', 'DEN', false, 39, 39, 8, 10, false],
  [65, '2018-03-09', 'LAC', false, 39, 25, 10, 6, false],
  [66, '2018-03-11', 'LAL', false, 31, 24, 10, 7, false],
  [67, '2018-03-13', 'PHX', false, 33, 28, 12, 11, false],
  [68, '2018-03-15', 'POR', false, 41, 35, 14, 6, false],
  [69, '2018-03-17', 'CHI', false, 40, 33, 13, 12, false],
  [70, '2018-03-19', 'MIL', true, 40, 40, 12, 10, false],
  [71, '2018-03-21', 'TOR', true, 39, 35, 7, 17, false],
  [72, '2018-03-23', 'PHX', true, 29, 27, 6, 9, false],
  [73, '2018-03-25', 'BKN', false, 38, 37, 10, 8, false],
  [74, '2018-03-27', 'MIA', false, 38, 18, 6, 7, false],
  [75, '2018-03-28', 'CHA', false, 37, 41, 10, 8, false],
  [76, '2018-03-30', 'NOP', true, 42, 27, 9, 11, false],
  [77, '2018-04-01', 'DAL', true, 39, 16, 13, 12, false],
  [78, '2018-04-03', 'TOR', true, 37, 27, 10, 6, false],
  [79, '2018-04-05', 'WAS', true, 39, 33, 9, 14, false],
  [80, '2018-04-06', 'PHI', false, 40, 44, 11, 11, false],
  [81, '2018-04-09', 'NYK', false, 39, 26, 6, 11, false],
  [82, '2018-04-11', 'NYK', true, 11, 10, 5, 2, false],
  [83, '2018-04-15', 'IND', true, 44, 24, 10, 12, true],
  [84, '2018-04-18', 'IND', true, 40, 46, 12, 5, true],
  [85, '2018-04-20', 'IND', false, 42, 28, 12, 8, true],
  [86, '2018-04-22', 'IND', false, 46, 32, 13, 7, true],
  [87, '2018-04-25', 'IND', true, 42, 44, 10, 8, true],
  [88, '2018-04-27', 'IND', false, 31, 22, 5, 7, true],
  [89, '2018-04-29', 'IND', true, 43, 45, 8, 7, true],
  [90, '2018-05-01', 'TOR', false, 47, 26, 11, 13, true],
  [91, '2018-05-03', 'TOR', false, 41, 43, 8, 14, true],
  [92, '2018-05-05', 'TOR', true, 41, 38, 6, 7, true],
  [93, '2018-05-07', 'TOR', true, 38, 29, 8, 11, true],
  [94, '2018-05-13', 'BOS', false, 36, 15, 7, 9, true],
  [95, '2018-05-15', 'BOS', false, 39, 42, 10, 12, true],
  [96, '2018-05-19', 'BOS', true, 38, 27, 5, 12, true],
  [97, '2018-05-21', 'BOS', true, 42, 44, 5, 3, true],
  [98, '2018-05-23', 'BOS', false, 39, 26, 10, 5, true],
  [99, '2018-05-25', 'BOS', true, 46, 46, 11, 9, true],
  [100, '2018-05-27', 'BOS', false, 48, 35, 15, 9, true],
  [101, '2018-05-31', 'GSW', false, 48, 51, 8, 8, true],
  [102, '2018-06-03', 'GSW', false, 44, 29, 9, 13, true],
  [103, '2018-06-06', 'GSW', true, 47, 33, 10, 11, true],
  [104, '2018-06-08', 'GSW', true, 41, 23, 7, 8, true]
].map(([game, date, opp, home, min, pts, reb, ast, playoffs]) => ({ game, date, opp, home, min, pts, reb, ast, playoffs }));

// Moyenne des 10 meilleurs joueurs de la ligue dans chaque catégorie en 2017-18
// (référence reprise du projet d'origine).
const TOP10 = { pts: 26.22, reb: 12.07, ast: 8.03 };

const OPPONENTS = {
  ATL: 'Atlanta', BKN: 'Brooklyn', BOS: 'Boston', CHA: 'Charlotte', CHI: 'Chicago',
  DAL: 'Dallas', DEN: 'Denver', DET: 'Detroit', GSW: 'Golden State', HOU: 'Houston',
  IND: 'Indiana', LAC: 'Los Angeles Clippers', LAL: 'Los Angeles Lakers', MEM: 'Memphis',
  MIA: 'Miami', MIL: 'Milwaukee', MIN: 'Minnesota', NOP: 'New Orleans', NYK: 'New York',
  OKC: 'Oklahoma City', ORL: 'Orlando', PHI: 'Philadelphie', PHX: 'Phoenix',
  POR: 'Portland', SAC: 'Sacramento', SAS: 'San Antonio', TOR: 'Toronto', UTA: 'Utah',
  WAS: 'Washington'
};

// Les étapes du récit. `game` est le match sur lequel le graphique s'arrête.
const CHAPTERS = [
  {
    game: 0,
    kicker: 'Mode d’emploi',
    title: 'Rejouez la saison',
    text: 'Faites défiler : les 104 matchs s’allument un par un. Une courbe par catégorie, et en pointillés la moyenne des dix meilleurs joueurs de la ligue. Chaque fois qu’une courbe passe au-dessus, LeBron joue comme l’élite.'
  },
  {
    game: 1,
    kicker: '17 oct. 2017 · Boston',
    title: 'Une ouverture sous tension',
    result: 'Victoire 102-99',
    text: 'LeBron retrouve Kyrie Irving, parti à Boston pendant l’été. La soirée est assombrie par la terrible blessure de Gordon Hayward dans les premières minutes. James frôle le triple-double et Cleveland s’impose.'
  },
  {
    game: 9,
    kicker: '3 nov. 2017 · à Washington',
    title: '57 points',
    result: 'Victoire 130-122',
    text: '23 tirs réussis sur 34. C’est le deuxième plus gros total de sa carrière, et le plus haut sommet de toute la saison.'
  },
  {
    game: 29,
    kicker: '14 déc. 2017 · Lakers',
    title: 'Le rythme de croisière',
    result: 'Victoire 121-112',
    text: 'Triple-double face aux Lakers (25 points, 12 rebonds, 12 passes). Quelques semaines plus tôt, les Cavs ont enchaîné 13 victoires de suite. Les trois courbes flirtent avec leurs pointillés.'
  },
  {
    game: 40,
    kicker: '8 jan. 2018 · à Minnesota',
    title: 'Le trou d’air de janvier',
    result: 'Défaite 127-99',
    text: 'Le mois le plus difficile de la saison. Les Cavs perdent pied et LeBron ne marque que 10 points à Minneapolis. La courbe des points plonge sous les pointillés.'
  },
  {
    game: 53,
    kicker: '7 fév. 2018 · Minnesota',
    title: 'La veille du grand ménage',
    result: 'Victoire 140-138 a.p.',
    text: '48 minutes, 37 points, 10 rebonds, 15 passes. Le lendemain, Cleveland échange six joueurs avant la date limite des transferts. Une nouvelle équipe se construit autour de lui.'
  },
  {
    game: 82,
    kicker: '11 avr. 2018 · New York',
    title: '82 matchs sur 82',
    result: 'Victoire 110-98',
    text: 'Pour la première fois de sa carrière, à 33 ans, LeBron dispute tous les matchs de la saison régulière. Bilan : 27,5 points, 8,6 rebonds et 9,1 passes de moyenne, avec 18 triple-doubles.'
  },
  {
    game: 87,
    kicker: '25 avr. 2018 · Indiana, match 5',
    title: 'Le premier panier au buzzer',
    result: 'Victoire 98-95',
    text: '44 points et un tir à trois points à la dernière seconde. Poussé jusqu’au match 7 par les Pacers dès le premier tour, LeBron y répondra avec 45 points.'
  },
  {
    game: 92,
    kicker: '5 mai 2018 · Toronto, match 3',
    title: 'Le tir impossible',
    result: 'Victoire 105-103',
    text: 'Un floater en pleine course qui embrasse la planche au buzzer. Toronto, premier de la conférence Est, est balayé 4-0.'
  },
  {
    game: 100,
    kicker: '27 mai 2018 · à Boston, match 7',
    title: 'Huitième finale de suite',
    result: 'Victoire 87-79',
    text: 'Les 48 minutes sur le parquet, 35 points, 15 rebonds, 9 passes. LeBron envoie Cleveland en finale NBA pour la quatrième année consécutive, sa huitième d’affilée à titre personnel.'
  },
  {
    game: 101,
    kicker: '31 mai 2018 · à Golden State, match 1',
    title: '51 points pour rien',
    result: 'Défaite 124-114 a.p.',
    text: 'Sa plus grosse performance des playoffs, le deuxième plus haut sommet de l’année après les 57 de novembre. Elle ne suffit pas face aux Warriors.'
  },
  {
    game: 104,
    kicker: '8 juin 2018 · Golden State, match 4',
    title: 'Fin de partie',
    result: 'Défaite 108-85',
    text: 'Balayés en finale. Sur l’ensemble des playoffs, LeBron tourne à 34,0 points, 9,1 rebonds et 9,0 passes. 104 matchs, 3 947 minutes, 2 999 points : l’une des saisons les plus complètes de l’histoire.'
  }
];
