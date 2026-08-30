/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - AUTHENTICATION CONTROLLER
 * Patient & Doctor Logins, Registration, Auth Modals & Session Navigation
 * ==========================================================================
 */

let currentAuthRole = 'patient'; // 'patient' or 'doctor'
let currentAuthMode = 'login';   // 'login' or 'register'

/**
 * Initializes Auth State on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.ClinicDB) {
    window.ClinicDB.onAuthStateChanged(updateHeaderAuthUI);
  }
  initAuthFormListeners();
});

/**
 * Updates Header buttons depending on whether user is logged in
 */
function updateHeaderAuthUI(user) {
  const navActions = document.querySelectorAll('.nav-actions, .top-bar-right');

  document.querySelectorAll('.auth-logged-in-badge').forEach(el => el.remove());
  document.querySelectorAll('.auth-login-trigger').forEach(el => el.style.display = user ? 'none' : 'inline-flex');

  if (user) {
    const isDoctor = user.role === 'doctor';
    const targetDashboard = isDoctor ? 'doctor-portal.html' : 'portal.html';
    const roleIcon = isDoctor ? 'fa-user-md' : 'fa-user-circle';
    const roleBadge = isDoctor ? 'Doctor Portal' : 'Patient Portal';

    // Update Topbar links
    const topBarRight = document.querySelector('.top-bar-right');
    if (topBarRight) {
      const existingPortalLink = topBarRight.querySelector('a[href="portal.html"], a[href="doctor-portal.html"]');
      if (existingPortalLink) {
        existingPortalLink.href = targetDashboard;
        existingPortalLink.innerHTML = `<i class="fas ${roleIcon}" style="color: ${isDoctor ? 'var(--color-gold)' : 'var(--color-jade-light)'};"></i> ${user.name} (${roleBadge})`;
      }
    }

    // Add User Profile Chip in Main Nav
    const mainNavActions = document.querySelector('.header .nav-actions');
    if (mainNavActions) {
      const existingBadge = mainNavActions.querySelector('.user-auth-badge-wrap');
      if (existingBadge) existingBadge.remove();

      const userBadge = document.createElement('div');
      userBadge.className = 'user-auth-badge-wrap auth-logged-in-badge';
      userBadge.innerHTML = `
        <a href="${targetDashboard}" class="user-nav-chip ${isDoctor ? 'doctor' : ''}">
          <i class="fas ${roleIcon}"></i>
          <span>${user.name.split(' ')[0]}</span>
        </a>
        <button class="btn btn-outline btn-sm" onclick="handleLogout()" title="Logout" style="padding: 0.45rem 0.75rem;">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      `;
      mainNavActions.insertBefore(userBadge, mainNavActions.firstChild);
    }
  }
}

/**
 * Switch between Patient & Doctor login roles
 */
function setAuthRole(role) {
  currentAuthRole = role;
  
  const patientBtn = document.getElementById('roleTogglePatient');
  const docBtn = document.getElementById('roleToggleDoctor');
  const regToggle = document.getElementById('authRegisterTab');
  const roleDesc = document.getElementById('authRoleDescription');

  if (patientBtn && docBtn) {
    if (role === 'patient') {
      patientBtn.classList.add('active');
      docBtn.classList.remove('active');
      if (regToggle) regToggle.style.display = 'inline-block';
      if (roleDesc) roleDesc.textContent = 'Access your personal health records, Unani prescriptions & appointments.';
    } else {
      docBtn.classList.add('active');
      patientBtn.classList.remove('active');
      // Doctor accounts are staff-managed, default to login
      setAuthMode('login');
      if (regToggle) regToggle.style.display = 'none';
      if (roleDesc) roleDesc.textContent = 'Clinical physician access for patient triage, prescriptions & notes.';
    }
  }
}

/**
 * Switch between Login & Register tabs
 */
function setAuthMode(mode) {
  currentAuthMode = mode;
  const loginTab = document.getElementById('authLoginTab');
  const regTab = document.getElementById('authRegisterTab');
  const loginForm = document.getElementById('authLoginForm');
  const regForm = document.getElementById('authRegisterForm');

  if (loginTab && regTab && loginForm && regForm) {
    if (mode === 'login') {
      loginTab.classList.add('active');
      regTab.classList.remove('active');
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
    } else {
      regTab.classList.add('active');
      loginTab.classList.remove('active');
      regForm.style.display = 'block';
      loginForm.style.display = 'none';
    }
  }
}

/**
 * Handle Login Submission
 */
async function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value.trim() : '';

  if (!email || !password) {
    if (window.showToast) window.showToast('Please enter both email and password.', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authenticating...`;
  }

  const result = await window.ClinicDB.loginUser(email, password);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In to Account`;
  }

  if (result.success) {
    if (window.showToast) {
      window.showToast(`Welcome back, ${result.user.name}! Redirecting to dashboard...`, 'success');
    }
    closeAuthModal();

    setTimeout(() => {
      if (result.user.role === 'doctor') {
        window.location.href = 'doctor-portal.html';
      } else {
        window.location.href = 'portal.html';
      }
    }, 600);
  } else {
    if (window.showToast) window.showToast(result.error || 'Login failed.', 'error');
  }
}

/**
 * Handle Patient Registration Submission
 */
