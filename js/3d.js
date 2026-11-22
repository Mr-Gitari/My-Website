/* 3D touches: tilting profile photo, skills sphere, flip stat tiles.
   Pure JavaScript and CSS, no libraries. Remove the <script> tag for this
   file in index.html (and revamp3d.css) to switch it off. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Tilting profile photo ---------- */
  const avatar = document.querySelector(".avatar");
  if (avatar && !reduce) {
    const MAX = 16;
    let raf = 0;
    const tilt = (nx, ny) => {            // nx, ny in -1..1
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        avatar.style.transform =
          `perspective(700px) rotateY(${nx * MAX}deg) rotateX(${-ny * MAX}deg) scale(1.03)`;
        avatar.style.setProperty("--gx", `${50 + nx * 40}%`);
        avatar.style.setProperty("--gy", `${50 + ny * 40}%`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      avatar.style.transform = "";
      avatar.style.setProperty("--gx", "50%");
      avatar.style.setProperty("--gy", "30%");
    };
    avatar.addEventListener("pointermove", (e) => {
      const r = avatar.getBoundingClientRect();
      tilt(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    avatar.addEventListener("pointerleave", reset);
    avatar.addEventListener("pointercancel", reset);
    avatar.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") reset(); });

    // Phones that expose motion without a permission prompt (most Android)
    const needsPermission = typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";
    if ("DeviceOrientationEvent" in window && !needsPermission) {
      let base = null;
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null || e.beta == null) return;
        if (!base) base = { g: e.gamma, b: e.beta };
        const nx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 25));
        const ny = Math.max(-1, Math.min(1, (e.beta - base.b) / 25));
        tilt(nx, ny);
      }, { passive: true });
    }
  }

  /* ---------- 3. Skills sphere ---------- */
  const sphere = document.getElementById("sphere");
  if (sphere) {
    const words = [...new Set([...document.querySelectorAll("#skills .chips li")]
      .map((li) => li.textContent.trim()))].slice(0, 18);
    const N = words.length;
    const pts = words.map((_, i) => {      // Fibonacci sphere
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(th) * r, y, z: Math.sin(th) * r };
    });
    const nodes = words.map((w) => {
      const s = document.createElement("span");
      s.className = "sphere-word";
      s.textContent = w;
      sphere.appendChild(s);
      return s;
    });

    let rotX = 0.3, rotY = 0, vx = 0, vy = reduce ? 0 : 0.004;
    let slow = false, dragging = false, lastX = 0, lastY = 0, visible = false, raf = 0;

    const draw = () => {
      const R = sphere.clientWidth * 0.4;
      const cx = Math.cos(rotX), sx = Math.sin(rotX), cy = Math.cos(rotY), sy = Math.sin(rotY);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2;         // 0 back .. 1 front
        nodes[i].style.transform =
          `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${(0.7 + depth * 0.5).toFixed(2)})`;
        nodes[i].style.opacity = (0.25 + depth * 0.75).toFixed(2);
        nodes[i].style.zIndex = Math.round(depth * 10);
      }
    };

    const tick = () => {
      if (!dragging) {
        rotY += vy; rotX += vx;
        vx *= 0.95;
        vy = reduce ? vy * 0.95 : vy + ((slow ? 0.0012 : 0.004) - vy) * 0.06;
      }
      draw();
      raf = visible && !reduce ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    }, { threshold: 0.1 }).observe(sphere);

    sphere.addEventListener("pointerdown", (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      sphere.setPointerCapture(e.pointerId);
      sphere.classList.add("grabbing");
    });
    sphere.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rotY += dx * 0.012; rotX -= dy * 0.012;
      vy = dx * 0.012; vx = -dy * 0.012;
      if (reduce) draw();
    });
    sphere.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") slow = true; });
    sphere.addEventListener("pointerleave", () => { slow = false; });
    const end = () => { dragging = false; sphere.classList.remove("grabbing"); };
    sphere.addEventListener("pointerup", end);
    sphere.addEventListener("pointercancel", end);
    draw();
  }

  /* ---------- 4. Flip stat tiles ---------- */
  document.querySelectorAll(".stats .flip-in").forEach((btn) => {
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("flipped");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });
})();
