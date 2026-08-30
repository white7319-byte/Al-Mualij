/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - PATIENT PORTAL & HEALTH RECORDS ENGINE
 * Real-time Firestore Sync, Herbal Prescriptions, Progress Tracker & Reports
 * ==========================================================================
 */

// Active Patient Profile State
let activePatient = {
  id: "AM-PT-9042",
  name: "Zubair Hashmi",
  email: "zubair.patient@almualij.com",
  age: 44,
  gender: "Male",
  bloodGroup: "O+",
  mizaj: "Damwi-Safrawi (Sanguine-Choleric)",
  primarySpecialist: "Hakim Dr. Tariq Al-Mansoor",
  condition: "L4-L5 Lumbar Disc Bulge & Sciatica (Non-Surgical Protocol)",
  surgeryStatus: "Surgery Avoided (92% Lumbar Nerve Decompression Achieved)"
};

// Default Sample Clinical Reports
const patientReports = [
  {
    id: "rep-01",
    title: "Initial Diagnostic Pulse & Lumbar Evaluation Report",
    date: "2026-07-15",
    doctor: "Hakim Dr. Tariq Al-Mansoor",
    fileSize: "1.4 MB",
    type: "Diagnostic EHR"
  },
  {
    id: "rep-02",
    title: "Post-Hijama Fascial Decompression & Nerve Conduction Note",
    date: "2026-08-02",
    doctor: "Dr. Amina Khalil (PT, Hijama Specialist)",
    fileSize: "2.1 MB",
    type: "Therapy Note"
  },
  {
    id: "rep-03",
    title: "Eastern Chiropractic Lumbar Alignment & ROM Measurement",
    date: "2026-08-18",
    doctor: "Dr. Rashid Qadri (D.C.)",
    fileSize: "1.8 MB",
    type: "Clinical Summary"
  }
];

/**
 * Checks if current user is a demo account
 */
function isDemoUser() {
  const user = window.ClinicDB.currentUser;
  return user && user.uid && user.uid.startsWith('demo-');
}

/**
 * Initializes Patient Portal UI
 */
async function initPatientPortal() {
  const user = window.ClinicDB.currentUser;

  if (user) {
    if (isDemoUser()) {
      // Demo user - use predefined data
      activePatient = {
        ...activePatient,
        id: user.uid ? `AM-${user.uid.slice(0, 7).toUpperCase()}` : activePatient.id,
        name: user.name || activePatient.name,
        email: user.email || activePatient.email,
        bloodGroup: user.bloodGroup || activePatient.bloodGroup,
        mizaj: user.mizaj || activePatient.mizaj
      };
    } else {
      // Real patient - use only their data from registration
      activePatient = {
        id: user.uid ? `AM-${user.uid.slice(0, 7).toUpperCase()}` : 'AM-PATIENT',
        name: user.name || 'Patient',
        email: user.email || '',
        age: user.age || null,
        gender: user.gender || 'Not Specified',
        bloodGroup: user.bloodGroup || 'Not Provided',
        mizaj: user.mizaj || 'Not Assessed',
        primarySpecialist: user.primarySpecialist || 'Pending Assignment',
        condition: user.condition || 'General Consultation',
        surgeryStatus: user.surgeryStatus || 'Pending Assessment'
      };
    }
  }

  renderPatientBanner();
  await loadAndRenderAppointments();
  await loadAndRenderPrescriptions();
  renderReports();
  initPortalTabs();
}

/**
 * Renders Patient EHR Header Banner
 */
