/* ===================================================================
   STORY HOMES — Investor Landing Page interactions
   =================================================================== */
(function () {
  "use strict";

  /* ---------- Smart nav: shrink on scroll, hide on scroll down, show on scroll up ---------- */
  const nav = document.getElementById("nav");
  let lastY = window.scrollY;
  const onScroll = () => {
    if (nav.classList.contains("nav--menu-open")) return; // stay put while the mobile menu is open
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    if (y > lastY && y > 160) {
      nav.classList.add("nav--hidden"); // scrolling down
    } else {
      nav.classList.remove("nav--hidden"); // scrolling up
    }
    lastY = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav: hamburger toggles a dropdown panel ---------- */
  const navBurger = document.getElementById("navBurger");
  const navMobilePanel = document.getElementById("navMobilePanel");
  if (navBurger && navMobilePanel) {
    const setMenuOpen = (open) => {
      nav.classList.toggle("nav--menu-open", open);
      navBurger.setAttribute("aria-expanded", String(open));
    };
    navBurger.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("nav--menu-open"));
    });
    navMobilePanel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll(".num[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const valEl = el.querySelector(".val");
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const cur = Math.round(target * eased);
      valEl.textContent = cur.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => {
      c.querySelector(".val").textContent = parseFloat(c.dataset.count).toLocaleString();
    });
  }

  /* ---------- Testimonials (investor-relevant, from client file) ---------- */
  const testimonials = [
    {
      quote:
        "As an agent that specialized in fix and flip properties it's never an easy task, however Jawad came in after some failed buyers and turned the entire escrow around and closed the deal.",
      name: "AO Realty",
      role: "Fix & Flip Agent",
      agent: "Jawad",
    },
    {
      quote:
        "Reliable and transparent investor. A great resource for any wholesalers who need help with dispositions. Just closed a deal with them.",
      name: "Adrian Pedraza",
      role: "Wholesaler",
      agent: "Jawad",
    },
    {
      quote:
        "Having been involved in real estate flipping in the US for many years, I was fortunate to meet Katrin, who demonstrated a high level of professionalism and excellent communication.",
      name: "Zerui Yan",
      role: "Real Estate Flipper",
      agent: "Katrin",
    },
    {
      quote:
        "I had a great experience working with Mersad as a wholesaler. What really stood out was his transparency and how clearly he had my best interests in mind at every step.",
      name: "Evergreen Property Investment",
      role: "Wholesaler",
      agent: "Mersad",
    },
    {
      quote:
        "This is my fifth transaction with Mohammad and his outstanding team, and they continue to deliver professionalism and results every time. Can't wait for the next five.",
      name: "Kristin Santos",
      role: "Repeat Investor",
      agent: "Mohammad",
    },
    {
      quote:
        "BJ and Story Homes are the best to work with if you're looking for a property to buy or invest. Hardworking, detail-oriented, and committed to getting the best results.",
      name: "Nudora Inc",
      role: "Investor",
      agent: "BJ",
    },
    {
      quote:
        "We just closed our first deal together. Jawad understands the market inside and out and communicated very well throughout the entire transaction. I'd refer him to anyone.",
      name: "Carlos Hudgins",
      role: "Investor",
      agent: "Jawad",
    },
    {
      quote:
        "Working with Kelly and the Story team is a breeze. Efficient, smooth transactions, easy escrow, good terms and great people. We will be doing business with them again.",
      name: "Griffen Puhl",
      role: "Buy & Hold Investor",
      agent: "Kelly",
    },
  ];

  const marquee = document.getElementById("marquee");
  if (marquee) {
    const cardHTML = (t) => {
      const initials = t.name
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
      return `
        <article class="testi">
          <div class="t-stars">★★★★★</div>
          <p>"${t.quote}"</p>
          <div class="t-who">
            <div class="t-av">${initials}</div>
            <div>
              <div class="t-name">${t.name}</div>
              <div class="t-role">${t.role}</div>
            </div>
          </div>
          <div class="t-agent">Worked with ${t.agent}</div>
        </article>`;
    };
    // Duplicate the set so the -50% keyframe loops seamlessly.
    const set = testimonials.map(cardHTML).join("");
    marquee.innerHTML = set + set;
  }

  /* ---------- Building parallax band: subtle image drift as it crosses the viewport ---------- */
  const buildingImg = document.querySelector(".building-parallax-img");
  if (buildingImg) {
    const section = buildingImg.closest(".building-parallax");
    const updateParallax = () => {
      const rect = section.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const offset = progress * 40; // px of drift, kept small so the building stays framed
      buildingImg.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
  }

  /* ---------- Flow chart: draw the connecting line and stagger the icons in on scroll ---------- */
  const flow = document.getElementById("flowChart");
  const flowPath = document.getElementById("flowPath");
  if (flow && flowPath) {
    const len = flowPath.getTotalLength();
    flowPath.style.strokeDasharray = len;
    flowPath.style.strokeDashoffset = len;
    flowPath.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.15,1)";
    const reveal = () => {
      flow.classList.add("in");
      flowPath.style.strokeDashoffset = "0";
    };
    if ("IntersectionObserver" in window) {
      const fio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal();
              fio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      fio.observe(flow);
    } else {
      reveal();
    }
  }

  /* ---------- Deals carousel: arrow buttons page by a full set of visible cards ---------- */
  const dealsTrack = document.getElementById("dealsTrack");
  const dealsPrev = document.getElementById("dealsPrev");
  const dealsNext = document.getElementById("dealsNext");
  if (dealsTrack && dealsPrev && dealsNext) {
    const pageWidth = () => {
      const card = dealsTrack.querySelector(".deal-card");
      if (!card) return dealsTrack.clientWidth;
      const style = getComputedStyle(dealsTrack);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      // Count how many cards are actually visible at once (3 on desktop, 2 on tablet,
      // ~1 on mobile) so the arrows page by exactly one full screen of cards.
      const visible = Math.max(1, Math.round(dealsTrack.clientWidth / (card.getBoundingClientRect().width + gap)));
      return visible * (card.getBoundingClientRect().width + gap);
    };
    dealsPrev.addEventListener("click", () => dealsTrack.scrollBy({ left: -pageWidth(), behavior: "smooth" }));
    dealsNext.addEventListener("click", () => dealsTrack.scrollBy({ left: pageWidth(), behavior: "smooth" }));
  }

  /* ---------- Gallery videos: click to play with sound + native controls ---------- */
  document.querySelectorAll(".vid-card").forEach((card) => {
    const video = card.querySelector("video");
    const src = card.dataset.video;
    card.addEventListener("click", () => {
      if (card.classList.contains("playing")) return;
      if (!video.src) video.src = src;
      video.muted = false;
      video.controls = true;
      video.play().catch(() => {});
      card.classList.add("playing");
    });
    video.addEventListener("pause", () => {
      if (video.currentTime > 0 && !video.ended) return;
      card.classList.remove("playing");
    });
  });

  /* ---------- Background videos (perk, CTA): lazy-load + play when scrolled into view ---------- */
  const inviewVideos = document.querySelectorAll("[data-inview]");
  if (inviewVideos.length && "IntersectionObserver" in window) {
    const pio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            if (!el.src) el.src = el.dataset.inview;
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    inviewVideos.forEach((v) => pio.observe(v));
  }

  /* ---------- Video testimonials: click to play with sound + native controls ---------- */
  document.querySelectorAll(".testi-vid").forEach((card) => {
    const video = card.querySelector("video");
    const src = card.dataset.video;
    card.addEventListener("click", () => {
      if (card.classList.contains("playing")) return;
      if (!video.src) video.src = src;
      video.muted = false;
      video.controls = true;
      video.play().catch(() => {});
      card.classList.add("playing");
    });
    video.addEventListener("pause", () => {
      if (video.currentTime > 0 && !video.ended) return;
      card.classList.remove("playing");
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq").forEach((faq) => {
    const q = faq.querySelector(".faq-q");
    const a = faq.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = faq.classList.contains("open");
      document.querySelectorAll(".faq").forEach((f) => {
        f.classList.remove("open");
        f.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        faq.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Lead capture form (Name, Email, Phone required) ----------
     Submits to a Google Apps Script Web App, which emails the lead (styled HTML,
     Story Homes branding) with the UTM/campaign data attached. See
     apps-script/Code.gs for the receiving script and setup instructions.

     IMPORTANT: replace this with the real deployment URL before launch
     (Apps Script editor → Deploy → New deployment → Web app → copy the URL). */
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz3mNC5m2yX4ivpEOcQK5HrxWfcW-JGx1ciXKXPdQw-76v9VmX1Jg02i5zwCoEfUlUG/exec";

  const leadForm = document.getElementById("lead-form");
  if (leadForm) {
    const msgEl = document.getElementById("lead-form-msg");
    const showMsg = (text) => {
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.classList.toggle("show", Boolean(text));
    };

    // ---- Bot-proofing setup: stamp hidden fields as soon as the form exists ----
    // 1) Honeypot ("website") — real visitors never see or fill it (see .hp-field
    //    in styles.css); anything in it means an automated filler touched every input.
    // 2) Time trap — bots typically submit within milliseconds of the page loading;
    //    real people take at least a couple of seconds to read and type.
    const loadedAtField = document.getElementById("lf-loaded-at");
    if (loadedAtField) loadedAtField.value = String(Date.now());
    const MIN_FILL_SECONDS = 3;

    // ---- UTM / campaign tracking — captured once on load, carried in hidden fields ----
    const params = new URLSearchParams(window.location.search);
    const utmMap = {
      utm_source: "lf-utm-source",
      utm_medium: "lf-utm-medium",
      utm_campaign: "lf-utm-campaign",
      utm_term: "lf-utm-term",
      utm_content: "lf-utm-content",
    };
    Object.entries(utmMap).forEach(([param, fieldId]) => {
      const field = document.getElementById(fieldId);
      if (field) field.value = params.get(param) || "";
    });
    const pageUrlField = document.getElementById("lf-page-url");
    if (pageUrlField) pageUrlField.value = window.location.href;
    const referrerField = document.getElementById("lf-referrer");
    if (referrerField) referrerField.value = document.referrer || "direct";

    const validate = (name, value) => {
      const v = value.trim();
      if (name === "email") return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (name === "phone") return v.replace(/[^0-9]/g, "").length >= 7;
      return v.length > 0;
    };
    // Clear the invalid state as the user corrects a field.
    leadForm.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        if (input.classList.contains("invalid") && validate(input.name, input.value)) {
          input.classList.remove("invalid");
        }
      });
    });

    const resetButton = (btn, original) => {
      btn.textContent = original;
      btn.disabled = false;
    };

    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showMsg("");

      const btn = leadForm.querySelector('button[type="submit"]');
      const original = btn.textContent;

      // ---- Bot checks: fail silently with the normal success state so scrapers
      // and bots get no signal that they were caught, but nothing is ever sent. ----
      const honeypot = leadForm.elements["website"];
      const filledInMs = Date.now() - Number(loadedAtField?.value || Date.now());
      if ((honeypot && honeypot.value.trim() !== "") || filledInMs < MIN_FILL_SECONDS * 1000) {
        btn.textContent = "You're on the list ✓";
        btn.disabled = true;
        leadForm.reset();
        setTimeout(() => resetButton(btn, original), 3400);
        return;
      }

      let firstInvalid = null;
      ["name", "email", "phone"].forEach((n) => {
        const input = leadForm.elements[n];
        const ok = validate(n, input.value);
        input.classList.toggle("invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
        showMsg("Form isn't connected yet — set GOOGLE_SCRIPT_URL in script.js.");
        console.warn(
          "Lead form: GOOGLE_SCRIPT_URL is still a placeholder. Deploy apps-script/Code.gs " +
            "as a Web App and paste the deployment URL into script.js."
        );
        return;
      }

      const payload = {};
      new FormData(leadForm).forEach((value, key) => {
        if (key === "website") return; // never forward the honeypot
        payload[key] = value;
      });

      btn.textContent = "Sending…";
      btn.disabled = true;

      // Content-Type: text/plain keeps this a CORS "simple request" so Apps Script's
      // automatic Access-Control-Allow-Origin works without a preflight OPTIONS call
      // (which Apps Script Web Apps don't handle).
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Request failed");
          return res.json().catch(() => ({}));
        })
        .then((data) => {
          if (data && data.ok === false) throw new Error(data.error || "Submission rejected");
          btn.textContent = "You're on the list ✓";
          leadForm.reset();
          if (loadedAtField) loadedAtField.value = String(Date.now());
          setTimeout(() => resetButton(btn, original), 3400);

          // Google Ads conversion: fires only here, on a confirmed real lead —
          // never on page load, and never for the bot-trap branch above.
          if (typeof gtag === "function") {
            gtag("event", "conversion", {
              send_to: "AW-16832581516/q_EJCK79w9wcEIyfs9o-",
              value: 0.0,
              currency: "USD",
            });
          }

          // Meta Pixel Lead conversion: same rule — only on a confirmed real
          // submission, never on page load and never for the bot-trap branch.
          if (typeof fbq === "function") {
            fbq("track", "Lead");
          }
        })
        .catch(() => {
          resetButton(btn, original);
          showMsg("Something went wrong sending that — please try again or email us directly.");
        });
    });
  }

  /* ---------- Smooth-scroll offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });
})();
