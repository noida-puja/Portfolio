(() => {
  const yearNode = document.querySelector("#year");
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  /* ---------- Scroll-triggered theme swap (light ↔ dark) ---------- */
  const themedSections = Array.from(document.querySelectorAll("[data-theme]"));
  const body = document.body;
  let currentTheme = null;
  let lastY = window.scrollY;
  let direction = "down";
  let desiredTheme = null;
  let desiredSince = 0;
  const ENTER_DOWN = 120;
  const ENTER_UP = 60;
  const STABLE_DOWN = 140;
  const STABLE_UP = 70;

  function applyTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    body.classList.toggle("theme-dark-active", theme === "dark");
  }

  function updateTheme() {
    if (!themedSections.length) return;
    const y = window.scrollY;
    direction = y > lastY ? "down" : y < lastY ? "up" : direction;
    lastY = y;

    const midY = window.innerHeight * 0.5;
    const midAbs = y + midY;

    let nearestTheme = currentTheme || "light";
    let nearestDist = Infinity;
    let coverMargin = -1;

    themedSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = rect.bottom + window.scrollY;
      const covers = top <= midAbs && bottom >= midAbs;
      const dist = covers
        ? 0
        : Math.min(Math.abs(top - midAbs), Math.abs(bottom - midAbs));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestTheme = sec.dataset.theme;
        if (covers) coverMargin = Math.min(midAbs - top, bottom - midAbs);
      }
    });

    const ENTER = direction === "down" ? ENTER_DOWN : ENTER_UP;
    const STABLE = direction === "down" ? STABLE_DOWN : STABLE_UP;

    let next = currentTheme ?? nearestTheme;
    if (nearestDist === 0 && coverMargin >= ENTER) next = nearestTheme;

    const now = performance.now();
    if (next !== desiredTheme) {
      desiredTheme = next;
      desiredSince = now;
    }
    if (now - desiredSince >= STABLE) applyTheme(desiredTheme);
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTheme();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // initialize theme
  applyTheme(themedSections[0]?.dataset.theme || "light");
  updateTheme();

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Drawer (Connect) ---------- */
  const drawer = document.getElementById("drawer");
  const openBtns = document.querySelectorAll("[data-open-drawer]");
  const closeBtns = document.querySelectorAll("[data-close-drawer]");
  const closeOnClick = document.querySelectorAll("[data-close-on-click]");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtns.forEach((b) => b.addEventListener("click", openDrawer));
  closeBtns.forEach((b) => b.addEventListener("click", closeDrawer));
  closeOnClick.forEach((b) => b.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- Pinned roadmap (sticky section, content changes) ---------- */
  document.querySelectorAll("[data-pinned]").forEach((scroller) => {
    const steps = parseInt(scroller.dataset.steps, 10) || 1;
    const cards = scroller.querySelectorAll(".pinned-card");
    const dots = scroller.querySelectorAll(".pinned-dot");
    let lastActive = -1;

    function setActive(i) {
      if (i === lastActive) return;
      lastActive = i;
      cards.forEach((c, idx) => {
        c.classList.toggle("active", idx === i);
        c.classList.toggle("exit", idx < i);
      });
      dots.forEach((d, idx) => d.classList.toggle("active", idx <= i));
    }

    function onScroll() {
      const rect = scroller.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = scroller.offsetHeight - vh;
      if (total <= 0) return setActive(0);
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const i = Math.min(steps - 1, Math.floor(progress * steps));
      setActive(i);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });

  /* ---------- Number counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          countIO.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countIO.observe(c));
  }

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
