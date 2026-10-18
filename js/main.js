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

  // Nav shadow + reading progress
  var nav = $('#nav'), bar = $('#progress');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Active link highlighting (primary menu sections + legal TOC)
  var secMap = { top: 'top', how: 'how', solutions: 'solutions', families: 'families', resources: 'resources', about: 'about', contact: 'contact',
                 solution: 'solutions', problem: 'top', question: 'top', dashboard: 'solutions', insurance: 'solutions', property: 'solutions',
                 file: 'solutions', generations: 'families', why: 'families', faq: 'resources' };
  function setActive(links, key) {
    links.forEach(function (l) {
      var h = l.getAttribute('href');
      l.classList.toggle('active', h === '#' + key || h === 'index.html#' + key);
    });
  }
  if ('IntersectionObserver' in window) {
    var links = $$('.menu a:not(.btn)');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && secMap[en.target.id]) setActive(links, secMap[en.target.id]);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });

    var toc = $$('.toc a');
    if (toc.length) {
      var tspy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) toc.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      $$('.doc article').forEach(function (a) { tspy.observe(a); });
    }
  }

  // Reveal on scroll
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.reveal').forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 0.08 + 's'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Open the FAQ item when linked to directly (e.g. #faq-nri)
  function openHashFaq() {
    var t = location.hash && $(location.hash);
    if (t && t.tagName === 'DETAILS') t.open = true;
  }
  window.addEventListener('hashchange', openHashFaq);
  openHashFaq();

  // Family readiness check
  var quiz = $('#quiz');
  if (quiz) {
    var out = $('#quizOut'), msg = $('#quizMsg'), cta = $('#quizCta');
    quiz.addEventListener('change', function () {
      var answered = 0, unsure = 0;
      for (var i = 1; i <= 5; i++) {
        var c = quiz.querySelector('input[name=q' + i + ']:checked');
        if (c) { answered++; if (c.value === '0') unsure++; }
      }
      if (answered < 5) {
        msg.textContent = answered + ' of 5 answered.';
        cta.hidden = true; out.classList.remove('gap');
        return;
      }
      out.classList.toggle('gap', unsure > 0);
      cta.hidden = unsure === 0;
      msg.textContent = unsure === 0
        ? 'Your family appears well informed today. A periodic review keeps it that way.'
        : unsure + ' of 5 answers were “I am not sure”. Your family may have a financial-information gap.';
    });
  }

  // Contact form -> WhatsApp (no email address supplied for Gomeen yet)
  var form = $('#form'), note = $('#formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      var em = form.elements.email;
      if (em.value && !/^\S+@\S+\.\S+$/.test(em.value)) { em.classList.add('invalid'); ok = false; } else { em.classList.remove('invalid'); }
      if (!ok) { note.textContent = 'Please complete the highlighted fields and tick the consent box.'; return; }
      var d = new FormData(form);
      var text = 'Hello Gomeen, I would like to book a family wealth discussion.\n\n' +
        'Name: ' + d.get('name') + '\nMobile: ' + d.get('phone') + '\nEmail: ' + (d.get('email') || '-') +
        '\nLocation: ' + (d.get('city') || '-') + '\nPreferred contact: ' + d.get('method') +
        '\nInterest: ' + d.get('topic') + '\n\n' + (d.get('msg') || '');
      window.open('https://wa.me/919600168982?text=' + encodeURIComponent(text), '_blank', 'noopener');
      note.textContent = 'Opening WhatsApp with your message…';
    });
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