async function handleRegisterSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  const pass = document.getElementById('regPassword')?.value.trim();
  const blood = document.getElementById('regBloodGroup')?.value;
  const submitBtn = document.getElementById('regSubmitBtn');

  if (!name || !email || !pass) {
    if (window.showToast) window.showToast('Please fill in all required registration fields (*)', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating Patient Account...`;
  }

  const result = await window.ClinicDB.registerUser(email, pass, name, phone, 'patient', {
    bloodGroup: blood || 'O+',
    mizaj: 'Damwi (Sanguine Balanced)',
    condition: 'General Non-Surgical Consultation'
  });

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-user-plus"></i> Create Patient Account`;
  }

  if (result.success) {
    if (window.showToast) {
      window.showToast(`Account successfully created for ${result.user.name}! Accessing portal...`, 'success');
    }
    closeAuthModal();
    setTimeout(() => {
      window.location.href = 'portal.html';
    }, 600);
  } else {
    if (window.showToast) window.showToast(result.error || 'Registration failed.', 'error');
  }
}

/**
 * 1-Click Fast Demo Login
 */
function quickDemoLogin(role = 'patient') {
  const user = window.ClinicDB.loginDemo(role);
  if (window.showToast) {
    window.showToast(`Logged in with Demo ${role === 'doctor' ? 'Doctor (Hakim Tariq)' : 'Patient (Zubair Hashmi)'}!`, 'success');
  }
  closeAuthModal();

  setTimeout(() => {
    if (role === 'doctor') {
      window.location.href = 'doctor-portal.html';
    } else {
      window.location.href = 'portal.html';
    }
  }, 400);
}

/**
 * Handle Logout
 */
async function handleLogout() {
  await window.ClinicDB.logoutUser();
  if (window.showToast) window.showToast('You have been logged out safely.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

/**
 * Open / Close Auth Modal
 */
function openAuthModal(role = 'patient') {
  let modal = document.getElementById('authModal');
  if (!modal) {
    createAuthModalDOM();
    modal = document.getElementById('authModal');
  }
  setAuthRole(role);
  modal.classList.add('active');
  lockBodyScroll();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }
}

/**
 * Dynamically builds Auth Modal HTML
 */
function createAuthModalDOM() {
  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog auth-card">
      <button class="modal-close-btn" onclick="closeAuthModal()">&times;</button>
      
      <div class="auth-header">
        <div class="logo-icon-wrap" style="margin: 0 auto; width: 44px; height: 44px;">
          <i class="fas fa-seedling"></i>
        </div>
        <div class="brand-title">AL-MUALIJ CLINIC</div>
        <div class="brand-tagline">Secure Medical Portal Access</div>

        <!-- Role Switcher -->
        <div class="role-toggle-bar">
          <button class="role-toggle-btn active" id="roleTogglePatient" onclick="setAuthRole('patient')">
            <i class="fas fa-user-circle"></i> Patient Portal
          </button>
          <button class="role-toggle-btn doctor" id="roleToggleDoctor" onclick="setAuthRole('doctor')">
            <i class="fas fa-user-md"></i> Doctor / Staff
          </button>
        </div>
      </div>

      <div class="auth-body">
        <!-- 1-Click Demo Shortcut -->
        <div class="demo-login-box">
          <div class="demo-login-title"><i class="fas fa-bolt"></i> 1-Click Fast Demo Login</div>
          <div class="demo-buttons-grid">
            <button class="btn-demo" onclick="quickDemoLogin('patient')">
              <i class="fas fa-user"></i> Demo Patient
            </button>
            <button class="btn-demo doc" onclick="quickDemoLogin('doctor')">
              <i class="fas fa-stethoscope"></i> Demo Doctor
            </button>
          </div>
        </div>

        <p id="authRoleDescription" style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 1.25rem;">
          Access your personal health records, Unani prescriptions & appointments.
        </p>

        <!-- Mode Switcher (Login / Register) -->
        <div class="auth-mode-switch">
          <div class="auth-tab-link active" id="authLoginTab" onclick="setAuthMode('login')">Sign In</div>
          <div class="auth-tab-link" id="authRegisterTab" onclick="setAuthMode('register')">Create Patient Account</div>
        </div>

        <!-- LOGIN FORM -->
        <form id="authLoginForm" onsubmit="handleLoginSubmit(event)">
          <div class="form-group">
            <label class="form-label">Email Address (*)</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="e.g., patient@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password (*)</label>
            <input type="password" id="loginPassword" class="form-input" placeholder="Enter your password" required>
          </div>
          <button type="submit" id="loginSubmitBtn" class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;">
            <i class="fas fa-sign-in-alt"></i> Sign In to Account
          </button>
        </form>

        <!-- REGISTER FORM (Patients Only) -->
        <form id="authRegisterForm" style="display: none;" onsubmit="handleRegisterSubmit(event)">
          <div class="form-group">
            <label class="form-label">Full Name (*)</label>
            <input type="text" id="regName" class="form-input" placeholder="e.g., Sarah Johnson" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address (*)</label>
            <input type="email" id="regEmail" class="form-input" placeholder="e.g., sarah@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Mobile / WhatsApp Number</label>
            <input type="tel" id="regPhone" class="form-input" placeholder="+1 (555) 000-0000">
          </div>
          <div class="form-group">
            <label class="form-label">Blood Group</label>
            <select id="regBloodGroup" class="form-select">
              <option value="O+">O Positive (O+)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="O-">O Negative (O-)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Create Password (*)</label>
            <input type="password" id="regPassword" class="form-input" placeholder="Minimum 6 characters" required>
          </div>
          <button type="submit" id="regSubmitBtn" class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;">
            <i class="fas fa-user-plus"></i> Create Patient Account
          </button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function initAuthFormListeners() {
  // Global hooks
}

// Global exposure
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.setAuthRole = setAuthRole;
window.setAuthMode = setAuthMode;
window.handleLoginSubmit = handleLoginSubmit;
window.handleRegisterSubmit = handleRegisterSubmit;
window.quickDemoLogin = quickDemoLogin;
window.handleLogout = handleLogout;
