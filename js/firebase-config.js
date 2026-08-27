/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - FIREBASE CONFIGURATION, AUTH & FIRESTORE DATABASE SERVICE
 * Role-Based Authentication (Patients & Doctors) + Live Firestore Sync
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. ACTIVE FIREBASE CONFIGURATION (Al-Mualij Production Project)
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB0xalJyND1JEI2mjmGDhXuddtH08Yo2Mc",
  authDomain: "al-mualij.firebaseapp.com",
  projectId: "al-mualij",
  storageBucket: "al-mualij.firebasestorage.app",
  messagingSenderId: "719464381679",
  appId: "1:719464381679:web:f097303dcbf7f05f96af1a",
  measurementId: "G-DL0L2VPV0P"
};

// Preset Demo Accounts for Instant 1-Click Evaluation
const DEMO_USERS = {
  patient: {
    uid: "demo-patient-01",
    email: "zubair.patient@almualij.com",
    name: "Zubair Hashmi",
    phone: "+1 (555) 782-9901",
    role: "patient",
    bloodGroup: "O+",
    mizaj: "Damwi-Safrawi (Sanguine-Choleric)",
    condition: "L4-L5 Lumbar Disc Bulge & Sciatica",
    surgeryStatus: "Surgery Avoided (92% Decompressed)"
  },
  doctor: {
    uid: "demo-doc-01",
    email: "hakim.tariq@almualij.com",
    name: "Hakim Dr. Tariq Al-Mansoor",
    doctorId: "dr-tariq-al-mansoor",
    specialtyLabel: "Unani Herbal Medicine & Pulse Diagnosis",
    role: "doctor",
    degrees: "B.U.M.S, M.D. (Pharmacology)",
    phone: "+1 (800) 555-6825 ext 102"
  },
  doctor2: {
    uid: "demo-doc-02",
    email: "dr.amina@almualij.com",
    name: "Dr. Amina Khalil (PT)",
    doctorId: "dr-amina-khalil",
    specialtyLabel: "Therapeutic Hijama & Fascial Release",
    role: "doctor",
    degrees: "DPT, Certified Wet Cupping Therapist",
    phone: "+1 (800) 555-6825 ext 105"
  }
};

class FirebaseClinicService {
  constructor() {
    this.isLive = false;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.authListeners = [];
    this.init();
  }

