/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - DOCTORS DIRECTORY & SPECIALISTS DATA ENGINE
 * Client-Side Filtering, Interactive Practitioner Modals & Booking Hooks
 * ==========================================================================
 */

const CLINIC_DOCTORS = [
  {
    id: "dr-tariq-al-mansoor",
    name: "Hakim Dr. Tariq Al-Mansoor",
    title: "Chief Consultant of Unani Medicine & Pulse Diagnosis",
    specialty: "unani",
    specialtyLabel: "Unani Herbal Medicine",
    degrees: "B.U.M.S, M.D. (Unani Pharmacology), 22+ Yrs Exp.",
    rating: 4.95,
    reviewsCount: 342,
    fee: "$75 / Consultation",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    bio: "Internationally renowned Hakim with over two decades of clinical mastery in Nabz (Pulse Diagnosis) and complex chronic metabolic, liver, and gastrointestinal conditions. Specializes in reversing chronic systemic imbalances without surgical or invasive interventions.",
    certifications: [
      "Board Certified Unani Physician (AUSH)",
      "Fellowship in Herbal Phytochemistry (Cairo)",
      "Senior Member of International Eastern Medicine Council"
    ],
    availability: "Mon, Tue, Thu, Sat (09:00 AM - 04:00 PM)",
    avoidedSurgeriesCount: "1,200+ Gallbladder & Digestive Avoidances"
  },
  {
    id: "dr-amina-khalil",
    name: "Dr. Amina Khalil (PT, Hijama Specialist)",
    title: "Head of Therapeutic Hijama & Fascial Release",
    specialty: "hijama",
    specialtyLabel: "Hijama (Wet Cupping)",
    degrees: "DPT, Certified Wet Cupping Practitioner (UK), 14+ Yrs Exp.",
    rating: 4.98,
    reviewsCount: 512,
    fee: "$65 / Session",
    avatar: "https://images.unsplash.com/photo-1594824813501-48434e12e9e2?auto=format&fit=crop&w=600&q=80",
    bio: "Pioneer in modern aseptic Hijama therapy combined with neuromuscular rehabilitation. Specializes in chronic disc herniations, sciatica, cervical radiculopathy, and athletic micro-trauma healing without surgical incisions.",
    certifications: [
      "Certified Hijama Therapist (GCT UK)",
      "Doctor of Physical Therapy (DPT)",
      "Specialized in Lymphatic Drainage & Fascial Decompression"
    ],
    availability: "Daily (10:00 AM - 06:00 PM)",
    avoidedSurgeriesCount: "850+ Lumbar & Cervical Spine Avoidances"
  },
  {
    id: "dr-wei-chen-tcm",
    name: "Dr. Wei Chen (L.Ac, Dipl. O.M.)",
    title: "Senior Acupuncturist & Moxibustion Master",
    specialty: "acupuncture",
    specialtyLabel: "Acupuncture & Moxa",
    degrees: "M.S. Traditional Chinese Medicine, NCCAOM Certified, 18+ Yrs Exp.",
    rating: 4.92,
    reviewsCount: 280,
    fee: "$80 / Session",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    bio: "Master of meridian stimulation and electro-acupuncture for severe neurological and vascular pain. Helped hundreds of patients overcome intractable migraines, trigeminal neuralgia, and osteoarthritis without steroid injections or joint replacements.",
    certifications: [
      "Diplomate of Oriental Medicine (NCCAOM)",
      "Certified Classical Moxibustion Specialist",
      "Member of World Federation of Acupuncture Societies"
    ],
    availability: "Mon, Wed, Fri, Sun (09:30 AM - 05:30 PM)",
    avoidedSurgeriesCount: "620+ Knee & Neurological Avoidances"
  },
  {
    id: "dr-rashid-qadri",
    name: "Dr. Rashid Qadri (D.C., Eastern Bone Setter)",
    title: "Master of Eastern Chiropractic & Musculoskeletal Realignment",
    specialty: "chiropractic",
    specialtyLabel: "Chiropractic Alignment",
    degrees: "D.C. (Chiropractic), Traditional Bone Setting Guild, 16+ Yrs Exp.",
    rating: 4.94,
    reviewsCount: 418,
    fee: "$70 / Session",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80",
    bio: "Combines ancient Eastern osteopathic traction with modern chiropractic biomechanics. Provides gentle, non-surgical correction for scoliosis, frozen shoulder, pelvic torsion, and sports spinal damage.",
    certifications: [
      "Doctor of Chiropractic (D.C.)",
      "Traditional Spinal Realignment Certification",
      "Postural Biomechanics Specialist"
    ],
    availability: "Tue, Thu, Sat (11:00 AM - 07:00 PM)",
    avoidedSurgeriesCount: "940+ Shoulder & Spine Surgeries Avoided"
  },
  {
    id: "dr-maryam-siddiqui",
    name: "Dr. Maryam Siddiqui (N.D., Unani Herbalist)",
    title: "Consultant Naturopath & Metabolic Detox Specialist",
    specialty: "naturopathy",
    specialtyLabel: "Naturopathy & Detox",
    degrees: "Doctor of Naturopathy (N.D.), B.Sc. Clinical Nutrition, 12+ Yrs Exp.",
    rating: 4.89,
    reviewsCount: 195,
    fee: "$60 / Consultation",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    bio: "Integrates clinical therapeutic nutrition with ancient herbal tonics to treat autoimmune disorders, hormonal imbalances (PCOS, thyroid), and chronic inflammatory conditions naturally.",
    certifications: [
      "Board Certified Naturopathic Physician",
      "Certified Clinical Phytotherapist",
      "Expert in Humoral (Mizaj) Dietetics"
    ],
    availability: "Mon, Tue, Wed, Fri (10:00 AM - 04:00 PM)",
    avoidedSurgeriesCount: "480+ Thyroid & Laparoscopy Avoidances"
  },
  {
    id: "dr-zayd-farooqi",
    name: "Hakim Zayd Farooqi",
    title: "Senior Chronic Pain & Leech Therapy (Jalook) Specialist",
    specialty: "hijama",
    specialtyLabel: "Hijama & Leech Therapy",
    degrees: "B.U.M.S, Advanced Hirudotherapy Certification, 15+ Yrs Exp.",
    rating: 4.96,
    reviewsCount: 310,
    fee: "$70 / Session",
    avatar: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?auto=format&fit=crop&w=600&q=80",
    bio: "Specializes in therapeutic Hirudotherapy (medicinal leeching) and targeted dry/wet cupping for non-healing ulcers, varicose veins, localized blood stagnation, and chronic tendonitis.",
    certifications: [
      "Certified Medicinal Hirudotherapist",
      "Senior Unani Clinical Practitioner",
      "Vascular Stagnation Specialist"
    ],
    availability: "Wed, Thu, Fri, Sun (11:00 AM - 06:00 PM)",
    avoidedSurgeriesCount: "530+ Varicose Vein & Amputation Avoidances"
  }
];

