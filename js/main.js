document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Toast helper ---
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // --- 1. Theme toggle (dark / light, remembered) ---
  const themeBtn = document.getElementById("theme-toggle");
  const metaTheme = document.getElementById("meta-theme");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? "#f2f5fc" : "#060a13");
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }

  // --- 2. Profile photo: show the monogram only if the photo is missing ---
  const photo = document.getElementById("photo");
  if (photo) {
    const avatar = photo.closest(".avatar");
    const showPhoto = () => { photo.hidden = false; if (avatar) avatar.classList.add("has-photo"); };
    const hidePhoto = () => { photo.hidden = true; if (avatar) avatar.classList.remove("has-photo"); };
    photo.addEventListener("load", showPhoto);
    photo.addEventListener("error", hidePhoto);
    if (photo.complete) {
      if (photo.naturalWidth > 0) showPhoto(); else hidePhoto();
    }
  }

  // --- 3. Typing effect for the role line ---
  const typed = document.getElementById("typed");
  const roles = [
    "Web Developer",
    "Full-Stack JavaScript Delivery",
    "React · Node.js · Tailwind CSS"
  ];

  if (typed && !reduceMotion) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = true;

    function tick() {
      const current = roles[roleIndex];
      let delay;

      if (deleting) {
        charIndex--;
        delay = 30;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 350;
        }
      } else {
        charIndex++;
        delay = 65;
        if (charIndex === current.length) {
          deleting = true;
          delay = 1800;
        }
      }

      typed.textContent = roles[roleIndex].slice(0, charIndex);
      setTimeout(tick, delay);
    }

    setTimeout(tick, 3500);
  }

  // --- 4. Cursor spotlight on glass cards (mouse and pen only) ---
  document.querySelectorAll(".glass").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", e.clientX - rect.left + "px");
      card.style.setProperty("--y", e.clientY - rect.top + "px");
    });
  });

  // --- 5. Copy-to-clipboard buttons ---
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }
  }

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await copyText(btn.dataset.copy);
      showToast(ok ? "Copied to clipboard" : "Could not copy, please copy manually");
    });
  });

  // --- 6. Share this card ---
  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const data = {
        title: "Raphael Gitari Muchiri | Software Engineer",
        text: "Raphael Gitari Muchiri, Software Engineer. Here is his digital business card.",
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(data);
        } catch (e) { /* share sheet closed */ }
      } else {
        const ok = await copyText(data.url);
        showToast(ok ? "Card link copied" : "Copy the link from the address bar");
      }
    });
  }
});
