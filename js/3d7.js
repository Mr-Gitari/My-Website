/* Credential deck, lightbox ring gallery and hero depth layers.
   Remove this script and css/revamp3d7.css to switch all three off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 4. Credential deck ---------- */
  const journey = document.getElementById("journey");
  const filters = journey && journey.querySelector(".t-filters");
  const src = journey ? [...journey.querySelectorAll(".t-item")].slice(0, 4) : [];
  if (filters && src.length) {
    const data = src.map((li) => {
      const text = li.querySelector("p").textContent.trim();
      return {
        date: li.querySelector(".t-date").textContent.trim(),
        title: li.querySelector("h3").textContent.trim(),
        text: text.split(". ")[0].replace(/\.$/, "") + ".",
        tag: li.dataset.type === "award" ? "Award" : "Certification",
      };
    });
    const wrap = document.createElement("div");
    wrap.className = "deck-wrap";
    wrap.innerHTML = '<p class="deck-label">Credentials <span>tap or swipe the top card</span></p>';
    const deck = document.createElement("div");
    deck.className = "deck";
    deck.setAttribute("role", "group");
    deck.setAttribute("aria-label", "Credentials deck");
    const cards = data.map((d) => {
      const c = document.createElement("div");
      c.className = "dcard";
      c.innerHTML = `<div><span class="d-date"></span><h4></h4></div><p></p><span class="d-tag"></span>`;
      c.querySelector(".d-date").textContent = d.date;
      c.querySelector("h4").textContent = d.title;
      c.querySelector("p").textContent = d.text;
      c.querySelector(".d-tag").textContent = d.tag;
      deck.appendChild(c);
      return c;
    });
    const ctl = document.createElement("div");
    ctl.className = "deck-ctl";
    const nextBtn = document.createElement("button");
    nextBtn.type = "button"; nextBtn.textContent = "Next card";
    const count = document.createElement("span");
    ctl.append(nextBtn, count);
    deck.appendChild(ctl);
    wrap.appendChild(deck);
    filters.insertAdjacentElement("beforebegin", wrap);

    let order = cards.map((_, i) => i);
    const layout = () => {
      order.forEach((ci, k) => {
        const c = cards[ci];
        c.classList.toggle("top", k === 0);
        c.style.zIndex = 10 - k;
        c.style.opacity = k > 3 ? 0 : (1 - k * 0.2).toFixed(2);
        c.style.transform = `translate3d(0, ${k * 13}px, ${-k * 46}px) scale(${(1 - k * 0.05).toFixed(2)})`;
        c.setAttribute("aria-hidden", k === 0 ? "false" : "true");
      });
      count.textContent = `${order[0] + 1} / ${cards.length}`;
    };
    const sendBack = (dir) => {
      const c = cards[order[0]];
      c.style.transition = "transform 0.4s ease, opacity 0.4s ease";
      c.style.transform = `translate3d(${dir * 130}%, -10px, 0) rotate(${dir * 14}deg)`;
      c.style.opacity = 0;
      setTimeout(() => {
        c.style.transition = "none";
        order.push(order.shift());
        layout();
        void c.offsetWidth;
        c.style.transition = "";
      }, reduce ? 0 : 380);
    };
    nextBtn.addEventListener("click", () => sendBack(1));
    deck.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { sendBack(e.key === "ArrowRight" ? 1 : -1); e.preventDefault(); } });
    deck.tabIndex = 0;

    let sx = 0, dx = 0, dragging = false, moved = false;
    deck.addEventListener("pointerdown", (e) => {
      const top = cards[order[0]];
      if (!top.contains(e.target)) return;
      dragging = true; moved = false; sx = e.clientX; dx = 0;
      top.classList.add("drag");
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dx = e.clientX - sx;
      if (Math.abs(dx) > 5) moved = true;
      cards[order[0]].style.transform = `translate3d(${dx}px, 0, 0) rotate(${dx / 14}deg)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      const top = cards[order[0]];
      top.classList.remove("drag");
      if (Math.abs(dx) > 70) sendBack(dx > 0 ? 1 : -1);
      else if (!moved) sendBack(1);
      else layout();
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    layout();
  }

  /* ---------- 5. Lightbox ring gallery ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const fig = lb && lb.querySelector("figure");
  if (lb && lbImg && fig) {
    const ring = document.createElement("div");
    ring.className = "lb-ring";
    const rin = document.createElement("div");
    rin.className = "lb-ring-in";
    ring.appendChild(rin);
    fig.appendChild(ring);

    let group = [], thumbs = [], cur = 0, spin = 0, drag = false, moved = 0, lx = 0;
    const prevBtn = document.getElementById("lb-prev");
    const nextBtn = document.getElementById("lb-next");

    const stepFor = () => 360 / Math.max(group.length, 1);
    const radius = () => Math.max(110, group.length * 34);
    const place = () => {
      const st = stepFor();
      thumbs.forEach((t, i) => { t.style.transform = `rotateY(${i * st}deg) translateZ(${radius()}px)`; });
      rin.style.transform = `translateZ(${-radius()}px) rotateY(${spin}deg)`;
      thumbs.forEach((t, i) => t.classList.toggle("current", i === cur));
    };
    const currentIndex = () => {
      const s = lbImg.getAttribute("src");
      return group.findIndex((b) => { const im = b.querySelector("img"); return (im.currentSrc || im.src) === lbImg.src || im.getAttribute("src") === s; });
    };
    const focusOn = (i) => {
      cur = i;
      // shortest way round the ring
      const st = stepFor();
      let target = -i * st;
      while (target - spin > 180) target -= 360;
      while (target - spin < -180) target += 360;
      spin = target;
      place();
    };
    const build = (btn) => {
      const strip = btn.closest(".shots");
      group = strip ? [...strip.querySelectorAll(".shot")] : [btn];
      rin.textContent = "";
      thumbs = group.map((b, i) => {
        const t = document.createElement("button");
        t.type = "button"; t.className = "lb-thumb";
        t.setAttribute("aria-label", `Show screenshot ${i + 1} of ${group.length}`);
        const im = document.createElement("img");
        im.src = b.querySelector("img").getAttribute("src"); im.alt = ""; im.draggable = false;
        t.appendChild(im);
        t.addEventListener("click", () => {
          if (moved > 6) return;
          // the viewer steps through shots in page order; each project's shots are side by side
          const ci = currentIndex();
          if (ci < 0 || ci === i) return;
          const btn = i > ci ? nextBtn : prevBtn;
          for (let n = 0; n < Math.abs(i - ci); n++) btn.click();
        });
        rin.appendChild(t);
        return t;
      });
      ring.style.display = group.length > 1 ? "" : "none";
      spin = 0;
      const i = group.indexOf(btn);
      cur = i < 0 ? 0 : i;
      spin = -cur * stepFor();
      place();
    };
    document.querySelectorAll(".shot").forEach((btn) => btn.addEventListener("click", () => build(btn)));
    // keep the ring in step when the arrows or keys change the picture
    new MutationObserver(() => { const i = currentIndex(); if (i >= 0 && thumbs.length) focusOn(i); })
      .observe(lbImg, { attributes: true, attributeFilter: ["src"] });

    // drag to spin the ring and pick the nearest thumbnail
    ring.addEventListener("pointerdown", (e) => { drag = true; moved = 0; lx = e.clientX; ring.classList.add("dragging"); });
    window.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx);
      spin += dx * 0.5; rin.style.transform = `translateZ(${-radius()}px) rotateY(${spin}deg)`;
    });
    const up = () => {
      if (!drag) return;
      drag = false; ring.classList.remove("dragging");
      if (moved > 6 && group.length) {
        const st = stepFor();
        const idx = ((Math.round(-spin / st) % group.length) + group.length) % group.length;
        spin = Math.round(spin / st) * st;
        place();
        setTimeout(() => { thumbs[idx].click(); }, 0);
        moved = 0;
      }
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  /* ---------- 6. Hero depth layers ---------- */
  const prof = document.getElementById("profile");
  if (prof && !reduce) {
    let raf = 0, nx = 0, ny = 0;
    const set = (x, y) => {
      nx = x; ny = y;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        prof.style.setProperty("--px", nx.toFixed(3));
        prof.style.setProperty("--py", ny.toFixed(3));
      });
    };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    }, { passive: true });
    if ("DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null || e.beta == null) return;
        set(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
      }, { passive: true });
    }
  }
})();
