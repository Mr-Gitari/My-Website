/* Intro animation bookkeeping and scroll-driven device mock-ups.
   Remove this script and css/revamp3d5.css to switch both off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // remember that the intro has been seen
  try { localStorage.setItem("intro-seen", "1"); } catch (e) { /* storage blocked */ }
  const intro = document.querySelector(".intro");
  if (intro) setTimeout(() => intro.remove(), 1800);

  // device mock-ups
  const devices = [];
  document.querySelectorAll("#projects article.project").forEach((art) => {
    const shots = art.querySelectorAll(".shots .shot img");
    const host = art.querySelector(".p-art");
    if (!shots.length || !host) return;
    const src = (shots[1] || shots[0]).getAttribute("src");
    const d = document.createElement("div");
    d.className = "device";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<div class="device-frame"><img alt="" loading="lazy" draggable="false"></div>';
    d.querySelector("img").src = src;
    host.appendChild(d);
    devices.push({ art, d });
  });
  if (!devices.length || reduce) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    devices.forEach(({ art, d }) => {
      const r = art.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const t = Math.max(-1, Math.min(1, ((r.top + r.height * 0.2) - vh / 2) / (vh / 2)));
      d.style.setProperty("--ry", `${(-18 - t * 22).toFixed(1)}deg`);
      d.style.setProperty("--rx", `${(4 + t * 8).toFixed(1)}deg`);
      d.style.setProperty("--ty", `${(t * -16).toFixed(1)}px`);
    });
  };
  const on = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on);
  update();
})();
