/* HRK365 — site behaviour: language, nav, reveal, accordion */
(function () {
  'use strict';

  /* ---- sticky nav shadow ---- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.body.classList.remove('menu-open');
  });

  /* ---- desktop dropdowns: keyboard support ---- */
  document.querySelectorAll('.has-sub > a').forEach(function (a) {
    a.addEventListener('focus', function () { a.parentNode.classList.add('is-open'); });
    a.parentNode.addEventListener('focusout', function (e) {
      if (!a.parentNode.contains(e.relatedTarget)) a.parentNode.classList.remove('is-open');
    });
  });

  /* ---- accordion ---- */
  document.querySelectorAll('.acc__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentNode;
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---- contact form without a backend: compose an email instead ---- */
  var mailForm = document.querySelector('form[data-mailto]');
  if (mailForm) {
    mailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(mailForm);
      var get = function (k) { return (d.get(k) || '').toString().trim(); };
      var subject = (get('topic') || 'Enquiry') + ' — ' + (get('company') || get('name') || '');
      var lines = [
        'Name: ' + get('name'),
        'Company: ' + get('company'),
        'Email: ' + get('email'),
        'Phone: ' + get('phone'),
        'Topic: ' + get('topic'),
        '',
        get('message')
      ];
      window.location.href = 'mailto:' + mailForm.dataset.mailto +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* ---- year ---- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ---- interactive engagement flow (/process/) ---- */
(function () {
  'use strict';
  document.querySelectorAll('.flow').forEach(function (flow) {
    var nodes = Array.prototype.slice.call(flow.querySelectorAll('.flow__node'));
    var cards = Array.prototype.slice.call(flow.querySelectorAll('.flow__card'));
    var fill = flow.querySelector('.flow__fill');
    var track = flow.querySelector('.flow__track');
    var prev = flow.querySelector('.flow__prev');
    var next = flow.querySelector('.flow__next');
    var now = flow.querySelector('.flow__now');
    if (!nodes.length || !cards.length) return;
    var cur = 0;

    function fillTo(i) {
      if (!fill || !track) return;
      var vertical = window.matchMedia('(max-width:860px)').matches;
      var dot = nodes[i].querySelector('.flow__dot');
      var tr = track.getBoundingClientRect();
      var dr = dot.getBoundingClientRect();
      if (vertical) {
        var pctV = ((dr.top + dr.height / 2 - tr.top) / tr.height) * 100;
        fill.style.setProperty('--fillv', Math.max(0, Math.min(100, pctV)) + '%');
      } else {
        var line = flow.querySelector('.flow__line').getBoundingClientRect();
        var pct = ((dr.left + dr.width / 2 - line.left) / line.width) * 100;
        fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
      }
    }

    function go(i, focusCard) {
      cur = Math.max(0, Math.min(nodes.length - 1, i));
      nodes.forEach(function (n, j) {
        n.classList.toggle('is-active', j === cur);
        n.classList.toggle('is-done', j < cur);
        n.setAttribute('aria-selected', j === cur ? 'true' : 'false');
      });
      cards.forEach(function (c, j) { c.hidden = j !== cur; });
      if (now) now.textContent = ('0' + (cur + 1)).slice(-2);
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === nodes.length - 1;
      fillTo(cur);
      if (focusCard) cards[cur].focus({ preventScroll: true });
    }

    nodes.forEach(function (n) {
      n.addEventListener('click', function () { go(parseInt(n.dataset.step, 10)); });
    });
    if (prev) prev.addEventListener('click', function () { go(cur - 1); });
    if (next) next.addEventListener('click', function () { go(cur + 1); });
    flow.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(cur - 1); }
    });
    window.addEventListener('resize', function () { fillTo(cur); });
    /* first paint after fonts/layout settle */
    setTimeout(function () { go(0); }, 60);
  });
})();
