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

    /* Callbacks the router fires after it shows a section. */
    var routeHooks = [];

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

    /* Dynamic years since starting client work (auto count from 2022) */
    document.querySelectorAll('[data-since-year]').forEach(function (el) {
      var y = parseInt(el.getAttribute('data-since-year'), 10);
      var m = parseInt(el.getAttribute('data-since-month') || '1', 10) - 1;
      var now = new Date();
      var diff = now.getFullYear() - y;
      if (now.getMonth() < m) diff--;
      var years = Math.max(1, diff);
      el.setAttribute('data-count', years);
      var suffix = el.getAttribute('data-suffix') || '+ yrs';
      el.textContent = years + suffix;
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

    var lastOrderData = null;

    /* Enquiry and order forms. The site is static, so there is no backend of
       our own: a form with data-sheet POSTs to a Google Apps Script web app
       that appends a row to the sheet. Without
       one — or if the request fails — the filled-in form is handed to the
       visitor's mail client instead, so it is never simply lost.
       Both forms live in the same document now, so each is wired separately. */
    document.querySelectorAll('[data-form]').forEach(function (form) {
      var getEndpoint = function () {
        var ds = (form.getAttribute('data-sheet') || '').trim();
        if (ds) return ds;
        if (form.getAttribute('data-subject') === 'Order' || form.getAttribute('data-plan-field')) {
          try {
            return atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy8=') +
                   atob('QUtmeWNieXFDR19QbmtsRkM4Z1V1RDQwZmxGOVB4V20wd3pyT1ZjYkFxalNnWHZRdWV4eTFWNG1OdTBZZzdnVVhWZE96ZXA0') +
                   atob('L2V4ZWM=');
          } catch (e) {
            return '';
          }
        }
        return '';
      };
      var endpoint = getEndpoint();
      var mailTo = form.getAttribute('data-mailto');
      var okBox = form.querySelector('.form__ok');
      var btn = form.querySelector('button[type="submit"]');
      var planField = form.getAttribute('data-plan-field');

      /* Arriving from a pricing card: #order/growth fixes the package to
         Growth. The labels live on the form as data-plan-*, so the prices are
         written once, in the markup. Enterprise has no fixed price, so it is
         the one package that asks the visitor for a figure. */
      if (planField && form.elements[planField]) {
        var updatePlanAndPrice = function (plan) {
          var label = plan && form.getAttribute('data-plan-' + plan.toLowerCase());
          if (label) form.elements[planField].value = label;
          var pkgVal = (form.elements[planField].value || '').toLowerCase();
          var priceInput = form.elements['price'];
          var priceHint = document.getElementById('order-price-hint');
          var priceField = document.getElementById('order-price-field');

          if (priceInput) {
            if (pkgVal.indexOf('growth') !== -1) {
              priceInput.value = '৳9,500';
              priceInput.readOnly = true;
              if (priceHint) priceHint.innerHTML = 'Fixed for Growth (৳9,500 / project). <a href="#pricing">Pick a different package</a>';
            } else if (pkgVal.indexOf('enterprise') !== -1) {
              if (priceInput.value === '৳3,000' || priceInput.value === '৳9,500') {
                priceInput.value = '';
              }
              priceInput.readOnly = false;
              priceInput.placeholder = 'What is this worth to you? Leave blank for a quote';
              if (priceHint) priceHint.innerHTML = 'Enterprise is priced per project &mdash; name a figure or leave blank for a quote.';
            } else {
              priceInput.value = '৳3,000';
              priceInput.readOnly = true;
              if (priceHint) priceHint.innerHTML = 'Fixed for Launch (৳3,000 / project). <a href="#pricing">Pick a different package</a>';
            }
            if (priceField) priceField.hidden = false;
          }
        };

        routeHooks.push(function (route, plan) {
          if (route !== 'order') return;
          updatePlanAndPrice(plan || 'launch');
        });
      }

      var collect = function () {
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) {
          if (el.name && el.type !== 'submit' && el.type !== 'button') {
            if (el.type === 'radio') {
              if (el.checked) data[el.name] = el.value;
            } else {
              data[el.name] = (el.value || '').trim();
            }
          }
        });
        // Ensure price is always filled in for the Google Sheet
        if (!data.price || data.price === '') {
          var pkg = (data.package || '').toLowerCase();
          if (pkg.indexOf('growth') !== -1) {
            data.price = '৳9,500';
          } else if (pkg.indexOf('enterprise') !== -1) {
            data.price = 'Custom Quote';
          } else {
            data.price = '৳3,000';
          }
        }
        // Payment defaults & status
        if (!data.payment_method) {
          data.payment_method = 'Pay after Discussion';
        }
        if (data.trx_id && data.trx_id.trim().length > 0) {
          data.payment_status = 'Advance Paid';
        } else if (data.payment_method.indexOf('Discussion') !== -1) {
          data.payment_status = 'Awaiting Discussion';
        } else {
          data.payment_status = 'Pending Advance';
        }
        lastOrderData = data;
        return data;
      };
      var busy = function (on) {
        if (!btn) return;
        btn.disabled = on;
        btn.textContent = on ? 'Sending...' : btn.getAttribute('data-label');
      };
      var showOrderReceipt = function (data) {
        var receipt = document.getElementById('order-receipt');
        if (!receipt) return;
        receipt.hidden = false;

        var elPkg = document.getElementById('receipt-package');
        var elPrice = document.getElementById('receipt-price');
        var elAdv = document.getElementById('receipt-advance');
        var elContact = document.getElementById('receipt-contact');
        var elMethod = document.getElementById('receipt-method');
        var elStatus = document.getElementById('receipt-status');
        var elWa = document.getElementById('receipt-wa-btn');

        if (elPkg) elPkg.textContent = data.package || 'Launch — ৳3,000 / project';
        if (elPrice) elPrice.textContent = data.price || '৳3,000';

        // Calculate 50% advance
        var adv = '50% upon scope approval';
        var priceNum = parseInt(String(data.price || '').replace(/[^0-9]/g, ''), 10);
        if (priceNum && !isNaN(priceNum)) {
          adv = '৳' + Math.round(priceNum / 2).toLocaleString();
        }
        if (elAdv) elAdv.textContent = adv;

        if (elContact) {
          elContact.textContent = (data.name || 'Valued Client') + (data.phone ? ' · ' + data.phone : '');
        }
        if (elMethod) elMethod.textContent = data.payment_method || 'Pay after Discussion';

        if (elStatus) {
          if (data.trx_id && data.trx_id.trim().length > 0) {
            elStatus.textContent = 'Advance Submitted (Trx: ' + data.trx_id.trim() + ')';
            elStatus.className = 'receipt-badge receipt-badge--paid';
          } else if ((data.payment_method || '').indexOf('Discussion') !== -1) {
            elStatus.textContent = 'Awaiting Discussion / Confirmation';
            elStatus.className = 'receipt-badge receipt-badge--pending';
          } else {
            elStatus.textContent = 'Pending 50% Advance (' + adv + ')';
            elStatus.className = 'receipt-badge receipt-badge--pending';
          }
        }

        if (elWa) {
          var waText = 'Hi Fuad, I have submitted an order on Softece:\n' +
            '• Package: ' + (data.package || '') + '\n' +
            '• Price: ' + (data.price || '') + '\n' +
            '• Advance (50%): ' + adv + '\n' +
            '• Name: ' + (data.name || '') + '\n' +
            '• Phone: ' + (data.phone || '') + '\n' +
            '• Payment: ' + (data.payment_method || 'Discussion') + '\n' +
            (data.trx_id ? ('• TrxID: ' + data.trx_id + '\n') : '') +
            'Please confirm and share our project timeline.';
          elWa.href = 'https://wa.me/8801902780443?text=' + encodeURIComponent(waText);
        }

        if (okBox) okBox.style.display = 'none';

        try {
          receipt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (_) {}
      };

      var done = function (message, data) {
        if (data && document.getElementById('order-receipt')) {
          showOrderReceipt(data);
          return;
        }
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
        done('Your email app should be opening with everything filled in \u2014 press send there.', data);
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

        if (endpoint && window.fetch) {
          busy(true);
          fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(data)
          }).then(function () {
            busy(false);
            done(null, data);
            if (!document.getElementById('order-receipt')) {
              form.reset();
            } else if (btn) {
              btn.textContent = 'Order Submitted ✓';
              btn.disabled = true;
            }
          })['catch'](function () {
            busy(false);
            if (mailTo) {
              handToMailClient(data);
            } else {
              done('Thanks — your order is in. We\u2019ll reply within one business day.', data);
              if (!document.getElementById('order-receipt')) {
                form.reset();
              }
            }
          });
          return;
        }

        if (mailTo) {
          handToMailClient(data);
        }
      });
    });

    /* Copy bKash/Nagad/Rocket Number */
    var copyBtn = document.getElementById('btn-copy-number');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var num = '01902780443';
        var copyText = document.getElementById('copy-btn-text');
        var handleSuccess = function () {
          if (copyText) copyText.textContent = 'Copied!';
          setTimeout(function () {
            if (copyText) copyText.textContent = 'Copy Number';
          }, 2500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(num).then(handleSuccess)['catch'](function () {
            window.prompt('Copy bKash/Nagad/Rocket Number:', num);
          });
        } else {
          window.prompt('Copy bKash/Nagad/Rocket Number:', num);
        }
      });
    }

    /* Copy Binance Pay ID */
    var copyBinanceBtn = document.getElementById('btn-copy-binance');
    if (copyBinanceBtn) {
      copyBinanceBtn.addEventListener('click', function () {
        var binanceId = '570841564';
        var copyText = document.getElementById('copy-binance-text');
        var handleSuccess = function () {
          if (copyText) copyText.textContent = 'Copied!';
          setTimeout(function () {
            if (copyText) copyText.textContent = 'Copy Pay ID';
          }, 2500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(binanceId).then(handleSuccess)['catch'](function () {
            window.prompt('Copy Binance Pay ID:', binanceId);
          });
        } else {
          window.prompt('Copy Binance Pay ID:', binanceId);
        }
      });
    }

    /* Submit Late TrxID from receipt card */
    var trxSubmitBtn = document.getElementById('receipt-trx-submit');
    var trxInput = document.getElementById('receipt-trx-input');
    var trxStatus = document.getElementById('receipt-trx-status');
    if (trxSubmitBtn && trxInput) {
      trxSubmitBtn.addEventListener('click', function () {
        var trxVal = (trxInput.value || '').trim();
        if (!trxVal) {
          alert('Please enter a Transaction ID (TrxID) first.');
          return;
        }
        trxSubmitBtn.disabled = true;
        trxSubmitBtn.textContent = 'Saving...';

        var endpoint = '';
        try {
          endpoint = atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy8=') +
                     atob('QUtmeWNieXFDR19QbmtsRkM4Z1V1RDQwZmxGOVB4V20wd3pyT1ZjYkFxalNnWHZRdWV4eTFWNG1OdTBZZzdnVVhWZE96ZXA0') +
                     atob('L2V4ZWM=');
        } catch (_) {}

        var clientPhone = (lastOrderData && lastOrderData.phone) || (document.getElementById('order-phone') ? document.getElementById('order-phone').value : '');
        var clientEmail = (lastOrderData && lastOrderData.email) || (document.getElementById('order-email') ? document.getElementById('order-email').value : '');
        var clientName = (lastOrderData && lastOrderData.name) || (document.getElementById('order-name') ? document.getElementById('order-name').value : '');

        var payload = {
          action: 'update_trx',
          trx_id: trxVal,
          payment_status: 'Advance Paid',
          phone: clientPhone,
          email: clientEmail,
          name: clientName
        };

        var onDone = function () {
          trxSubmitBtn.disabled = false;
          trxSubmitBtn.textContent = 'Saved ✓';
          if (trxStatus) {
            trxStatus.textContent = '✓ Transaction ID (' + trxVal + ') recorded in our sprint sheet!';
            trxStatus.style.color = '#4ade80';
          }
          var elStatus = document.getElementById('receipt-status');
          if (elStatus) {
            elStatus.textContent = 'Advance Paid (Trx: ' + trxVal + ')';
            elStatus.className = 'receipt-badge receipt-badge--paid';
          }
          var elWa = document.getElementById('receipt-wa-btn');
          if (elWa && lastOrderData) {
            lastOrderData.trx_id = trxVal;
            var adv = '50% upon scope approval';
            var priceNum = parseInt(String(lastOrderData.price || '').replace(/[^0-9]/g, ''), 10);
            if (priceNum && !isNaN(priceNum)) {
              adv = '৳' + Math.round(priceNum / 2).toLocaleString();
            }
            var waText = 'Hi Fuad, I have submitted an order on Softece:\n' +
              '• Package: ' + (lastOrderData.package || '') + '\n' +
              '• Price: ' + (lastOrderData.price || '') + '\n' +
              '• Advance (50%): ' + adv + '\n' +
              '• Name: ' + (lastOrderData.name || '') + '\n' +
              '• Phone: ' + (lastOrderData.phone || '') + '\n' +
              '• Payment: ' + (lastOrderData.payment_method || 'Discussion') + '\n' +
              '• TrxID: ' + trxVal + '\n' +
              'Please confirm and share our project timeline.';
            elWa.href = 'https://wa.me/8801902780443?text=' + encodeURIComponent(waText);
          }
        };

        if (endpoint && window.fetch) {
          fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          }).then(onDone)['catch'](onDone);
        } else {
          onDone();
        }
      });
    }

    /* ---------- Routing ----------
       The whole site is one document: six <section class="route"> blocks, one
       shown at a time. Everything after the site root is a hash and nothing
       else — #services, #contact, #order/growth — and a deep anchor such as
       #pricing or #team resolves to the section that owns it, so those links
       keep working and stay short. With scripting off no section is hidden
       and the page reads top to bottom. */
    var sections = {};
    document.querySelectorAll('.route').forEach(function (el) {
      sections[el.getAttribute('data-route')] = el;
    });

    if (Object.keys(sections).length) {
      var OWNER = {
        stack: 'home', process: 'home', pricing: 'services', app: 'services', cross: 'services',
        web: 'services', server: 'services', database: 'services', api: 'services',
        balancer: 'services', team: 'about'
      };
      var navBar = document.querySelector('.nav');

      var readHash = function () {
        var bits = (location.hash || '').replace(/^#/, '').split('/');
        var key = (bits[0] || '').toLowerCase();
        if (!key) return { route: 'home', anchor: '', extra: '' };
        if (sections[key]) return { route: key, anchor: '', extra: bits[1] || '' };
        if (OWNER[key]) return { route: OWNER[key], anchor: key, extra: '' };
        return { route: 'home', anchor: '', extra: '' };
      };

      var routeOf = function (href) {
        var key = (href || '').replace(/^#/, '').split('/')[0].toLowerCase();
        return sections[key] ? key : (OWNER[key] || '');
      };

      /* html has scroll-behavior:smooth for in-page links, which would animate
         a route change across thousands of pixels of the section just shown.
         Arriving somewhere new should be instant. */
      var jump = function (y) {
        /* scrollTo's "auto" defers to the CSS property rather than overriding
           it, so turn smooth off around the call instead. */
        var prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        root.style.scrollBehavior = prev;
      };

      var scrollToAnchor = function (id) {
        var target = id && document.getElementById(id);
        if (!target) { jump(0); return; }
        var y = target.getBoundingClientRect().top + (window.pageYOffset || 0) -
                ((navBar ? navBar.offsetHeight : 0) + 24);
        jump(Math.max(0, y));
      };

      var go = function (first) {
        var at = readHash();
        Object.keys(sections).forEach(function (name) {
          sections[name].hidden = (name !== at.route);
        });
        var title = sections[at.route].getAttribute('data-title');
        if (title) document.title = title;

        document.querySelectorAll('.nav__link').forEach(function (a) {
          a.classList.toggle('is-active', routeOf(a.getAttribute('href')) === at.route);
        });

        routeHooks.forEach(function (fn) { fn(at.route, at.extra); });

        /* A section that was display:none has no layout, so let it lay out
           before measuring where the anchor ended up. */
        if (at.anchor) {
          requestAnimationFrame(function () { scrollToAnchor(at.anchor); });
          /* The web fonts land after this and re-flow everything above the
             target, so on a cold load take the measurement again. */
          if (first && document.fonts && document.fonts.ready && document.fonts.ready.then) {
            document.fonts.ready.then(function () { scrollToAnchor(at.anchor); });
          }
        } else if (!first) {
          jump(0);
        }
      };

      window.addEventListener('hashchange', function () { go(false); });
      go(true);
    }

    /* Footer year */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
