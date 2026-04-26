const PAGE_INDEX = [
  { title: "Home", href: "/", keywords: "hero roadmap banner" },
  { title: "Notes", href: "/notes", keywords: "semester subjects pdf" },
  { title: "Code Executor", href: "/code-executor", keywords: "c cpp python java html css javascript run" },
  { title: "Previous Year Paper", href: "/pyq", keywords: "past papers year" },
  { title: "About", href: "/about", keywords: "mission team" },
  { title: "Subscription", href: "/subscription", keywords: "newsletter updates" },
  { title: "Login", href: "/login", keywords: "auth account" },
  { title: "Terms of Us", href: "/terms", keywords: "legal" },
  { title: "Contact Us", href: "/contact", keywords: "email contact" },
  { title: "Cookies", href: "/cookies", keywords: "cookie policy" },
  { title: "Privacy Policy", href: "/privacy", keywords: "privacy" },
  { title: "FAQ", href: "/faq", keywords: "questions" }
];

const SIDEBAR_ITEMS = [
  { key: "home", label: "Home", href: "/" },
  { key: "notes", label: "Notes", href: "/notes" },
  { key: "code-executor", label: "Code Executor", href: "/code-executor" },
  { key: "pyq", label: "Previous Year Paper", href: "/pyq" }
];

const FOOTER_ITEMS = [
  { label: "Terms of Us", href: "/terms" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Cookies", href: "/cookies" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "FAQ", href: "/faq" }
];

const STARTER_CODE = {
  c: "#include <stdio.h>\n\nint main() {\n  printf(\"Hello from C!\\n\");\n  return 0;\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << \"Hello from C++!\\n\";\n  return 0;\n}\n",
  python: "print('Hello from Python!')\n",
  java: "class prog {\n  public static void main(String[] args) {\n    System.out.println(\"Hello from Java!\");\n  }\n}\n",
  html_css_javascript: "<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Live Preview</title>\n  <style>\n    body {\n      margin: 0;\n      min-height: 100vh;\n      display: grid;\n      place-items: center;\n      background: linear-gradient(135deg, #f6f8ff, #fef6ec);\n      font-family: system-ui, sans-serif;\n    }\n\n    button {\n      border: 0;\n      padding: 0.8rem 1.1rem;\n      border-radius: 999px;\n      background: #1f7a5b;\n      color: #fff;\n      font-size: 1rem;\n      cursor: pointer;\n    }\n  </style>\n</head>\n<body>\n  <button id=\"tap\">Click me</button>\n\n  <script>\n    document.getElementById('tap').addEventListener('click', () => {\n      alert('HTML + CSS + JavaScript is running in one preview.');\n    });\n  </script>\n</body>\n</html>\n"
};

const BROWSER_PREVIEW_LANGUAGE = "html_css_javascript";

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.dataset.page || "home";
  renderShell(currentPage);
  initializeTheme();
  initializeSearch();
  initializeNotesPage();
  initializePyqPage();
  initializeHeroSlider();
  initializeSubscriptionForms();
  initializeLoginForms();
  initializeCodeExecutor();
  initializeLogout();
  syncAuthState();
});

function renderShell(currentPage) {
  const headerRoot = document.getElementById("siteHeader");
  const sidebarRoot = document.getElementById("siteSidebar");
  const footerRoot = document.getElementById("siteFooter");

  if (headerRoot) {
    headerRoot.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="/" aria-label="CodeCrack home">
          <img src="/images/cc-3.png" alt="CodeCrack logo">
          <span class="brand-copy">
            <span>CodeCrack</span>
            <span>Study faster. Build stronger.</span>
          </span>
        </a>
        <nav class="header-actions" aria-label="Header actions">
          <a class="action-btn" href="/">Home</a>
          <button class="action-btn" type="button" data-open-search>Search</button>
          <a class="action-btn" href="/subscription">Subscription</a>
          <a class="action-btn primary" href="/login" data-login-link>Login</a>
          <button class="icon-btn" type="button" data-theme-toggle aria-label="Toggle theme">Theme</button>
        </nav>
      </div>
    `;
  }

  if (sidebarRoot) {
    const links = SIDEBAR_ITEMS.map((item) => {
      const activeClass = item.key === currentPage ? "active" : "";
      return `<a class="side-link ${activeClass}" href="${item.href}">${item.label}</a>`;
    }).join("");

    sidebarRoot.innerHTML = `
      <nav class="side-nav" aria-label="Sidebar sections">
        ${links}
        <button class="side-button logout" type="button" data-logout>Logout</button>
      </nav>
    `;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <div class="footer-links">
        ${FOOTER_ITEMS.map(
          (item) => `<a class="footer-link" href="${item.href}">${item.label}</a>`
        ).join("")}
      </div>
    `;
  }
}

