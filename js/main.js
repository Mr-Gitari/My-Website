document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CONTACT_EMAIL = "raphaelmuchiri79@gmail.com";

  // --- Toast helper ---
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
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
    "React · Node.js · Tailwind CSS",
    "Hackathon Winner"
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

  // --- 4. Cursor spotlight on glass cards and 3D tilt on project cards (mouse only) ---
  document.querySelectorAll(".glass").forEach((card) => {
    const isProject = card.classList.contains("project");

    card.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", x + "px");
      card.style.setProperty("--y", y + "px");

      if (isProject && !reduceMotion) {
        card.style.setProperty("--ry", ((x / rect.width - 0.5) * 6).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y / rect.height) * 5).toFixed(2) + "deg");
      }
    });

    if (isProject) {
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    }
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

  // --- 7. Reveal sections as they scroll into view ---
  const revealItems = document.querySelectorAll(".sr");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("in"));
  }

  // --- 8. Count-up numbers in the stats strip ---
  const counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    el.textContent = "0";
    requestAnimationFrame(frame);
  }

  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  }

  // --- 9. Scroll progress bar and active dock link ---
  const progress = document.getElementById("progress");
  const dockLinks = Array.from(document.querySelectorAll("#dock a"));
  const sections = dockLinks
    .map((a) => ({ link: a, el: document.getElementById(a.dataset.target) }))
    .filter((s) => s.el);
  let scrollQueued = false;

  function setActive(link) {
    dockLinks.forEach((a) => {
      const on = a === link;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    scrollQueued = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty("--p", max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : 0);

    if (!sections.length) return;
    let current = sections[0];

    if (window.scrollY < 40) {
      current = sections[0];
    } else if (max > 0 && window.scrollY >= max - 6) {
      current = sections[sections.length - 1];
    } else {
      const line = window.innerHeight * 0.4;
      sections.forEach((s) => {
        if (s.el.getBoundingClientRect().top <= line) current = s;
      });
    }
    setActive(current.link);
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScroll);
  }

  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);
  onScroll();

  // --- 10. Contact form (opens the visitor's email app, or posts to a form service) ---
  const form = document.getElementById("contact-form");
  const formError = document.getElementById("form-error");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (formError) formError.textContent = "";

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (name.length < 2) { formError.textContent = "Please enter your name."; form.elements.name.focus(); return; }
      if (!emailOk) { formError.textContent = "Please enter a valid email address."; form.elements.email.focus(); return; }
      if (message.length < 10) { formError.textContent = "Your message should be at least 10 characters."; form.elements.message.focus(); return; }

      const endpoint = (form.dataset.endpoint || "").trim();

      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ name, email, message })
          });
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          showToast("Message sent. Thank you!");
        } catch (err) {
          formError.textContent = "Could not send right now. Please email me directly instead.";
        }
        return;
      }

      const subject = "Message from " + name + " (via your digital card)";
      const body = message + "\n\n" + name + "\n" + email;
      showToast("Opening your email app...");
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  // --- 11. Easter egg: terminal ---
  const termBtn = document.getElementById("terminal-btn");
  const term = document.getElementById("terminal");
  const termOut = document.getElementById("term-out");
  const termClose = document.getElementById("terminal-close");
  let termRun = 0;

  const script = [
    { cmd: "whoami", out: ["Raphael Gitari Muchiri, Software Engineer"] },
    { cmd: "cat stack.txt", out: ["React · TypeScript · Node.js · Express", "MongoDB · MariaDB · Django · Tailwind CSS"] },
    { cmd: "git log --wins", out: ["1st place   SilvaGuard (Oct 2026)", "2nd place   AgriSenti, Impact Hackathon (Aug 2025)"] },
    { cmd: "./hire-raphael.sh", out: ["Compiling a great idea together...", "Done."] }
  ];

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function addLine(className) {
    const line = document.createElement("div");
    if (className) line.className = className;
    termOut.appendChild(line);
    return line;
  }

  async function playTerminal() {
    const run = ++termRun;
    termOut.textContent = "";

    for (const step of script) {
      if (run !== termRun) return;
      const cmdLine = addLine();
      const prompt = document.createElement("span");
      prompt.className = "t-prompt";
      prompt.textContent = "$ ";
      const cmdText = document.createElement("span");
      cmdLine.append(prompt, cmdText);

      if (reduceMotion) {
        cmdText.textContent = step.cmd;
      } else {
        for (const ch of step.cmd) {
          if (run !== termRun) return;
          cmdText.textContent += ch;
          await wait(34);
        }
        await wait(220);
      }

      for (const text of step.out) {
        if (run !== termRun) return;
        const outLine = addLine("t-out");
        outLine.textContent = text;
        if (!reduceMotion) await wait(160);
      }
      if (!reduceMotion) await wait(260);
    }

    if (run !== termRun) return;
    const last = addLine();
    const link = document.createElement("a");
    link.href = "mailto:" + CONTACT_EMAIL;
    link.textContent = "> Say hello: " + CONTACT_EMAIL;
    last.appendChild(link);
    const caret = document.createElement("span");
    caret.className = "t-caret";
    last.appendChild(caret);
    termOut.scrollTop = termOut.scrollHeight;
  }

  if (termBtn && term && typeof term.showModal === "function") {
    termBtn.addEventListener("click", () => {
      term.showModal();
      playTerminal();
    });
    if (termClose) termClose.addEventListener("click", () => term.close());
    term.addEventListener("click", (e) => { if (e.target === term) term.close(); });
    term.addEventListener("close", () => { termRun++; });
  } else if (termBtn) {
    termBtn.hidden = true;
  }
});
