/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - MAIN CLIENT APPLICATION JAVASCRIPT
 * Navigation, Interactive Symptom Locator, Insurance Lookup, Forms & Carousel
 * ==========================================================================
 */

// Symptom Locator Data Matrix
const SYMPTOM_TREATMENT_MAP = {
  sciatica: {
    title: "Sciatica & Lumbar Disc Herniation (L4-S1)",
    therapy: "Hijama (Wet Cupping) & Spinal Mobilization",
    avoidedSurgery: "Lumbar Laminectomy & Discectomy",
    recoveryTime: "3 to 5 weeks (non-invasive)",
    description: "Clears blood stagnation and lymphatic compression around the sciatic nerve root, restoring disc hydration and relieving radiating leg pain naturally.",
    specialistId: "dr-amina-khalil"
  },
  migraine: {
    title: "Intractable Migraine & Cluster Headaches",
    therapy: "Cranial Acupuncture & Unani Herbal Formulations",
    avoidedSurgery: "Nerve Decompression Surgery & Chronic Injections",
    recoveryTime: "4 to 6 sessions",
    description: "Balances vascular spasm, regulates cerebral blood flow, and eliminates humoral heat toxins triggering cranial inflammation.",
    specialistId: "dr-wei-chen-tcm"
  },
  ibs: {
    title: "IBS, Chronic Gastritis & GERD / Acid Reflux",
    therapy: "Unani Phytopharmacology & Dietary Mizaj Balance",
    avoidedSurgery: "Gallbladder Removal & Chronic PPI Dependency",
    recoveryTime: "6 to 8 weeks",
    description: "Strengthens stomach lining, soothes inflammation, and normalizes gut microbiota using ancient botanical tonics and digestive temperament balance.",
    specialistId: "dr-tariq-al-mansoor"
  },
  arthritis: {
    title: "Knee Osteoarthritis & Frozen Shoulder",
    therapy: "Eastern Chiropractic Alignment & Balsam Oil Fomentation",
    avoidedSurgery: "Total Knee Replacement & Shoulder Arthroscopy",
    recoveryTime: "4 to 6 weeks",
    description: "Restores joint synovial fluid balance, releases periarticular fascial adhesions, and improves range of motion without prosthetic implants.",
    specialistId: "dr-rashid-qadri"
  },
  varicose: {
    title: "Varicose Veins & Peripheral Vascular Stasis",
    therapy: "Medicinal Leeching (Hirudotherapy) & Hijama",
    avoidedSurgery: "Vein Stripping & Endovenous Laser Ablation",
    recoveryTime: "3 to 4 sessions",
    description: "Natural hirudin and anti-thrombotic enzymes dissolve localized micro-clots, decongest heavy legs, and heal chronic venous skin discoloration.",
    specialistId: "dr-zayd-farooqi"
  },
  hormonal: {
    title: "PCOS, Thyroid Imbalance & Chronic Fatigue",
    therapy: "Naturopathic Detoxification & Endocrine Herbal Regimens",
    avoidedSurgery: "Ovarian Drilling & Lifelong Synthetic Hormones",
    recoveryTime: "8 to 12 weeks",
    description: "Restores hypothalamic-pituitary-ovarian axis harmony, reduces insulin resistance, and detoxifies cellular metabolic residue.",
    specialistId: "dr-maryam-siddiqui"
  }
};

// Supported Insurance & Corporate Panels
const INSURANCE_PANELS = [
  { name: "Allianz Global Health", coverage: "100% Non-Surgical & Acupuncture Covered", tier: "Direct Billing" },
  { name: "Cigna International", coverage: "Covered under Complementary & Alternative Medicine", tier: "Direct Billing" },
  { name: "Bupa Global Healthcare", coverage: "Specialist Eastern Therapies & Hijama Covered", tier: "Pre-Approval" },
  { name: "Aetna International", coverage: "Outpatient Holistic & Chiropractic Covered", tier: "Direct Billing" },
  { name: "MetLife Medical", coverage: "Approved for Musculoskeletal Non-Surgical Protocols", tier: "Claim Reimbursement" },
  { name: "AXA Health Plan", coverage: "Covers Certified Unani & Acupuncture Consultations", tier: "Direct Billing" },
  { name: "Jubilee Health Insurance", coverage: "Full Coverage for Non-Surgical Rehabilitation", tier: "Direct Billing" },
  { name: "Adamjee Health Insurance", coverage: "Covered for Pain Management & Holistic Therapies", tier: "Claim Reimbursement" }
];

/**
 * Initializes Main Interactions on DOM Load
 */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileDrawer();
  initSymptomLocator();
  initInsuranceSearch();
  initTestimonialCarousel();
  initContactAndCallbackForms();
});

/**
 * Sticky Header Scroll Listener
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Mobile Drawer Menu
 */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('drawerCloseBtn');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Close drawer when clicking any drawer link
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/**
 * Interactive Symptom Locator Tool
 */
function initSymptomLocator() {
  const chips = document.querySelectorAll('.symptom-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const symptomKey = chip.getAttribute('data-symptom');
      displaySymptomResult(symptomKey);
    });
  });

  // Display first symptom by default if exists
  if (chips.length > 0) {
    displaySymptomResult('sciatica');
  }
}

