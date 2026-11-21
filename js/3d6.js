/* Contact cube, flip business card and particle field.
   Remove this script and css/revamp3d6.css to switch all three off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Contact cube ---------- */
  const cube = document.getElementById("ccube");
  const cin = document.getElementById("ccube-in");
  if (cube && cin) {
    const faces = [...cin.querySelectorAll(".cf")];
    let rx = -12, ry = -18, drag = false, moved = 0, lx = 0, ly = 0, active = 0;

    const apply = () => { cin.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    const setActive = (i) => {
      active = i;
      faces.forEach((f, k) => {
        f.classList.toggle("on", k === i);
        f.tabIndex = k === i ? 0 : -1;
        f.setAttribute("aria-hidden", k === i ? "false" : "true");
      });
    };
    const snap = () => {
      let k;
      if (rx <= -45) { rx = -90; ry = Math.round(ry / 360) * 360; k = 4; }
      else if (rx >= 45) { rx = 90; ry = Math.round(ry / 360) * 360; k = 5; }
      else { rx = 0; ry = Math.round(ry / 90) * 90; k = (((-ry / 90) % 4) + 4) % 4; }
      setActive(k);
      apply();
    };
    // face 4 (GitHub) is on top: rotateX(-90) shows it; face 5 (CV) on the bottom: rotateX(90)
    cube.addEventListener("pointerdown", (e) => {
      drag = true; moved = 0; lx = e.clientX; ly = e.clientY;
      cube.classList.add("grabbing");
    });
    window.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      ry += dx * 0.7;
      rx = Math.max(-100, Math.min(100, rx - dy * 0.7));
      apply();
    });
    const up = () => {
      if (!drag) return;
      drag = false;
      cube.classList.remove("grabbing");
      if (moved > 6) { snap(); suppress = true; setTimeout(() => { suppress = false; }, 60); }
      else if (rx === -12 && ry === -18) { /* untouched */ }
    };
    let suppress = false;
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    cube.addEventListener("click", (e) => { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    cube.addEventListener("keydown", (e) => {
      const turn = { ArrowRight: [0, -90], ArrowLeft: [0, 90], ArrowUp: [-90, 0], ArrowDown: [90, 0] }[e.key];
      if (!turn) return;
      e.preventDefault();
      if (turn[0]) { rx = rx === 0 ? turn[0] : 0; } else { rx = 0; ry += turn[1]; }
      snap();
    });
    // first view is a slight angle; settle on the front face when first scrolled to
    new IntersectionObserver(([en], ob) => {
      if (en.isIntersecting) { rx = 0; ry = 0; snap(); ob.disconnect(); }
    }, { threshold: 0.6 }).observe(cube);
    setActive(0);
  }

  /* ---------- 2. Flip business card ---------- */
  const prof = document.getElementById("profile");
  if (prof) {
    const front = document.createElement("div");
    front.className = "pf-front";
    while (prof.firstChild) front.appendChild(prof.firstChild);

    const back = document.createElement("div");
    back.className = "pf-back";
    back.innerHTML = `
      <button class="pf-flip" type="button" data-flip aria-label="Flip the card back to the front">&#8634; Front</button>
      <h2>Raphael Gitari Muchiri</h2>
      <p>Software engineer from Nairobi. I build clean, responsive web apps with React, Node.js and Tailwind CSS, and I like turning complex ideas into simple interfaces.</p>
      <p class="pf-kicker">Top skills</p>
      <ul class="chips"><li>React</li><li>Node.js</li><li>Tailwind CSS</li><li>JavaScript</li><li>Express</li><li>MongoDB</li></ul>
      <p class="pf-kicker">Reach me</p>
      <div class="pf-lines">
        <a href="tel:+254794040986">+254 794 040 986</a>
        <a href="mailto:raphaelmuchiri79@gmail.com">raphaelmuchiri79@gmail.com</a>
        <span>Nairobi, Kenya</span>
      </div>
      <div class="pf-actions">
        <a class="btn btn-primary" href="contact.vcf" download>Save to Contacts</a>
      </div>`;

    const flipBtn = document.createElement("button");
    flipBtn.className = "pf-flip";
    flipBtn.type = "button";
    flipBtn.setAttribute("aria-label", "Flip the card to see the back");
    flipBtn.innerHTML = "&#8635; Flip";
    front.appendChild(flipBtn);

    const wrap = document.createElement("div");
    wrap.className = "pf-faces";
    wrap.append(front, back);
    prof.appendChild(wrap);
    prof.classList.add("is-flip");
    back.setAttribute("inert", "");

    const setFlip = (on) => {
      wrap.classList.toggle("flipped", on);
      if (on) { front.setAttribute("inert", ""); back.removeAttribute("inert"); }
      else { back.setAttribute("inert", ""); front.removeAttribute("inert"); }
    };
    flipBtn.addEventListener("click", () => setFlip(true));
    back.querySelector("[data-flip]").addEventListener("click", () => setFlip(false));

    // swipe sideways to flip (touch and mouse)
    let sx = 0, sy = 0, tracking = false;
    prof.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button, .avatar")) return;
      tracking = true; sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) setFlip(!wrap.classList.contains("flipped"));
    });
  }

  /* ---------- 3. Particle field ---------- */
  const cv = document.getElementById("field");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d");
    const small = window.innerWidth < 700;
    const N = small ? 38 : 70;
    const pts = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
    }));
    let w = 0, h = 0, dpr = 1, tx = 0, ty = 0, cx = 0, cy = 0, running = true;
    let color = "198,244,50", boost = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const readColor = () => {
      const c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const m = /^#?([0-9a-f]{6})$/i.exec(c);
      if (m) { const n = parseInt(m[1], 16); color = `${n >> 16},${(n >> 8) & 255},${n & 255}`; }
      boost = document.documentElement.getAttribute("data-theme") === "light" ? 4 : 1;
    };
    const aim = (x, y) => { tx = (x / w - 0.5) * 2; ty = (y / h - 0.5) * 2; };
    window.addEventListener("pointermove", (e) => aim(e.clientX, e.clientY), { passive: true });
    if ("DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null) return;
        tx = Math.max(-1, Math.min(1, e.gamma / 30));
        ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }, { passive: true });
    }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    new MutationObserver(readColor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const proj = new Array(N);
    function frame() {
      if (!running) return;
      cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const ay = cx * 0.5, ax = -cy * 0.35;
      const cyr = Math.cos(ay), syr = Math.sin(ay), cxr = Math.cos(ax), sxr = Math.sin(ax);
      const scale = Math.min(w, h) * 0.75;
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x > 1.1 || p.x < -1.1) p.vx *= -1;
        if (p.y > 1.1 || p.y < -1.1) p.vy *= -1;
        const x1 = p.x * cyr + p.z * syr, z1 = -p.x * syr + p.z * cyr;
        const y2 = p.y * cxr - z1 * sxr, z2 = p.y * sxr + z1 * cxr;
        const f = 1.6 / (2.6 - z2);
        proj[i] = { x: w / 2 + x1 * scale * f, y: h / 2 + y2 * scale * f * 0.9, f };
      }
      for (let i = 0; i < N; i++) {
        const a = proj[i];
        for (let j = i + 1; j < N; j++) {
          const b = proj[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.strokeStyle = `rgba(${color},${Math.min(0.5, (1 - d / 12000) * 0.12 * boost).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < N; i++) {
        const a = proj[i];
        ctx.fillStyle = `rgba(${color},${Math.min(0.85, (0.12 + a.f * 0.22) * boost).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, 1 + a.f * 1.3, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize(); readColor(); requestAnimationFrame(frame);
  }
})();
