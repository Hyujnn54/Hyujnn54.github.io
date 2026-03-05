/* ============================================
   3D LOW-POLY WIREFRAME — SCROLLABLE PAGE LAYER
   Canvas is absolute (scrolls with page). Shapes
   are pinned to document positions so new ones
   appear as you scroll down.
   ============================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H; // H = full document height
  const mouse = { x: 0.5, y: 0.5 }; // normalised viewport coords

  /* ---- Geometry ---- */
  function edgesFor(verts, tol) {
    const e = [];
    for (let i = 0; i < verts.length; i++)
      for (let j = i+1; j < verts.length; j++) {
        const dx=verts[i][0]-verts[j][0], dy=verts[i][1]-verts[j][1], dz=verts[i][2]-verts[j][2];
        if (Math.abs(Math.sqrt(dx*dx+dy*dy+dz*dz)-tol) < tol*0.07) e.push([i,j]);
      }
    return e;
  }
  const φ = (1+Math.sqrt(5))/2;
  const ICO_V = [[0,1,φ],[0,-1,φ],[0,1,-φ],[0,-1,-φ],[1,φ,0],[-1,φ,0],[1,-φ,0],[-1,-φ,0],[φ,0,1],[-φ,0,1],[φ,0,-1],[-φ,0,-1]];
  const OCT_V = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const TET_V = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
  const CUB_V = [[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]];
  const GEO = {
    ico: { v: ICO_V, edges: edgesFor(ICO_V,2) },
    oct: { v: OCT_V, edges: edgesFor(OCT_V,Math.SQRT2) },
    tet: { v: TET_V, edges: edgesFor(TET_V,2*Math.SQRT2) },
    cub: { v: CUB_V, edges: edgesFor(CUB_V,2) }
  };

  /* ---- 3-D rotation + projection ---- */
  const rx=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c];};
  const ry=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];};
  const rz=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]];};
  function proj(v, cx, cy) {
    const fov=420, z=v[2]+fov;
    if(z<=0) return null;
    return [cx+v[0]*fov/z, cy+v[1]*fov/z];
  }

  /* ---- Floating code lines ---- */
  const CODE_SNIPPETS = [
    'const x = 0;', 'void main()', '#include <stdio.h>', 'int[] arr = {};',
    'import os', 'git push origin', 'ssh-keygen -t rsa', 'nmap -sV 127.0.0.1',
    'chmod 755', 'malloc(sizeof(t))', 'AES_256_GCM', 'SELECT * FROM users',
    'async/await', 'for(;;){}', 'while(true)', 'typedef struct node',
    'return 0;', 'iptables -A INPUT', 'docker run -it', 'kubectl get pods',
    'gcc -O2 -Wall', '0x00000000', '>>> EOF', 'NULL PTR',
    '01001000 01101001', 'SIGTERM', 'cat /etc/passwd', 'ping -c 4',
    'openssl enc -aes', 'netstat -an', 'traceroute', 'sudo !!'
  ];
  let codeLines = [];

  function buildCodeLines() {
    codeLines = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const y = Math.random() * H;
      codeLines.push({
        text:  CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
        x:     (0.14 + Math.random() * 0.72) * W,
        y,
        vy:    0.22 + Math.random() * 0.30,
        alpha: 0.13 + Math.random() * 0.11,
        size:  11 + Math.floor(Math.random() * 3)
      });
    }
  }

  function drawCodeLines() {
    ctx.textBaseline = 'top';
    codeLines.forEach(cl => {
      ctx.font        = `${cl.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle   = `rgba(255,255,255,${cl.alpha})`;
      ctx.fillText(cl.text, cl.x, cl.y);
      cl.y -= cl.vy;
      if (cl.y < -20) {
        cl.y    = H + 20 + Math.random() * 300;
        cl.text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        cl.x    = (0.14 + Math.random() * 0.72) * W;
      }
    });
  }

  /* ---- Shapes ---- */
  const DEFS = [
    // near top
    { type:'ico', cxF:0.08, yF:0.06, sz:88,  arx:0,   ary:0,   arz:0,   drx: 0.004, dry: 0.007, drz: 0.002, a:0.32 },
    { type:'oct', cxF:0.92, yF:0.09, sz:62,  arx:0.5, ary:0.2, arz:0,   drx: 0.007, dry:-0.005, drz: 0.002, a:0.35 },
    { type:'cub', cxF:0.05, yF:0.17, sz:52,  arx:0.3, ary:0.6, arz:0.2, drx:-0.003, dry:-0.006, drz: 0.004, a:0.28 },
    { type:'tet', cxF:0.94, yF:0.24, sz:70,  arx:1.0, ary:0.5, arz:0.3, drx:-0.005, dry: 0.008, drz: 0.004, a:0.30 },
    // mid
    { type:'ico', cxF:0.07, yF:0.34, sz:55,  arx:0.8, ary:0.4, arz:0,   drx: 0.006, dry:-0.004, drz: 0.005, a:0.30 },
    { type:'cub', cxF:0.93, yF:0.40, sz:68,  arx:0.2, ary:1.0, arz:0.5, drx:-0.004, dry: 0.006, drz:-0.003, a:0.33 },
    { type:'oct', cxF:0.06, yF:0.50, sz:58,  arx:0.7, ary:0,   arz:0.4, drx:-0.006, dry: 0.005, drz:-0.004, a:0.30 },
    { type:'tet', cxF:0.94, yF:0.57, sz:76,  arx:0,   ary:0.8, arz:0.6, drx: 0.003, dry: 0.005, drz:-0.006, a:0.32 },
    // lower half
    { type:'ico', cxF:0.08, yF:0.66, sz:80,  arx:0.4, ary:1.1, arz:0.2, drx: 0.005, dry: 0.004, drz: 0.003, a:0.30 },
    { type:'cub', cxF:0.92, yF:0.73, sz:55,  arx:0.9, ary:0.3, arz:0.7, drx:-0.004, dry:-0.005, drz: 0.006, a:0.28 },
    { type:'oct', cxF:0.06, yF:0.82, sz:64,  arx:0.1, ary:0.6, arz:0.4, drx: 0.006, dry: 0.007, drz:-0.003, a:0.33 },
    { type:'tet', cxF:0.93, yF:0.88, sz:72,  arx:0.5, ary:0.2, arz:0.9, drx:-0.005, dry: 0.003, drz: 0.005, a:0.30 },
    { type:'ico', cxF:0.07, yF:0.94, sz:50,  arx:1.2, ary:0.7, arz:0.3, drx: 0.004, dry:-0.006, drz: 0.003, a:0.26 },
    { type:'cub', cxF:0.93, yF:0.98, sz:60,  arx:0.6, ary:0.9, arz:0.1, drx:-0.003, dry: 0.005, drz:-0.005, a:0.28 },
  ];
  let shapes = [];

  function buildShapes() {
    shapes = DEFS.map(d => ({
      ...d,
      cx: d.cxF * W,
      cy: d.yF * H   // absolute document Y
    }));
  }

  function drawShape(sh) {
    const geo = GEO[sh.type];
    // Mouse parallax tilt (based on current cursor in viewport)
    const mRx = (mouse.y - 0.5) * 0.14;
    const mRy = (mouse.x - 0.5) * 0.14;

    const pts = geo.v.map(v => {
      let p = [v[0]*sh.sz, v[1]*sh.sz, v[2]*sh.sz];
      p = rx(p, sh.arx + mRx);
      p = ry(p, sh.ary + mRy);
      p = rz(p, sh.arz);
      return proj(p, sh.cx, sh.cy);
    });

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${sh.a})`;
    ctx.lineWidth   = 1.6;
    geo.edges.forEach(([i,j]) => {
      if (!pts[i] || !pts[j]) return;
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[j][0], pts[j][1]);
    });
    ctx.stroke();

    sh.arx += sh.drx;
    sh.ary += sh.dry;
    sh.arz += sh.drz;
  }

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawCodeLines();
    shapes.forEach(drawShape);
    requestAnimationFrame(loop);
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    // Use full document height so shapes live in page-space
    H = canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
    buildShapes();
    buildCodeLines();
  }

  // Wait for page to finish layout before measuring scrollHeight
  window.addEventListener('load', () => { resize(); loop(); });
  window.addEventListener('resize', resize);
  // Also re-measure when repos load (they expand the page)
  window.addEventListener('reposLoaded', resize);
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
   TEXT SCRAMBLE ON HOVER
   ============================================ */