function initializeTheme() {
  const toggleButton = document.querySelector("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("cc_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  if (!toggleButton) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("cc_theme", nextTheme);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const toggleButton = document.querySelector("[data-theme-toggle]");

  if (toggleButton) {
    toggleButton.textContent = theme === "dark" ? "Light" : "Dark";
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function requestJson(url) {
  const response = await fetch(url, {
    credentials: "include"
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function initializeSearch() {
  const modal = document.getElementById("searchModal");
  const openButton = document.querySelector("[data-open-search]");
  const closeButton = document.querySelector("[data-close-search]");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  if (!modal || !openButton || !closeButton || !input || !results) {
    return;
  }

  const renderLocal = (query) => {
    const normalized = query.trim().toLowerCase();
    return PAGE_INDEX.filter((item) => {
      if (!normalized) {
        return true;
      }

      const haystack = `${item.title} ${item.keywords}`.toLowerCase();
      return haystack.includes(normalized);
    });
  };

  const drawResults = (items) => {
    if (!items.length) {
      results.innerHTML = '<div class="empty-state">No matches found.</div>';
      return;
    }

    results.innerHTML = items
      .map(
        (item) => {
          const title = escapeHtml(item.title);
          const href = item.href || "/";
          const keywords = escapeHtml(item.keywords || item.type || "");

          return `
          <a class="search-item" href="${href}">
            <strong>${title}</strong>
            <small>${keywords}</small>
          </a>
        `;
        }
      )
      .join("");
  };

  const renderResults = async (query) => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("query", query.trim());
      }

      const data = await requestJson(`/api/search?${params.toString()}`);
      const items = Array.isArray(data.items) ? data.items : [];
      drawResults(items);
    } catch (error) {
      drawResults(renderLocal(query));
    }
  };

  const open = () => {
    modal.hidden = false;
    renderResults("");
    input.value = "";
    input.focus();
  };

  const close = () => {
    modal.hidden = true;
  };

  openButton.addEventListener("click", open);
  closeButton.addEventListener("click", close);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      close();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      close();
    }
  });

  let searchDebounce;

  input.addEventListener("input", (event) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      renderResults(event.target.value);
    }, 160);
  });
}

