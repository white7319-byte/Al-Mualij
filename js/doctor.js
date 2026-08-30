/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - DOCTOR & CLINICAL PORTAL ENGINE
 * Patient Queue Management, Clinical Notes, Herbal Prescriptions & Firestore Sync
 * ==========================================================================
 */

let doctorBookings = [];
let currentDoctorFilter = 'all';

/**
 * Initializes Doctor Dashboard
 */
async function initDoctorDashboard() {
  const user = window.ClinicDB.currentUser;

  // If not logged in as doctor, show login prompt
  if (!user || user.role !== 'doctor') {
    renderDoctorAuthGate();
    return;
  }

  renderDoctorProfileBanner(user);
  await loadAndRenderDoctorQueue();
}

/**
 * Renders Doctor Profile Banner
 */
function renderDoctorProfileBanner(doctor) {
  const nameEl = document.getElementById('docName');
  const titleEl = document.getElementById('docTitle');
  const metaEl = document.getElementById('docMetaTags');

  if (nameEl) nameEl.textContent = doctor.name;
  if (titleEl) titleEl.textContent = doctor.specialtyLabel || 'Senior Clinical Specialist';
  if (metaEl) {
    metaEl.innerHTML = `
      <span class="meta-chip"><i class="fas fa-id-badge"></i> Physician ID: ${doctor.doctorId || 'DOC-CHIEF'}</span>
      <span class="meta-chip mizaj"><i class="fas fa-certificate"></i> ${doctor.degrees || 'Certified Physician'}</span>
      <span class="meta-chip active-plan"><i class="fas fa-check-circle"></i> Live Consultation Room Active</span>
    `;
  }
}

/**
 * Displays an authentication gate if not signed in as doctor
 */
