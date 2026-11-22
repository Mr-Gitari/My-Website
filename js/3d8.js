(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* 1. magnetic cursor */
  if (mouse && !reduce) {
    const dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cur-dot"; ring.className = "cur-ring";
    document.body.append(dot, ring);
    let x = 0, y = 0, rx = 0, ry = 0, run = false;
    const loop = () => {
      rx += (x - rx) * 0.55; ry += (y - ry) * 0.55;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      if (Math.abs(x - rx) + Math.abs(y - ry) > 0.1) requestAnimationFrame(loop); else run = false;
    };
    const HOT = "a,button,.btn,[role=button],summary,label,select,input,textarea";
    const mags = new WeakSet();
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      document.documentElement.classList.add("cur-on");
      document.body.classList.add("cur-on");
      dot.style.transform = `translate(${x}px,${y}px)`;
      if (!run) { run = true; requestAnimationFrame(loop); }
      const t = e.target.closest && e.target.closest(HOT);
      document.body.classList.toggle("cur-hot", !!t);
      $$(".mag-on").forEach(m => { if (m !== t) { m.style.translate = ""; m.classList.remove("mag-on"); } });
      if (t && (t.classList.contains("btn") || t.classList.contains("icon-btn") || t.closest(".social,.dock"))) {
        const r = t.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) * 0.25, dy = (y - (r.top + r.height / 2)) * 0.25;
        t.classList.add("mag", "mag-on"); t.style.translate = `${dx}px ${dy}px`;
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("cur-on", "cur-hot"));
  }

  /* 2. spotlight + gentle tilt (only touches the card under the pointer) */
  let raf = 0, cur = null, lastE = null;
  const clear = el => { if (!el) return; el.classList.remove("lit"); if (el.classList.contains("tilting")) { el.classList.remove("tilting"); el.style.transform = ""; } };
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    lastE = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const el = lastE.target.closest ? lastE.target.closest(".card,.project") : null;
      if (el !== cur) { clear(cur); cur = el; }
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.classList.add("lit");
      el.style.setProperty("--sx", lastE.clientX - r.left + "px");
      el.style.setProperty("--sy", lastE.clientY - r.top + "px");
      if (!reduce && (el.id === "about" || el.classList.contains("project"))) {
        const px = (lastE.clientX - r.left) / r.width - 0.5, py = (lastE.clientY - r.top) / r.height - 0.5;
        el.classList.add("tilting");
        el.style.transform = `perspective(1100px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
      }
    });
  }, { passive: true });
  document.addEventListener("pointerleave", () => { clear(cur); cur = null; });

  /* 3. command palette */
  const dlg = document.createElement("dialog");
  dlg.className = "pal"; dlg.setAttribute("aria-label", "Quick actions");
  dlg.innerHTML = '<input type="text" placeholder="Quick actions: type to filter…" aria-label="Filter quick actions" autocomplete="off"><ul role="listbox"></ul>';
  document.body.appendChild(dlg);
  const input = $("input", dlg), list = $("ul", dlg);

  const toast = msg => {
    const t = document.createElement("div"); t.className = "pal-toast"; t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t); setTimeout(() => t.remove(), 1800);
  };
  const go = id => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
  const cmds = [];
  $$("article.project").forEach(a => {
    const h = $("h3", a); if (!h) return;
    cmds.push(["Open project: " + h.textContent.trim(), "Project", () => { a.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); a.classList.add("flash"); setTimeout(() => a.classList.remove("flash"), 1600); }]);
  });
  cmds.push(
    ["Toggle light / dark theme", "Action", () => $("#theme-toggle")?.click()],
    ["Copy email address", "Action", () => { navigator.clipboard?.writeText("raphaelmuchiri79@gmail.com").then(() => toast("Email copied"), () => toast("raphaelmuchiri79@gmail.com")); }],
    ["Open terminal", "Action", () => $("#terminal-btn")?.click()],
    ["Save to contacts", "Action", () => { const a = $('a[href$="contact.vcf"]'); a ? a.click() : location.href = "contact.vcf"; }],
    ["Download CV", "Action", () => { const a = $('a[href$=".pdf"]'); if (a) a.click(); }],
    ["Open LinkedIn", "Link", () => open("https://www.linkedin.com/in/mr-gitari", "_blank", "noopener")],
    ["Open GitHub", "Link", () => open("https://github.com/Mr-Gitari", "_blank", "noopener")],
    ["Call Raphael", "Link", () => { location.href = "tel:+254794040986"; }]
  );

  let shown = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = cmds.filter(c => !q || (c[0] + " " + c[1]).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    if (!shown.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = "No matches"; list.appendChild(li); return; }
    shown.forEach((c, i) => {
      const li = document.createElement("li"); li.setAttribute("role", "option");
      if (i === sel) { li.className = "sel"; li.setAttribute("aria-selected", "true"); }
      const s = document.createElement("span"); s.textContent = c[0];
      const m = document.createElement("small"); m.textContent = c[1];
      li.append(s, m);
      li.addEventListener("click", () => run(c));
      li.addEventListener("pointermove", () => { if (sel !== i) { sel = i; render(); } });
      list.appendChild(li);
    });
    $(".sel", list)?.scrollIntoView({ block: "nearest" });
  };
  const run = c => { dlg.close(); setTimeout(c[2], 60); };
  const open_ = () => { if (dlg.open) return; input.value = ""; sel = 0; dlg.showModal(); render(); input.focus(); };
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); run(shown[sel]); }
  });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : open_(); }
  });

  const dock = $("#dock");
  if (dock) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "dock-search"; b.setAttribute("aria-label", "Quick actions (Ctrl K)"); b.title = "Quick actions (Ctrl K)";
    b.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';
    b.addEventListener("click", open_);
    dock.appendChild(b);
  }
})();
