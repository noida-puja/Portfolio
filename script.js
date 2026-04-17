const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const revealNodes = document.querySelectorAll(".reveal");

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
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const guideMessage = document.querySelector("#guide-message");
const sectionNodes = document.querySelectorAll("[data-section][data-voice]");
const navLinks = document.querySelectorAll("[data-nav]");

function setActiveSection(sectionId, message) {
  if (guideMessage) {
    guideMessage.textContent = message;
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const targetId = href.replace("#", "");
    const isHeroLink = sectionId === "hero" && targetId === "about";
    link.classList.toggle("is-active", targetId === sectionId || isHeroLink);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visibleEntries.length) {
      return;
    }

    const topEntry = visibleEntries[0];
    const sectionId = topEntry.target.dataset.section;
    const message = topEntry.target.dataset.voice;
    setActiveSection(sectionId, message);
  },
  {
    threshold: [0.3, 0.55, 0.8],
    rootMargin: "-12% 0px -28% 0px",
  }
);

sectionNodes.forEach((section) => sectionObserver.observe(section));

setActiveSection(
  "hero",
  "Welcome. Start with the overview, then follow the timeline and capability story."
);
