(function () {
  'use strict';

  // ── Mobile nav toggle ─────────────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ── Code block enhancements: language label + copy button ─────────────
  var blocks = document.querySelectorAll('div.highlighter-rouge, figure.highlight, div.highlight');
  blocks.forEach(function (block) {
    // Derive language label from class (e.g. "language-python", "highlight-python")
    var lang = '';
    var match = (block.className || '').match(/(?:language|highlight)-([a-z0-9+#-]+)/i);
    if (match) lang = match[1];
    if (!lang) {
      var inner = block.querySelector('[class*="language-"]');
      if (inner) {
        var m2 = inner.className.match(/language-([a-z0-9+#-]+)/i);
        if (m2) lang = m2[1];
      }
    }
    if (lang) {
      var label = document.createElement('span');
      label.className = 'lang-label';
      label.textContent = lang;
      block.appendChild(label);
    }

    // Copy button
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.textContent = 'copy';
    btn.addEventListener('click', function () {
      var code = block.querySelector('pre code') || block.querySelector('pre');
      if (!code) return;
      var text = code.innerText.replace(/ /g, ' ');
      var done = function () {
        btn.classList.add('copied');
        btn.textContent = 'copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.textContent = 'copy';
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    block.appendChild(btn);
  });

  function fallback(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    cb();
  }

  // ── Blockquote callouts: > [!NOTE] / [!WARNING] / [!DANGER] / [!TIP] ──
  var callouts = { NOTE: 'note', WARNING: 'warning', WARN: 'warning', DANGER: 'danger', TIP: 'success', SUCCESS: 'success' };
  document.querySelectorAll('.prose blockquote').forEach(function (q) {
    var p = q.querySelector('p');
    if (!p) return;
    var m = p.innerHTML.match(/^\[!([A-Z]+)\]\s*/);
    if (m && callouts[m[1]]) {
      q.classList.add(callouts[m[1]]);
      p.innerHTML = p.innerHTML.replace(/^\[!([A-Z]+)\]\s*/, '<strong>' + m[1].toLowerCase() + ' › </strong>');
    }
  });

  // ── Hero typewriter effect ─────────────────────────────────────────────
  var typed = document.querySelectorAll('.term-typed');
  typed.forEach(function (el) {
    var full = el.getAttribute('data-typed') || '';
    if (!full) return;
    el.textContent = '';
    var i = 0;
    function step() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i++;
        setTimeout(step, 20 + Math.random() * 30);
      }
    }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = full;
    } else {
      setTimeout(step, 400);
    }
  });

  // ── Writeup list filters ───────────────────────────────────────────────
  var filterContainer = document.querySelector('[data-filter-target]');
  if (filterContainer) {
    var targetSel = filterContainer.getAttribute('data-filter-target');
    var target = document.querySelector(targetSel);
    if (target) {
      filterContainer.addEventListener('click', function (e) {
        var chip = e.target.closest('.filter-chip');
        if (!chip) return;
        e.preventDefault();
        var group = chip.getAttribute('data-group') || 'all';
        var value = chip.getAttribute('data-value');
        filterContainer.querySelectorAll('.filter-chip[data-group="' + group + '"]').forEach(function (c) {
          c.classList.toggle('is-active', c === chip);
        });
        var state = {};
        filterContainer.querySelectorAll('.filter-chip.is-active').forEach(function (c) {
          state[c.getAttribute('data-group')] = c.getAttribute('data-value');
        });
        var cards = target.querySelectorAll('[data-category], [data-platform]');
        var any = false;
        cards.forEach(function (card) {
          var ok = true;
          if (state.category && state.category !== '*' && card.getAttribute('data-category') !== state.category) ok = false;
          if (state.platform && state.platform !== '*' && card.getAttribute('data-platform') !== state.platform) ok = false;
          card.style.display = ok ? '' : 'none';
          if (ok) any = true;
        });
        var empty = target.querySelector('.empty');
        if (empty) empty.style.display = any ? 'none' : '';
      });
    }
  }
})();