function initializeNotesPage() {
  const table = document.getElementById("notesTable");
  if (!table) {
    return;
  }

  const subjectInput = document.getElementById("notesSubjectFilter");
  const semesterInput = document.getElementById("notesSemesterFilter");
  const searchInput = document.getElementById("notesSearchFilter");
  const clearButton = document.getElementById("notesClearFilters");

  const renderRows = (items) => {
    if (!items.length) {
      table.innerHTML = `
        <article class="table-row">
          <div>
            <strong>No notes found</strong>
            <small>Try different subject, semester, or search terms.</small>
          </div>
          <span class="action-btn" aria-hidden="true">View PDF</span>
          <span class="action-btn" aria-hidden="true">Download</span>
        </article>
      `;
      return;
    }

    table.innerHTML = items
      .map((item) => {
        const title = escapeHtml(item.title);
        const subtitle = escapeHtml(
          `${item.subject} | Semester ${item.semester}${item.description ? ` | ${item.description}` : ""}`
        );
        const pdfUrl = escapeHtml(item.pdfUrl);

        return `
          <article class="table-row">
            <div>
              <strong>${title}</strong>
              <small>${subtitle}</small>
            </div>
            <a class="action-btn" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">View PDF</a>
            <a class="action-btn" href="${pdfUrl}" download>Download</a>
          </article>
        `;
      })
      .join("");
  };

  const loadNotes = async () => {
    table.innerHTML = `
      <article class="table-row">
        <div>
          <strong>Loading notes...</strong>
          <small>Please wait while data is fetched.</small>
        </div>
        <span class="action-btn" aria-hidden="true">View PDF</span>
        <span class="action-btn" aria-hidden="true">Download</span>
      </article>
    `;

    const params = new URLSearchParams();

    if (subjectInput?.value.trim()) {
      params.set("subject", subjectInput.value.trim());
    }

    if (semesterInput?.value.trim()) {
      params.set("semester", semesterInput.value.trim());
    }

    if (searchInput?.value.trim()) {
      params.set("q", searchInput.value.trim());
    }

    try {
      const data = await requestJson(`/api/notes?${params.toString()}`);
      renderRows(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      table.innerHTML = `
        <article class="table-row">
          <div>
            <strong>Could not load notes</strong>
            <small>${escapeHtml(error.message)}</small>
          </div>
          <span class="action-btn" aria-hidden="true">View PDF</span>
          <span class="action-btn" aria-hidden="true">Download</span>
        </article>
      `;
    }
  };

  [subjectInput, semesterInput, searchInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", loadNotes);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (subjectInput) {
        subjectInput.value = "";
      }
      if (semesterInput) {
        semesterInput.value = "";
      }
      if (searchInput) {
        searchInput.value = "";
      }
      loadNotes();
    });
  }

  loadNotes();
}

function initializePyqPage() {
  const table = document.getElementById("pyqTable");
  if (!table) {
    return;
  }

  const subjectInput = document.getElementById("pyqSubjectFilter");
  const yearInput = document.getElementById("pyqYearFilter");
  const semesterInput = document.getElementById("pyqSemesterFilter");
  const clearButton = document.getElementById("pyqClearFilters");

  const renderRows = (items) => {
    if (!items.length) {
      table.innerHTML = `
        <article class="table-row">
          <div>
            <strong>No PYQ papers found</strong>
            <small>Try different filters for subject, year, or semester.</small>
          </div>
          <span class="action-btn" aria-hidden="true">Open PDF</span>
          <span class="action-btn" aria-hidden="true">Download</span>
        </article>
      `;
      return;
    }

    table.innerHTML = items
      .map((item) => {
        const title = escapeHtml(item.title);
        const subtitle = escapeHtml(
          `${item.subject} | Year ${item.year} | Semester ${item.semester} | ${item.examType}`
        );
        const pdfUrl = escapeHtml(item.pdfUrl);

        return `
          <article class="table-row">
            <div>
              <strong>${title}</strong>
              <small>${subtitle}</small>
            </div>
            <a class="action-btn" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open PDF</a>
            <a class="action-btn" href="${pdfUrl}" download>Download</a>
          </article>
        `;
      })
      .join("");
  };

  const loadPyq = async () => {
    table.innerHTML = `
      <article class="table-row">
        <div>
          <strong>Loading previous year papers...</strong>
          <small>Please wait while data is fetched.</small>
        </div>
        <span class="action-btn" aria-hidden="true">Open PDF</span>
        <span class="action-btn" aria-hidden="true">Download</span>
      </article>
    `;

    const params = new URLSearchParams();

    if (subjectInput?.value.trim()) {
      params.set("subject", subjectInput.value.trim());
    }

    if (yearInput?.value.trim()) {
      params.set("year", yearInput.value.trim());
    }

    if (semesterInput?.value.trim()) {
      params.set("semester", semesterInput.value.trim());
    }

    try {
      const data = await requestJson(`/api/pyq?${params.toString()}`);
      renderRows(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      table.innerHTML = `
        <article class="table-row">
          <div>
            <strong>Could not load PYQ papers</strong>
            <small>${escapeHtml(error.message)}</small>
          </div>
          <span class="action-btn" aria-hidden="true">Open PDF</span>
          <span class="action-btn" aria-hidden="true">Download</span>
        </article>
      `;
    }
  };

  [subjectInput, yearInput, semesterInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", loadPyq);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (subjectInput) {
        subjectInput.value = "";
      }
      if (yearInput) {
        yearInput.value = "";
      }
      if (semesterInput) {
        semesterInput.value = "";
      }
      loadPyq();
    });
  }

  loadPyq();
}

