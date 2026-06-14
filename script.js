(() => {
  // ===== NAV TOGGLE =====
  const navToggle = document.querySelector(".nav-toggle");
  const siteHeader = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".site-nav a");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteHeader) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      siteHeader.classList.toggle("nav-open", !expanded);
      // Prevent body scroll when nav is open
      document.body.style.overflow = expanded ? "" : "hidden";
    });

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        siteHeader.classList.remove("nav-open");
        document.body.style.overflow = "";
      });
    });

    // Close nav on click outside
    document.addEventListener("click", (e) => {
      if (siteHeader.classList.contains("nav-open") &&
          !siteNav.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navToggle.setAttribute("aria-expanded", "false");
        siteHeader.classList.remove("nav-open");
        document.body.style.overflow = "";
      }
    });

    // Close nav on resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) {
        navToggle.setAttribute("aria-expanded", "false");
        siteHeader.classList.remove("nav-open");
        document.body.style.overflow = "";
      }
    });

    // Close nav on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteHeader.classList.contains("nav-open")) {
        navToggle.setAttribute("aria-expanded", "false");
        siteHeader.classList.remove("nav-open");
        document.body.style.overflow = "";
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
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + "%" : "0%";

        // Show/hide back to top button
        if (scrollTop > 400) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }

        // Hide header on scroll down, show on scroll up (mobile only)
        if (window.innerWidth <= 720) {
          if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            siteHeader.style.transform = "translateY(-100%)";
          } else {
            // Scrolling up
            siteHeader.style.transform = "translateY(0)";
          }
        } else {
          siteHeader.style.transform = "";
        }

        lastScrollTop = scrollTop;
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

  // ===== LAZY LOADING IMAGES =====
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: "50px" });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => img.classList.add("loaded"));
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });

  // ===== TOUCH GESTURES FOR PORTFOLIO =====
  let touchStartX = 0;
  let touchEndX = 0;

  const portfolioCards = document.querySelectorAll(".portfolio-card");
  portfolioCards.forEach(card => {
    card.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    card.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe(card);
    }, { passive: true });
  });

  function handleSwipe(card) {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      // Swipe detected - could be used for navigation
      if (diff > 0) {
        // Swipe left
        card.classList.add("swipe-left");
      } else {
        // Swipe right
        card.classList.add("swipe-right");
      }
      setTimeout(() => {
        card.classList.remove("swipe-left", "swipe-right");
      }, 300);
    }
  }

  // ===== PREVENT ZOOM ON INPUT FOCUS (iOS) =====
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    document.querySelectorAll("input, select, textarea").forEach(el => {
      el.addEventListener("focus", () => {
        el.style.fontSize = "16px";
      });
    });
  }
})();
