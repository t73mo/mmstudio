(() => {
  // ===== NAV TOGGLE =====
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

  // ===== SCROLL PROGRESS =====
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.prepend(progressBar);

  // ===== BACK TO TOP =====
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Наверх");
  backToTop.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ===== SCROLL HANDLER =====
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + "%" : "0%";

        if (scrollTop > 400) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== CONTACT FORM =====
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const card = form.closest(".contact-card");
      const heading = card.querySelector("h2");
      form.style.display = "none";
      heading.insertAdjacentHTML("afterend", '<div class="form-success show"><h3>Запрос отправлен</h3><p>Мы свяжемся с вами в ближайшее время.</p></div>');
    });
  }

  // ===== PHONE MASK =====
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", e => {
      let val = e.target.value.replace(/\D/g, "");
      if (val.length > 0) {
        if (val[0] === "7" || val[0] === "8") val = val.substring(1);
        let formatted = "+7";
        if (val.length > 0) formatted += " (" + val.substring(0, 3);
        if (val.length >= 3) formatted += ") " + val.substring(3, 6);
        if (val.length >= 6) formatted += "-" + val.substring(6, 8);
        if (val.length >= 8) formatted += "-" + val.substring(8, 10);
        e.target.value = formatted;
      }
    });
  }
})();
