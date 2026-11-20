/* Interactive journey: filters, expandable cards, scroll-lit timeline,
   tilt on hover. Remove this script and css/revamp3d3.css to switch off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sec = document.getElementById("journey");
  const tl = sec && sec.querySelector(".timeline");
  if (!tl) return;
  const items = [...tl.querySelectorAll(".t-item")];

  // expand / collapse (one open at a time)
  items.forEach((li) => {
    const btn = li.querySelector(".t-toggle");
    btn.addEventListener("click", () => {
      const open = !li.classList.contains("open");
      items.forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".t-toggle").setAttribute("aria-expanded", "false");
      });
      if (open) {
        li.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // filters
  const filters = sec.querySelectorAll(".t-filters button");
  filters.forEach((f) => f.addEventListener("click", () => {
    filters.forEach((x) => { x.classList.toggle("on", x === f); x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
    const kind = f.dataset.f;
    items.forEach((li) => {
      li.classList.toggle("hide", kind !== "all" && li.dataset.type !== kind);
      li.classList.remove("open");
      li.querySelector(".t-toggle").setAttribute("aria-expanded", "false");
    });
    update();
  }));

  // jump to a project
  sec.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => {
    const name = b.dataset.goto.toLowerCase();
    const art = [...document.querySelectorAll("#projects article.project")]
      .find((a) => a.querySelector("h3").textContent.toLowerCase().includes(name));
    if (!art) return;
    art.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    art.classList.remove("flash"); void art.offsetWidth; art.classList.add("flash");
  }));

  // scroll-lit line and dots
  let ticking = false;
  function update() {
    ticking = false;
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight, mark = vh * 0.6;
    const p = Math.max(0, Math.min(1, (mark - r.top) / Math.max(1, r.height)));
    tl.style.setProperty("--prog", p.toFixed(3));
    items.forEach((li) => {
      if (li.classList.contains("hide")) return;
      li.classList.toggle("reached", li.getBoundingClientRect().top < mark);
    });
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // hover tilt (mouse only)
  if (!reduce) {
    items.forEach((li) => {
      const t = li.querySelector(".t-toggle");
      t.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = t.getBoundingClientRect();
        t.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + "deg");
        t.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2) + "deg");
      });
      t.addEventListener("pointerleave", () => { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); });
    });
  }
})();