function initializeHeroSlider() {
  const slider = document.getElementById("heroSlider");
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dotsRoot = slider.querySelector("[data-hero-dots]");
  const prevButton = slider.querySelector("[data-hero-prev]");
  const nextButton = slider.querySelector("[data-hero-next]");

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let intervalRef;

  const setActiveSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentIndex);
    });

    if (dotsRoot) {
      dotsRoot.querySelectorAll(".hero-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentIndex);
      });
    }
  };

  const startAuto = () => {
    stopAuto();
    intervalRef = setInterval(() => {
      setActiveSlide(currentIndex + 1);
    }, 4500);
  };

  const stopAuto = () => {
    if (intervalRef) {
      clearInterval(intervalRef);
      intervalRef = undefined;
    }
  };

  if (dotsRoot) {
    dotsRoot.innerHTML = slides
      .map((_, index) => `<button class="hero-dot" type="button" data-hero-dot="${index}"></button>`)
      .join("");

    dotsRoot.addEventListener("click", (event) => {
      const target = event.target.closest("[data-hero-dot]");
      if (!target) {
        return;
      }

      setActiveSlide(Number(target.dataset.heroDot));
      startAuto();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      setActiveSlide(currentIndex - 1);
      startAuto();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      setActiveSlide(currentIndex + 1);
      startAuto();
    });
  }

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);
  slider.addEventListener("focusin", stopAuto);
  slider.addEventListener("focusout", startAuto);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
    }
  });

  setActiveSlide(0);
  startAuto();
}

function setFormMessage(form, message, type) {
  const slot = form.querySelector("[data-form-message]");
  if (!slot) {
    return;
  }

  slot.textContent = message;
  slot.className = `form-message ${type || ""}`.trim();
}

function initializeSubscriptionForms() {
  const forms = document.querySelectorAll("[data-subscription-form]");

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const emailInput = form.querySelector("input[name='email']");
      const sourceInput = form.querySelector("input[name='source']");

      if (!emailInput) {
        return;
      }

      setFormMessage(form, "Submitting...", "");

      try {
        const response = await fetch("/api/subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailInput.value,
            source: sourceInput ? sourceInput.value : "header"
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setFormMessage(form, data.error || "Subscription failed", "error");
          return;
        }

        setFormMessage(form, "Subscribed successfully.", "success");
        form.reset();
      } catch (error) {
        setFormMessage(form, "Unable to connect. Please try again.", "error");
      }
    });
  });
}

function initializeLoginForms() {
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = loginForm.querySelector("input[name='email']")?.value || "";
      const password = loginForm.querySelector("input[name='password']")?.value || "";
      setFormMessage(loginForm, "Signing in...", "");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          setFormMessage(loginForm, data.error || "Login failed", "error");
          return;
        }

        setFormMessage(loginForm, "Welcome back. Redirecting...", "success");
        setTimeout(() => {
          window.location.assign("/");
        }, 600);
      } catch (error) {
        setFormMessage(loginForm, "Unable to reach server", "error");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = registerForm.querySelector("input[name='name']")?.value || "";
      const email = registerForm.querySelector("input[name='email']")?.value || "";
      const password = registerForm.querySelector("input[name='password']")?.value || "";
      setFormMessage(registerForm, "Creating account...", "");

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          setFormMessage(registerForm, data.error || "Registration failed", "error");
          return;
        }

        setFormMessage(registerForm, "Account ready. Redirecting...", "success");
        setTimeout(() => {
          window.location.assign("/");
        }, 600);
      } catch (error) {
        setFormMessage(registerForm, "Unable to reach server", "error");
      }
    });
  }
}