(function () {
  const CHARS = '!<>-_\/[]{}=+*^?#01ABXZ$%@~';
  function scramble(el) {
    const original = el.dataset.scrambleOrig || el.textContent;
    el.dataset.scrambleOrig = original;
    let iter = 0;
    clearInterval(el._si);
    el._si = setInterval(() => {
      el.textContent = original.split('').map((ch, i) => {
        if (ch === ' ' || ch === '.') return ch;
        if (i < Math.floor(iter)) return original[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      iter += 0.45;
      if (iter > original.length) {
        clearInterval(el._si);
        el.textContent = original;
      }
    }, 28);
  }
  function restore(el) {
    clearInterval(el._si);
    el.textContent = el.dataset.scrambleOrig || el.textContent;
  }
  // Targets: nav links + section titles text nodes
  document.querySelectorAll('.nav-links a').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el));
    el.addEventListener('mouseleave', () => restore(el));
  });
  // Section numbers stay; scramble the text after the <span>
  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => {
      const span = title.querySelector('.section-num');
      const orig = span ? title.textContent.replace(span.textContent, '').trim() : title.textContent;
      scramble(title);
      // Put num span back after a tick so it isn't scrambled
      if (span) requestAnimationFrame(() => title.prepend(span));
    });
    title.addEventListener('mouseleave', () => restore(title));
  });
})();

