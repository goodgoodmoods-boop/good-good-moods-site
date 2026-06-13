/* Good Good Moods — interactions (vanilla JS) */
(function () {
  'use strict';

  var icons = function () { if (window.lucide) window.lucide.createIcons(); };

  /* ---- Scroll doux avec compensation du header ---- */
  function goTo(id) {
    var el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-goto]');
    if (a) { e.preventDefault(); goTo(a.getAttribute('data-goto')); closeMenu(); }
  });

  /* ---- Header au scroll ---- */
  var header = document.getElementById('header');
  function onScroll() { if (header) header.classList.toggle('solid', window.scrollY > 20 || menuOpen); }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuOpen = false;
  function setMenu(o) {
    menuOpen = o;
    if (mobileMenu) mobileMenu.classList.toggle('open', o);
    if (burger) burger.setAttribute('aria-expanded', o);
    if (burger) burger.innerHTML = '<i data-lucide="' + (o ? 'x' : 'menu') + '"></i>';
    onScroll(); icons();
  }
  function closeMenu() { if (menuOpen) setMenu(false); }
  if (burger) burger.addEventListener('click', function () { setMenu(!menuOpen); });

  /* ---- Reveal au scroll ---- */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---- HERO cinematique : disciplines qui defilent ---- */
  var WORDS = [
    { w: 'GRAFFITI', sub: 'LETTRES & FRESQUES', lede: 'On peint des murs qui racontent le quartier.' },
    { w: 'RAP', sub: 'VERBE & SCÈNE', lede: 'On tend le micro et on donne de la voix au terrain.' },
    { w: 'SCRATCH', sub: 'PLATINES & ÉNERGIE', lede: 'On met le feu, du quartier à la grande scène.' }
  ];
  var cw = 0;
  var elWord = document.getElementById('cineWord');
  var elSub = document.getElementById('cineSub');
  var elLede = document.getElementById('cineLede');
  var elDots = document.getElementById('cineDots');
  var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function renderWord() {
    var d = WORDS[cw];
    if (elWord) { elWord.textContent = d.w; elWord.classList.remove('swap'); void elWord.offsetWidth; elWord.classList.add('swap'); }
    if (elSub) elSub.textContent = d.sub;
    if (elLede) elLede.textContent = d.lede;
    if (elDots) elDots.querySelectorAll('span').forEach(function (s, i) { s.classList.toggle('on', i === cw); });
  }
  function cineSet(i) { cw = (i + WORDS.length) % WORDS.length; renderWord(); }
  var cineTimer = null;
  function cineAuto() { if (!prefersReduce) cineTimer = setInterval(function () { cineSet(cw + 1); }, 4800); }
  function cineStop() { if (cineTimer) { clearInterval(cineTimer); cineTimer = null; } }
  if (elWord) {
    document.querySelectorAll('.cine-prev').forEach(function (b) { b.addEventListener('click', function () { cineStop(); cineSet(cw - 1); cineAuto(); }); });
    document.querySelectorAll('.cine-next').forEach(function (b) { b.addEventListener('click', function () { cineStop(); cineSet(cw + 1); cineAuto(); }); });
    if (elDots) elDots.querySelectorAll('span').forEach(function (s, i) { s.addEventListener('click', function () { cineStop(); cineSet(i); cineAuto(); }); });
    renderWord();
    cineAuto();
  }

  /* ---- HERO : nuage de particules (sphere de points, reagit a la souris) ---- */
  (function () {
    var canvas = document.querySelector('.hero-particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var N = 170, pts = [];
    for (var k = 0; k < N; k++) {
      var yy = 1 - (k / (N - 1)) * 2;
      var rad = Math.sqrt(Math.max(0, 1 - yy * yy));
      var th = k * 2.399963229;
      pts.push({ x: Math.cos(th) * rad, y: yy, z: Math.sin(th) * rad, s: 0.6 + Math.random() * 1.7 });
    }
    var rot = 0, tmx = 0, tmy = 0, mx = 0, my = 0;
    function resize() {
      W = host.clientWidth; H = host.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    host.addEventListener('mousemove', function (e) {
      var r = host.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width - 0.5;
      tmy = (e.clientY - r.top) / r.height - 0.5;
    });
    host.addEventListener('mouseleave', function () { tmx = 0; tmy = 0; });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.5, cy = H * 0.56, R = Math.min(W, H) * 0.34;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      if (!prefersReduce) rot += 0.0016;
      var ry = rot + mx * 0.9, rx = my * 0.6;
      var cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      for (var i = 0; i < N; i++) {
        var p = pts[i];
        var x1 = p.x * cY - p.z * sY, z1 = p.x * sY + p.z * cY;
        var y1 = p.y * cX - z1 * sX, z2 = p.y * sX + z1 * cX;
        var persp = 1 / (1.8 - z2 * 0.7);
        var sx = cx + x1 * R * persp, sy = cy + y1 * R * persp;
        var depth = (z2 + 1) / 2;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.4, p.s * (0.5 + depth) * persp), 0, 6.2832);
        ctx.fillStyle = 'rgba(240,96,108,' + (0.1 + depth * 0.6).toFixed(3) + ')';
        ctx.fill();
      }
    }
    function frame() { draw(); requestAnimationFrame(frame); }
    if (prefersReduce) draw(); else requestAnimationFrame(frame);
  })();

  /* ---- REALISATIONS : lightbox par projet ---- */
  var LE40_PHOTOS = [
    ['photos/40-watermelon.jpg', 'Tourne-disque pastèque · Mabu & Resha'], ['photos/40-soldiers.jpg', 'Soldats & gramophone'],
    ['photos/40-detail-3.jpg', 'La trompette'], ['photos/40-heron.jpg', 'Héron (en cours)'],
    ['photos/40-detail-2.jpg', 'Détail des mains'], ['photos/40-drone-2.jpg', 'Vue du couloir']
  ];
  for (var _q = 1; _q <= 10; _q++) { if (_q === 4) continue; LE40_PHOTOS.push(['photos/40-x' + _q + '.jpg', 'Le 40 · fresque']); }

  var PROJECTS = [
    { name: 'CFA Laval', meta: 'Façades & coquelicots', tag: 'École', pos: 'center', photos: [
      ['photos/cfa-atelier-2.jpg', 'En cours de réalisation'], ['photos/cfa-coquelicots.jpg', 'Coquelicots & main'], ['photos/cfa-poppies-face.jpg', 'Visage & coquelicots'],
      ['photos/cfa-rooster.jpg', 'Coq bleu & cœur'], ['photos/cfa-rooster-2.jpg', 'Façade jungle bleue'],
      ['photos/cfa-hand-detail.jpg', 'Détail des mains'], ['photos/cfa-coquelicots-2.jpg', 'Détail coquelicots'] ] },
    { name: "Maison de l'Élan", meta: 'Fresque de clôture', tag: 'Médico-social', pos: 'center 60%', photos: [
      ['photos/maison-elan.jpg', 'Façade complète'], ['photos/maison-elan-2.jpg', 'Personnages'], ['photos/maison-elan-3.jpg', 'Détail végétal'],
      ['photos/maison-elan-4.jpg', 'Motifs abstraits'], ['photos/maison-elan-5.jpg', 'Mur végétal'] ] },
    { name: 'Robert Tatin', meta: 'Festival · live painting', tag: 'Événement', pos: 'center', photos: [
      ['photos/robert-tatin-2.jpg', 'Œil & champignon'], ['photos/graf-tatin.jpg', 'Fresque collective'],
      ['photos/robert-tatin-4.jpg', 'Détail festival'], ['photos/rt6.jpg', 'Panneau bleu · Tatin'] ] },
    { name: 'Salle de Bouère', meta: 'Salle de basket', tag: 'Fresque', pos: 'center', photos: [
      ['photos/bouere.jpg', 'Never Give Up'], ['photos/bouere-2.jpg', 'Vue large'], ['photos/bouere-3.jpg', 'Sous le panier'], ['photos/bouere-4.jpg', 'Détail terrain'] ] },
    { name: '11/22', meta: 'Portraits · open mic · DJ', tag: 'Événement', pos: 'center 30%', photos: [
      ['photos/portrait.jpg', 'Portrait réaliste'], ['photos/portrait-2.jpg', 'Portrait aux lunettes'],
      ['photos/open-mic.jpg', 'Open mic au coucher du soleil'], ['photos/scenes-2.jpg', 'Scène ouverte'] ] },
    { name: 'Place du 11 Nov', meta: 'Laval · palissade de chantier', tag: 'Fresque', pos: 'center', photos: [
      ['photos/nov-village.jpg', 'Village bleu'], ['photos/nov-immeubles.jpg', 'Immeubles cubistes'],
      ['photos/nov-soleil.jpg', 'Soleil & couleurs'], ['photos/nov-main.jpg', 'La main GGM'] ] },
    { name: 'Crèche Tistou', meta: 'Laval · petite enfance', tag: 'Petite enfance', pos: 'center', photos: [
      ['photos/tistou-flamants.jpg', 'Flamants roses'], ['photos/tistou-perroquet.jpg', 'Perroquet'], ['photos/tistou-girafe.jpg', 'Girafe & savane'],
      ['photos/tistou-4.jpg', 'Fresque fleurs'], ['photos/tistou-5.jpg', 'Mur ensoleillé'], ['photos/tistou-6.jpg', 'Soleil sourire'],
      ['photos/tistou-7.jpg', 'Fleurs géantes'], ['photos/tistou-atelier.jpg', 'On peint ensemble'], ['photos/tistou-9.jpg', 'Allée fleurie'] ] },
    { name: 'JO 2024', meta: 'Fresque sportive', tag: 'Événement', pos: 'center', photos: [
      ['photos/jo-athletes.jpg', 'Athlètes'], ['photos/jo-course.jpg', 'La course'], ['photos/jo-abstrait.jpg', 'Sommet abstrait'] ] },
    { name: 'Le 40', meta: 'Mabu & Resha · intérieur', tag: 'Fresque', pos: 'center', photos: LE40_PHOTOS }
  ];

  var LEG_PHOTOS = [
    ['photos/tigre.jpg', 'Tigre japonais'], ['photos/good-boy.jpg', 'Good Boy'], ['photos/oiseaux.jpg', 'Mésanges'], ['photos/legumerie-croco.jpg', 'Crocodile cowboy · Souk']
  ];
  for (var _lg = 1; _lg <= 22; _lg++) LEG_PHOTOS.push(['photos/LEGUMERIE' + _lg + '.jpg', 'Jam La Légumerie']);

  var EVENTS = [
    { name: "L'État des lieux #1", meta: 'La Légumerie · Laval · mars', tag: 'Festival', pos: 'center top', photos: [
      ['photos/etat-des-lieux-affiche.jpg', "Affiche — L'État des lieux #1"] ] },
    { name: 'La Légumerie', meta: 'Laval · jam graffiti', tag: 'Fresque', pos: 'center', photos: LEG_PHOTOS },
    { name: 'Jam les éléphants', meta: 'Festival · jam graffiti', tag: 'Festival', pos: 'center', photos: [
      ['photos/jam3f-mur.jpg', 'Le mur de la jam'], ['photos/jam3f-cover.jpg', 'Pièce wildstyle'], ['photos/jam3f-cat.jpg', 'Chat punk en feu'],
      ['photos/jam3f-cubine.jpg', 'Lettrage CUBINE'], ['photos/jam3f-perso.jpg', 'Personnage'], ['photos/jam3f-piece.jpg', 'Pièce couleurs'] ] }
  ];

  var lbState = { p: null, i: 0 };
  var lbRoot = document.getElementById('lightbox');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderLightbox() {
    var p = lbState.p; if (!p) { lbRoot.innerHTML = ''; lbRoot.style.display = 'none'; return; }
    var n = p.photos.length, cur = p.photos[lbState.i];
    var thumbs = n > 1 ? '<div class="ggm-lb-thumbs">' + p.photos.map(function (ph, i) {
      return '<button class="ggm-lb-thumb" data-i="' + i + '" aria-label="' + esc(ph[1]) + '" style="border-color:' + (i === lbState.i ? 'var(--accent)' : 'transparent') + '"><img src="' + ph[0] + '" alt=""></button>';
    }).join('') + '</div>' : '';
    var navs = n > 1 ? '<button class="lb-nav" data-act="prev" aria-label="Précédente" style="left:14px"><i data-lucide="chevron-left"></i></button>'
      + '<button class="lb-nav" data-act="next" aria-label="Suivante" style="right:14px"><i data-lucide="chevron-right"></i></button>' : '';
    lbRoot.innerHTML =
      '<div class="ggm-lb" role="dialog" aria-modal="true" aria-label="Projet ' + esc(p.name) + '">' +
        '<div class="ggm-lb-panel" data-stop>' +
          '<div class="ggm-lb-head">' +
            '<span class="lb-name">' + esc(p.name) + '</span>' +
            '<span class="tag inkOutline">' + esc(p.tag) + '</span>' +
            '<span class="lb-meta">' + esc(p.meta) + '</span>' +
            '<button class="lb-close" data-act="close" aria-label="Fermer"><i data-lucide="x"></i></button>' +
          '</div>' +
          '<div class="ggm-lb-stage">' +
            '<img src="' + cur[0] + '" alt="' + esc(p.name + ' — ' + cur[1]) + '">' + navs +
            '<span class="lb-caption"><span class="dot"></span>' + esc(cur[1]) + '<span class="count">' + (lbState.i + 1) + ' / ' + n + '</span></span>' +
          '</div>' + thumbs +
        '</div>' +
      '</div>';
    lbRoot.style.display = 'block';
    icons();
  }
  function cardHTML(p, i) {
    return '<button class="ggm-card" data-i="' + i + '" aria-label="Voir le projet ' + esc(p.name) + '">' +
      '<img class="ggm-card-img" src="' + p.photos[0][0] + '" alt="' + esc(p.name + ' — ' + p.photos[0][1]) + '" loading="lazy" style="object-position:' + (p.pos || 'center') + '">' +
      '<span class="card-grad" aria-hidden="true"></span>' +
      '<span class="card-count"><i data-lucide="images"></i> ' + p.photos.length + '</span>' +
      '<span class="card-cap"><span class="row1"><span class="idx">' + String(i + 1).padStart(2, '0') + '</span><span class="name">' + esc(p.name) + '</span></span>' +
      '<span class="row2"><span class="meta">' + esc(p.meta) + '</span><span class="see">Voir <i data-lucide="arrow-right"></i></span></span></span>' +
      '</button>';
  }
  function openList(list, i) { lbState.p = list[i]; lbState.i = 0; document.body.style.overflow = 'hidden'; renderLightbox(); }
  function closeLb() { lbState.p = null; document.body.style.overflow = ''; renderLightbox(); }
  function lbPrev() { if (lbState.p) { lbState.i = (lbState.i - 1 + lbState.p.photos.length) % lbState.p.photos.length; renderLightbox(); } }
  function lbNext() { if (lbState.p) { lbState.i = (lbState.i + 1) % lbState.p.photos.length; renderLightbox(); } }

  function fillGrid(grid, list) {
    if (!grid) return;
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('[data-i]').forEach(function (c) {
      c.addEventListener('click', function () { openList(list, parseInt(c.getAttribute('data-i'), 10)); });
    });
  }
  fillGrid(document.getElementById('projGrid'), PROJECTS);
  fillGrid(document.getElementById('eventGrid'), EVENTS);
  icons();
  if (lbRoot) lbRoot.addEventListener('click', function (e) {
    var act = e.target.closest('[data-act]');
    if (act) { var a = act.getAttribute('data-act'); if (a === 'prev') lbPrev(); else if (a === 'next') lbNext(); else closeLb(); return; }
    if (!e.target.closest('[data-stop]')) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lbState.p) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') lbPrev(); else if (e.key === 'ArrowRight') lbNext();
  });

  /* ---- CONTACT : type de demande + envoi Netlify ---- */
  var typeInput = document.getElementById('typeInput');
  var msg = document.getElementById('msg');
  document.querySelectorAll('.type-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.type-btn').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var t = b.getAttribute('data-type');
      if (typeInput) typeInput.value = t;
      if (msg) msg.placeholder = t === 'atelier' ? 'Public, nombre de participants, dates envisagées…' : 'Le lieu, la surface, l’envie, le délai…';
    });
  });

  var form = document.getElementById('contactForm');
  var card = document.getElementById('contactCard');
  function success() {
    var t = typeInput ? typeInput.value : 'projet';
    card.innerHTML = '<div class="contact-success">' +
      '<div class="check"><i data-lucide="check"></i></div>' +
      '<h3>Bien reçu, merci !</h3>' +
      '<p>On revient vers toi très vite pour ' + (t === 'atelier' ? 'ton atelier' : 'ton projet') + '. Garde les bonnes ondes.</p>' +
      '</div>';
    icons();
  }
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.nom.value.trim() || !form.email.value.includes('@')) return;
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(success).catch(success);
  });

  /* ---- Perf : decodage image asynchrone ---- */
  document.querySelectorAll('img').forEach(function (i) { i.decoding = 'async'; });

  /* ---- Init icones ---- */
  onScroll();
  icons();
})();