  /**
   * Initializes Firebase App, Auth & Firestore Web SDKs
   */
  init() {
    try {
      if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isLive = true;

        // Listen for live Firebase Auth state changes
        this.auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            // Fetch extra user role/metadata from Firestore collection 'users'
            try {
              const userDoc = await this.db.collection('users').doc(firebaseUser.uid).get();
              if (userDoc.exists) {
                this.currentUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() };
              } else {
                this.currentUser = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'patient', name: firebaseUser.displayName || 'Patient' };
              }
            } catch (e) {
              this.currentUser = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'patient', name: 'Patient' };
            }
          } else {
            this.currentUser = null;
          }
          this._notifyAuthListeners();
        });

        console.log("🔥 [Firebase] Live Firebase Auth & Firestore connected successfully:", firebaseConfig.projectId);
      } else {
        // Local Session Storage Mode
        this._initLocalAuth();
        console.info("ℹ️ [Firebase Auth & DB] Running in Local Storage Mode with active session management. To connect live Firebase, enter your API key in /js/firebase-config.js.");
      }
    } catch (err) {
      console.warn("⚠️ [Firebase] Init fallback to local storage:", err);
      this._initLocalAuth();
    }
  }

  _initLocalAuth() {
    const saved = localStorage.getItem('almualij_auth_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
    this._notifyAuthListeners();
  }

  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    callback(this.currentUser);
  }

  _notifyAuthListeners() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error("Auth listener error:", e); }
    });
  }

  /**
   * Registers a new user account (Patient or Doctor)
   */
  async registerUser(email, password, fullName, phone, role = 'patient', extraMeta = {}) {
    const normalizedEmail = email.toLowerCase().trim();

    if (this.isLive && this.auth && this.db) {
      try {
        const userCred = await this.auth.createUserWithEmailAndPassword(normalizedEmail, password);
        const uid = userCred.user.uid;
        
        const profile = {
          uid,
          email: normalizedEmail,
          name: fullName,
          phone,
          role,
          createdAt: new Date().toISOString(),
          ...extraMeta
        };

        // Save profile in Firestore
        await this.db.collection('users').doc(uid).set(profile);
        this.currentUser = profile;
        this._notifyAuthListeners();
        return { success: true, user: profile };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Local Storage Mock Registration
    const users = JSON.parse(localStorage.getItem('almualij_users_db') || '[]');
    if (users.find(u => u.email === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      uid: 'user-' + Math.floor(100000 + Math.random() * 900000),
      email: normalizedEmail,
      password, // Simulated
      name: fullName,
      phone,
      role,
      bloodGroup: extraMeta.bloodGroup || 'A+',
      mizaj: extraMeta.mizaj || 'Damwi (Sanguine Balanced)',
      createdAt: new Date().toISOString(),
      ...extraMeta
    };

    users.push(newUser);
    localStorage.setItem('almualij_users_db', JSON.stringify(users));

    this.currentUser = newUser;
    localStorage.setItem('almualij_auth_user', JSON.stringify(newUser));
    this._notifyAuthListeners();
    return { success: true, user: newUser };
  }

  /**
   * Logs in a user with Email & Password (or Doctor ID)
   */
  async loginUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    if (this.isLive && this.auth && this.db) {
      try {
        const userCred = await this.auth.signInWithEmailAndPassword(normalizedEmail, password);
        const uid = userCred.user.uid;
        const userDoc = await this.db.collection('users').doc(uid).get();
        
        if (userDoc.exists) {
          this.currentUser = { uid, email: normalizedEmail, ...userDoc.data() };
        } else {
          this.currentUser = { uid, email: normalizedEmail, role: 'patient', name: 'User' };
        }
        this._notifyAuthListeners();
        return { success: true, user: this.currentUser };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Check Preset Demo Users
    if (normalizedEmail === DEMO_USERS.patient.email) {
      this.currentUser = DEMO_USERS.patient;
      localStorage.setItem('almualij_auth_user', JSON.stringify(this.currentUser));
      this._notifyAuthListeners();
      return { success: true, user: this.currentUser };
    }

    if (normalizedEmail === DEMO_USERS.doctor.email || normalizedEmail === 'doctor@almualij.com') {
      this.currentUser = DEMO_USERS.doctor;
      localStorage.setItem('almualij_auth_user', JSON.stringify(this.currentUser));
      this._notifyAuthListeners();
      return { success: true, user: this.currentUser };
    }

    if (normalizedEmail === DEMO_USERS.doctor2.email) {
      this.currentUser = DEMO_USERS.doctor2;
      localStorage.setItem('almualij_auth_user', JSON.stringify(this.currentUser));
      this._notifyAuthListeners();
      return { success: true, user: this.currentUser };
    }

    // Check local database
    const users = JSON.parse(localStorage.getItem('almualij_users_db') || '[]');
    const matched = users.find(u => u.email === normalizedEmail && u.password === password);

    if (matched) {
      this.currentUser = matched;
      localStorage.setItem('almualij_auth_user', JSON.stringify(matched));
      this._notifyAuthListeners();
      return { success: true, user: matched };
    }

    return { success: false, error: 'Invalid email or password. (Tip: Use 1-Click Demo Login to test immediately)' };
  }

  /**
   * Fast Demo Login Helper (for testing without typing credentials)
   */
  loginDemo(role = 'patient') {
    if (role === 'doctor') {
      this.currentUser = DEMO_USERS.doctor;
    } else {
      this.currentUser = DEMO_USERS.patient;
    }
    localStorage.setItem('almualij_auth_user', JSON.stringify(this.currentUser));
    this._notifyAuthListeners();
    return this.currentUser;
  }

  /**
   * Logs out the current user session
   */
  async logoutUser() {
    if (this.isLive && this.auth) {
      await this.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem('almualij_auth_user');
    this._notifyAuthListeners();
  }

  // =========================================================================
  // FIRESTORE DATABASE METHODS (BOOKINGS, PRESCRIPTIONS, INQUIRIES)
  // =========================================================================

  /**
   * Saves a new booking to Firestore collection 'bookings'
   */
  async saveBooking(bookingData) {
    const enriched = {
      ...bookingData,
      patientUid: this.currentUser ? this.currentUser.uid : 'guest',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      clinicalNotes: ''
    };

    // Save to Local DB Cache
    const cached = JSON.parse(localStorage.getItem('almualij_bookings') || '[]');
    cached.unshift(enriched);
    localStorage.setItem('almualij_bookings', JSON.stringify(cached));

    // Save to Firestore
    if (this.isLive && this.db) {
      try {
        const ref = await this.db.collection('bookings').add(enriched);
        enriched.firestoreId = ref.id;
        console.log("🔥 [Firestore] Booking created with ID:", ref.id);
      } catch (e) {
        console.error("Firestore booking write error:", e);
      }
    }

    return enriched;
  }

  /**
   * Retrieves bookings for the active patient
   */
  async getPatientBookings(email = null) {
    const targetEmail = email || (this.currentUser ? this.currentUser.email : null);

    if (this.isLive && this.db && targetEmail) {
      try {
        const snap = await this.db.collection('bookings')
          .where('patientEmail', '==', targetEmail)
          .get();
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) return list;
      } catch (e) {
        console.warn("Firestore patient query failed, using local cache:", e);
      }
    }

    // Local Storage Filter
    const cached = JSON.parse(localStorage.getItem('almualij_bookings') || '[]');
    if (targetEmail) {
      const filtered = cached.filter(b => b.patientEmail && b.patientEmail.toLowerCase() === targetEmail.toLowerCase());
      if (filtered.length > 0) return filtered;
    }
    return cached;
  }

  /**
   * Retrieves all bookings for Doctor Dashboard
   */
  async getDoctorBookings(doctorId = null) {
    if (this.isLive && this.db) {
      try {
        let query = this.db.collection('bookings');
        if (doctorId) {
          query = query.where('doctorId', '==', doctorId);
        }
        const snap = await query.get();
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) return list;
      } catch (e) {
        console.warn("Firestore doctor query failed, using local cache:", e);
      }
    }

    const cached = JSON.parse(localStorage.getItem('almualij_bookings') || '[]');
    if (doctorId) {
      const filtered = cached.filter(b => b.doctorId === doctorId);
      if (filtered.length > 0) return filtered;
    }
    return cached;
  }

  /**
   * Updates booking status and clinical consultation notes
   */
  async updateBookingStatus(referenceNumber, newStatus, clinicalNotes = '') {
    // 1. Update in local storage
    const cached = JSON.parse(localStorage.getItem('almualij_bookings') || '[]');
    const target = cached.find(b => b.referenceNumber === referenceNumber);
    if (target) {
      target.status = newStatus;
      if (clinicalNotes) target.clinicalNotes = clinicalNotes;
      localStorage.setItem('almualij_bookings', JSON.stringify(cached));
    }

    // 2. Update in Firestore if live
    if (this.isLive && this.db) {
      try {
        const snap = await this.db.collection('bookings').where('referenceNumber', '==', referenceNumber).get();
        snap.forEach(async (doc) => {
          await this.db.collection('bookings').doc(doc.id).update({
            status: newStatus,
            clinicalNotes: clinicalNotes || doc.data().clinicalNotes || '',
            updatedAt: new Date().toISOString()
          });
        });
      } catch (e) {
        console.error("Firestore update booking error:", e);
      }
    }

    return true;
  }

  /**
   * Prescribes a new Unani Herbal Regimen into Firestore collection 'prescriptions'
   */
  async addPrescription(rxData) {
    const enriched = {
      ...rxData,
      id: 'rx-' + Math.floor(100 + Math.random() * 900),
      prescribedBy: this.currentUser ? this.currentUser.name : 'Attending Physician',
      createdAt: new Date().toISOString()
    };

    // Cache locally
    const existing = JSON.parse(localStorage.getItem('almualij_prescriptions') || '[]');
    existing.unshift(enriched);
    localStorage.setItem('almualij_prescriptions', JSON.stringify(existing));

    // Save to Firestore
    if (this.isLive && this.db) {
      try {
        await this.db.collection('prescriptions').add(enriched);
      } catch (e) {
        console.error("Firestore prescription write error:", e);
      }
    }

    return enriched;
  }

  /**
   * Retrieves active prescriptions for a patient
   */
  async getPatientPrescriptions(email = null) {
    const targetEmail = email || (this.currentUser ? this.currentUser.email : null);

    if (this.isLive && this.db && targetEmail) {
      try {
        const snap = await this.db.collection('prescriptions').where('patientEmail', '==', targetEmail).get();
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) return list;
      } catch (e) {
        console.warn("Firestore prescriptions query failed:", e);
      }
    }

    const cached = JSON.parse(localStorage.getItem('almualij_prescriptions') || '[]');
    if (targetEmail) {
      const filtered = cached.filter(p => p.patientEmail && p.patientEmail.toLowerCase() === targetEmail.toLowerCase());
      if (filtered.length > 0) return filtered;
    }
    return cached;
  }

  /**
   * Saves patient inquiry to Firestore
   */
  async saveInquiry(inquiryData) {
    const record = {
      ...inquiryData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const inquiries = JSON.parse(localStorage.getItem('almualij_inquiries') || '[]');
    inquiries.push(record);
    localStorage.setItem('almualij_inquiries', JSON.stringify(inquiries));

    if (this.isLive && this.db) {
      try {
        await this.db.collection('inquiries').add(record);
      } catch (e) {
        console.error("Firestore inquiry write error:", e);
      }
    }
    return true;
  }
}

// Global Singleton Instance
window.ClinicDB = new FirebaseClinicService();
window.DEMO_USERS = DEMO_USERS;
