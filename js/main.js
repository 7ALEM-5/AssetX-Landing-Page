/* AssetX — interactions: language, theme, menu, reveal, tabs, counters. */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var I18N = window.AX_I18N || { ar: {}, en: {} };
  var WA_NUMBER = '201017380253';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Language ---------- */
  // Capture the Arabic source text from the page so it can be restored.
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  nodes.forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (!(key in I18N.ar)) I18N.ar[key] = el.innerHTML;
  });

  function t(lang, key) {
    var dict = I18N[lang] || {};
    return key in dict ? dict[key] : I18N.ar[key];
  }

  function applyLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    nodes.forEach(function (el) {
      var v = t(lang, el.getAttribute('data-i18n'));
      if (v != null) el.innerHTML = v;
    });
    document.title = t(lang, 'meta.title');
    var msg = encodeURIComponent(t(lang, 'wa.msg'));
    document.querySelectorAll('.js-wa').forEach(function (a) {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msg;
    });
    updateThemeLabels();
    // statement highlight state is lost when innerHTML changes; re-apply if already seen
    document.querySelectorAll('.statement.in').forEach(function (s) { s.classList.add('in'); });
  }

  function setLang(lang) {
    try { localStorage.setItem('ax-lang', lang); } catch (e) {}
    if (reduceMotion) { applyLang(lang); return; }
    body.classList.add('lang-switching');
    setTimeout(function () {
      applyLang(lang);
      body.classList.remove('lang-switching');
    }, 220);
  }

  /* ---------- Theme ---------- */
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function updateThemeLabels() {
    var lang = root.lang === 'en' ? 'en' : 'ar';
    var label = t(lang, currentTheme() === 'dark' ? 'ui.themeToLight' : 'ui.themeToDark');
    document.querySelectorAll('.site-footer [data-action="theme"] span').forEach(function (s) { s.textContent = label; });
    document.querySelectorAll('[data-action="theme"]').forEach(function (b) { b.setAttribute('aria-label', label); });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#070D1A' : '#F8FAFC');
  }

  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ax-theme', next); } catch (e) {}
    updateThemeLabels();
  }

  /* ---------- Menu ---------- */
  var burger = document.querySelector('[data-action="menu"]');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
  }

  /* ---------- Actions ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (btn) {
      var action = btn.getAttribute('data-action');
      if (action === 'lang') setLang(root.lang === 'ar' ? 'en' : 'ar');
      if (action === 'theme') toggleTheme();
      if (action === 'menu') setMenu(!body.classList.contains('menu-open'));
      return;
    }
    if (e.target.closest('.nav a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Header on scroll + active nav ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) sectionObs.observe(s);
    });
  }

  /* ---------- Reveal on scroll (with stagger) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  // stagger siblings that share a parent
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.querySelector('.count') || en.target.classList.contains('count')) runCounters(en.target);
        revealObs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up ---------- */
  function runCounters(scope) {
    scope.querySelectorAll('.count').forEach(function (el) {
      var to = parseInt(el.getAttribute('data-to'), 10) || 0;
      if (to === 0 || reduceMotion) { el.textContent = to; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (tb) {
      var on = tb === tab;
      tb.classList.toggle('is-active', on);
      tb.setAttribute('aria-selected', String(on));
      tb.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(tb.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { selectTab(tb); });
    tb.addEventListener('keydown', function (e) {
      var dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      if (root.dir === 'rtl') dir = -dir;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus(); selectTab(next);
    });
  });

  /* ---------- Hero parallax (pointer) ---------- */
  var stage = document.querySelector('.hero-stage');
  if (stage && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var cards = stage.querySelectorAll('.asset-card, .stage-core');
    window.addEventListener('pointermove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5), y = (e.clientY / window.innerHeight - 0.5);
      cards.forEach(function (c, i) {
        var depth = (i % 4 + 1) * 5;
        c.style.translate = (x * depth).toFixed(1) + 'px ' + (y * depth).toFixed(1) + 'px';
      });
    }, { passive: true });
  }

  /* ---------- Init ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  applyLang(root.lang === 'en' ? 'en' : 'ar');
})();
