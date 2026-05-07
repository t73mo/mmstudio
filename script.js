const sections = document.querySelectorAll(".section");
const navToggle = document.querySelector(".nav-toggle");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");

if (navToggle && siteHeader) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteHeader.classList.toggle("nav-open", !expanded);
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteHeader.classList.remove("nav-open");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      navToggle.setAttribute("aria-expanded", "false");
      siteHeader.classList.remove("nav-open");
    }
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  sections.forEach(section => observer.observe(section));
} else {
  sections.forEach(section => section.classList.add("show"));
}