/**
 * Renders Doctor Cards into the grid container with dynamic filtering
 * @param {string} filter - 'all' or specialty key
 */
function renderDoctors(filter = 'all') {
  const container = document.getElementById('doctorsGrid');
  if (!container) return;

  const filtered = filter === 'all' 
    ? CLINIC_DOCTORS 
    : CLINIC_DOCTORS.filter(d => d.specialty === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
        <p style="color: var(--color-text-muted); font-size: 1.1rem;">No specialists found for this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(doc => `
    <div class="doctor-card" data-specialty="${doc.specialty}">
      <div class="doctor-avatar-wrap">
        <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar" loading="lazy">
        <div class="doctor-specialty-badge">${doc.specialtyLabel}</div>
      </div>
      <div class="doctor-body">
        <h3 class="doctor-name">${doc.name}</h3>
        <div class="doctor-degrees">${doc.degrees}</div>
        
        <div class="doctor-experience">
          <i class="fas fa-certificate" style="color: var(--color-jade);"></i>
          <span>${doc.title}</span>
        </div>

        <div class="doctor-rating">
          <i class="fas fa-star"></i>
          <span>${doc.rating}</span>
          <span style="color: var(--color-text-light); font-size: 0.8rem; font-weight: normal;">(${doc.reviewsCount} verified reviews)</span>
        </div>

        <div style="font-size: 0.85rem; color: var(--color-jade); font-weight: 600; margin-bottom: 1.25rem;">
          <i class="fas fa-shield-alt"></i> ${doc.avoidedSurgeriesCount}
        </div>

        <div class="doctor-actions">
          <button class="btn btn-outline btn-sm" onclick="openDoctorModal('${doc.id}')">
            View Profile
          </button>
          <button class="btn btn-primary btn-sm" onclick="startBookingWithDoctor('${doc.id}')">
            Book Visit
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Initializes Doctor filter buttons
 */
function initDoctorFilters() {
  const buttons = document.querySelectorAll('.doctors-filter-bar .filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      renderDoctors(filter);
    });
  });
}

/**
 * Opens detailed modal for a specific doctor
 * @param {string} doctorId 
 */
function openDoctorModal(doctorId) {
  const doc = CLINIC_DOCTORS.find(d => d.id === doctorId);
  if (!doc) return;

  let modal = document.getElementById('doctorDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'doctorDetailModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 640px;">
      <button class="modal-close-btn" onclick="closeDoctorModal()">&times;</button>
      
      <div style="display: flex; gap: 1.5rem; padding: 2rem; background: var(--color-bg-alt); border-bottom: 1px solid var(--color-border); align-items: center;">
        <img src="${doc.avatar}" alt="${doc.name}" style="width: 100px; height: 100px; border-radius: var(--radius-lg); object-fit: cover; border: 3px solid var(--color-jade-light);">
        <div>
          <div class="badge-tag" style="margin-bottom: 0.35rem;">${doc.specialtyLabel}</div>
          <h2 style="font-size: 1.4rem; color: var(--color-primary);">${doc.name}</h2>
          <div style="font-size: 0.85rem; color: var(--color-jade); font-weight: 600;">${doc.degrees}</div>
          <div style="font-size: 0.85rem; color: var(--color-gold); margin-top: 0.25rem;">
            <i class="fas fa-star"></i> <strong>${doc.rating}</strong> / 5.0 (${doc.reviewsCount} patient reviews)
          </div>
        </div>
      </div>

      <div style="padding: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--color-primary);">Clinical Biography & Philosophy</h4>
          <p style="font-size: 0.925rem; color: var(--color-text-muted); line-height: 1.6;">${doc.bio}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--color-primary);">Verified Certifications & Accreditations</h4>
          <ul style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${doc.certifications.map(c => `
              <li style="font-size: 0.875rem; color: var(--color-text-main); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle" style="color: var(--color-jade);"></i> ${c}
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: var(--color-bg-light); border-radius: var(--radius-md); margin-bottom: 1.75rem; border: 1px solid var(--color-border);">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; font-weight: 600;">Consultation Fee</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary);">${doc.fee}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; font-weight: 600;">Clinic Hours</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-jade);">${doc.availability}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button class="btn btn-outline" onclick="closeDoctorModal()">Close</button>
          <button class="btn btn-primary" onclick="closeDoctorModal(); startBookingWithDoctor('${doc.id}');">
            <i class="fas fa-calendar-check"></i> Book Consultation Now
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  lockBodyScroll();
}

function closeDoctorModal() {
  const modal = document.getElementById('doctorDetailModal');
  if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }
}

/**
 * Preselects doctor and opens the Multi-step booking engine
 * @param {string} doctorId 
 */
function startBookingWithDoctor(doctorId) {
  if (window.openBookingWithDoctorId) {
    window.openBookingWithDoctorId(doctorId);
  } else if (window.openBookingModal) {
    window.openBookingModal();
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  renderDoctors('all');
  initDoctorFilters();
});

// Global exposure
window.CLINIC_DOCTORS = CLINIC_DOCTORS;
window.renderDoctors = renderDoctors;
window.openDoctorModal = openDoctorModal;
window.closeDoctorModal = closeDoctorModal;
window.startBookingWithDoctor = startBookingWithDoctor;