function renderPatientBanner() {
  const nameEl = document.getElementById('portalPatientName');
  const metaEl = document.getElementById('portalPatientMeta');

  if (nameEl) nameEl.textContent = activePatient.name;
  if (metaEl) {
    metaEl.innerHTML = `
      <span class="meta-chip"><i class="fas fa-id-card"></i> Member ID: ${activePatient.id}</span>
      <span class="meta-chip"><i class="fas fa-envelope"></i> ${activePatient.email}</span>
      <span class="meta-chip"><i class="fas fa-tint"></i> Blood: ${activePatient.bloodGroup}</span>
      <span class="meta-chip mizaj"><i class="fas fa-fire-alt"></i> Temperament (Mizaj): ${activePatient.mizaj}</span>
      <span class="meta-chip active-plan"><i class="fas fa-shield-alt"></i> ${activePatient.surgeryStatus}</span>
    `;
  }
}

/**
 * Loads bookings from Firestore / Database for active patient
 */
async function loadAndRenderAppointments() {
  const container = document.getElementById('portalAppointmentsList');
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Syncing medical consultations from Firestore...</div>`;

  let bookings = [];
  if (window.ClinicDB) {
    bookings = await window.ClinicDB.getPatientBookings(activePatient.email);
  }

  // If no dynamic bookings exist, show appropriate content
  if (bookings.length === 0) {
    if (isDemoUser()) {
      // Show demo bookings for demo accounts only
      bookings = [
        {
          referenceNumber: "AM-2026-7842",
          specialtyName: "Hijama (Wet Cupping Therapy - Session 4)",
          doctorName: "Dr. Amina Khalil (PT, Hijama Specialist)",
          appointmentDate: "2026-09-02",
          appointmentTime: "10:30 AM",
          status: "confirmed",
          clinicalNotes: "Targeted lumbar vacuum decompression on bladder meridian."
        },
        {
          referenceNumber: "AM-2026-6219",
          specialtyName: "Unani Pulse Review & Herbal Regimen Follow-up",
          doctorName: "Hakim Dr. Tariq Al-Mansoor",
          appointmentDate: "2026-08-10",
          appointmentTime: "02:00 PM",
          status: "completed",
          clinicalNotes: "Damwi temperament stabilized. Disc inflammation down by 85%."
        }
      ];
    } else {
      // For real patients with no bookings, show empty state
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--color-bg-alt); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
          <i class="fas fa-calendar-check" style="font-size: 2.5rem; color: var(--color-jade); margin-bottom: 1rem; display: block;"></i>
          <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">No Appointments Yet</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">You haven't booked any consultations yet. Start your healing journey by scheduling your first appointment.</p>
          <button class="btn btn-primary" onclick="openBookingModal()">
            <i class="fas fa-plus"></i> Book Your First Session
          </button>
        </div>
      `;
      return;
    }
  }

  container.innerHTML = bookings.map((apt, index) => {
    const isUpcoming = apt.status !== 'completed';
    const dateObj = new Date(apt.appointmentDate || Date.now());
    const day = dateObj.getDate() || '15';
    const month = dateObj.toLocaleString('default', { month: 'short' }) || 'SEP';

    return `
      <div class="appointment-card ${isUpcoming ? 'upcoming' : 'completed'}">
        <div class="apt-time-badge">
          <div class="apt-day">${day}</div>
          <div class="apt-month">${month}</div>
          <div class="apt-hour">${apt.appointmentTime || '10:00 AM'}</div>
        </div>

        <div class="apt-info">
          <h3 class="apt-title">${apt.specialtyName}</h3>
          <div class="apt-practitioner">
            <i class="fas fa-user-md" style="color: var(--color-jade); margin-right: 4px;"></i> ${apt.doctorName}
          </div>
          <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 4px;">
            Booking Ref: <strong>${apt.referenceNumber || 'AM-CONFIRMED'}</strong>
          </div>
          ${apt.clinicalNotes ? `
            <div style="font-size: 0.8rem; background: var(--color-bg-alt); padding: 0.4rem 0.6rem; border-radius: 4px; margin-top: 6px; color: var(--color-primary);">
              <strong><i class="fas fa-stethoscope"></i> Clinical Note:</strong> ${apt.clinicalNotes}
            </div>
          ` : ''}
          <div class="apt-status ${isUpcoming ? 'confirmed' : 'done'}">
            ${isUpcoming ? '<i class="fas fa-clock"></i> Scheduled Consultation' : '<i class="fas fa-check-double"></i> Completed'}
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${isUpcoming ? `
            <button class="btn btn-outline btn-sm" onclick="openRescheduleModal('${apt.referenceNumber}')">
              <i class="fas fa-sync-alt"></i> Reschedule
            </button>
            <button class="btn btn-primary btn-sm" onclick="showAppointmentSlipModal('${apt.referenceNumber}', '${apt.specialtyName}', '${apt.doctorName}', '${apt.appointmentDate}', '${apt.appointmentTime}')">
              <i class="fas fa-qrcode"></i> Digital Pass
            </button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="viewReportDetail('rep-02')">
              <i class="fas fa-file-medical"></i> View Summary
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Loads and renders Herbal Prescriptions from Firestore
 */
async function loadAndRenderPrescriptions() {
  const container = document.getElementById('portalPrescriptionsGrid');
  if (!container) return;

  let prescriptions = [];
  if (window.ClinicDB) {
    prescriptions = await window.ClinicDB.getPatientPrescriptions(activePatient.email);
  }

  // Default formulations if none in Firestore yet
  if (prescriptions.length === 0) {
    if (isDemoUser()) {
      // Show demo prescriptions for demo accounts only
      prescriptions = [
        {
          name: "Hab-e-Suranjan Al-Mualij",
          category: "Anti-Inflammatory Joint & Sciatica Formulation",
          dosage: "1 Tablet Twice Daily (Morning & Evening after meals)",
          instructions: "Take with warm goat milk or lukewarm water. Dissolves humoral uric toxins.",
          timing: "Morning & Evening",
          dietRestrictions: "Avoid sour curd, red meat, and cold beverages during active therapy."
        },
        {
          name: "Roghan-e-Balsan (Balsam Herbal Oil)",
          category: "Topical Spine & Deep Fascia Realignment Oil",
          dosage: "Gently massage 5ml along the lower lumbar spine (L4-S1)",
          instructions: "Apply warm and follow with warm towel compression for 15 minutes.",
          timing: "Night before bed",
          dietRestrictions: "Keep lower back protected from direct draft/AC."
        },
        {
          name: "Jawarish Shahi & Arq-e-Mako",
          category: "Liver & Metabolic Detox Tonic",
          dosage: "5g Jawarish + 50ml Arq in morning on empty stomach",
          instructions: "Balances internal digestive heat and accelerates tissue regeneration.",
          timing: "Early Morning",
          dietRestrictions: "Drink at least 2.5L structured lukewarm water daily."
        }
      ];
    } else {
      // For real patients with no prescriptions, show empty state
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--color-bg-alt); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
          <i class="fas fa-leaf" style="font-size: 2.5rem; color: var(--color-jade); margin-bottom: 1rem; display: block;"></i>
          <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">No Prescriptions Yet</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Herbal prescriptions will appear here after your first consultation with our Hakim (Unani medicine practitioner).</p>
        </div>
      `;
      return;
    }
  }

  container.innerHTML = prescriptions.map(rx => `
    <div class="rx-card">
      <div class="rx-badge"><i class="fas fa-leaf"></i> Active Regimen</div>
      <h3 class="rx-name">${rx.name}</h3>
      <div class="rx-formulation">${rx.category}</div>

      <div class="rx-dosage-box">
        <div class="rx-timing"><i class="fas fa-clock"></i> ${rx.timing}</div>
        <div style="margin-top: 4px; color: var(--color-text-main); font-weight: 500;">${rx.dosage}</div>
        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 2px;">${rx.instructions}</div>
      </div>

      <div class="rx-diet-notes">
        <strong><i class="fas fa-utensils"></i> Dietary Rule:</strong> ${rx.dietRestrictions}
      </div>
    </div>
  `).join('');
}

/**
 * Renders Clinical Reports Tab
 */
function renderReports() {
  const container = document.getElementById('portalReportsList');
  if (!container) return;

  if (!isDemoUser()) {
    // For real patients with no reports, show empty state
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; background: var(--color-bg-alt); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
        <i class="fas fa-file-medical-alt" style="font-size: 2.5rem; color: var(--color-jade); margin-bottom: 1rem; display: block;"></i>
        <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">No Reports Yet</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Diagnostic reports and clinical summaries will be available after your consultations.</p>
      </div>
    `;
    return;
  }

  // For demo users, show sample reports
  container.innerHTML = patientReports.map(rep => `
    <div class="report-item">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="report-icon">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div>
          <h4 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 2px;">${rep.title}</h4>
          <div style="font-size: 0.825rem; color: var(--color-text-muted);">
            Issued: <strong>${rep.date}</strong> by ${rep.doctor} • <span style="color: var(--color-jade); font-weight: 600;">${rep.type}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-outline btn-sm" onclick="viewReportDetail('${rep.id}')">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="btn btn-primary btn-sm" onclick="downloadSampleReport('${rep.id}', '${rep.title}')">
          <i class="fas fa-download"></i> PDF (${rep.fileSize})
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Portal Navigation Tab Switcher
 */
function initPortalTabs() {
  const tabBtns = document.querySelectorAll('.portal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.portal-tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/**
 * Shows interactive Digital Pass Modal
 */
function showAppointmentSlipModal(ref, specialty, doctor, date, time) {
  let modal = document.getElementById('digitalPassModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'digitalPassModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 520px;">
      <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.remove('active'); unlockBodyScroll();">&times;</button>
      <div style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-jade) 100%); color: #fff; padding: 2rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0; text-align: center;">
        <div style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: #A7F3D0; font-weight: 700;">Al-Mualij Eastern Medicine Clinic</div>
        <h2 style="color: #fff; font-size: 1.5rem; margin: 0.5rem 0;">Digital Clinic Pass</h2>
        <div style="font-size: 0.85rem; color: #E2E8F0;">Pass Ref: <strong>${ref}</strong></div>
      </div>

      <div style="padding: 2rem; text-align: center;">
        <div class="slip-qr-mock" style="margin-bottom: 1.5rem;">
          <div class="qr-box" style="width: 100px; height: 100px; margin: 0 auto;">
            ${Array(16).fill(0).map(() => `<div class="qr-dot"></div>`).join('')}
          </div>
        </div>

        <div style="text-align: left; background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: 1.5rem;">
          <div style="margin-bottom: 0.4rem;"><strong>Patient:</strong> ${activePatient.name} (${activePatient.id})</div>
          <div style="margin-bottom: 0.4rem;"><strong>Therapy:</strong> ${specialty}</div>
          <div style="margin-bottom: 0.4rem;"><strong>Specialist:</strong> ${doctor}</div>
          <div><strong>Scheduled:</strong> ${date} at ${time}</div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="window.print()">
          <i class="fas fa-print"></i> Print / Save Pass
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  lockBodyScroll();
}

/**
 * Downloads / Previews Sample PDF Clinical Report
 */
function downloadSampleReport(repId, title) {
  if (window.showToast) {
    window.showToast(`Generating certified clinical summary: "${title}"`, 'info');
  }

  setTimeout(() => {
    viewReportDetail(repId);
  }, 500);
}

function viewReportDetail(repId) {
  const rep = patientReports.find(r => r.id === repId) || patientReports[0];
  let modal = document.getElementById('reportDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reportDetailModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 680px;">
      <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      
      <div style="padding: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--color-primary); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
          <div>
            <h2 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 0.2rem;">AL-MUALIJ MEDICAL CLINIC</h2>
            <div style="font-size: 0.8rem; color: var(--color-jade); font-weight: 700; text-transform: uppercase;">Certified Non-Surgical Eastern Healthcare</div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: var(--color-text-muted);">
            <div>Report Ref: <strong>${rep.id.toUpperCase()}-2026</strong></div>
            <div>Date: ${rep.date}</div>
          </div>
        </div>

        <div style="background: var(--color-bg-alt); padding: 1rem 1.25rem; border-radius: var(--radius-md); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 1.5rem;">
          <div><strong>Patient:</strong> ${activePatient.name}</div>
          <div><strong>Member ID:</strong> ${activePatient.id}</div>
          <div><strong>Mizaj (Temperament):</strong> ${activePatient.mizaj}</div>
          <div><strong>Physician:</strong> ${rep.doctor}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1.05rem; color: var(--color-primary); margin-bottom: 0.5rem;">Clinical Assessment & Findings:</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
            Patient presented with chronic L4-L5 lumbar radiculopathy and left leg radiating pain (initial pain score 9/10). 
            Following 4 sessions of targeted Hijama (Wet Cupping), manual Eastern spinal traction, and anti-inflammatory Unani phytopharmacology, 
            nerve root impingement has reduced by 85%. Current pain score: 1.5/10. Full spinal mobility restored without surgical discectomy.
          </p>
        </div>

        <div style="margin-bottom: 2rem;">
          <h4 style="font-size: 1.05rem; color: var(--color-primary); margin-bottom: 0.5rem;">Prognosis & Follow-up:</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
            Excellent prognosis. Invasive surgery deemed completely unnecessary. Continue posture preservation and morning detox regimen.
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--color-text-light);">
            Digitally Signed by Al-Mualij Medical Board
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').classList.remove('active')">Close</button>
            <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Report</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * Reschedule Modal
 */
function openRescheduleModal(reference) {
  let modal = document.getElementById('rescheduleModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rescheduleModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 500px;">
      <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      <div style="padding: 2rem;">
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 0.5rem;">Reschedule Appointment</h3>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
          Booking Reference: <strong>${reference}</strong>
        </p>

        <div class="form-group">
          <label class="form-label">Preferred New Date</label>
          <input type="date" id="rescheduleDate" class="form-input" required>
        </div>

        <div class="form-group">
          <label class="form-label">Preferred Time Slot</label>
          <select id="rescheduleTime" class="form-select">
            <option>Morning (09:00 AM - 12:00 PM)</option>
            <option>Afternoon (02:00 PM - 05:00 PM)</option>
            <option>Evening (05:00 PM - 07:00 PM)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Reason / Special Notes</label>
          <textarea id="rescheduleNotes" class="form-textarea" rows="2" placeholder="e.g., Schedule conflict, travel..."></textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" onclick="submitReschedule('${reference}')">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

async function submitReschedule(ref) {
  const date = document.getElementById('rescheduleDate')?.value;
  const time = document.getElementById('rescheduleTime')?.value;
  const notes = document.getElementById('rescheduleNotes')?.value;

  if (!date) {
    if (window.showToast) window.showToast('Please select a preferred new date.', 'error');
    return;
  }

  if (window.dispatchN8nWebhook) {
    await window.dispatchN8nWebhook('urgent_callback', {
      type: 'reschedule_request',
      bookingReference: ref,
      preferredDate: date,
      preferredTime: time,
      patientNotes: notes,
      patientName: activePatient.name,
      patientId: activePatient.id
    });
  }

  document.getElementById('rescheduleModal')?.classList.remove('active');
  if (window.showToast) {
    window.showToast('Reschedule request sent! Our patient desk will confirm via SMS shortly.', 'success');
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('portalAppointmentsList')) {
    initPatientPortal();
  }
});

// Global exposure
window.initPatientPortal = initPatientPortal;
window.showAppointmentSlipModal = showAppointmentSlipModal;
window.viewReportDetail = viewReportDetail;
window.downloadSampleReport = downloadSampleReport;
window.openRescheduleModal = openRescheduleModal;
window.submitReschedule = submitReschedule;
