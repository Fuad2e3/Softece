/* ============================================================
   Softece — Interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Theme ----------
     Three states, cycled by the button: auto -> light -> dark -> auto.
     'auto' removes the attribute so the CSS media query follows the operating
     system, and keeps following it if the OS flips at sunset. A forced choice
     is stored and wins until the visitor cycles back to auto.
     The pre-paint script in each page's <head> applies a forced choice early;
     this file owns everything after that. */
  var root = document.documentElement;
  var THEMES = ['auto', 'light', 'dark'];
  var mqDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var pref = 'auto';
  try {
    var stored = localStorage.getItem('softece-theme');
    if (THEMES.indexOf(stored) > -1) pref = stored;
  } catch (e) {}

  function resolved() {
    if (pref !== 'auto') return pref;
    return mqDark && mqDark.matches ? 'dark' : 'light';
  }

  function paintThemeButtons() {
    var label = pref === 'auto'
      ? 'Theme: auto (following your system, currently ' + resolved() + ')'
      : 'Theme: ' + pref;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
    // Keep the mobile browser chrome in step. On auto each meta stays scoped to
    // its own media query; a forced choice switches the matching one on and the
    // other off, since the browser uses the first meta whose media matches.
    document.querySelectorAll('meta[name="theme-color"][data-scheme]').forEach(function (m) {
      var scheme = m.getAttribute('data-scheme');
      m.setAttribute('media', pref === 'auto'
        ? '(prefers-color-scheme: ' + scheme + ')'
        : (scheme === pref ? 'all' : 'not all'));
    });
  }

  function applyTheme() {
    if (pref === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', pref);
    paintThemeButtons();
  }

  function cycleTheme() {
    pref = THEMES[(THEMES.indexOf(pref) + 1) % THEMES.length];
    try { localStorage.setItem('softece-theme', pref); } catch (e) {}
    applyTheme();
  }

  // While on auto, follow the system if it changes mid-visit.
  if (mqDark) {
    var onSystemChange = function () { if (pref === 'auto') paintThemeButtons(); };
    if (mqDark.addEventListener) mqDark.addEventListener('change', onSystemChange);
    else if (mqDark.addListener) mqDark.addListener(onSystemChange);
  }

  /* ---------- Ready ---------- */
  document.addEventListener('DOMContentLoaded', function () {

    /* Theme buttons */
    applyTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', cycleTheme);
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
          var raw = el.getAttribute('data-count');
          var target = parseFloat(raw);
          var suffix = el.getAttribute('data-suffix') || '';
          // Match the precision written in the markup. Rounding everything
          // fractional to one decimal turned 99.98% into 100.0%.
          var decimals = raw.indexOf('.') > -1 ? raw.split('.')[1].length : 0;
          var dur = 1500, t0 = performance.now();
          function tick(now) {
            var p = Math.min((now - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals) + suffix;
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

    /* Enquiry and order forms. The site is static, so there is no backend of
       our own: a form with data-sheet POSTs to a Google Apps Script web app
       that appends a row to the sheet (see tools/sheet-endpoint.gs). Without
       one — or if the request fails — the filled-in form is handed to the
       visitor's mail client instead, so it is never simply lost. */
    var form = document.querySelector('[data-form]');
    if (form) {
      var endpoint = (form.getAttribute('data-sheet') || '').trim();
      var mailTo = form.getAttribute('data-mailto');
      var okBox = form.querySelector('.form__ok');
      var btn = form.querySelector('button[type="submit"]');

      /* Arriving from a pricing card: order.html?plan=Growth fixes the package
         to Growth. The labels live on the form as data-plan-*, so the prices
         are written once, in the markup. Enterprise has no fixed price, so it
         is the one package that asks the visitor for a figure. */
      var planField = form.getAttribute('data-plan-field');
      if (planField && form.elements[planField]) {
        var wanted = (location.search.match(/[?&]plan=([^&]*)/) || [])[1];
        if (wanted) {
          wanted = decodeURIComponent(wanted.replace(/\+/g, ' ')).trim().toLowerCase();
          var label = form.getAttribute('data-plan-' + wanted);
          if (label) form.elements[planField].value = label;
        }
        var priceField = document.getElementById('price-field');
        if (priceField) {
          priceField.hidden = form.elements[planField].value.toLowerCase().indexOf('enterprise') !== 0;
        }
      }

      var collect = function () {
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) {
          if (el.name && el.type !== 'submit' && el.type !== 'button') {
            data[el.name] = (el.value || '').trim();
          }
        });
        return data;
      };
      var busy = function (on) {
        if (!btn) return;
        btn.disabled = on;
        btn.textContent = on ? 'Sending...' : btn.getAttribute('data-label');
      };
      var done = function (message) {
        if (!okBox) return;
        if (message) okBox.textContent = message;
        okBox.classList.add('is-shown');
      };
      var handToMailClient = function (data) {
        if (!mailTo) return;
        var lines = [];
        for (var key in data) {
          if (data.hasOwnProperty(key) && key !== 'message' && key !== 'details') {
            lines.push(key.charAt(0).toUpperCase() + key.slice(1) + ': ' + (data[key] || '-'));
          }
        }
        lines.push('', data.message || data.details || '');
        done('Your email app should be opening with everything filled in \u2014 press send there.');
        window.location.href = 'mailto:' + mailTo +
          '?subject=' + encodeURIComponent(
            (form.getAttribute('data-subject') || 'Project enquiry') + ' from ' + (data.name || 'the Softece site')) +
          '&body=' + encodeURIComponent(lines.join('\r\n'));
      };

      if (btn) btn.setAttribute('data-label', btn.textContent);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.checkValidity && !form.checkValidity()) {
          if (form.reportValidity) form.reportValidity();
          return;
        }
        var data = collect();

        if (!endpoint || !window.fetch) {
          handToMailClient(data);
          return;
        }

        busy(true);
        /* no-cors keeps this a simple request: Apps Script answers from a
           redirect it cannot put CORS headers on, so the reply is opaque —
           a resolved promise is all the confirmation there is. */
        fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data)
        }).then(function () {
          busy(false);
          done(null);
          form.reset();
        })['catch'](function () {
          busy(false);
          handToMailClient(data);
        });
      });
    }

    /* Landing on an anchor from another page (Hire us -> services.html#pricing).
       The browser jumps before the web fonts arrive; when they do, everything
       above the target re-flows and the section has drifted out from under the
       nav. Re-align on load and once the fonts are ready. */
    if (location.hash.length > 1) {
      var jumpTo = null;
      try { jumpTo = document.querySelector(location.hash); } catch (e) {}
      if (jumpTo) {
        var navBar = document.querySelector('.nav');
        var align = function () {
          var offset = (navBar ? navBar.offsetHeight : 0) + 24;
          var y = jumpTo.getBoundingClientRect().top + (window.pageYOffset || 0) - offset;
          if (Math.abs(y - (window.pageYOffset || 0)) < 2) return;
          try {
            window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
          } catch (e) {
            window.scrollTo(0, Math.max(0, y));
          }
        };
        align();
        window.addEventListener('load', align);
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
          document.fonts.ready.then(align);
        }
      }
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
