/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - MULTI-STEP BOOKING ENGINE
 * State Manager, Firestore Database Sync, n8n Webhook Dispatch & Slip Generator
 * ==========================================================================
 */

// Global Booking State
const bookingState = {
  currentStep: 1,
  totalSteps: 4,
  data: {
    specialtyId: 'hijama',
    specialtyName: 'Hijama (Wet Cupping Therapy)',
    doctorId: 'dr-amina-khalil',
    doctorName: 'Dr. Amina Khalil (PT, Hijama Specialist)',
    doctorFee: '$65 / Session',
    appointmentDate: '',
    appointmentTime: '10:00 AM',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Female',
    patientSymptoms: '',
    hasInsurance: false,
    insuranceProvider: ''
  }
};

const CLINIC_SPECIALTIES = [
  {
    id: "hijama",
    name: "Hijama (Wet Cupping Therapy)",
    desc: "Targeted vascular & lymphatic micro-extraction to relieve pain and deep muscle stagnation.",
    icon: "fa-tint",
    defaultDoc: "dr-amina-khalil"
  },
  {
    id: "unani",
    name: "Unani Herbal Medicine (Tibb)",
    desc: "Comprehensive humoral temperament (Mizaj) pulse diagnosis and bespoke herbal pharmacology.",
    icon: "fa-leaf",
    defaultDoc: "dr-tariq-al-mansoor"
  },
  {
    id: "acupuncture",
    name: "Acupuncture & Moxibustion",
    desc: "Meridian energy flow stimulation for migraine, neurological, and joint restoration.",
    icon: "fa-bolt",
    defaultDoc: "dr-wei-chen-tcm"
  },
  {
    id: "chiropractic",
    name: "Eastern Chiropractic Alignment",
    desc: "Non-surgical spinal decompression, disc realignment, and posture mobilization.",
    icon: "fa-bone",
    defaultDoc: "dr-rashid-qadri"
  },
  {
    id: "naturopathy",
    name: "Naturopathic Detox & Dietetics",
    desc: "Cellular rejuvenation, anti-inflammatory nutrition, and metabolic harmony.",
    icon: "fa-apple-alt",
    defaultDoc: "dr-maryam-siddiqui"
  },
  {
    id: "chronic-pain",
    name: "Chronic Pain & Leech Therapy",
    desc: "Natural hirudotherapy enzymes for severe varicose veins, sciatica & tendonitis.",
    icon: "fa-heartbeat",
    defaultDoc: "dr-zayd-farooqi"
  }
];

/**
 * Initializes the Multi-step Booking Engine
 */
function initBookingWizard() {
  renderSpecialtyOptions();
  renderProviderOptions();
  generateAvailableTimeSlots();
  setupBookingFormListeners();
  setDefaultBookingDate();
}

/**
 * Render Step 1 Specialties
 */
