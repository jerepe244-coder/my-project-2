/**
 * Hotel La Fresque — Avenida de Mayo 984, Buenos Aires
 * Core Client Application (ES / EN Bilingual, Gallery Lightbox, Booking Engine, Mobile Drawer)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. STATE & INITIALIZATION ---
  let currentLang = 'es';
  const savedLang = localStorage.getItem('lafresque_lang');
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get('lang');

  if (langFromUrl && ['es', 'en'].includes(langFromUrl.toLowerCase())) {
    currentLang = langFromUrl.toLowerCase();
  } else if (savedLang && ['es', 'en'].includes(savedLang)) {
    currentLang = savedLang;
  } else {
    const userBrowserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (userBrowserLang.startsWith('en')) {
      currentLang = 'en';
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
  setupGallery();
  setupContactForm();
});

// --- 2. BILINGUAL TRANSLATION ENGINE ---
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('lafresque_lang', lang);
  document.documentElement.lang = lang;

  const t = translations[lang];

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update HTML content (for elements that might contain styled tags)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.setAttribute('placeholder', t[key]);
    }
  });

  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (t[key]) {
      el.setAttribute('aria-label', t[key]);
    }
  });

  // Update Language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  // Update page title & meta descriptions
  if (lang === 'es') {
    document.title = "Hotel La Fresque — Avenida de Mayo 984, Buenos Aires | Sitio Oficial";
  } else {
    document.title = "Hotel La Fresque — Avenida de Mayo 984, Buenos Aires | Official Site";
  }
}

function setupLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selected = btn.getAttribute('data-lang');
      setLanguage(selected);
    });
  });
}

// --- 3. NAVIGATION & SCROLL BEHAVIOR ---
function setupNavigation() {
  const header = document.querySelector('.site-header');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.mobile-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

  // Sticky header background
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Open mobile drawer
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Close mobile drawer
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Smooth scroll offset calculation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight || 80;
        const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
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

  const formatDate = (date) => date.toISOString().split('T')[0];

  const checkinInputs = document.querySelectorAll('input[type="date"][id*="checkin"]');
  const checkoutInputs = document.querySelectorAll('input[type="date"][id*="checkout"]');

  checkinInputs.forEach(input => {
    input.min = formatDate(today);
    if (!input.value) input.value = formatDate(today);

    input.addEventListener('change', () => {
      const selected = new Date(input.value);
      const nextDay = new Date(selected);
      nextDay.setDate(selected.getDate() + 1);
      checkoutInputs.forEach(outInput => {
        outInput.min = formatDate(nextDay);
        if (new Date(outInput.value) <= selected) {
          outInput.value = formatDate(nextDay);
        }
      });
    });
  });

  checkoutInputs.forEach(input => {
    input.min = formatDate(tomorrow);
    if (!input.value) input.value = formatDate(tomorrow);
  });
}

// --- 5. BOOKING SYSTEM & MODAL ---
function setupBookingSystem() {
  const modal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('closeBookingModal');
  const openModalBtns = document.querySelectorAll('[data-open-booking]');
  const bookingBarForm = document.getElementById('quickBookingForm');
  const modalForm = document.getElementById('modalBookingForm');
  const sendWhatsAppBtn = document.getElementById('modalSendWhatsApp');
  const sendEmailBtn = document.getElementById('modalSendEmail');

  function openBookingModal(initialRoom = '') {
    if (!modal) return;
    if (initialRoom) {
      const modalRoomSelect = document.getElementById('modalRoomType');
      if (modalRoomSelect) modalRoomSelect.value = initialRoom;
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const roomPref = btn.getAttribute('data-room') || '';
      openBookingModal(roomPref);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeBookingModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBookingModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeBookingModal();
    }
  });

  // Quick Booking Bar handler
  if (bookingBarForm) {
    bookingBarForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkinVal = document.getElementById('barCheckin').value;
      const checkoutVal = document.getElementById('barCheckout').value;
      const guestsVal = document.getElementById('barGuests').value;
      const roomVal = document.getElementById('barRoomType').value;

      // Transfer values to modal
      if (document.getElementById('modalCheckin')) document.getElementById('modalCheckin').value = checkinVal;
      if (document.getElementById('modalCheckout')) document.getElementById('modalCheckout').value = checkoutVal;
      if (document.getElementById('modalGuests')) document.getElementById('modalGuests').value = guestsVal;
      if (document.getElementById('modalRoomType')) document.getElementById('modalRoomType').value = roomVal;

      openBookingModal(roomVal);
    });
  }

  // Format booking details
  function getBookingData() {
    return {
      name: (document.getElementById('modalName')?.value || '').trim(),
      email: (document.getElementById('modalEmail')?.value || '').trim(),
      phone: (document.getElementById('modalPhone')?.value || '').trim(),
      checkin: document.getElementById('modalCheckin')?.value || '',
      checkout: document.getElementById('modalCheckout')?.value || '',
      guests: document.getElementById('modalGuests')?.value || '2',
      room: document.getElementById('modalRoomType')?.value || 'Cualquiera',
      comments: (document.getElementById('modalComments')?.value || '').trim()
    };
  }

  function validateBooking(data) {
    if (!data.name) {
      showToast(currentLang === 'es' ? 'Por favor ingrese su nombre y apellido.' : 'Please enter your full name.', 'error');
      return false;
    }
    if (!data.email && !data.phone) {
      showToast(currentLang === 'es' ? 'Ingrese un email o teléfono de contacto.' : 'Please enter an email or phone number.', 'error');
      return false;
    }
    return true;
  }

  // WhatsApp Dispatch
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getBookingData();
      if (!validateBooking(data)) return;

      const isEs = currentLang === 'es';
      const msg = isEs 
        ? `*Consulta de Reserva — Hotel La Fresque*\n\n` +
          `• *Pasajero:* ${data.name}\n` +
          `• *Fecha de Entrada:* ${data.checkin}\n` +
          `• *Fecha de Salida:* ${data.checkout}\n` +
          `• *Huéspedes:* ${data.guests}\n` +
          `• *Habitación:* ${data.room}\n` +
          `• *Email:* ${data.email || 'No indicado'}\n` +
          `• *Teléfono:* ${data.phone || 'No indicado'}\n` +
          (data.comments ? `• *Comentarios:* ${data.comments}\n` : '') +
          `\n_Enviado desde el sitio web oficial https://lafresquehotel.com_`
        : `*Reservation Inquiry — Hotel La Fresque*\n\n` +
          `• *Guest Name:* ${data.name}\n` +
          `• *Check-in Date:* ${data.checkin}\n` +
          `• *Check-out Date:* ${data.checkout}\n` +
          `• *Guests:* ${data.guests}\n` +
          `• *Room Category:* ${data.room}\n` +
          `• *Email:* ${data.email || 'Not provided'}\n` +
          `• *Phone:* ${data.phone || 'Not provided'}\n` +
          (data.comments ? `• *Comments:* ${data.comments}\n` : '') +
          `\n_Sent from official website https://lafresquehotel.com_`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=5491128590958&text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
      closeBookingModal();
      showToast(isEs ? 'Abriendo WhatsApp con su consulta...' : 'Opening WhatsApp with your inquiry...', 'success');
    });
  }

  // Email Dispatch
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getBookingData();
      if (!validateBooking(data)) return;

      const isEs = currentLang === 'es';
      const subject = isEs 
        ? `Consulta de Reserva: ${data.name} (${data.checkin} al ${data.checkout})`
        : `Reservation Inquiry: ${data.name} (${data.checkin} to ${data.checkout})`;

      const body = isEs
        ? `Estimado equipo de Hotel La Fresque,\n\n` +
          `Deseo consultar disponibilidad para la siguiente estadía:\n\n` +
          `Nombre del pasajero: ${data.name}\n` +
          `Fecha de Check-in: ${data.checkin}\n` +
          `Fecha de Check-out: ${data.checkout}\n` +
          `Cantidad de Huéspedes: ${data.guests}\n` +
          `Categoría solicitada: ${data.room}\n` +
          `Teléfono de contacto: ${data.phone}\n` +
          `Correo electrónico: ${data.email}\n` +
          (data.comments ? `Requerimientos o comentarios: ${data.comments}\n` : '') +
          `\nAgradezco me informen tarifas y disponibilidad.\n\nAtentamente,\n${data.name}`
        : `Dear Hotel La Fresque Team,\n\n` +
          `I would like to inquire about availability for the following stay:\n\n` +
          `Guest Name: ${data.name}\n` +
          `Check-in Date: ${data.checkin}\n` +
          `Check-out Date: ${data.checkout}\n` +
          `Guests: ${data.guests}\n` +
          `Requested Room: ${data.room}\n` +
          `Contact Phone: ${data.phone}\n` +
          `Email: ${data.email}\n` +
          (data.comments ? `Special Requests: ${data.comments}\n` : '') +
          `\nPlease confirm rates and availability.\n\nBest regards,\n${data.name}`;

      const mailtoUrl = `mailto:info@lafresquehotel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      closeBookingModal();
      showToast(isEs ? 'Abriendo cliente de correo electrónico...' : 'Opening email client...', 'success');
    });
  }
}

// --- 6. ROOMS TAB FILTERING ---
function setupRoomsTabs() {
  const tabs = document.querySelectorAll('.room-tab-btn');
  const cards = document.querySelectorAll('.room-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-room-tab');

      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- 7. PHOTO GALLERY & LIGHTBOX ---
function setupGallery() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  let visibleItems = Array.from(items);

  // Gallery Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filter === 'all' || itemCat.includes(filter)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      visibleItems = Array.from(items).filter(i => i.style.display !== 'none');
    });
  });

  // Open Lightbox
  function showLightbox(index) {
    if (!visibleItems[index]) return;
    currentGalleryIndex = index;
    const item = visibleItems[index];
    const imgEl = item.querySelector('img');
    const captionEl = item.querySelector('.gallery-caption-title');

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightboxCaption.textContent = captionEl ? captionEl.textContent : imgEl.alt;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % visibleItems.length;
    showLightbox(currentGalleryIndex);
  }

  function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + visibleItems.length) % visibleItems.length;
    showLightbox(currentGalleryIndex);
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) showLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNextImage);
  if (prevBtn) prevBtn.addEventListener('click', showPrevImage);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) hideLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });
}

// --- 8. CONTACT FORM HANDLER ---
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (document.getElementById('contactName')?.value || '').trim();
    const email = (document.getElementById('contactEmail')?.value || '').trim();
    const message = (document.getElementById('contactMessage')?.value || '').trim();
    const phone = (document.getElementById('contactPhone')?.value || '').trim();

    if (!name || !email || !message) {
      showToast(currentLang === 'es' ? 'Por favor complete todos los campos obligatorios.' : 'Please fill in all required fields.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';

    // Formats mailto link or dispatches
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      form.reset();

      const isEs = currentLang === 'es';
      showToast(
        isEs ? '¡Gracias! Su mensaje ha sido enviado a la recepción del hotel.' : 'Thank you! Your message has been sent to our reception.',
        'success'
      );

      // Open mailto fallback
      const subject = encodeURIComponent(`Consulta Web: ${name}`);
      const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${message}`);
      window.location.href = `mailto:info@lafresquehotel.com?subject=${subject}&body=${body}`;
    }, 600);
  });
}

// --- 9. TOAST NOTIFICATION HELPER ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}
