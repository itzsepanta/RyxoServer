document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // 1. THEME TOGGLE (Dark/Light)
  // ============================================================
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check saved theme
  const savedTheme = localStorage.getItem("ryxoserver-theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("ryxoserver-theme", next);
    updateThemeIcon(next);

    document.querySelectorAll(".stat-number").forEach((el) => {
      el.style.color = "";
    });
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
      icon.className = "fas fa-moon";
    } else {
      icon.className = "fas fa-sun";
    }
  }

  // ============================================================
  // 2. GITHUB API
  // ============================================================
  const FALLBACK_STATS = {
    stars: 4,
    forks: 0,
    watchers: 1,
    updated: "Jun 29, 2026",
  };

  async function fetchGitHubStats() {
    try {
      const response = await fetch(
        "https://api.github.com/repos/itzsepanta/RyxoServer",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const stats = {
        stars: data.stargazers_count ?? FALLBACK_STATS.stars,
        forks: data.forks_count ?? FALLBACK_STATS.forks,
        watchers: data.watchers_count ?? FALLBACK_STATS.watchers,
        updated: data.updated_at
          ? new Date(data.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : FALLBACK_STATS.updated,
      };

      animateCounter("stars", stats.stars);
      animateCounter("forks", stats.forks);
      animateCounter("watchers", stats.watchers);

      const lastUpdated = document.getElementById("lastUpdated");
      if (lastUpdated) {
        lastUpdated.textContent = stats.updated;
      }
    } catch (error) {
      console.warn("GitHub API fallback:", error.message);
      animateCounter("stars", FALLBACK_STATS.stars);
      animateCounter("forks", FALLBACK_STATS.forks);
      animateCounter("watchers", FALLBACK_STATS.watchers);

      const lastUpdated = document.getElementById("lastUpdated");
      if (lastUpdated) {
        lastUpdated.textContent = FALLBACK_STATS.updated;
      }
    }
  }

  // ============================================================
  // 3. COUNTER ANIMATION
  // ============================================================
  function animateCounter(id, target) {
    const element = document.querySelector(`.stat-number[data-count="${id}"]`);
    if (!element) {
      console.warn(`Element with data-count="${id}" not found`);
      return;
    }

    if (parseInt(element.textContent) === target) {
      return;
    }

    const start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(start + (target - start) * eased);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
        const accentColor =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--accent")
            .trim() || "#4fd1c5";
        element.style.transition = "color 0.3s ease";
        element.style.color = accentColor;
        setTimeout(() => {
          element.style.color = "";
        }, 500);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // ============================================================
  // 4. TERMINAL TYPING EFFECT
  // ============================================================
  function startTerminalTyping() {
    const terminalBody = document.getElementById("terminalBody");
    if (!terminalBody) return;

    const lines = [
      { type: "prompt", text: "npm run start:dev" },
      { type: "output", text: "🚀 RyxoServer started on port 3000" },
      { type: "output", text: "📡 Monitoring: HTTPS · HTTP · TCP · UDP" },
      { type: "output", text: "📊 Dashboard: http://localhost:3000/status" },
    ];

    // Clear terminal except last line (cursor)
    const cursorLine = terminalBody.querySelector("p:last-child");
    terminalBody.innerHTML = "";

    let lineIndex = 0;
    let charIndex = 0;
    let currentP = null;
    let isPrompt = false;

    function typeLine() {
      if (lineIndex >= lines.length) {
        // Add final cursor
        const cursorP = document.createElement("p");
        cursorP.innerHTML = `<span class="prompt">$</span> <span class="blink">▌</span>`;
        terminalBody.appendChild(cursorP);
        return;
      }

      const line = lines[lineIndex];
      const p = document.createElement("p");
      isPrompt = line.type === "prompt";

      if (isPrompt) {
        p.innerHTML = `<span class="prompt">$</span> <span class="cmd" style="display:inline;"></span>`;
      } else {
        p.innerHTML = `<span class="output"></span>`;
      }

      terminalBody.appendChild(p);
      currentP = p;
      charIndex = 0;
      typeChars(line.text);
    }

    function typeChars(text) {
      if (charIndex <= text.length) {
        const span = isPrompt
          ? currentP.querySelector(".cmd")
          : currentP.querySelector(".output");
        if (span) {
          span.textContent = text.substring(0, charIndex);
        }

        if (charIndex < text.length) {
          const delay = text[charIndex] === " " ? 20 : 40;
          charIndex++;
          setTimeout(() => typeChars(text), delay);
        } else {
          // Line complete
          lineIndex++;
          setTimeout(typeLine, 400);
        }
      }
    }

    setTimeout(typeLine, 600);
  }

  // ============================================================
  // 5. MOBILE MENU
  // ============================================================
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  }

  // ============================================================
  // 6. COPY TO CLIPBOARD
  // ============================================================
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const codeBlock = copyBtn.closest(".code-block");
      if (!codeBlock) return;
      const codeElement = codeBlock.querySelector("pre code");
      if (!codeElement) return;

      const codeText = codeElement.innerText.trim();

      try {
        await navigator.clipboard.writeText(codeText);
        showCopyFeedback(copyBtn, true);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = codeText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showCopyFeedback(copyBtn, true);
      }
    });
  }

  function showCopyFeedback(btn, success) {
    const original = btn.innerHTML;
    btn.innerHTML = success
      ? '<i class="fas fa-check"></i> Copied!'
      : '<i class="fas fa-times"></i> Error!';
    btn.style.color = success ? "var(--accent)" : "#ff6b6b";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.color = "";
    }, 2000);
  }

  // ============================================================
  // 7. SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbarHeight =
          document.querySelector(".navbar")?.offsetHeight || 80;
        const targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });
      }
    });
  });

  // ============================================================
  // 8. INTERSECTION OBSERVER (fade-in)
  // ============================================================
  const animatedElements = document.querySelectorAll(
    ".feature-card, .quick-card, .tech-pill, .testimonial-card, .section-header",
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    animatedElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
  } else {
    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  // ============================================================
  // 9. NAVBAR SCROLL SHADOW
  // ============================================================
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // ============================================================
  // 10. INIT
  // ============================================================
  fetchGitHubStats();
  startTerminalTyping();

  console.log("🚀 RyxoServer Landing · Fully loaded");
  console.log(`📱 Theme: ${html.getAttribute("data-theme")}`);
});