/* ============================================
   PARALLAX SECTIONS
   ============================================ */
(function () {
  const FACTOR = 0.26;
  const sections = Array.from(document.querySelectorAll('.section'));

  function applyParallax() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    sections.forEach(sec => {
      const container = sec.querySelector('.container');
      if (!container) return;
      const rect   = sec.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const shift  = (center - vh / 2) * FACTOR;
      container.style.transform = `translateY(${shift}px)`;
    });
  }

  window.addEventListener('scroll', applyParallax, { passive: true });
  window.addEventListener('resize', applyParallax);
  applyParallax();
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

  // Repos to never show (readme-only or portfolio repo itself)
  const EXCLUDED_REPOS = new Set(['Hyujnn54', 'hyujnn_portfolio']);

  // Extra pinned repo (collaboration)
  const FEATURED_EXTRA = [
    {
      name: 'Shadows-Of-Liberty',
      full_name: 'Aziz-BenLamine/Shadows-Of-Liberty',
      html_url: 'https://github.com/Aziz-BenLamine/Shadows-Of-Liberty',
      description: 'A game built in C — pinned collaboration project.',
      language: 'C',
      stargazers_count: 1,
      forks_count: 1,
      topics: ['game', 'c', 'collaboration'],
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
    const topics = (repo.topics || []).slice(0, 4);
    const card   = document.createElement('div');
    card.className = 'repo-card reveal';
    card.dataset.lang = repo.language || '';
    card.innerHTML = `
      <div class="repo-body">
        <div class="repo-header-row">
          <svg class="repo-icon-svg" viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
          </svg>
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">${repo.name}</a>
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-open-btn" title="Open on GitHub">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/></svg>
          </a>
        </div>
        <p class="repo-desc">${repo.description || 'No description provided.'}</p>
        ${topics.length ? `<div class="repo-topics">${topics.map(t => `<span class="repo-topic">${t}</span>`).join('')}</div>` : ''}
        <div class="repo-footer">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot ${langClass(repo.language)}"></span>${repo.language}</span>` : ''}
          <span class="repo-stat">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
            ${repo.stargazers_count}
          </span>
          <span class="repo-stat">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
            ${repo.forks_count}
          </span>
          ${repo.updated_at ? `<span class="repo-updated">${timeAgo(repo.updated_at)}</span>` : ''}
        </div>
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

    filtered.forEach((repo, i) => {
      const card = buildCard(repo);
      card.style.transitionDelay = `${i * 40}ms`;
      // small timeout so opacity transition plays after paint
      setTimeout(() => card.classList.add('visible'), 30 + i * 40);
      grid.appendChild(card);
    });

  }

  async function fetchRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const ownRepos = data.filter(r => !EXCLUDED_REPOS.has(r.name) && !r.fork);
      const names = new Set(ownRepos.map(r => r.name));
      const extras = FEATURED_EXTRA.filter(r => !names.has(r.name));
      allRepos = [...ownRepos, ...extras].sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const tb = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return tb - ta;
      });
    } catch {
      allRepos = [
        { name: 'Talent-Bridge', html_url: 'https://github.com/Hyujnn54/Talent-Bridge', description: 'A Java desktop and web HR application for managing recruitment and interviews.', language: 'Java', stargazers_count: 0, forks_count: 0, topics: ['java','javafx','hr','recruitment'], updated_at: '2026-03-05T11:55:41Z' },
        { name: 'PPW', html_url: 'https://github.com/Hyujnn54/PPW', description: 'PPW — Personal Password Manager. AES-256-GCM encrypted vault with cloud sync, generator & browser extension.', language: 'Python', stargazers_count: 0, forks_count: 0, topics: ['python','security','passwords'], updated_at: '2026-03-05T19:31:25Z' },
        ...FEATURED_EXTRA
      ];
    }
    renderRepos('all');
    // Let canvas know page height changed
    setTimeout(() => window.dispatchEvent(new Event('reposLoaded')), 200);
  }

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
   MAGNETIC CURSOR
   ============================================ */