function displaySymptomResult(symptomKey) {
  const resultPanel = document.getElementById('symptomResultPanel');
  if (!resultPanel) return;

  const data = SYMPTOM_TREATMENT_MAP[symptomKey];
  if (!data) return;

  resultPanel.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: center;">
      <div>
        <div class="badge-tag" style="background: rgba(16, 185, 129, 0.2); color: #34D399; margin-bottom: 0.5rem;">
          <i class="fas fa-check-circle"></i> Non-Surgical Alternative Available
        </div>
        <h3 style="color: #FFFFFF; font-size: 1.5rem; margin-bottom: 0.75rem;">${data.title}</h3>
        <p style="color: #CBD5E1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
          ${data.description}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: rgba(255, 255, 255, 0.08); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; font-weight: 600;">Recommended Therapy</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #34D399;">${data.therapy}</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.1); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid rgba(239, 68, 68, 0.2);">
            <div style="font-size: 0.75rem; color: #FCA5A5; text-transform: uppercase; font-weight: 600;">Surgery Avoided</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #EF4444;">${data.avoidedSurgery}</div>
          </div>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.05); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.15); text-align: center;">
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 0.35rem;">Typical Non-Surgical Course</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #FBBF24; margin-bottom: 1rem;">${data.recoveryTime}</div>
        <button class="btn btn-primary" style="width: 100%;" onclick="startBookingWithDoctor('${data.specialistId}')">
          <i class="fas fa-calendar-check"></i> Book Non-Surgical Evaluation
        </button>
      </div>
    </div>
  `;

  resultPanel.classList.add('active');
}

/**
 * Dynamic Insurance Panel Search Filter
 */
function initInsuranceSearch() {
  const searchInput = document.getElementById('insuranceSearchInput');
  const resultsContainer = document.getElementById('insuranceResultsGrid');

  function renderInsurance(query = '') {
    if (!resultsContainer) return;
    
    const filtered = INSURANCE_PANELS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.coverage.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-muted);">
          No insurance panel match found. We also provide official medical receipts for direct claim reimbursement.
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <div style="background: #FFFFFF; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <h4 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 2px;">${item.name}</h4>
          <div style="font-size: 0.825rem; color: var(--color-jade); font-weight: 600;">${item.coverage}</div>
        </div>
        <span class="badge-tag" style="margin-bottom: 0; font-size: 0.75rem;">${item.tier}</span>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderInsurance(e.target.value.trim()));
  }

  renderInsurance();
}

/**
 * Testimonials Carousel
 */
function initTestimonialCarousel() {
  let currentIndex = 0;
  const cards = document.querySelectorAll('.testimonial-slide');
  if (cards.length === 0) return;

  function showSlide(index) {
    cards.forEach((card, i) => {
      card.style.display = i === index ? 'block' : 'none';
    });
  }

  const prevBtn = document.getElementById('testimonialPrevBtn');
  const nextBtn = document.getElementById('testimonialNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      showSlide(currentIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % cards.length;
      showSlide(currentIndex);
    });
  }

  showSlide(0);

  // Auto slide every 6 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    showSlide(currentIndex);
  }, 6000);
}

/**
 * Contact Form & Urgent Callback Submissions
 */
function initContactAndCallbackForms() {
  // Urgent Callback Form in Topbar or Hero
  const callbackForm = document.getElementById('urgentCallbackForm');
  if (callbackForm) {
    callbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = callbackForm.querySelector('input[type="tel"]');
      const nameInput = callbackForm.querySelector('input[type="text"]');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const name = nameInput ? nameInput.value.trim() : 'Urgent Caller';

      if (!phone) {
        if (window.showToast) window.showToast('Please enter your phone number.', 'error');
        return;
      }

      const payload = {
        name: name,
        phone: phone,
        type: 'urgent_callback_request',
        submittedAt: new Date().toISOString()
      };

      if (window.ClinicDB) await window.ClinicDB.saveInquiry(payload);
      if (window.dispatchN8nWebhook) await window.dispatchN8nWebhook('urgent_callback', payload);

      if (phoneInput) phoneInput.value = '';
      if (nameInput) nameInput.value = '';

      if (window.showToast) {
        window.showToast('Priority callback received! A senior clinical triage coordinator will call you within 10 minutes.', 'success');
      }
    });
  }

  // General Contact Form
  const contactForm = document.getElementById('generalContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        if (window.showToast) window.showToast('Please fill in required contact fields.', 'error');
        return;
      }

      const payload = {
        name, email, phone, message,
        submittedAt: new Date().toISOString()
      };

      if (window.ClinicDB) await window.ClinicDB.saveInquiry(payload);
      if (window.dispatchN8nWebhook) await window.dispatchN8nWebhook('contact_inquiry', payload);

      contactForm.reset();
      if (window.showToast) {
        window.showToast('Thank you for contacting Al-Mualij! We will respond to your medical inquiry promptly.', 'success');
      }
    });
  }
}

// Global exposure
window.SYMPTOM_TREATMENT_MAP = SYMPTOM_TREATMENT_MAP;
window.displaySymptomResult = displaySymptomResult;
