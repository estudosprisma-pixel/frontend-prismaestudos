const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const heroVideo = document.querySelector(".hero-video");

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.playsInline = true;

  const startHeroVideo = () => {
    const playback = heroVideo.play();
    if (playback?.catch) playback.catch(() => {});
  };

  if (heroVideo.readyState >= 2) startHeroVideo();
  else heroVideo.addEventListener("loadeddata", startHeroVideo, { once: true });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) startHeroVideo();
  });
}