function renderSpecialtyOptions() {
  const container = document.getElementById('bookingSpecialtyGrid');
  if (!container) return;

  container.innerHTML = CLINIC_SPECIALTIES.map(spec => `
    <div class="specialty-option-card ${bookingState.data.specialtyId === spec.id ? 'selected' : ''}" 
         onclick="selectBookingSpecialty('${spec.id}')">
      <div class="specialty-icon-box">
        <i class="fas ${spec.icon}"></i>
      </div>
      <div class="specialty-info">
        <h4>${spec.name}</h4>
        <p>${spec.desc}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Selects a specialty in Step 1
 */
function selectBookingSpecialty(specId) {
  const spec = CLINIC_SPECIALTIES.find(s => s.id === specId);
  if (!spec) return;

  bookingState.data.specialtyId = spec.id;
  bookingState.data.specialtyName = spec.name;
  
  // Also preselect associated default doctor
  if (spec.defaultDoc) {
    const doc = window.CLINIC_DOCTORS ? window.CLINIC_DOCTORS.find(d => d.id === spec.defaultDoc) : null;
    if (doc) {
      bookingState.data.doctorId = doc.id;
      bookingState.data.doctorName = doc.name;
      bookingState.data.doctorFee = doc.fee;
    }
  }

  renderSpecialtyOptions();
  renderProviderOptions();
}

/**
 * Render Step 2 Doctors based on selected specialty
 */
function renderProviderOptions() {
  const container = document.getElementById('bookingProviderGrid');
  if (!container || !window.CLINIC_DOCTORS) return;

  // Show matching doctors first, then others
  const doctors = [...window.CLINIC_DOCTORS].sort((a, b) => {
    if (a.specialty === bookingState.data.specialtyId) return -1;
    if (b.specialty === bookingState.data.specialtyId) return 1;
    return 0;
  });

  container.innerHTML = doctors.map(doc => `
    <div class="provider-option-card ${bookingState.data.doctorId === doc.id ? 'selected' : ''}" 
         onclick="selectBookingProvider('${doc.id}')">
      <img src="${doc.avatar}" alt="${doc.name}" class="provider-thumb">
      <div class="provider-details">
        <h4>${doc.name}</h4>
        <div class="provider-specialty">${doc.specialtyLabel}</div>
        <div class="provider-fee">Fee: <strong>${doc.fee}</strong></div>
      </div>
    </div>
  `).join('');
}

/**
 * Selects a provider in Step 2
 */
function selectBookingProvider(docId) {
  const doc = window.CLINIC_DOCTORS ? window.CLINIC_DOCTORS.find(d => d.id === docId) : null;
  if (!doc) return;

  bookingState.data.doctorId = doc.id;
  bookingState.data.doctorName = doc.name;
  bookingState.data.doctorFee = doc.fee;
  
  renderProviderOptions();
}

/**
 * Sets default minimum date (tomorrow)
 */
function setDefaultBookingDate() {
  const dateInput = document.getElementById('bookingDateInput');
  if (!dateInput) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  dateInput.min = dateStr;
  dateInput.value = dateStr;
  bookingState.data.appointmentDate = dateStr;
}

/**
 * Generates dynamic Morning/Afternoon/Evening time slots
 */
function generateAvailableTimeSlots() {
  const morningContainer = document.getElementById('morningSlotsGrid');
  const afternoonContainer = document.getElementById('afternoonSlotsGrid');

  const morningSlots = ["09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM", "12:00 PM"];
  const afternoonSlots = ["02:00 PM", "02:45 PM", "03:30 PM", "04:15 PM", "05:00 PM", "05:45 PM"];

  if (morningContainer) {
    morningContainer.innerHTML = morningSlots.map((slot, idx) => `
      <button type="button" class="time-slot-btn ${slot === bookingState.data.appointmentTime ? 'selected' : ''} ${idx === 2 ? 'disabled' : ''}" 
              onclick="selectBookingSlot('${slot}', this)">
        ${slot}
      </button>
    `).join('');
  }

  if (afternoonContainer) {
    afternoonContainer.innerHTML = afternoonSlots.map((slot, idx) => `
      <button type="button" class="time-slot-btn ${slot === bookingState.data.appointmentTime ? 'selected' : ''}" 
              onclick="selectBookingSlot('${slot}', this)">
        ${slot}
      </button>
    `).join('');
  }
}

function selectBookingSlot(slotTime, btnElement) {
  if (btnElement && btnElement.classList.contains('disabled')) return;
  bookingState.data.appointmentTime = slotTime;
  
  document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
  if (btnElement) btnElement.classList.add('selected');
}

/**
 * Step navigation controller
 */
function goToBookingStep(stepNumber) {
  if (stepNumber > bookingState.currentStep) {
    if (!validateCurrentStep(bookingState.currentStep)) {
      return;
    }
  }

  bookingState.currentStep = stepNumber;
  
  // Update step progress bar
  const progressLine = document.getElementById('stepProgressLine');
  const progressPercent = ((stepNumber - 1) / (bookingState.totalSteps - 1)) * 100;
  if (progressLine) progressLine.style.width = `${progressPercent}%`;

  // Update step nodes
  for (let i = 1; i <= bookingState.totalSteps; i++) {
    const node = document.getElementById(`stepNode${i}`);
    if (node) {
      node.classList.remove('active', 'completed');
      if (i === stepNumber) {
        node.classList.add('active');
      } else if (i < stepNumber) {
        node.classList.add('completed');
      }
    }
  }

  // Show current step panel
  document.querySelectorAll('.booking-step-content').forEach(panel => panel.classList.remove('active'));
  const currentPanel = document.getElementById(`bookingStep${stepNumber}`);
  if (currentPanel) currentPanel.classList.add('active');

  // Update footer button states
  const prevBtn = document.getElementById('bookingPrevBtn');
  const nextBtn = document.getElementById('bookingNextBtn');
  const submitBtn = document.getElementById('bookingSubmitBtn');

  if (prevBtn) prevBtn.style.display = stepNumber === 1 ? 'none' : 'inline-flex';
  if (nextBtn) nextBtn.style.display = stepNumber === bookingState.totalSteps ? 'none' : 'inline-flex';
  if (submitBtn) submitBtn.style.display = stepNumber === bookingState.totalSteps ? 'inline-flex' : 'none';
}

function validateCurrentStep(step) {
  if (step === 1) {
    if (!bookingState.data.specialtyId) {
      if (window.showToast) window.showToast('Please select a treatment therapy.', 'error');
      return false;
    }
    return true;
  }
  
  if (step === 2) {
    if (!bookingState.data.doctorId) {
      if (window.showToast) window.showToast('Please select a practitioner.', 'error');
      return false;
    }
    return true;
  }

  if (step === 3) {
    const dateInput = document.getElementById('bookingDateInput');
    if (dateInput && dateInput.value) {
      bookingState.data.appointmentDate = dateInput.value;
    }
    if (!bookingState.data.appointmentDate || !bookingState.data.appointmentTime) {
      if (window.showToast) window.showToast('Please select an appointment date and time slot.', 'error');
      return false;
    }
    return true;
  }

  return true;
}

/**
 * Handle form input changes
 */
function setupBookingFormListeners() {
  const nameInput = document.getElementById('patientNameInput');
  const emailInput = document.getElementById('patientEmailInput');
  const phoneInput = document.getElementById('patientPhoneInput');
  const ageInput = document.getElementById('patientAgeInput');
  const symptomsInput = document.getElementById('patientSymptomsInput');
  const insuranceCheck = document.getElementById('patientInsuranceCheck');

  if (nameInput) nameInput.addEventListener('input', (e) => bookingState.data.patientName = e.target.value.trim());
  if (emailInput) emailInput.addEventListener('input', (e) => bookingState.data.patientEmail = e.target.value.trim());
  if (phoneInput) phoneInput.addEventListener('input', (e) => bookingState.data.patientPhone = e.target.value.trim());
  if (ageInput) ageInput.addEventListener('input', (e) => bookingState.data.patientAge = e.target.value.trim());
  if (symptomsInput) symptomsInput.addEventListener('input', (e) => bookingState.data.patientSymptoms = e.target.value.trim());
  if (insuranceCheck) {
    insuranceCheck.addEventListener('change', (e) => {
      bookingState.data.hasInsurance = e.target.checked;
      const provGroup = document.getElementById('insuranceProviderGroup');
      if (provGroup) provGroup.style.display = e.target.checked ? 'block' : 'none';
    });
  }
}

/**
 * Submits the complete Booking to Firestore DB & n8n Webhook
 */
async function submitBooking() {
  // Validate Step 4 inputs
  const name = document.getElementById('patientNameInput')?.value.trim();
  const email = document.getElementById('patientEmailInput')?.value.trim();
  const phone = document.getElementById('patientPhoneInput')?.value.trim();

  if (!name || !email || !phone) {
    if (window.showToast) window.showToast('Please complete all required patient information fields (*)', 'error');
    return;
  }

  bookingState.data.patientName = name;
  bookingState.data.patientEmail = email;
  bookingState.data.patientPhone = phone;

  // Generate Booking Reference Number
  const randomRef = 'AM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  bookingState.data.referenceNumber = randomRef;

  const submitBtn = document.getElementById('bookingSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Secure Booking...`;
  }

  try {
    // 1. Save to Firebase Firestore (or resilient local cache)
    let savedRecord = bookingState.data;
    if (window.ClinicDB) {
      savedRecord = await window.ClinicDB.saveBooking(bookingState.data);
    }

    // 2. Dispatch payload to n8n Automation Webhook
    if (window.dispatchN8nWebhook) {
      await window.dispatchN8nWebhook('booking_submit', savedRecord);
    }

    // 3. Render Confirmation Slip UI
    renderConfirmationSlip(savedRecord);
    
    if (window.showToast) {
      window.showToast('Appointment successfully confirmed! Syncing with clinic schedule.', 'success');
    }
  } catch (error) {
    console.error("Booking error:", error);
    if (window.showToast) window.showToast('An error occurred during booking. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Confirm & Reserve Appointment`;
    }
  }
}

