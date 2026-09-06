/* ============================================================
   Softece — Interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('softece-theme'); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);

  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('softece-theme', next); } catch (e) {}
  }

  /* ---------- Ready ---------- */
  document.addEventListener('DOMContentLoaded', function () {

    /* Theme buttons */
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    /* Sticky nav */
    var nav = document.querySelector('.nav');
    var progress = document.querySelector('.progress');
    var totop = document.querySelector('.totop');

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-stuck', y > 12);
      if (totop) totop.classList.toggle('is-shown', y > 520);
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (totop) {
      totop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* Mobile drawer */
    var burger = document.querySelector('[data-drawer-toggle]');
    var drawer = document.querySelector('.drawer');
    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var open = drawer.classList.toggle('is-open');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      drawer.addEventListener('click', function (e) {
        if (e.target === drawer || e.target.tagName === 'A') {
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    }

    /* Scroll reveal */
    var revealables = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var d = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () { el.classList.add('is-in'); }, d);
          io.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* Card cursor glow */
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* Counters */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var target = parseFloat(el.getAttribute('data-count'));
          var suffix = el.getAttribute('data-suffix') || '';
          var dur = 1500, t0 = performance.now();
          function tick(now) {
            var p = Math.min((now - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = target * eased;
            el.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.round(val)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          cio.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }

    /* Accordion */
    document.querySelectorAll('.acc__q').forEach(function (q) {
      q.addEventListener('click', function () {
        var acc = q.closest('.acc');
        var isOpen = acc.classList.contains('is-open');
        var group = acc.parentElement;
        group.querySelectorAll('.acc').forEach(function (a) {
          a.classList.remove('is-open');
          var b = a.querySelector('.acc__q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          acc.classList.add('is-open');
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* Portfolio filters */
    var filters = document.querySelectorAll('.filter');
    if (filters.length) {
      filters.forEach(function (f) {
        f.addEventListener('click', function () {
          filters.forEach(function (x) { x.classList.remove('is-active'); });
          f.classList.add('is-active');
          var key = f.getAttribute('data-filter');
          document.querySelectorAll('.work').forEach(function (w) {
            var match = key === 'all' || (w.getAttribute('data-cat') || '').split(' ').indexOf(key) > -1;
            w.classList.toggle('is-hidden', !match);
          });
        });
      });
    }

    /* Contact form (front-end only demo) */
    var form = document.querySelector('[data-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = form.querySelector('.form__ok');
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
        setTimeout(function () {
          if (ok) ok.classList.add('is-shown');
          form.reset();
          if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
        }, 700);
      });
    }

    /* Active nav link */
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav__link, .drawer a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().split('#')[0].toLowerCase();
      if (href && href === here) a.classList.add('is-active');
    });

    /* Footer year */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