(function () {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Only activate on mouse devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mX = -300, mY = -300;
  let rX = -300, rY = -300;

  document.addEventListener('mousemove', e => {
    mX = e.clientX;
    mY = e.clientY;
  }, { passive: true });

  document.addEventListener('mousedown', () => ring.classList.add('is-clicked'),    { passive: true });
  document.addEventListener('mouseup',   () => setTimeout(() => ring.classList.remove('is-clicked'), 160), { passive: true });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity  = ''; ring.style.opacity  = ''; });

  // Elements that get magnetically pulled toward the cursor
  const SELECTORS = '.btn, .nav-links a, .hero-avatar-wrap, .social-link, .tech-tag';
  const RADIUS    = 90; // px — activation zone

  function loop() {
    // Dot tracks cursor exactly
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';

    // Ring lerps behind with slight lag
    rX += (mX - rX) * 0.11;
    rY += (mY - rY) * 0.11;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';

    // Magnetic pull
    let nearAny = false;
    document.querySelectorAll(SELECTORS).forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  * 0.5;
      const cy   = rect.top  + rect.height * 0.5;
      const dx   = mX - cx;
      const dy   = mY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS) {
        nearAny = true;
        const pull = (RADIUS - dist) / RADIUS;   // 0 at edge → 1 at center
        el.style.transform  = `translate(${dx * pull * 0.36}px, ${dy * pull * 0.36}px)`;
        el.style.transition = 'transform 0.08s linear';
      } else {
        el.style.transform  = '';
        el.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
      }
    });

    ring.classList.toggle('is-hovered', nearAny);
    requestAnimationFrame(loop);
  }

  loop();

  const ctx    = canvas.getContext('2d');
  const invCtx = invCvs.getContext('2d');

  const SCALE  = 0.18;   // low-res render upscaled — smooth + fast
  const THRESH = 1.0;
  // Light direction (top-left, angled toward viewer)
  const LX = 0.5774, LY = -0.5774, LZ = 0.5774; // normalized
  // Blinn-Phong half-vector (between light and viewer (0,0,1))
  const HX = LX * 0.5, HY = LY * 0.5, HZ = (LZ + 1) * 0.5;
  const HLEN = Math.sqrt(HX*HX + HY*HY + HZ*HZ);

  let W, H, SW, SH;
  const mouse = { x: -9999, y: -9999 };
  const blobs = [];
  const NUM   = 9;

  class Blob {
    constructor(i) {
      this.r  = 80 + Math.random() * 80;
      this.x  = (0.1 + Math.random() * 0.8) * (W || 1000);
      this.y  = (0.1 + Math.random() * 0.8) * (H || 600);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
    }
    update() {
      // Localized cursor repulsion — only blobs within 120px of cursor are pushed
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const FLEE = 130;
      if (dist < FLEE) {
        const strength = Math.pow((FLEE - dist) / FLEE, 2) * 9;
        this.vx += (dx / dist) * strength;
        this.vy += (dy / dist) * strength;
      }
      // Gentle wander
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy += (Math.random() - 0.5) * 0.08;
      // Strong damping so they rejoin quickly when cursor leaves
      this.vx *= 0.88;
      this.vy *= 0.88;
      // Speed cap
      const spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
      if (spd > 7) { this.vx = this.vx/spd*7; this.vy = this.vy/spd*7; }
      this.x += this.vx;
      this.y += this.vy;
      // Soft bounce
      const pad = this.r * 0.3;
      if (this.x < pad)     { this.x = pad;     this.vx =  Math.abs(this.vx) * 0.6; }
      if (this.x > W - pad) { this.x = W - pad; this.vx = -Math.abs(this.vx) * 0.6; }
      if (this.y < pad)     { this.y = pad;     this.vy =  Math.abs(this.vy) * 0.6; }
      if (this.y > H - pad) { this.y = H - pad; this.vy = -Math.abs(this.vy) * 0.6; }
    }
  }

  function resize() {
    W  = hero.offsetWidth;
    H  = hero.offsetHeight;
    SW = Math.ceil(W * SCALE);
    SH = Math.ceil(H * SCALE);
    [canvas, invCvs].forEach(c => {
      c.width  = SW;            c.height  = SH;
      c.style.width  = W + 'px'; c.style.height = H + 'px';
    });
  }

  function initBlobs() {
    blobs.length = 0;
    for (let i = 0; i < NUM; i++) blobs.push(new Blob(i));
  }

  function fieldAndGrad(wx, wy) {
    let sum = 0, gx = 0, gy = 0;
    for (let k = 0; k < blobs.length; k++) {
      const b  = blobs[k];
      const ex = wx - b.x, ey = wy - b.y;
      const d2 = ex*ex + ey*ey || 0.0001;
      const d4 = d2 * d2;
      const r2 = b.r * b.r;
      sum += r2 / d2;
      // analytical gradient: d/dx(r²/d²) = -2r²x/d⁴
      gx  -= 2 * r2 * ex / d4;
      gy  -= 2 * r2 * ey / d4;
    }
    return { sum, gx, gy };
  }

  function render() {
    if (!SW || !SH) { requestAnimationFrame(render); return; }

    const imgD = ctx.createImageData(SW, SH);
    const invD = invCtx.createImageData(SW, SH);
    const px   = imgD.data;
    const ipx  = invD.data;

    for (let py = 0; py < SH; py++) {
      for (let qx = 0; qx < SW; qx++) {
        const wx = qx / SCALE;
        const wy = py / SCALE;
        const { sum, gx, gy } = fieldAndGrad(wx, wy);

        if (sum < THRESH) continue;

        // ---- Surface normal from analytical gradient ----
        // gradient points toward blob center (increasing field)
        // surface normal in 3D: inward-2D + fake z-height gives lens shape
        const glen = Math.sqrt(gx*gx + gy*gy) || 0.001;
        const nx_raw = gx / glen;   // tangent direction
        const ny_raw = gy / glen;
        // The nearer we are to the surface edge, the more the normal tilts
        // surface tilt factor: high near threshold, 0 at center
        const tilt = Math.min(1, THRESH / sum); // 1 at edge, 0 at center
        const nx = nx_raw * tilt;
        const ny = ny_raw * tilt;
        const nz = Math.sqrt(Math.max(0, 1 - nx*nx - ny*ny));

        // ---- Phong Lighting ----
        const diff = Math.max(0, nx*LX + ny*LY + nz*LZ);
        // Blinn-Phong specular
        const ndotH = Math.max(0, nx*(HX/HLEN) + ny*(HY/HLEN) + nz*(HZ/HLEN));
        const spec  = Math.pow(ndotH, 48);

        // ---- Edge darkness (black rim like real mercury) ----
        // edge_t: 0 at threshold boundary, rises quickly inward
        const edge_t = Math.min(1, (sum - THRESH) * 5);
        // Fresnel-like: edges are very dark (1 - edge_t is high at rim)
        const rim  = edge_t * edge_t;  // sharply dark at very edge

        // ---- Silver base color with lighting ----
        // ambient 0.12, diffuse 0.55, specular 1.0 white
        const ambR = 145 * 0.12, ambG = 158 * 0.12, ambB = 172 * 0.12;
        const R = Math.min(255, Math.round((ambR + 145 * 0.55 * diff + 255 * spec) * rim));
        const G = Math.min(255, Math.round((ambG + 158 * 0.55 * diff + 255 * spec) * rim));
        const B = Math.min(255, Math.round((ambB + 172 * 0.55 * diff + 255 * spec) * rim));
        const A  = Math.round(Math.min(1, edge_t * 3) * 235);

        const idx = (py * SW + qx) * 4;
        px[idx]   = R;  px[idx+1] = G;  px[idx+2] = B;  px[idx+3] = A;

        // Inversion mask: pure white in mercury shape
        ipx[idx]   = 255; ipx[idx+1] = 255; ipx[idx+2] = 255;
        ipx[idx+3] = Math.round(rim * 200);
      }
    }

    ctx.putImageData(imgD, 0, 0);
    invCtx.putImageData(invD, 0, 0);
    blobs.forEach(b => b.update());
    requestAnimationFrame(render);
  }

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

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
