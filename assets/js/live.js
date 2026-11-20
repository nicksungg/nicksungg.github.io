// Live demos.
//
// The demos run on my workstation and are reached through tunnels whose
// addresses can change when the machine restarts. The workstation publishes the
// current addresses to live.json on the "live" branch of this repository; this
// script reads that file, checks from the visitor's browser whether each demo
// answers, and updates the page.
(function () {
  var REPO = 'nicksungg/nicksungg.github.io';
  var SOURCES = [
    { url: 'https://api.github.com/repos/' + REPO + '/contents/live.json?ref=live',
      headers: { Accept: 'application/vnd.github.raw+json' } },
    { url: 'https://raw.githubusercontent.com/' + REPO + '/live/live.json' },
    { url: 'live.json' }
  ];
  var NAMES = ['blendednet', 'blendednetpp'];

  function fetchJson(src) {
    return fetch(src.url, { headers: src.headers || {}, cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(src.url + ' ' + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.demos) throw new Error('no demos in ' + src.url);
      return j;
    });
  }

  function loadAddresses() {
    return SOURCES.reduce(function (p, src) {
      return p.catch(function () { return fetchJson(src); });
    }, Promise.reject(new Error('start')));
  }

  // A demo counts as live if its icon loads. A tunnel that is down answers with
  // an error page, which fails to load as an image.
  function probe(url) {
    return new Promise(function (resolve) {
      if (!url) return resolve(false);
      var img = new Image();
      var done = false;
      function finish(ok) { if (!done) { done = true; resolve(ok); } }
      var timer = setTimeout(function () { finish(false); }, 10000);
      img.onload = function () { clearTimeout(timer); finish(true); };
      img.onerror = function () { clearTimeout(timer); finish(false); };
      img.src = url.replace(/\/$/, '') + '/favicon.ico?t=' + Date.now();
    });
  }

  function setStatus(name, state) {
    var text = { checking: 'Checking…', live: 'Live now', off: 'Offline right now' }[state];
    document.querySelectorAll('[data-demo-status="' + name + '"]').forEach(function (el) {
      el.classList.remove('live', 'off');
      if (state !== 'checking') el.classList.add(state);
      el.textContent = text;
    });
  }

  NAMES.forEach(function (n) { setStatus(n, 'checking'); });

  var ready = loadAddresses().then(function (data) {
    return Promise.all(NAMES.map(function (n) {
      var url = data.demos[n] && data.demos[n].url;
      return probe(url).then(function (ok) { return { name: n, url: url || null, live: ok }; });
    })).then(function (list) {
      var out = { updated: data.updated || null, demos: {} };
      list.forEach(function (d) { out.demos[d.name] = d; setStatus(d.name, d.live ? 'live' : 'off'); });
      return out;
    });
  }).catch(function () {
    var out = { updated: null, demos: {} };
    NAMES.forEach(function (n) { out.demos[n] = { name: n, url: null, live: false }; setStatus(n, 'off'); });
    return out;
  });

  window.LiveDemos = { ready: ready };

  // ---- demos.html: embed the selected demo ----
  var frames = document.querySelectorAll('[data-demo-frame]');
  if (!frames.length) return;

  function mount(panel, state) {
    var name = panel.getAttribute('data-demo-frame');
    var d = state.demos[name];
    var off = panel.querySelector('.demo-off');
    var iframe = panel.querySelector('iframe');
    var path = panel.getAttribute('data-path') || '/';
    var holder = panel.closest('[data-panel]') || document;
    holder.querySelectorAll('[data-demo-open="' + name + '"]').forEach(function (a) {
      if (d.live) { a.href = d.url + path; a.removeAttribute('aria-disabled'); a.hidden = false; }
      else { a.hidden = true; }
    });
    if (!d.live) { if (off) off.hidden = false; if (iframe) iframe.removeAttribute('src'); return; }
    if (off) off.hidden = true;
    var target = d.url + path;
    if (iframe && iframe.getAttribute('src') !== target) iframe.setAttribute('src', target);
  }

  function mountVisible(state) {
    frames.forEach(function (panel) {
      var holder = panel.closest('[data-panel]');
      if (!holder || !holder.hidden) mount(panel, state);
    });
  }

  ready.then(function (state) {
    mountVisible(state);
    document.addEventListener('tabchange', function () { mountVisible(state); });
    // Buttons that switch between pages of one demo (the structures viewer has two).
    document.querySelectorAll('[data-demo-path]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.querySelector('[data-demo-frame="' + btn.getAttribute('data-for') + '"]');
        if (!panel) return;
        panel.setAttribute('data-path', btn.getAttribute('data-demo-path'));
        btn.parentNode.querySelectorAll('[data-demo-path]').forEach(function (b) { b.classList.toggle('demo', b === btn); });
        mount(panel, state);
      });
    });
  });
})();