function initializeCodeExecutor() {
  const languageSelect = document.getElementById("codeLanguage");
  const codeInput = document.getElementById("codeInput");
  const stdinInput = document.getElementById("stdinInput");
  const output = document.getElementById("codeOutput");
  let previewFrame = document.getElementById("previewFrame");
  const runButton = document.getElementById("runCodeBtn");
  const clearButton = document.getElementById("clearCodeBtn");
  const resetButton = document.getElementById("resetCodeBtn");
  const fontSizeInput = document.getElementById("fontSizeInput");

  if (!languageSelect || !codeInput || !output || !runButton) {
    return;
  }

  if (!previewFrame && output && output.parentNode) {
    previewFrame = document.createElement("iframe");
    previewFrame.id = "previewFrame";
    previewFrame.style.width = "100%";
    previewFrame.style.minHeight = "400px";
    previewFrame.style.border = "1px solid #ccc";
    previewFrame.style.borderRadius = "8px";
    previewFrame.hidden = true;
    output.parentNode.insertBefore(previewFrame, output.nextSibling);
  }

  let webInputsContainer = document.getElementById("webInputsContainer");
  if (!webInputsContainer && codeInput.parentNode) {
    webInputsContainer = document.createElement("div");
    webInputsContainer.id = "webInputsContainer";
    webInputsContainer.style.display = "none";
    webInputsContainer.style.gap = "1rem";
    webInputsContainer.style.flexDirection = "column";
    webInputsContainer.style.width = "100%";

    webInputsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: bold; margin-bottom: 0.25rem;">HTML</label>
        <textarea id="htmlInput" style="width: 100%; min-height: 120px; font-family: monospace; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: bold; margin-bottom: 0.25rem;">CSS</label>
        <textarea id="cssInput" style="width: 100%; min-height: 120px; font-family: monospace; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: bold; margin-bottom: 0.25rem;">JavaScript</label>
        <textarea id="jsInput" style="width: 100%; min-height: 120px; font-family: monospace; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    codeInput.parentNode.insertBefore(webInputsContainer, codeInput.nextSibling);
  }

  const htmlInput = document.getElementById("htmlInput");
  const cssInput = document.getElementById("cssInput");
  const jsInput = document.getElementById("jsInput");

  const isBrowserPreviewMode = () => languageSelect.value === BROWSER_PREVIEW_LANGUAGE;

  const previewHint = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, sans-serif;
      background: #f4f4f4;
      color: #222;
    }
  </style>
</head>
<body>
  <p>Press Run to render your HTML + CSS + JavaScript preview.</p>