/**
 * Renders the Confirmation Slip in the modal
 * @param {Object} record 
 */
function renderConfirmationSlip(record) {
  const body = document.querySelector('.booking-body');
  const footer = document.querySelector('.booking-footer');
  const stepsBar = document.querySelector('.booking-steps-bar');

  if (stepsBar) stepsBar.style.display = 'none';
  if (footer) footer.style.display = 'none';

  if (body) {
    body.innerHTML = `
      <div class="confirmation-slip-wrap">
        <div class="confirmation-badge-top">
          <i class="fas fa-check"></i>
        </div>
        <h3 class="confirmation-title">Appointment Confirmed!</h3>
        <p class="confirmation-ref">Booking Reference: <strong>${record.referenceNumber}</strong></p>

        <div class="slip-details-card">
          <div class="slip-row">
            <span class="slip-label">Patient Name:</span>
            <span class="slip-value">${record.patientName}</span>
          </div>
          <div class="slip-row">
            <span class="slip-label">Treatment Therapy:</span>
            <span class="slip-value">${record.specialtyName}</span>
          </div>
          <div class="slip-row">
            <span class="slip-label">Consulting Specialist:</span>
            <span class="slip-value">${record.doctorName}</span>
          </div>
          <div class="slip-row">
            <span class="slip-label">Date & Time:</span>
            <span class="slip-value">${record.appointmentDate} at ${record.appointmentTime}</span>
          </div>
          <div class="slip-row">
            <span class="slip-label">Consultation Fee:</span>
            <span class="slip-value">${record.doctorFee}</span>
          </div>
          <div class="slip-row">
            <span class="slip-label">Status:</span>
            <span class="slip-value" style="color: var(--color-jade);"><i class="fas fa-check-circle"></i> Reserved & Scheduled</span>
          </div>
        </div>

        <div class="slip-qr-mock">
          <div class="qr-box">
            ${Array(16).fill(0).map(() => `<div class="qr-dot"></div>`).join('')}
          </div>
          <div style="text-align: left;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">Digital Patient Check-In QR</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Present this slip or QR at clinic reception for fast-track non-surgical consultation.</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-outline" onclick="window.print()">
            <i class="fas fa-print"></i> Print Appointment Slip
          </button>
          <a href="portal.html" class="btn btn-primary">
            <i class="fas fa-user-circle"></i> Open Patient Portal
          </a>
          <button class="btn btn-outline" onclick="closeBookingModal()">
            Close
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Modal Open / Close Helpers
 */
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    // Check if user is logged in and prefill patient info
    if (window.ClinicDB && window.ClinicDB.currentUser) {
      const user = window.ClinicDB.currentUser;
      bookingState.data.patientName = user.name || bookingState.data.patientName;
      bookingState.data.patientEmail = user.email || bookingState.data.patientEmail;
      bookingState.data.patientPhone = user.phone || bookingState.data.patientPhone;

      const nameInput = document.getElementById('patientNameInput');
      const emailInput = document.getElementById('patientEmailInput');
      const phoneInput = document.getElementById('patientPhoneInput');

      if (nameInput && user.name) nameInput.value = user.name;
      if (emailInput && user.email) emailInput.value = user.email;
      if (phoneInput && user.phone) phoneInput.value = user.phone;
    }

    modal.classList.add('active');
    goToBookingStep(1);
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function openBookingWithDoctorId(doctorId) {
  openBookingModal();
  selectBookingProvider(doctorId);
  goToBookingStep(2);
}

function openBookingWithSpecialty(specialtyId) {
  openBookingModal();
  selectBookingSpecialty(specialtyId);
  goToBookingStep(1);
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  initBookingWizard();
});

// Global exposure
window.bookingState = bookingState;
window.goToBookingStep = goToBookingStep;
window.selectBookingSpecialty = selectBookingSpecialty;
window.selectBookingProvider = selectBookingProvider;
window.selectBookingSlot = selectBookingSlot;
window.submitBooking = submitBooking;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.openBookingWithDoctorId = openBookingWithDoctorId;
window.openBookingWithSpecialty = openBookingWithSpecialty;
