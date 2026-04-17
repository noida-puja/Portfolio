const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealNodes = document.querySelectorAll(".reveal");

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("reveal-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -36px 0px",
    }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("reveal-visible"));
}

const guideMessage = document.querySelector("#guide-message");
const sectionIndex = document.querySelector("#section-index");
const sectionNodes = document.querySelectorAll("[data-section][data-voice]");
const navLinks = document.querySelectorAll("[data-nav]");

function setActiveSection(sectionId, message, order) {
  if (guideMessage) {
    guideMessage.textContent = message;
  }

  if (sectionIndex && order) {
    sectionIndex.textContent = order;
  }

  navLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").replace("#", "");
    const heroFallback = sectionId === "hero" && href === "about";
    link.classList.toggle("is-active", href === sectionId || heroFallback);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visible.length) {
      return;
    }

    const current = visible[0].target;
    setActiveSection(
      current.dataset.section,
      current.dataset.voice,
      current.dataset.order
    );
  },
  {
    threshold: [0.3, 0.5, 0.75],
    rootMargin: "-12% 0px -30% 0px",
  }
);

sectionNodes.forEach((section) => sectionObserver.observe(section));

setActiveSection(
  "hero",
  "Welcome. The portfolio opens like a living HR sketchbook before moving into story, results, and working style.",
  "01"
);

const cursorGlow = document.querySelector(".cursor-glow");
document.addEventListener("pointermove", (event) => {
  if (!cursorGlow || prefersReducedMotion) {
    return;
  }

  cursorGlow.style.setProperty("--cursor-x", `${event.clientX}px`);
  cursorGlow.style.setProperty("--cursor-y", `${event.clientY}px`);
});

const sceneShell = document.querySelector("[data-scene]");
const scene = document.querySelector(".scene");

if (sceneShell && scene && !prefersReducedMotion) {
  sceneShell.addEventListener("pointermove", (event) => {
    const rect = sceneShell.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 18;
    const rotateX = (0.5 - py) * 16;

    scene.style.setProperty("--scene-ry", `${rotateY}deg`);
    scene.style.setProperty("--scene-rx", `${rotateX}deg`);
  });

  sceneShell.addEventListener("pointerleave", () => {
    scene.style.setProperty("--scene-ry", "8deg");
    scene.style.setProperty("--scene-rx", "-10deg");
  });
}

const tiltCards = document.querySelectorAll(".tilt-card");

tiltCards.forEach((card) => {
  if (prefersReducedMotion) {
    return;
  }

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const tiltY = (px - 0.5) * 10;
    const tiltX = (0.5 - py) * 8;

    card.style.setProperty("--tilt-y", `${tiltY}deg`);
    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-lift", "-6px");
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-lift", "0px");
  });
});
