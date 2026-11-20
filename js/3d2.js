/* 3D project carousel (coverflow) and tilting screenshot viewer.
   Plain JavaScript, no libraries. Remove this script tag and
   css/revamp3d2.css to switch it off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Project carousel ---------- */
  const sec = document.getElementById("projects");
  const list = sec && sec.querySelector(".projects");
  const articles = list ? [...list.querySelectorAll("article.project")] : [];
  if (articles.length > 1) {
    const flow = document.createElement("div");
    flow.className = "cflow sr";
    flow.tabIndex = 0;
    flow.setAttribute("role", "region");
    flow.setAttribute("aria-roledescription", "carousel");
    flow.setAttribute("aria-label", "Project spotlight. Use the left and right arrow keys.");

    const stage = document.createElement("div");
    stage.className = "cflow-stage";

    const cards = articles.map((a, i) => {
      const img = a.querySelector(".p-art img");
      const cs = getComputedStyle(a);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cflow-card";
      b.style.setProperty("--g1", cs.getPropertyValue("--g1").trim() || "#334155");
      b.style.setProperty("--g2", cs.getPropertyValue("--g2").trim() || "#0f172a");
      const art = document.createElement("span");
      art.className = "cf-art";
      if (img) {
        const im = document.createElement("img");
        im.src = img.getAttribute("src");
        im.alt = "";
        im.loading = "lazy";
        im.draggable = false;
        art.appendChild(im);
      } else {
        art.classList.add("cf-gradient");
      }
      const label = document.createElement("span");
      label.className = "cf-label";
      label.textContent = a.querySelector("h3").textContent;
      b.append(art, label);
      b.setAttribute("aria-label", `${label.textContent}, project ${i + 1} of ${articles.length}`);
      stage.appendChild(b);
      return b;
    });

    const info = document.createElement("div");
    info.className = "cflow-info";
    info.setAttribute("aria-live", "polite");
    const infoMeta = document.createElement("p");
    const infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.className = "btn btn-primary btn-sm";
    infoBtn.textContent = "View project";
    info.append(infoMeta, infoBtn);

    const nav = document.createElement("div");
    nav.className = "cflow-nav";
    const prev = document.createElement("button");
    prev.type = "button"; prev.className = "cf-arrow"; prev.setAttribute("aria-label", "Previous project"); prev.innerHTML = "&#8592;";
    const next = document.createElement("button");
    next.type = "button"; next.className = "cf-arrow"; next.setAttribute("aria-label", "Next project"); next.innerHTML = "&#8594;";
    const dots = document.createElement("div");
    dots.className = "cf-dots";
    const dotEls = articles.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button"; d.setAttribute("aria-label", `Go to project ${i + 1}`);
      d.addEventListener("click", () => go(i));
      dots.appendChild(d);
      return d;
    });
    nav.append(prev, dots, next);

    flow.append(stage, info, nav);
    const head = sec.querySelector(".sec-head");
    (head ? head : sec).insertAdjacentElement(head ? "afterend" : "afterbegin", flow);

    let cur = 0;
    const layout = () => {
      const w = stage.clientWidth;
      const cardW = Math.min(w * 0.64, 340);
      stage.style.setProperty("--cw", cardW + "px");
      stage.style.height = Math.round(cardW * 0.7 + 30) + "px";
      cards.forEach((c, i) => {
        const off = i - cur, a = Math.abs(off);
        const x = off * cardW * (w < 520 ? 0.5 : 0.62);
        c.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${-a * 150}px) rotateY(${-off * 38}deg) scale(${off === 0 ? 1 : 0.9})`;
        c.style.opacity = a > 2 ? 0 : (1 - a * 0.28).toFixed(2);
        c.style.zIndex = 10 - a;
        c.style.pointerEvents = a > 2 ? "none" : "auto";
        c.classList.toggle("is-front", off === 0);
        c.tabIndex = off === 0 ? 0 : -1;
        c.setAttribute("aria-current", off === 0 ? "true" : "false");
        dotEls[i].classList.toggle("on", off === 0);
      });
      const art = articles[cur];
      infoMeta.textContent = art.querySelector(".p-meta").textContent.trim();
      prev.disabled = cur === 0;
      next.disabled = cur === articles.length - 1;
    };
    const go = (i) => { cur = Math.max(0, Math.min(articles.length - 1, i)); layout(); };
    const open = () => {
      const a = articles[cur];
      a.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      a.classList.remove("flash"); void a.offsetWidth; a.classList.add("flash");
    };

    cards.forEach((c, i) => c.addEventListener("click", () => { if (suppress) return; i === cur ? open() : go(i); }));
    infoBtn.addEventListener("click", open);
    prev.addEventListener("click", () => go(cur - 1));
    next.addEventListener("click", () => go(cur + 1));
    flow.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { go(cur - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { go(cur + 1); e.preventDefault(); }
    });

    // swipe / drag
    let sx = 0, dragging = false, moved = false, suppress = false;
    stage.addEventListener("pointerdown", (e) => { dragging = true; moved = false; sx = e.clientX; });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); sx = e.clientX; moved = true; }
    });
    const stop = () => {
      dragging = false;
      if (moved) { suppress = true; setTimeout(() => { suppress = false; }, 80); }
    };
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
    stage.addEventListener("pointerleave", () => { dragging = false; });
    window.addEventListener("resize", layout);
    layout();
    // layout again once fonts and images settle
    window.addEventListener("load", layout);
  }

  /* ---------- Tilting screenshot viewer ---------- */
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  if (lb && img && !reduce) {
    const MAX = 9;
    const move = (e) => {
      const r = img.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      const cx = Math.max(-1, Math.min(1, nx)), cy = Math.max(-1, Math.min(1, ny));
      img.style.transform = `perspective(900px) rotateY(${cx * MAX}deg) rotateX(${-cy * MAX}deg) scale(1.01)`;
      img.style.boxShadow = `${-cx * 26}px ${-cy * 26 + 30}px 70px rgba(0,0,0,.6)`;
    };
    const reset = () => { img.style.transform = ""; img.style.boxShadow = ""; };
    lb.addEventListener("pointermove", move);
    lb.addEventListener("pointerleave", reset);
    lb.addEventListener("close", reset);
    img.addEventListener("load", reset);
  }
})();
