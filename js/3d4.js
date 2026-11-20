/* (Pointer hook, now unused) toward the pointer. Remove this script and
   css/revamp3d4.css to switch off. */
(() => {
  "use strict";
  const cube = document.getElementById("cube");
  const prof = document.getElementById("profile");
  if (!cube || !prof || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  prof.addEventListener("pointermove", (e) => {
    const r = cube.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / 200;
    const dy = (e.clientY - (r.top + r.height / 2)) / 200;
    cube.style.setProperty("--ry", `${35 + Math.max(-1, Math.min(1, dx)) * 40}deg`);
    cube.style.setProperty("--rx", `${-24 - Math.max(-1, Math.min(1, dy)) * 30}deg`);
  });
})();
