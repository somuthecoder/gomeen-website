(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Theme toggle
  $('#themeBtn').addEventListener('click', function () {
    var next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    doc.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // Nav shadow on scroll
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Active link highlighting
  var links = $$('.menu a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  // Count-up
  function count(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });

  // Reveal on scroll (+ stagger, counters, skill bars)
  $$('.reveal').forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 0.08 + 's'); });
  var counted = false;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.classList.contains('stat') && !counted) { counted = true; $$('[data-count]').forEach(count); }
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); bio.unobserve(en.target); } });
    }, { threshold: 0.3 });
    $$('.bars').forEach(function (b) { bio.observe(b); });
  } else {
    $$('.reveal,.bars').forEach(function (el) { el.classList.add('in'); });
  }

  // Project filter
  var fbtns = $$('.f');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f;
      fbtns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
      $$('.proj, tbody tr').forEach(function (el) { el.hidden = !(f === 'all' || el.dataset.t === f); });
    });
  });

  // Contact form -> mailto
  var form = $('#form'), note = $('#formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please complete the highlighted fields.'; return; }
    var d = new FormData(form);
    var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nOrganisation: ' + (d.get('org') || '-') + '\n\n' + d.get('msg');
    location.href = 'mailto:rgopalr75@outlook.com?subject=' + encodeURIComponent('Enquiry: ' + d.get('topic')) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app…';
  });

  $('#yr').textContent = new Date().getFullYear();
})();
