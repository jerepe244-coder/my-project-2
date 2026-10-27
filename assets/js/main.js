/**
 * Hotel La Fresque — Avenida de Mayo 984, Buenos Aires
 * Core Client Application (ES / EN / PT Multilingual, Gallery Lightbox, Booking Engine, Mobile Drawer)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. STATE & INITIALIZATION ---
  const supportedLangs = ["es", "en", "pt"];
  let currentLang = "es";

  const normalizeLang = (code) => {
    if (!code) return null;
    const lower = code.toLowerCase().trim();
    if (lower === "pt" || lower.startsWith("pt-")) return "pt";
    if (lower === "en" || lower.startsWith("en-")) return "en";
    if (lower === "es" || lower.startsWith("es-")) return "es";
    return null;
  };

  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = normalizeLang(urlParams.get("lang"));
  const savedLang = normalizeLang(localStorage.getItem("lafresque_lang"));

  if (langFromUrl) {
    currentLang = langFromUrl;
  } else if (savedLang) {
    currentLang = savedLang;
  } else {
    const browserLang = normalizeLang(navigator.language || navigator.userLanguage || "");
    if (browserLang) {
      currentLang = browserLang;
    }
  }

  // Set initial dates for booking inputs
  setupDatePickers();

  // Initialize Language
  setLanguage(currentLang);

  // Setup event listeners
  setupNavigation();
  setupLanguageSwitcher();
  setupBookingSystem();
  setupRoomsTabs();
  setupRoomThumbnails();
  setupGallery();
  setupContactForm();
});

// --- 2. MULTILINGUAL TRANSLATION ENGINE ---
function setLanguage(lang) {
  if (!translations[lang]) return;
  window.currentAppLang = lang;
  localStorage.setItem("lafresque_lang", lang);
  document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;

  const t = translations[lang];

  // Update text content
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update HTML content
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) {
      el.setAttribute("placeholder", t[key]);
    }
  });

  // Update aria-labels
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (t[key]) {
      el.setAttribute("aria-label", t[key]);
    }
  });

  // Update Language toggle buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });

  // Update page title & meta descriptions
  if (lang === "pt") {
    document.title = "Hotel La Fresque — Avenida de Mayo 984, Buenos Aires | Site Oficial";
  } else if (lang === "en") {
    document.title = "Hotel La Fresque — Avenida de Mayo 984, Buenos Aires | Official Site";
  } else {
    document.title = "Hotel La Fresque — Avenida de Mayo 984, Buenos Aires | Sitio Oficial";
  }

  const metaDesc = document.querySelector("meta[name=\"description\"]");
  if (metaDesc) {
    if (lang === "pt") {
      metaDesc.setAttribute("content", "Hotel histórico na Avenida de Mayo 984, Monserrat, Buenos Aires. Edifício tombado de 1894 restaurado com abóbadas de tijolos, pisos de madeira, museu próprio e comodidades contemporâneas.");
    } else if (lang === "en") {
      metaDesc.setAttribute("content", "Historic hotel on Avenida de Mayo 984, Monserrat, Buenos Aires. Late 19th-century landmark restored with high vaulted ceilings, timber floors, on-site museum, and contemporary comforts.");
    } else {
      metaDesc.setAttribute("content", "Hotel de carácter histórico en Avenida de Mayo 984, Monserrat, Buenos Aires. Edificio de finales del siglo XIX reciclado a nuevo con techos altos, pisos de madera, museo propio y comodidades contemporáneas.");
    }
  }

  // Update active lightbox caption if open
  const lightbox = document.getElementById("lightboxModal");
  if (lightbox && lightbox.classList.contains("active")) {
    const activeItem = window.activeLightboxItem;
    if (activeItem) {
      const captionKey = activeItem.getAttribute("data-caption-i18n");
      const captionEl = document.getElementById("lightboxCaption");
      if (captionEl && captionKey && t[captionKey]) {
        captionEl.textContent = t[captionKey];
      }
    }
  }
}

function setupLanguageSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const selected = btn.getAttribute("data-lang");
      setLanguage(selected);
    });
  });
}

// --- 3. NAVIGATION & SCROLL BEHAVIOR ---
function setupNavigation() {
  const header = document.querySelector(".site-header");
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const drawer = document.querySelector(".mobile-nav-drawer");
  const overlay = document.querySelector(".drawer-overlay");
  const closeBtn = document.querySelector(".mobile-close-btn");
  const mobileLinks = document.querySelectorAll(".mobile-menu-links a");

  // Sticky header background
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) {
      closeDrawer();
    }
  });

  // Smooth scroll offset calculation
  document.querySelectorAll("a[href^=\"#\"]").forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || !targetId.startsWith("#")) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header ? (header.offsetHeight || 74) : 74;
        const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: "smooth"
        });
      }
    });
  });
}

// --- 4. DATE PICKERS SETUP ---
function setupDatePickers() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const checkinInputs = document.querySelectorAll("input[type=\"date\"][id*=\"checkin\"]");
  const checkoutInputs = document.querySelectorAll("input[type=\"date\"][id*=\"checkout\"]");

  checkinInputs.forEach((input) => {
    input.min = formatDate(today);
    if (!input.value) input.value = formatDate(today);

    input.addEventListener("change", () => {
      const selected = new Date(input.value);
      const nextDay = new Date(selected);
      nextDay.setDate(selected.getDate() + 1);
      checkoutInputs.forEach((outInput) => {
        outInput.min = formatDate(nextDay);
        if (new Date(outInput.value) <= selected) {
          outInput.value = formatDate(nextDay);
        }
      });
    });
  });

  checkoutInputs.forEach((input) => {
    input.min = formatDate(tomorrow);
    if (!input.value) input.value = formatDate(tomorrow);
  });
}

// --- 5. BOOKING SYSTEM & MODAL ---
function setupBookingSystem() {
  const modal = document.getElementById("bookingModal");
  const modalCloseBtn = document.getElementById("closeBookingModal");
  const openModalBtns = document.querySelectorAll("[data-open-booking]");
  const bookingBarForm = document.getElementById("quickBookingForm");
  const sendWhatsAppBtn = document.getElementById("modalSendWhatsApp");
  const directBookingBtn = document.getElementById("modalDirectBooking");

  const enforceExecutiveCapacity = (roomSelect, guestsSelect) => {
    if (!roomSelect || !guestsSelect) return;
    const isExecutive = roomSelect.value === "Ejecutiva";
    Array.from(guestsSelect.options).forEach((opt) => {
      const count = parseInt(opt.value, 10);
      if (isExecutive && count > 2) {
        opt.disabled = true;
      } else {
        opt.disabled = false;
      }
    });
    if (isExecutive && parseInt(guestsSelect.value, 10) > 2) {
      guestsSelect.value = "2";
    }
  };

  const barRoomEl = document.getElementById("barRoomType");
  const barGuestsEl = document.getElementById("barGuests");
  if (barRoomEl && barGuestsEl) {
    barRoomEl.addEventListener("change", () => enforceExecutiveCapacity(barRoomEl, barGuestsEl));
    enforceExecutiveCapacity(barRoomEl, barGuestsEl);
  }

  const modalRoomEl = document.getElementById("modalRoomType");
  const modalGuestsEl = document.getElementById("modalGuests");
  if (modalRoomEl && modalGuestsEl) {
    modalRoomEl.addEventListener("change", () => enforceExecutiveCapacity(modalRoomEl, modalGuestsEl));
  }

  function openBookingModal(initialRoom = "") {
    if (!modal) return;
    if (initialRoom) {
      const modalRoomSelect = document.getElementById("modalRoomType");
      if (modalRoomSelect) {
        modalRoomSelect.value = initialRoom;
        enforceExecutiveCapacity(modalRoomSelect, document.getElementById("modalGuests"));
      }
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeBookingModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const roomPref = btn.getAttribute("data-room") || "";
      openBookingModal(roomPref);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeBookingModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBookingModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeBookingModal();
    }
  });

  // Quick Booking Bar handler
  if (bookingBarForm) {
    bookingBarForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const checkinVal = document.getElementById("barCheckin").value;
      const checkoutVal = document.getElementById("barCheckout").value;
      const guestsVal = document.getElementById("barGuests").value;
      const roomVal = document.getElementById("barRoomType").value;

      if (document.getElementById("modalCheckin")) document.getElementById("modalCheckin").value = checkinVal;
      if (document.getElementById("modalCheckout")) document.getElementById("modalCheckout").value = checkoutVal;
      if (document.getElementById("modalGuests")) document.getElementById("modalGuests").value = guestsVal;
      if (document.getElementById("modalRoomType")) document.getElementById("modalRoomType").value = roomVal;

      openBookingModal(roomVal);
    });
  }

  function getBookingData() {
    return {
      name: (document.getElementById("modalName")?.value || "").trim(),
      email: (document.getElementById("modalEmail")?.value || "").trim(),
      phone: (document.getElementById("modalPhone")?.value || "").trim(),
      checkin: document.getElementById("modalCheckin")?.value || "",
      checkout: document.getElementById("modalCheckout")?.value || "",
      guests: document.getElementById("modalGuests")?.value || "2",
      room: document.getElementById("modalRoomType")?.value || "Cualquiera",
      comments: (document.getElementById("modalComments")?.value || "").trim()
    };
  }

  function validateBooking(data) {
    const lang = window.currentAppLang || "es";
    const t = translations[lang] || translations.es;

    if (!data.name) {
      showToast(t.toast_valid_name, "error");
      return false;
    }
    if (!data.email && !data.phone) {
      showToast(t.toast_valid_contact, "error");
      return false;
    }
    return true;
  }

  // WhatsApp Dispatch
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const data = getBookingData();
      if (!validateBooking(data)) return;

      const lang = window.currentAppLang || "es";
      const t = translations[lang] || translations.es;
      let msg = "";

      if (lang === "pt") {
        msg = `*Consulta de Reserva — Hotel La Fresque*\n\n` +
          `• *Hóspede:* ${data.name}\n` +
          `• *Data de Entrada:* ${data.checkin}\n` +
          `• *Data de Saída:* ${data.checkout}\n` +
          `• *Hóspedes:* ${data.guests}\n` +
          `• *Acomodação:* ${data.room}\n` +
          `• *E-mail:* ${data.email || "Não informado"}\n` +
          `• *Telefone:* ${data.phone || "Não informado"}\n` +
          (data.comments ? `• *Comentários:* ${data.comments}\n` : "") +
          `\n_Enviado através do site oficial https://lafresquehotel.com_`;
      } else if (lang === "en") {
        msg = `*Reservation Inquiry — Hotel La Fresque*\n\n` +
          `• *Guest Name:* ${data.name}\n` +
          `• *Check-in Date:* ${data.checkin}\n` +
          `• *Check-out Date:* ${data.checkout}\n` +
          `• *Guests:* ${data.guests}\n` +
          `• *Room Category:* ${data.room}\n` +
          `• *Email:* ${data.email || "Not provided"}\n` +
          `• *Phone:* ${data.phone || "Not provided"}\n` +
          (data.comments ? `• *Comments:* ${data.comments}\n` : "") +
          `\n_Sent from official website https://lafresquehotel.com_`;
      } else {
        msg = `*Consulta de Reserva — Hotel La Fresque*\n\n` +
          `• *Pasajero:* ${data.name}\n` +
          `• *Fecha de Entrada:* ${data.checkin}\n` +
          `• *Fecha de Salida:* ${data.checkout}\n` +
          `• *Huéspedes:* ${data.guests}\n` +
          `• *Habitación:* ${data.room}\n` +
          `• *Email:* ${data.email || "No indicado"}\n` +
          `• *Teléfono:* ${data.phone || "No indicado"}\n` +
          (data.comments ? `• *Comentarios:* ${data.comments}\n` : "") +
          `\n_Enviado desde el sitio web oficial https://lafresquehotel.com_`;
      }

      const whatsappUrl = `https://api.whatsapp.com/send?phone=5491128590958&text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, "_blank");
      closeBookingModal();
      showToast(t.toast_whatsapp_open, "success");
    });
  }

  // Direct Online Booking Link Handling
  if (directBookingBtn) {
    directBookingBtn.addEventListener("click", () => {
      setTimeout(() => {
        closeBookingModal();
      }, 300);
    });
  }
}

// --- 6. ROOMS TAB FILTERING ---
function setupRoomsTabs() {
  const tabs = document.querySelectorAll(".room-tab-btn");
  const cards = document.querySelectorAll(".room-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const filter = tab.getAttribute("data-room-tab");

      cards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// --- 7. ROOM PHOTO THUMBNAILS ---
function setupRoomThumbnails() {
  const cards = document.querySelectorAll(".room-card");
  cards.forEach((card) => {
    const mainImg = card.querySelector(".room-main-img");
    const thumbs = card.querySelectorAll(".room-thumb");
    if (!mainImg || thumbs.length === 0) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");

        const targetSrc = thumb.getAttribute("data-full-src") || thumb.getAttribute("src");
        const targetAlt = thumb.getAttribute("alt") || mainImg.alt;

        // Smooth fade effect
        mainImg.style.opacity = "0.2";
        setTimeout(() => {
          mainImg.src = targetSrc;
          mainImg.alt = targetAlt;
          mainImg.style.opacity = "1";
        }, 140);
      });
    });

    // View authentic photos button in room card
    const viewPhotosBtn = card.querySelector(".btn-view-room-photos");
    if (viewPhotosBtn) {
      viewPhotosBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const gallerySection = document.getElementById("gallery");
        if (gallerySection) {
          const archiveGrid = document.getElementById("galleryArchiveGrid");
          const toggleBtn = document.getElementById("toggleFullGallery");
          if (archiveGrid && archiveGrid.hasAttribute("hidden") && toggleBtn) {
            toggleBtn.click();
          }

          const header = document.querySelector(".site-header");
          const offset = header ? header.offsetHeight : 74;
          const pos = gallerySection.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: pos, behavior: "smooth" });
        }
      });
    }
  });
}

// --- 8. PHOTO GALLERY & LIGHTBOX ---
function setupGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const archiveGrid = document.getElementById("galleryArchiveGrid");
  const toggleBtn = document.getElementById("toggleFullGallery");
  const toggleBtnText = document.getElementById("toggleFullGalleryText");
  const lightbox = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  let currentGalleryIndex = 0;
  const visibleItems = Array.from(items);

  // Discreet Toggle for Full Gallery Archive
  if (toggleBtn && archiveGrid) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = archiveGrid.hasAttribute("hidden");
      const lang = window.currentAppLang || "es";
      const t = translations[lang] || translations.es;

      if (isHidden) {
        archiveGrid.removeAttribute("hidden");
        toggleBtn.setAttribute("aria-expanded", "true");
        if (toggleBtnText) {
          toggleBtnText.setAttribute("data-i18n", "gallery_collapse_all");
          toggleBtnText.textContent = t.gallery_collapse_all;
        }
      } else {
        archiveGrid.setAttribute("hidden", "");
        toggleBtn.setAttribute("aria-expanded", "false");
        if (toggleBtnText) {
          toggleBtnText.setAttribute("data-i18n", "gallery_explore_all");
          toggleBtnText.textContent = t.gallery_explore_all;
        }
      }
    });
  }

  // Open Lightbox
  function showLightbox(index) {
    if (!visibleItems[index]) return;
    currentGalleryIndex = index;
    const item = visibleItems[index];
    window.activeLightboxItem = item;

    const imgEl = item.querySelector("img");
    const captionKey = item.getAttribute("data-caption-i18n");
    const lang = window.currentAppLang || "es";
    const t = translations[lang] || translations.es;

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;

    if (captionKey && t[captionKey]) {
      lightboxCaption.textContent = t[captionKey];
    } else {
      const captionTitleEl = item.querySelector(".gallery-caption-title, .museum-caption-title");
      lightboxCaption.textContent = captionTitleEl ? captionTitleEl.textContent : imgEl.alt;
    }

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function hideLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    window.activeLightboxItem = null;
  }

  function showNextImage() {
    if (visibleItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % visibleItems.length;
    showLightbox(currentGalleryIndex);
  }

  function showPrevImage() {
    if (visibleItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + visibleItems.length) % visibleItems.length;
    showLightbox(currentGalleryIndex);
  }

  items.forEach((item) => {
    if (!item.hasAttribute("tabindex")) {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
    }
    item.addEventListener("click", () => {
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) showLightbox(idx);
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const idx = visibleItems.indexOf(item);
        if (idx !== -1) showLightbox(idx);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", hideLightbox);
  if (nextBtn) nextBtn.addEventListener("click", showNextImage);
  if (prevBtn) prevBtn.addEventListener("click", showPrevImage);

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) hideLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("active")) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowRight") showNextImage();
    if (e.key === "ArrowLeft") showPrevImage();
  });
}

// --- 9. CONTACT FORM HANDLER ---
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("contactName")?.value || "").trim();
    const email = (document.getElementById("contactEmail")?.value || "").trim();
    const message = (document.getElementById("contactMessage")?.value || "").trim();
    const phone = (document.getElementById("contactPhone")?.value || "").trim();

    const lang = window.currentAppLang || "es";
    const t = translations[lang] || translations.es;

    if (!name || !email || !message) {
      showToast(t.toast_valid_fields, "error");
      return;
    }

    const submitBtn = form.querySelector("button[type=\"submit\"]");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = t.form_msg_sending || "Enviando...";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      form.reset();

      showToast(t.toast_contact_success, "success");

      const subject = encodeURIComponent(`Consulta Web: ${name}`);
      const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${message}`);
      window.location.href = `mailto:info@lafresquehotel.com?subject=${subject}&body=${body}`;
    }, 500);
  });
}

// --- 10. TOAST NOTIFICATION HELPER ---
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg = type === "success" 
    ? `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`
    : `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    <span class="toast-icon-wrapper">${iconSvg}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 320);
  }, 4200);
}
