/* ============================================
   PARTICLE BACKGROUND
   ============================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n = 120) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(88,166,255,${s.alpha})`;
      ctx.fill();
    });

    // Draw connection lines between nearby stars
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(88,166,255,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function updateStars() {
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
    });
  }

  function loop() {
    drawStars();
    updateStars();
    requestAnimationFrame(loop);
  }

  resize();
  createStars();
  loop();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
})();

/* ============================================
   HAMBURGER MENU
   ============================================ */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();

/* ============================================
   TYPING ANIMATION
   ============================================ */
(function () {
  const lines = [
    'Computer Science Student',
    'Cloud & Cybersecurity Enthusiast',
    'Learning Networking & Security',
    'Building with C, C++, Python, Java',
    'Always Learning. Always Building.'
  ];

  const el = document.getElementById('typing-text');
  let lineIdx = 0, charIdx = 0, deleting = false, pause = 0;

  function type() {
    const current = lines[lineIdx];

    if (!deleting && charIdx <= current.length) {
      el.textContent = current.slice(0, charIdx++);
      setTimeout(type, 55);
    } else if (!deleting && charIdx > current.length) {
      pause++;
      if (pause < 28) { setTimeout(type, 80); return; }
      pause = 0;
      deleting = true;
      setTimeout(type, 55);
    } else if (deleting && charIdx >= 0) {
      el.textContent = current.slice(0, charIdx--);
      setTimeout(type, 30);
    } else {
      deleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
      charIdx = 0;
      setTimeout(type, 400);
    }
  }

  type();
})();

/* ============================================
   REVEAL ON SCROLL
   ============================================ */
(function () {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ============================================
   GITHUB REPOSITORIES
   ============================================ */
(function () {
  const GITHUB_USER = 'Hyujnn54';
  const grid  = document.getElementById('repos-grid');
  const btns  = document.querySelectorAll('.filter-btn');
  let allRepos = [];

  const LANG_COLORS = {
    Python: '#3572A5', Java: '#b07219',
    'C++': '#f34b7d', C: '#555599',
    JavaScript: '#f1e05a', TypeScript: '#2b7489',
    HTML: '#e34c26', CSS: '#563d7c'
  };

  // Extended repo list – includes a pinned Shadows-Of-Liberty external repo
  const FEATURED_EXTRA = [
    {
      name: 'Shadows-Of-Liberty',
      full_name: 'Aziz-BenLamine/Shadows-Of-Liberty',
      html_url: 'https://github.com/Aziz-BenLamine/Shadows-Of-Liberty',
      description: 'A C game project (pinned collaboration).',
      language: 'C',
      stargazers_count: 1,
      forks_count: 1,
      topics: ['game', 'c'],
      fork: false
    }
  ];

  function langClass(lang) {
    const map = { Python:'Python', Java:'Java', C:'C', 'C++':'C', JavaScript:'JavaScript', TypeScript:'TypeScript', HTML:'HTML', CSS:'CSS' };
    return `lang-${map[lang] || 'default'}`;
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return `${d}d ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return `${m}mo ago`;
    return `${Math.floor(m / 12)}y ago`;
  }

  function buildCard(repo) {
    const topics = (repo.topics || []).slice(0, 3);
    const card = document.createElement('div');
    card.className = 'repo-card reveal';
    card.dataset.lang = repo.language || '';
    card.innerHTML = `
      <div class="repo-icon">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
        </svg>
      </div>
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">${repo.name}</a>
      <p class="repo-desc">${repo.description || 'No description provided.'}</p>
      ${topics.length ? `<div class="repo-footer" style="gap:.4rem;flex-wrap:wrap;">${topics.map(t => `<span class="repo-topic">${t}</span>`).join('')}</div>` : ''}
      <div class="repo-footer">
        ${repo.language ? `<span class="repo-lang"><span class="lang-dot ${langClass(repo.language)}"></span>${repo.language}</span>` : ''}
        <span class="repo-stat">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
          ${repo.stargazers_count}
        </span>
        <span class="repo-stat">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
          ${repo.forks_count}
        </span>
        ${repo.updated_at ? `<span style="margin-left:auto;">${timeAgo(repo.updated_at)}</span>` : ''}
      </div>`;
    return card;
  }

  function renderRepos(lang) {
    grid.innerHTML = '';
    const filtered = lang === 'all'
      ? allRepos
      : allRepos.filter(r => (r.language || '') === lang || (r.language || '').startsWith(lang));

    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);padding:2rem;font-family:var(--font-mono);">No repositories found for this filter.</p>';
      return;
    }

    // Re-observe for reveal animations
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });

    filtered.forEach((repo, i) => {
      const card = buildCard(repo);
      card.style.transitionDelay = `${i * 60}ms`;
      grid.appendChild(card);
      io.observe(card);
    });
  }

  async function fetchRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      // Combine own repos + extra featured, deduplicate
      const ownRepos = data.filter(r => !r.fork || r.name === 'Hyujnn54');
      const names = new Set(ownRepos.map(r => r.name));
      const extras = FEATURED_EXTRA.filter(r => !names.has(r.name));
      allRepos = [...ownRepos, ...extras].sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const tb = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return tb - ta;
      });
    } catch (e) {
      // Fallback to static data if API fails
      allRepos = [
        { name: 'Talent-Bridge', html_url: 'https://github.com/Hyujnn54/Talent-Bridge', description: 'A Java desktop and web HR application for managing recruitment and interviews.', language: 'Java', stargazers_count: 0, forks_count: 0, topics: ['java','javafx','hr','recruitment'], updated_at: '2026-03-05T11:55:41Z' },
        { name: 'PPW',           html_url: 'https://github.com/Hyujnn54/PPW',           description: 'Python project.',                                           language: 'Python', stargazers_count: 0, forks_count: 0, topics: ['python'], updated_at: '2026-03-05T19:31:25Z' },
        ...FEATURED_EXTRA
      ];
    }

    renderRepos('all');
  }

  // Filter buttons
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRepos(btn.dataset.filter);
    });
  });

  fetchRepos();
})();

/* ============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================ */
(function () {
  const sections = document.querySelectorAll('section[id], .hero');
  const navAs    = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navAs.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) a.style.color = 'var(--accent)';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();