function renderDoctorAuthGate() {
  const main = document.querySelector('main.container');
  if (main) {
    main.innerHTML = `
      <div style="max-width: 580px; margin: 4rem auto; background: #FFFFFF; border-radius: var(--radius-xl); padding: 3rem 2rem; text-align: center; box-shadow: var(--shadow-xl); border: 1px solid var(--color-border);">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(217, 119, 6, 0.12); color: var(--color-gold); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem auto;">
          <i class="fas fa-user-md"></i>
        </div>
        <h2 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 0.5rem;">Physician & Staff Portal</h2>
        <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 2rem;">
          This clinical dashboard requires authenticated doctor credentials to manage patient queues, review diagnostic MRIs, and issue Unani herbal prescriptions.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-gold" onclick="openAuthModal('doctor')">
            <i class="fas fa-sign-in-alt"></i> Sign In with Doctor Credentials
          </button>
          <button class="btn btn-outline" onclick="quickDemoLogin('doctor')">
            <i class="fas fa-bolt"></i> 1-Click Demo Doctor Access (Hakim Tariq)
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Loads patient queue from Firestore / DB
 */
async function loadAndRenderDoctorQueue() {
  const container = document.getElementById('doctorQueueTableBody');
  if (!container) return;

  container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Fetching patient appointments from Firestore...</td></tr>`;

  const doc = window.ClinicDB.currentUser;
  doctorBookings = await window.ClinicDB.getDoctorBookings(doc ? doc.doctorId : null);

  // If no dynamic bookings exist, supply realistic clinical queue
  if (doctorBookings.length === 0) {
    doctorBookings = [
      {
        referenceNumber: "AM-2026-9104",
        patientName: "Zubair Hashmi",
        patientEmail: "zubair.patient@almualij.com",
        patientPhone: "+1 (555) 782-9901",
        specialtyName: "Hijama (Wet Cupping) & Spinal Decompression",
        appointmentDate: "2026-09-02",
        appointmentTime: "10:30 AM",
        status: "confirmed",
        patientSymptoms: "L4-L5 Lumbar herniation. Previous surgeon advised microdiscectomy.",
        clinicalNotes: "Patient progressing well. 85% pain reduction."
      },
      {
        referenceNumber: "AM-2026-8812",
        patientName: "Sarah Jenkins",
        patientEmail: "sarah.j@example.com",
        patientPhone: "+1 (555) 349-2104",
        specialtyName: "Unani Nabz (Pulse) & Chronic Migraine Regimen",
        appointmentDate: "2026-08-30",
        appointmentTime: "02:00 PM",
        status: "completed",
        patientSymptoms: "15 years of unilateral cluster headaches and temporal throbbing.",
        clinicalNotes: "Prescribed Jawarish Jalinoos + Arq-e-Gulaab. Migraine attacks reduced by 90%."
      },
      {
        referenceNumber: "AM-2026-7731",
        patientName: "Ibrahim Farooq",
        patientEmail: "i.farooq@example.com",
        patientPhone: "+1 (555) 671-8892",
        specialtyName: "Eastern Spinal Realignment & Osteoarthritis Care",
        appointmentDate: "2026-09-05",
        appointmentTime: "11:15 AM",
        status: "confirmed",
        patientSymptoms: "Severe right knee osteoarthritis. Recommended TKR surgery avoided.",
        clinicalNotes: ""
      }
    ];
  }

  updateDoctorKpis();
  renderDoctorQueueTable();
}

function updateDoctorKpis() {
  const total = doctorBookings.length;
  const completed = doctorBookings.filter(b => b.status === 'completed').length;
  const pending = doctorBookings.filter(b => b.status === 'confirmed').length;

  const totalEl = document.getElementById('kpiTotalPatients');
  const completedEl = document.getElementById('kpiCompleted');
  const pendingEl = document.getElementById('kpiPending');

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;
}

function filterDoctorQueue(status) {
  currentDoctorFilter = status;
  document.querySelectorAll('.doc-filter-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.doc-filter-tab[data-status="${status}"]`);
  if (activeTab) activeTab.classList.add('active');
  renderDoctorQueueTable();
}

function renderDoctorQueueTable() {
  const container = document.getElementById('doctorQueueTableBody');
  if (!container) return;

  const filtered = currentDoctorFilter === 'all' 
    ? doctorBookings 
    : doctorBookings.filter(b => b.status === currentDoctorFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">No appointments in this category.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(apt => `
    <tr>
      <td>
        <strong style="color: var(--color-primary);">${apt.patientName}</strong>
        <div style="font-size: 0.775rem; color: var(--color-text-muted);">${apt.patientEmail || apt.patientPhone}</div>
        <div style="font-size: 0.75rem; color: var(--color-jade); font-weight: 600;">Ref: ${apt.referenceNumber}</div>
      </td>
      <td>
        <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-primary);">${apt.specialtyName}</div>
        <div style="font-size: 0.8rem; color: var(--color-text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${apt.patientSymptoms || 'General consultation'}
        </div>
      </td>
      <td>
        <div style="font-weight: 600; font-size: 0.875rem;">${apt.appointmentDate}</div>
        <div style="font-size: 0.775rem; color: var(--color-text-muted);">${apt.appointmentTime}</div>
      </td>
      <td>
        <span class="status-pill ${apt.status}">
          <i class="fas ${apt.status === 'completed' ? 'fa-check-circle' : 'fa-clock'}"></i> ${apt.status}
        </span>
      </td>
      <td>
        <div style="font-size: 0.825rem; color: var(--color-text-muted); max-width: 200px;">
          ${apt.clinicalNotes ? `<span style="color: var(--color-primary); font-weight: 500;">${apt.clinicalNotes}</span>` : '<em style="color: var(--color-text-light);">No notes yet</em>'}
        </div>
      </td>
      <td>
        <div class="doctor-action-btns">
          <button class="btn btn-outline btn-sm" onclick="openClinicalNotesModal('${apt.referenceNumber}')" title="Add Consultation Note">
            <i class="fas fa-stethoscope"></i> Note
          </button>
          <button class="btn btn-primary btn-sm" onclick="openPrescribeModal('${apt.referenceNumber}', '${apt.patientName}', '${apt.patientEmail}')" title="Write Prescription">
            <i class="fas fa-prescription"></i> Rx
          </button>
          <button class="btn btn-gold btn-sm" onclick="toggleAppointmentStatus('${apt.referenceNumber}')" title="Toggle Completed">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Toggles appointment status between Confirmed and Completed
 */
async function toggleAppointmentStatus(referenceNumber) {
  const target = doctorBookings.find(b => b.referenceNumber === referenceNumber);
  if (!target) return;

  const newStatus = target.status === 'completed' ? 'confirmed' : 'completed';
  target.status = newStatus;

  await window.ClinicDB.updateBookingStatus(referenceNumber, newStatus, target.clinicalNotes);
  if (window.showToast) {
    window.showToast(`Appointment ${referenceNumber} marked as ${newStatus.toUpperCase()}`, 'success');
  }

  updateDoctorKpis();
  renderDoctorQueueTable();
}

/**
 * Clinical Consultation Notes Modal
 */
function openClinicalNotesModal(referenceNumber) {
  const apt = doctorBookings.find(b => b.referenceNumber === referenceNumber);
  if (!apt) return;

  let modal = document.getElementById('clinicalNotesModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'clinicalNotesModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 540px;">
      <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.remove('active'); unlockBodyScroll();">&times;</button>
      
      <div style="background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%); color: #fff; padding: 2rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
        <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 0.25rem;"><i class="fas fa-notes-medical"></i> Clinical Examination & Diagnosis</h3>
        <p style="font-size: 0.85rem; color: #CBD5E1; margin: 0;">Patient: <strong>${apt.patientName}</strong> (${apt.referenceNumber})</p>
      </div>

      <div style="padding: 2rem;">
        <div class="form-group">
          <label class="form-label">Reported Symptoms & Patient Complaint:</label>
          <div style="background: var(--color-bg-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-text-muted);">
            ${apt.patientSymptoms || 'No symptoms recorded at booking.'}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Physician Diagnosis & Non-Surgical Progress Note (*)</label>
          <textarea id="clinicalNoteInput" class="form-textarea" rows="4" placeholder="Enter pulse findings (Nabz), fascial release status, pain score reduction...">${apt.clinicalNotes || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Consultation Status</label>
          <select id="clinicalStatusSelect" class="form-select">
            <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmed & Scheduled</option>
            <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Completed / Discharged</option>
          </select>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').classList.remove('active'); unlockBodyScroll();">Cancel</button>
          <button class="btn btn-primary" onclick="saveClinicalNote('${apt.referenceNumber}')">
            <i class="fas fa-save"></i> Save to Patient EHR
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  lockBodyScroll();
}

async function saveClinicalNote(referenceNumber) {
  const note = document.getElementById('clinicalNoteInput')?.value.trim();
  const status = document.getElementById('clinicalStatusSelect')?.value || 'confirmed';

  const target = doctorBookings.find(b => b.referenceNumber === referenceNumber);
  if (target) {
    target.clinicalNotes = note;
    target.status = status;
  }

  await window.ClinicDB.updateBookingStatus(referenceNumber, status, note);
  const modal = document.getElementById('clinicalNotesModal');
  if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }

  if (window.showToast) {
    window.showToast('Clinical diagnosis note saved to Firestore EHR successfully!', 'success');
  }

  updateDoctorKpis();
  renderDoctorQueueTable();
}

/**
 * Prescribe Unani Herbal Regimen Modal
 */
function openPrescribeModal(referenceNumber, patientName, patientEmail) {
  let modal = document.getElementById('prescribeRxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'prescribeRxModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 580px;">
      <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.remove('active'); unlockBodyScroll();">&times;</button>
      
      <div style="background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-jade) 100%); color: #fff; padding: 2rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
        <h3 style="color: #fff; font-size: 1.35rem; margin-bottom: 0.25rem;"><i class="fas fa-mortar-pestle"></i> Prescribe Eastern Herbal Regimen</h3>
        <p style="font-size: 0.85rem; color: #A7F3D0; margin: 0;">Prescribing for: <strong>${patientName}</strong> (${patientEmail})</p>
      </div>

      <div style="padding: 2rem;">
        <div class="form-group">
          <label class="form-label">Herbal Formulation Name (*)</label>
          <input type="text" id="rxFormulationName" class="form-input" placeholder="e.g., Hab-e-Suranjan Al-Mualij, Jawarish Jalinoos" required>
        </div>

        <div class="form-group">
          <label class="form-label">Therapeutic Indication / Category</label>
          <input type="text" id="rxCategory" class="form-input" placeholder="e.g., Anti-Inflammatory Sciatica Formulation, Gut Tonic">
        </div>

        <div class="patient-form-grid">
          <div class="form-group">
            <label class="form-label">Dosage & Administration (*)</label>
            <input type="text" id="rxDosage" class="form-input" placeholder="e.g., 1 Tablet Twice Daily" required>
          </div>
          <div class="form-group">
            <label class="form-label">Timing</label>
            <input type="text" id="rxTiming" class="form-input" placeholder="e.g., Morning & Evening after meals">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Dietary Guidelines & Restrictions</label>
          <textarea id="rxDietRestrictions" class="form-textarea" rows="2" placeholder="e.g., Avoid red meat, sour curd. Drink lukewarm water."></textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').classList.remove('active'); unlockBodyScroll();">Cancel</button>
          <button class="btn btn-primary" onclick="savePrescription('${patientEmail}', '${patientName}')">
            <i class="fas fa-prescription-bottle-alt"></i> Issue Prescription to Portal
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  lockBodyScroll();
}

async function savePrescription(patientEmail, patientName) {
  const name = document.getElementById('rxFormulationName')?.value.trim();
  const category = document.getElementById('rxCategory')?.value.trim() || 'Eastern Herbal Remedy';
  const dosage = document.getElementById('rxDosage')?.value.trim();
  const timing = document.getElementById('rxTiming')?.value.trim() || 'Daily';
  const diet = document.getElementById('rxDietRestrictions')?.value.trim() || 'Balanced diet recommended.';

  if (!name || !dosage) {
    if (window.showToast) window.showToast('Please enter formulation name and dosage.', 'error');
    return;
  }

  await window.ClinicDB.addPrescription({
    name,
    category,
    dosage,
    timing,
    instructions: `Prescribed for ${patientName}. Take with water or herbal tea.`,
    dietRestrictions: diet,
    patientEmail: patientEmail.toLowerCase().trim()
  });

  const modal = document.getElementById('prescribeRxModal');
  if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }

  if (window.showToast) {
    window.showToast(`Prescription "${name}" issued and synced to patient's EHR portal!`, 'success');
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('doctorQueueTableBody')) {
    initDoctorDashboard();
  }
});

// Global exposure
window.initDoctorDashboard = initDoctorDashboard;
window.filterDoctorQueue = filterDoctorQueue;
window.toggleAppointmentStatus = toggleAppointmentStatus;
window.openClinicalNotesModal = openClinicalNotesModal;
window.saveClinicalNote = saveClinicalNote;
window.openPrescribeModal = openPrescribeModal;
window.savePrescription = savePrescription;
