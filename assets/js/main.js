// Shared page behaviour: theme toggle, mobile menu, scroll effects, showcase tabs.
(function () {
  var root = document.documentElement;

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') navLinks.classList.remove('open');
    });
  }

  var nav = document.querySelector('.nav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Fade sections in as they enter the viewport.
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Tabs: buttons carry data-tab, panels carry data-panel.
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var scope = document.getElementById(group.getAttribute('data-tabs')) || document;
    var tabs = group.querySelectorAll('[data-tab]');
    function show(name, push) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      scope.querySelectorAll('[data-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== name;
      });
      if (push && group.hasAttribute('data-hash')) {
        try { history.replaceState(null, '', '#' + name); } catch (e) {}
      }
      document.dispatchEvent(new CustomEvent('tabchange', { detail: { group: group, name: name } }));
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-tab'), true); });
    });
    var wanted = (location.hash || '').replace('#', '');
    var names = Array.prototype.map.call(tabs, function (t) { return t.getAttribute('data-tab'); });
    if (group.hasAttribute('data-hash') && names.indexOf(wanted) !== -1) show(wanted, false);
  });
})();
