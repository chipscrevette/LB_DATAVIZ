(() => {
  const STATS = [
    { key: 'pts', label: 'Points', unit: 'pts' },
    { key: 'reb', label: 'Rebonds', unit: 'reb' },
    { key: 'ast', label: 'Passes', unit: 'pas' }
  ];
  const N = GAMES.length;
  const FIRST_PLAYOFF_GAME = GAMES.find(d => d.playoffs).game;
  const MOMENTS = CHAPTERS.filter(c => c.game > 0);

  const fmt1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtInt = new Intl.NumberFormat('fr-FR');
  const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const parseDate = s => new Date(`${s}T12:00:00`);
  const where = d => (d.home ? 'contre ' : 'à ') + OPPONENTS[d.opp];
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function phaseLabel(d) {
    if (!d.playoffs) return 'Saison régulière';
    const round = { IND: '1er tour', TOR: 'Demi-finale Est', BOS: 'Finale Est', GSW: 'Finales NBA' }[d.opp];
    const first = GAMES.find(g => g.playoffs && g.opp === d.opp).game;
    return `Playoffs · ${round}, match ${d.game - first + 1}`;
  }

  // Version courte pour l'écran de téléphone.
  function shortPhase(d) {
    if (!d.playoffs) return fmtDate.format(parseDate(d.date));
    return phaseLabel(d).replace('Playoffs · ', '').replace(', match ', ' · match ');
  }

  const statTags = d => STATS.map(s => `<span class="tag" data-stat="${s.key}">${d[s.key]} ${s.unit}</span>`).join('');

  /* Graphique ---------------------------------------------------------------- */

  const stage = document.querySelector('.stage');
  const chartEl = document.getElementById('chart');
  const storyEl = document.getElementById('story');
  const tooltip = document.getElementById('tooltip');
  const counterGame = document.getElementById('counter-game');
  const counterPhase = document.getElementById('counter-phase');
  const counterEl = document.querySelector('.counter');
  const progressBar = document.getElementById('progress-bar');

  let chart = null;
  let currentGame = 0;
  let drawnOnce = false;

  function buildChart() {
    chartEl.innerHTML = '';
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const mobile = isMobile();
    const header = document.querySelector('.stage-header');
    const headerH = header.offsetHeight;
    const gutter = parseFloat(getComputedStyle(header).paddingLeft);

    const plot = {
      left: gutter + (mobile ? 20 : 26),
      right: W - (mobile ? gutter : 150),
      top: headerH + (mobile ? 34 : 58),
      bottom: mobile ? Math.round(H * 0.5) : H - 48
    };
    const plotW = plot.right - plot.left;

    // Sur téléphone, la caméra suit la saison : une vingtaine de matchs à l'écran,
    // le match en cours aux deux tiers, et une mini-carte de toute la saison dessous.
    const span = mobile ? 20 : N - 1;
    const x = d3.scaleLinear().domain([1, N]).range([plot.left, plot.left + (plotW / span) * (N - 1)]);
    const y = d3.scaleLinear().domain([0, 60]).range([plot.bottom, plot.top]);
    const worldW = x(N) - plot.left;

    const svg = d3.select(chartEl).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('aria-hidden', 'true');
    const defs = svg.append('defs');
    const clip = defs.append('clipPath').attr('id', 'played').append('rect')
      .attr('x', 0).attr('y', 0).attr('height', H).attr('width', 0);
    defs.append('clipPath').attr('id', 'markers-view').append('rect')
      .attr('x', plot.left - 12).attr('y', 0).attr('width', plotW + 24).attr('height', H);
    defs.append('clipPath').attr('id', 'viewport').append('rect')
      .attr('x', mobile ? plot.left - 2 : 0).attr('y', 0)
      .attr('width', mobile ? plotW + 4 : W).attr('height', mobile ? plot.bottom + 30 : H);

    STATS.forEach(s => {
      const grad = defs.append('linearGradient').attr('id', `fade-${s.key}`)
        .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
      grad.append('stop').attr('offset', '0%').style('stop-color', `var(--${s.key})`).attr('stop-opacity', 1);
      grad.append('stop').attr('offset', '100%').style('stop-color', `var(--${s.key})`).attr('stop-opacity', 0);
    });

    // Couche fixe : grille et graduations
    [0, 10, 20, 30, 40, 50, 60].filter(t => !mobile || t % 20 === 0).forEach(t => {
      svg.append('line').attr('class', 'grid').attr('x1', plot.left).attr('x2', plot.right + (mobile ? 0 : 10)).attr('y1', y(t)).attr('y2', y(t));
      svg.append('text').attr('class', 'tick').attr('x', plot.left - (mobile ? 6 : 10)).attr('y', y(t) + 4).attr('text-anchor', 'end').text(t);
    });

    // Couche mobile : tout ce qui défile avec la saison
    const viewport = svg.append('g').attr('clip-path', 'url(#viewport)');
    const world = viewport.append('g').attr('class', 'world');

    const poX = x(FIRST_PLAYOFF_GAME - 0.5);
    world.append('rect').attr('class', 'playoffs-band')
      .attr('x', poX).attr('y', plot.top).attr('width', x(N) - poX + 10).attr('height', plot.bottom - plot.top);
    world.append('line').attr('class', 'playoffs-line')
      .attr('x1', poX).attr('x2', poX).attr('y1', plot.top).attr('y2', plot.bottom);
    const ly = plot.top + (plot.bottom - plot.top) * 0.62;
    world.append('text').attr('class', 'playoffs-label')
      .attr('transform', `translate(${poX - 8},${ly}) rotate(-90)`).text('Début des playoffs');
    if (mobile) {
      // Les mois défilent sous le graphique.
      let last = null;
      GAMES.forEach(d => {
        const m = d.date.slice(0, 7);
        if (d.playoffs || m === last) return;
        last = m;
        world.append('text').attr('class', 'phase-label').attr('x', x(d.game)).attr('y', plot.bottom + 18)
          .text(parseDate(d.date).toLocaleDateString('fr-FR', { month: 'long' }));
      });
      world.append('text').attr('class', 'phase-label').attr('x', x(FIRST_PLAYOFF_GAME)).attr('y', plot.bottom + 18)
        .text('Playoffs');
    } else {
      world.append('text').attr('class', 'phase-label').attr('x', x(30)).attr('y', plot.bottom + 22).text('Saison régulière');
      world.append('text').attr('class', 'phase-label').attr('x', x(FIRST_PLAYOFF_GAME + 4)).attr('y', plot.bottom + 22).text('Playoffs');
    }

    // Moyennes du Top 10, en pointillés (fixes : elles valent pour toute la saison)
    STATS.forEach(s => {
      svg.append('line').attr('class', 'ref').attr('data-stat', s.key)
        .attr('x1', plot.left).attr('x2', plot.right + (mobile ? 0 : 10))
        .attr('y1', y(TOP10[s.key])).attr('y2', y(TOP10[s.key]));
    });

    // Les grands moments du récit, numérotés dans l'ordre de lecture
    const markerY = plot.top - (mobile ? 16 : 18);
    const r = mobile ? 8 : 9;
    const markerX = [];
    MOMENTS.forEach((m, i) => {
      const want = x(m.game);
      markerX.push(i && want - markerX[i - 1] < 2 * r + 3 ? markerX[i - 1] + 2 * r + 3 : want);
    });
    const markerLayer = mobile ? svg.append('g').attr('clip-path', 'url(#markers-view)').append('g') : world;
    const moments = markerLayer.selectAll('g.moment').data(MOMENTS).join('g').attr('class', 'moment');
    moments.append('line')
      .attr('x1', (d, i) => markerX[i]).attr('x2', d => x(d.game))
      .attr('y1', markerY + r).attr('y2', d => y(GAMES[d.game - 1].pts) - 6);
    moments.append('circle').attr('cx', (d, i) => markerX[i]).attr('cy', markerY).attr('r', r);
    moments.append('text').attr('x', (d, i) => markerX[i]).attr('y', markerY + 4.5)
      .attr('text-anchor', 'middle').style('font-size', mobile ? '11px' : '13px')
      .text((d, i) => i + 1);

    // Les trois courbes : en fantôme sur toute la saison, en couleur jusqu'au match en cours
    const line = key => d3.line().x(d => x(d.game)).y(d => y(d[key]));
    const area = key => d3.area().x(d => x(d.game)).y0(plot.bottom).y1(d => y(d[key]));
    const order = STATS.slice().reverse();

    const ghosts = world.append('g');
    const live = world.append('g').attr('clip-path', 'url(#played)');
    const ghostPaths = order.map(s => ghosts.append('path')
      .attr('class', 'ghost-line').attr('data-stat', s.key).attr('d', line(s.key)(GAMES)));
    order.forEach(s => {
      live.append('path').attr('class', 'live-area').attr('fill', `url(#fade-${s.key})`).attr('d', area(s.key)(GAMES));
    });
    order.forEach(s => {
      live.append('path').attr('class', 'live-line').attr('data-stat', s.key).attr('d', line(s.key)(GAMES));
    });
    if (mobile) {
      // Zoomé, chaque match mérite son point.
      order.forEach(s => {
        live.append('g').attr('class', 'dots').attr('data-stat', s.key)
          .selectAll('circle').data(GAMES).join('circle')
          .attr('cx', d => x(d.game)).attr('cy', d => y(d[s.key])).attr('r', 3);
      });
    }

    // Au chargement, la saison se dessine une première fois en fantôme.
    if (!drawnOnce && !reducedMotion) {
      ghostPaths.forEach((p, i) => {
        const len = p.node().getTotalLength();
        p.attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
          .transition().delay(200 + i * 150).duration(1600).ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0)
          .on('end', function () { d3.select(this).attr('stroke-dasharray', null); });
      });
    }
    drawnOnce = true;

    // Étiquettes des moyennes
    const refItems = STATS.map(s => ({ s, y: y(TOP10[s.key]) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < refItems.length; i++) {
      if (refItems[i].y - refItems[i - 1].y < 14) refItems[i].y = refItems[i - 1].y + 14;
    }
    if (mobile) {
      // À gauche, au-dessus de chaque pointillé, avec un liseré blanc pour rester lisible.
      STATS.forEach(s => {
        svg.append('text').attr('class', 'ref-label ref-label-mobile').attr('data-stat', s.key)
          .attr('x', plot.left + 4).attr('y', y(TOP10[s.key]) - 5)
          .text(`Top 10 · ${fmt1.format(TOP10[s.key])}`);
      });
    } else {
      refItems.forEach(({ s, y: ry }) => {
        svg.append('text').attr('class', 'ref-label').attr('x', plot.right + 16).attr('y', ry + 4)
          .text(`Top 10 · ${fmt1.format(TOP10[s.key])}`);
      });
    }

    // Mini-carte de la saison (téléphone)
    let mini = null;
    if (mobile) {
      const mTop = plot.bottom + 34;
      const mH = 30;
      const mx = d3.scaleLinear().domain([1, N]).range([plot.left, plot.right]);
      const my = d3.scaleLinear().domain([0, 60]).range([mTop + mH, mTop]);
      const g = svg.append('g').attr('class', 'mini');
      g.append('rect').attr('class', 'mini-po').attr('x', mx(FIRST_PLAYOFF_GAME - 0.5)).attr('y', mTop)
        .attr('width', plot.right - mx(FIRST_PLAYOFF_GAME - 0.5)).attr('height', mH);
      order.forEach(s => {
        g.append('path').attr('class', 'mini-line').attr('data-stat', s.key)
          .attr('d', d3.line().x(d => mx(d.game)).y(d => my(d[s.key]))(GAMES));
      });
      const win = g.append('rect').attr('class', 'mini-window').attr('y', mTop - 3).attr('height', mH + 6).attr('rx', 3);
      const dot = g.append('line').attr('class', 'mini-cursor').attr('y1', mTop - 3).attr('y2', mTop + mH + 3);
      mini = { mx, win, dot, bottom: mTop + mH };
    }

    // Têtes de courbe : un point vivant et la valeur du match en cours
    const heads = STATS.map(s => {
      const g = svg.append('g').attr('class', 'head').attr('data-stat', s.key).attr('opacity', 0);
      g.append('circle').attr('class', 'halo').attr('r', 10);
      g.append('circle').attr('r', mobile ? 5.5 : 7);
      return g;
    });
    const leaders = svg.append('g');
    const chipLayer = svg.append('g');
    const chips = STATS.map(s => {
      const leader = leaders.append('line').attr('class', 'leader').attr('data-stat', s.key).attr('opacity', 0);
      const g = chipLayer.append('g').attr('class', 'chip').attr('data-stat', s.key).attr('opacity', 0);
      const rect = g.append('rect');
      const text = g.append('text').attr('x', 8);
      text.append('tspan').attr('class', 'num');
      text.append('tspan').attr('class', 'unit').attr('dx', 4).text(s.unit);
      return { g, rect, text, leader };
    });

    const hoverLine = world.append('line').attr('class', 'hover-line')
      .attr('y1', plot.top).attr('y2', plot.bottom).style('opacity', 0);
    const view = { tx: 0 };
    svg.append('rect')
      .attr('x', plot.left).attr('y', plot.top).attr('width', plotW).attr('height', plot.bottom - plot.top)
      .attr('fill', 'transparent')
      .on('pointermove pointerdown', event => {
        const [mx] = d3.pointer(event);
        const game = Math.max(1, Math.min(N, Math.round(x.invert(mx - view.tx))));
        showTooltip(event, GAMES[game - 1], x(game));
      })
      .on('pointerleave', event => { if (event.pointerType !== 'touch') hideTooltip(); });

    // Placement du compteur et du récit
    counterEl.style.bottom = 'auto';
    if (mobile) {
      counterEl.style.top = `${mini.bottom + 14}px`;
    } else {
      counterEl.style.top = '18px';
      storyEl.style.top = `${plot.top + 18}px`;
    }

    return { x, y, plot, plotW, worldW, clip, heads, chips, moments, markerLayer, hoverLine, mobile, world, view, mini };
  }

  function valueAt(key, g) {
    const i = Math.max(1, Math.min(N, Math.floor(g)));
    const j = Math.min(N, i + 1);
    const t = g - i;
    return GAMES[i - 1][key] * (1 - t) + GAMES[j - 1][key] * t;
  }

  function renderChart() {
    if (!chart) return;
    const { x, y, plot, plotW, worldW, clip, heads, chips, mobile, world, view, mini, markerLayer } = chart;
    const g = Math.min(currentGame, N);
    const started = g >= 1;
    clip.attr('width', started ? x(g) + 2 : 0);

    // Caméra : le match en cours reste aux deux tiers de l'écran.
    if (mobile) {
      const anchor = plotW * 0.66;
      const tx = Math.max(-(worldW - plotW), Math.min(0, anchor - (x(Math.max(1, g)) - plot.left)));
      view.tx = tx;
      world.attr('transform', `translate(${tx},0)`);
      markerLayer.attr('transform', `translate(${tx},0)`);
      const visFrom = x.invert(plot.left - tx);
      const visTo = x.invert(plot.right - tx);
      mini.win.attr('x', mini.mx(visFrom)).attr('width', mini.mx(visTo) - mini.mx(visFrom));
      const cx = mini.mx(Math.max(1, g));
      mini.dot.attr('x1', cx).attr('x2', cx).attr('opacity', started ? 1 : 0);
    }

    const played = Math.max(1, Math.floor(g));
    const hx = x(Math.max(1, g)) + view.tx;
    const items = STATS.map((s, i) => {
      const hy = y(valueAt(s.key, Math.max(1, g)));
      heads[i].attr('transform', `translate(${hx},${hy})`).attr('opacity', started ? 1 : 0);
      return { i, hy, cy: hy, value: GAMES[played - 1][s.key] };
    });

    // Les étiquettes s'écartent les unes des autres sans perdre leur courbe.
    const gap = mobile ? 26 : 32;
    items.sort((a, b) => a.hy - b.hy);
    for (let k = 1; k < items.length; k++) {
      if (items[k].cy - items[k - 1].cy < gap) items[k].cy = items[k - 1].cy + gap;
    }
    const overflow = items[items.length - 1].cy - (plot.bottom - 8);
    if (overflow > 0) items.forEach(it => { it.cy -= overflow; });

    items.forEach(it => {
      const c = chips[it.i];
      c.text.select('.num').text(it.value);
      const tw = c.text.node().getComputedTextLength();
      const h = mobile ? 24 : 30;
      // Près du bord droit, l'étiquette passe à gauche de la tête.
      const right = hx + (mobile ? 14 : 20) + tw + 16 <= (mobile ? plot.right : plot.right + 140);
      const cx = right ? hx + (mobile ? 14 : 20) : hx - (mobile ? 14 : 20) - tw - 16;
      c.rect.attr('width', tw + 16).attr('height', h).attr('y', -h / 2);
      c.text.attr('y', mobile ? 7 : 8);
      c.g.attr('transform', `translate(${cx},${it.cy})`).attr('opacity', started ? 1 : 0);
      c.leader.attr('x1', hx).attr('y1', it.hy).attr('x2', right ? cx : cx + tw + 16).attr('y2', it.cy).attr('opacity', started ? 1 : 0);
    });

    progressBar.style.width = `${(g / N) * 100}%`;
    if (started) {
      const d = GAMES[played - 1];
      counterGame.textContent = `Match ${d.game}`;
      counterPhase.textContent = mobile ? shortPhase(d) : phaseLabel(d);
    } else {
      counterGame.textContent = 'Match 0';
      counterPhase.textContent = 'Saison 2017-18';
    }
  }

  /* Récit ----------------------------------------------------------------- */

  let activeChapter = -1;

  function renderStory(index) {
    if (index === activeChapter) return;
    activeChapter = index;
    const c = CHAPTERS[index];
    const d = c.game > 0 ? GAMES[c.game - 1] : null;
    storyEl.innerHTML = `
      <div class="story-date">${c.kicker}</div>
      ${d ? `<div class="story-stats">${statTags(d)}${c.result ? `<span class="story-result">${c.result}</span>` : ''}</div>` : ''}
      <h2 class="story-title">${c.title}</h2>
      <p class="story-text">${c.text}</p>`;
    storyEl.classList.remove('is-entering');
    void storyEl.offsetWidth;
    storyEl.classList.add('is-entering');
    if (chart) chart.moments.classed('is-active', m => m === c);
    placeStory();
  }

  // Sur grand écran, le texte se pose du côté où les courbes ne sont pas encore allumées.
  function placeStory() {
    if (!chart || chart.mobile) {
      storyEl.style.left = '';
      return;
    }
    const { plot } = chart;
    const c = CHAPTERS[Math.max(0, activeChapter)];
    const onRight = c.game < N * 0.45;
    storyEl.style.left = onRight ? `${plot.right - storyEl.offsetWidth - 24}px` : `${plot.left + 24}px`;
  }

  const stepsEl = document.getElementById('steps');
  stepsEl.innerHTML = CHAPTERS.map((c, i) => `<div class="step" data-index="${i}"></div>`).join('');
  const steps = [...stepsEl.children];

  function onScroll() {
    const mid = window.innerHeight / 2;
    const centers = steps.map(el => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    let game = 0;
    let active = 0;
    if (mid >= centers[centers.length - 1]) {
      game = N;
      active = steps.length - 1;
    } else if (mid > centers[0]) {
      for (let i = 0; i < centers.length - 1; i++) {
        if (mid >= centers[i] && mid < centers[i + 1]) {
          const t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
          // Pause sur chaque moment, puis la saison défile jusqu'au suivant.
          const eased = Math.min(1, Math.max(0, (t - 0.3) / 0.6));
          game = CHAPTERS[i].game + eased * (CHAPTERS[i + 1].game - CHAPTERS[i].game);
          active = eased < 0.5 ? i : i + 1;
          break;
        }
      }
    }
    renderStory(active);
    if (game !== currentGame) {
      currentGame = game;
      renderChart();
    }
  }

  let ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }

  /* Survol ---------------------------------------------------------------- */

  let tooltipScrollY = 0;

  function showTooltip(event, d, gx) {
    const box = stage.getBoundingClientRect();
    tooltip.innerHTML = `
      <div class="tooltip-title">Match ${d.game}</div>
      <div class="tooltip-meta">${fmtDate.format(parseDate(d.date))} · ${where(d)} · ${d.min} min</div>
      <div class="tooltip-row">${statTags(d)}</div>`;
    tooltip.hidden = false;
    tooltipScrollY = window.scrollY;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let left = event.clientX - box.left + 16;
    if (left + tw > box.width - 8) left = event.clientX - box.left - tw - 16;
    const top = Math.max(8, Math.min(event.clientY - box.top - th - 16, box.height - th - 8));
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${top}px`;
    chart.hoverLine.attr('x1', gx).attr('x2', gx).style('opacity', null);
  }

  function hideTooltip() {
    tooltip.hidden = true;
    if (chart) chart.hoverLine.style('opacity', 0);
  }

  /* Bilan ------------------------------------------------------------------ */

  function buildWaffles() {
    const el = document.getElementById('waffles');
    el.innerHTML = STATS.map(s => {
      const hits = GAMES.filter(d => d[s.key] > TOP10[s.key]).length;
      const cells = GAMES.map((d, i) => {
        const hit = d[s.key] > TOP10[s.key];
        return `<span class="cell${hit ? ' is-hit' : ''}" style="--i:${i}" title="Match ${d.game}, ${where(d)} : ${d[s.key]} ${s.unit}"></span>`;
      }).join('');
      return `
        <div class="waffle" data-stat="${s.key}">
          <div class="waffle-count">
            <b>${hits}<small>/${N}</small></b>
            <span class="tag">${s.label}</span>
            <em>matchs au-dessus de ${fmt1.format(TOP10[s.key])}</em>
          </div>
          <div class="waffle-grid" role="img" aria-label="${s.label} : ${hits} matchs sur ${N} au-dessus de la moyenne du Top 10">${cells}</div>
        </div>`;
    }).join('');

    if (reducedMotion || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
  }

  function buildCompare() {
    const regular = GAMES.filter(d => !d.playoffs);
    const playoffs = GAMES.filter(d => d.playoffs);
    document.getElementById('compare').innerHTML = STATS.map(s => {
      const rs = d3.mean(regular, d => d[s.key]);
      const po = d3.mean(playoffs, d => d[s.key]);
      const top = Math.max(rs, po);
      // Écart calculé sur les valeurs affichées, pour que 8,6 → 9,1 donne bien +0,5.
      const delta = Math.round(po * 10) / 10 - Math.round(rs * 10) / 10;
      const sign = delta > 0.05 ? '+' : delta < -0.05 ? '−' : '±';
      return `
        <div class="compare-item" data-stat="${s.key}">
          <span class="tag">${s.label}</span>
          <div class="compare-values">
            <span class="rs">${fmt1.format(rs)}</span><span class="arrow">→</span><span class="po">${fmt1.format(po)}</span>
          </div>
          <div class="compare-delta">${sign}${fmt1.format(Math.abs(delta))} en playoffs</div>
          <div class="compare-bars" aria-hidden="true">
            <span class="rs" style="--w:${(rs / top) * 100}%"></span>
            <span class="po" style="--w:${(po / top) * 100}%"></span>
          </div>
        </div>`;
    }).join('');
  }

  function buildTiles() {
    const tripleDoubles = GAMES.filter(d => STATS.every(s => d[s.key] >= 10)).length;
    document.getElementById('tiles').innerHTML = [
      ['Matchs joués', fmtInt.format(N)],
      ['Minutes', fmtInt.format(d3.sum(GAMES, d => d.min))],
      ['Points', fmtInt.format(d3.sum(GAMES, d => d.pts))],
      ['Triple-doubles', fmtInt.format(tripleDoubles)]
    ].map(([label, value]) => `<div class="tile"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  }

  function buildTable() {
    document.querySelector('#table tbody').innerHTML = GAMES.map(d => `
      <tr class="${d.game === FIRST_PLAYOFF_GAME ? 'po-start' : ''}">
        <td>${d.game}</td>
        <td>${fmtDate.format(parseDate(d.date))}</td>
        <td>${d.home ? '' : '@ '}${OPPONENTS[d.opp]}</td>
        <td>${d.min}</td><td>${d.pts}</td><td>${d.reb}</td><td>${d.ast}</td>
      </tr>`).join('');
  }

  /* Démarrage ------------------------------------------------------------ */

  function rebuild() {
    hideTooltip();
    chart = buildChart();
    const keep = activeChapter;
    activeChapter = -1;
    renderStory(Math.max(0, keep));
    renderChart();
    onScroll();
  }

  buildWaffles();
  buildCompare();
  buildTiles();
  buildTable();
  rebuild();

  window.addEventListener('scroll', () => {
    if (!tooltip.hidden && Math.abs(window.scrollY - tooltipScrollY) > 40) hideTooltip();
    requestScroll();
  }, { passive: true });

  // Un seul graphique, redessiné quand la taille change, sans empiler les écouteurs.
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Sur mobile, la barre d'adresse fait varier la hauteur au défilement : on l'ignore.
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      rebuild();
    }, 150);
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
})();
