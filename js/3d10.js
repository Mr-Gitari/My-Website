/* Case-study panels. Built from each project card's own content; optional
   data-problem / data-role / data-outcome attributes add story sections.
   Remove this script tag and css/revamp3d10.css to switch it off. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const articles = $$("article.project");
  if (!articles.length || !HTMLDialogElement) return;

  const dlg = document.createElement("dialog");
  dlg.className = "cs"; dlg.setAttribute("aria-label", "Project case study");
  document.body.appendChild(dlg);
  let idx = 0;

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

  const render = () => {
    const a = articles[idx];
    dlg.textContent = "";
    const top = el("div", "cs-top");
    const count = el("span", "cs-count", `${idx + 1} / ${articles.length}`);
    const nav = el("div", "cs-nav");
    const mk = (label, aria, fn) => { const b = el("button", "cs-btn", label); b.type = "button"; b.setAttribute("aria-label", aria); b.addEventListener("click", fn); return b; };
    nav.append(
      mk("←", "Previous project", () => { idx = (idx - 1 + articles.length) % articles.length; render(); dlg.scrollTop = 0; }),
      mk("→", "Next project", () => { idx = (idx + 1) % articles.length; render(); dlg.scrollTop = 0; }),
      mk("✕", "Close", () => dlg.close())
    );
    top.append(count, nav);

    const meta = $(".p-meta", a)?.textContent.trim();
    const title = $("h3", a)?.textContent.trim();
    const badge = $(".badge", a);
    const head = el("header", "cs-head");
    if (meta) head.append(el("p", "cs-meta", meta));
    head.append(el("h2", "cs-title", title));
    if (badge) head.append(el("span", "cs-badge", badge.textContent.trim()));

    const body = el("div", "cs-body");
    const desc = $(".p-desc", a); if (desc) body.append(el("p", "cs-desc", desc.textContent.trim()));

    const story = [["problem", "The problem"], ["role", "My role"], ["outcome", "Outcome"]];
    story.forEach(([k, label]) => {
      const v = a.dataset[k]; if (!v) return;
      const s = el("section", "cs-sec"); s.append(el("h3", "", label), el("p", "", v)); body.append(s);
    });

    const lis = $$("details li", a);
    if (lis.length) {
      const s = el("section", "cs-sec"); s.append(el("h3", "", "Highlights"));
      const ul = el("ul"); lis.forEach(li => ul.append(el("li", "", li.textContent.trim()))); s.append(ul); body.append(s);
    }
    const tags = $$(".tags li", a);
    if (tags.length) {
      const s = el("section", "cs-sec"); s.append(el("h3", "", "Built with"));
      const ul = el("ul", "cs-tags"); tags.forEach(t => ul.append(el("li", "", t.textContent.trim()))); s.append(ul); body.append(s);
    }
    const shots = $$(".shots .shot", a);
    const hero = $(".p-art img", a);
    const imgs = [];
    if (hero && !shots.length) imgs.push([hero.currentSrc || hero.src, hero.alt, ""]);
    shots.forEach(b => { const i = $("img", b); if (i) imgs.push([i.currentSrc || i.src, i.alt, b.dataset.caption || ""]); });
    if (imgs.length) {
      const s = el("section", "cs-sec"); s.append(el("h3", "", "Screens"));
      const grid = el("div", "cs-grid");
      imgs.forEach(([src, alt, cap]) => {
        const f = el("figure"); const im = el("img"); im.src = src; im.alt = alt; im.loading = "lazy";
        f.append(im); if (cap) f.append(el("figcaption", "", cap)); grid.append(f);
      });
      s.append(grid); body.append(s);
    }
    const links = $$(".p-links a", a);
    if (links.length) {
      const row = el("div", "cs-links");
      links.forEach(l => { const c = el("a", "btn btn-primary btn-sm", l.textContent.trim()); c.href = l.href; c.target = "_blank"; c.rel = "noopener noreferrer"; row.append(c); });
      body.append(row);
    }
    dlg.append(top, head, body);
  };

  const open = i => { idx = i; render(); dlg.showModal(); dlg.scrollTop = 0; };
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

  articles.forEach((a, i) => {
    let row = $(".p-links", a);
    if (!row) { row = el("div", "p-links"); ($(".p-body", a) || a).append(row); }
    const b = el("button", "btn btn-ghost btn-sm cs-open", "Case study");
    b.type = "button"; b.addEventListener("click", () => open(i));
    row.prepend(b);
  });
})();