</body>
</html>`;

  const hidePreview = () => {
    if (!previewFrame) {
      return;
    }

    previewFrame.hidden = true;
    previewFrame.srcdoc = "";
    output.hidden = false;
  };

  const showPreview = (source) => {
    if (!previewFrame) {
      output.hidden = false;
      output.textContent = "Preview frame unavailable on this page.";
      return;
    }

    previewFrame.srcdoc = source;
    previewFrame.hidden = false;
    output.hidden = true;
  };

  const setPreviewModeState = () => {
    if (isBrowserPreviewMode()) {
      if (stdinInput) {
        stdinInput.disabled = true;
        stdinInput.placeholder = "Standard input is disabled in HTML+CSS+JavaScript mode.";
      }
      codeInput.style.display = "none";
      if (webInputsContainer) webInputsContainer.style.display = "flex";
      return;
    }

    if (stdinInput) {
      stdinInput.disabled = false;
      stdinInput.placeholder = "Optional input for your program";
    }
    codeInput.style.display = "";
    if (webInputsContainer) webInputsContainer.style.display = "none";
  };

  const setStarterCode = () => {
    const language = languageSelect.value;
    if (isBrowserPreviewMode()) {
      if (htmlInput) htmlInput.value = `<button id="tap">Click me</button>`;
      if (cssInput) cssInput.value = `body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: linear-gradient(135deg, #f6f8ff, #fef6ec);\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  border: 0;\n  padding: 0.8rem 1.1rem;\n  border-radius: 999px;\n  background: #1f7a5b;\n  color: #fff;\n  font-size: 1rem;\n  cursor: pointer;\n}`;
      if (jsInput) jsInput.value = `document.getElementById('tap').addEventListener('click', () => {\n  alert('HTML + CSS + JavaScript is running in one preview.');\n});`;
    } else {
      codeInput.value = STARTER_CODE[language] || STARTER_CODE.python;
    }
  };

  if (!codeInput.value.trim()) {
    setStarterCode();
  }

  languageSelect.addEventListener("change", () => {
    setStarterCode();
    setPreviewModeState();

    if (isBrowserPreviewMode()) {
      showPreview(previewHint);
      return;
    }

    hidePreview();
  });

  setPreviewModeState();

  if (isBrowserPreviewMode()) {
    showPreview(previewHint);
  } else {
    hidePreview();
  }

  if (fontSizeInput) {
    fontSizeInput.addEventListener("input", (event) => {
      const size = `${event.target.value}px`;
      codeInput.style.fontSize = size;
      if (htmlInput) htmlInput.style.fontSize = size;
      if (cssInput) cssInput.style.fontSize = size;
      if (jsInput) jsInput.style.fontSize = size;
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (isBrowserPreviewMode()) {
        if (htmlInput) htmlInput.value = "";
        if (cssInput) cssInput.value = "";
        if (jsInput) jsInput.value = "";
      } else {
        codeInput.value = "";
      }

      if (stdinInput) {
        stdinInput.value = "";
      }

      if (isBrowserPreviewMode()) {
        showPreview(previewHint);
        return;
      }

      output.textContent = "Console cleared.";
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      setStarterCode();

      if (isBrowserPreviewMode()) {
        showPreview(previewHint);
        return;
      }

      output.textContent = "Starter template restored.";
    });
  }

  runButton.addEventListener("click", async () => {
    if (isBrowserPreviewMode()) {
      runButton.disabled = true;
      const combinedSource = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssInput ? cssInput.value : ""}
  </style>
</head>
<body>
${htmlInput ? htmlInput.value : ""}
  <script>
${jsInput ? jsInput.value : ""}
  </script>
</body>
</html>`;
      showPreview(combinedSource);
      runButton.disabled = false;
      return;
    }

    hidePreview();
    output.textContent = "Running code...";
    runButton.disabled = true;

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: languageSelect.value,
          code: codeInput.value,
          stdin: stdinInput ? stdinInput.value : ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        output.textContent = data.output || data.error || "Execution failed.";
        return;
      }

      const compileOutput = data.compile?.output ? `Compile:\n${data.compile.output}\n\n` : "";
      const runOutput = data.run?.output || data.output || "No output.";
      output.textContent = `${compileOutput}${runOutput}`.trim();
    } catch (error) {
      output.textContent = "Execution service unavailable.";
    } finally {
      runButton.disabled = false;
    }
  });
}

function initializeLogout() {
  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-logout]");
    if (!target) {
      return;
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        alert("Logout failed. Try again.");
        return;
      }

      window.location.assign("/login");
    } catch (error) {
      alert("Server unreachable. Logout did not complete.");
    }
  });
}

async function syncAuthState() {
  const loginLink = document.querySelector("[data-login-link]");
  if (!loginLink) {
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const email = data?.user?.email;

    if (email) {
      loginLink.textContent = email;
      loginLink.classList.remove("primary");
      loginLink.href = "/about";
    }
  } catch (error) {
    // Ignore failures here; anonymous browsing is allowed.
  }
}
