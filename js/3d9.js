/* Skill-to-project links, Nairobi clock, heading decode, journey depth.
   Remove this script tag and css/revamp3d9.css to switch it off. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nairobi clock ---- */
  const loc = $("#profile .loc");
  if (loc) {
    const p = document.createElement("p");
    p.className = "clock";
    p.setAttribute("aria-live", "off");
    loc.after(p);
    const tick = () => {
      let h = 12, txt = "";
      try {
        const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
        const hh = parts.find(x => x.type === "hour").value, mm = parts.find(x => x.type === "minute").value;
        h = +hh % 24; txt = `${hh}:${mm}`;
      } catch (e) { return; }
      const vh = new Date().getHours();
      const greet = vh < 5 ? "Hello, night owl" : vh < 12 ? "Good morning" : vh < 17 ? "Good afternoon" : "Good evening";
      const on = h >= 8 && h < 21;
      p.className = "clock " + (on ? "on" : "off");
      p.innerHTML = "";
      const i = document.createElement("i"); i.setAttribute("aria-hidden", "true");
      const sp = document.createElement("span");
      sp.textContent = `${greet} · Nairobi ${txt} · ${on ? "online" : "offline"}`;
      p.append(i, sp);
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---- Skill -> projects ---- */
  const sphere = $("#sphere");
  const articles = $$("article.project");
  if (sphere && articles.length) {
    const norm = t => t.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alias = { restapis: "restapi", nodejs: "node", tailwindcss: "tailwind" };
    const key = t => { const n = norm(t); return alias[n] || n; };
    const stack = articles.map(a => new Set($$(".tags li", a).map(li => key(li.textContent))));
    const names = articles.map(a => ($("h3", a) || {}).textContent?.trim() || "");
    const bar = document.createElement("div");
    bar.className = "skill-bar"; bar.hidden = true; bar.setAttribute("role", "status");
    sphere.after(bar);
    let picked = null;
    const flow = () => $$(".cflow-card");
    const clear = () => {
      picked = null; bar.hidden = true; bar.textContent = "";
      $$(".sphere-word.picked").forEach(w => w.classList.remove("picked"));
      articles.forEach(a => a.classList.remove("skill-hit", "skill-dim"));
      flow().forEach(c => c.classList.remove("skill-hit", "skill-dim"));
    };
    const pick = word => {
      const label = word.textContent.trim();
      if (picked === word) return clear();
      clear(); picked = word; word.classList.add("picked");
      const k = key(label);
      const hits = stack.map(s => s.has(k));
      articles.forEach((a, i) => { a.classList.add(hits[i] ? "skill-hit" : "skill-dim"); });
      flow().forEach((c, i) => c.classList.add(hits[i] ? "skill-hit" : "skill-dim"));
      bar.hidden = false; bar.textContent = "";
      const any = hits.some(Boolean);
      const t = document.createElement("span");
      t.textContent = any ? `${label} is used in: ` : `${label}: no featured project lists it yet, but it's part of my toolkit.`;
      bar.appendChild(t);
      hits.forEach((h, i) => {
        if (!h) return;
        const b = document.createElement("button");
        b.type = "button"; b.textContent = names[i];
        b.addEventListener("click", () => {
          articles[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
          articles[i].classList.add("flash"); setTimeout(() => articles[i].classList.remove("flash"), 1600);
        });
        bar.appendChild(b);
      });
      const x = document.createElement("button");
      x.type = "button"; x.className = "skill-x"; x.textContent = "Clear"; x.addEventListener("click", clear);
      bar.appendChild(x);
    };
    let down = null;
    sphere.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY }; });
    sphere.addEventListener("pointerup", e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 6) return;
      let best = null, bz = -1;
      $$(".sphere-word", sphere).forEach(w => {
        const r = w.getBoundingClientRect();
        const z = +w.style.zIndex || 0;
        if (e.clientX >= r.left - 4 && e.clientX <= r.right + 4 && e.clientY >= r.top - 4 && e.clientY <= r.bottom + 4 && z >= bz) { best = w; bz = z; }
      });
      if (best) pick(best);
    });
    const hint = $(".sphere-hint", sphere);
    if (hint) hint.textContent = "drag · tap a skill";
  }

  /* ---- Heading decode ---- */
  if (!reduce && "IntersectionObserver" in window) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789<>/_{}";
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const h = en.target, txt = h.textContent;
      h.setAttribute("aria-label", txt);
      h.style.minWidth = h.getBoundingClientRect().width + "px";
      let f = 0; const total = 16;
      const id = setInterval(() => {
        f++;
        const keep = Math.floor(txt.length * f / total);
        h.textContent = txt.split("").map((c, i) => (i < keep || c === " " || c === "&") ? c : chars[Math.floor(Math.random() * chars.length)]).join("");
        if (f >= total) { clearInterval(id); h.textContent = txt; h.style.minWidth = ""; }
      }, 35);
    }), { threshold: 0.6 });
    $$("#about h2, #skills h2, #journey h2, #contact h2, #projects-title").forEach(h => { if (!h.childElementCount) io.observe(h); });
  }

  /* ---- Journey depth: milestones swing in as the line reaches them ---- */
  const tl = $("#journey .timeline");
  if (tl && !reduce) tl.classList.add("depth");
})();
