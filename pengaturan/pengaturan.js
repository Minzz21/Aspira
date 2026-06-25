/* ──────────────────────────────────────────────────────────
   PENGATURAN — JavaScript
   ────────────────────────────────────────────────────────── */

/* ── SIMULATED STORED DATA ─────────────────────────────── */
let adminData = {
  nama:  'Administrator Utama',
  email: 'adminutama@aspiraai.id',
  telp:  '+62 812-3456-7890',
  nik:   '3201000000000001',      // stored internally, not shown plain
  role:  'Administrator',
};

/* ── INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarUser();
  syncDisplayName();
  document.getElementById('input-nama').addEventListener('input', syncDisplayName);
  document.getElementById('nik-baru').addEventListener('input', checkNIKMatch);
  document.getElementById('nik-konfirmasi').addEventListener('input', checkNIKMatch);
});

function updateSidebarUser() {
  document.getElementById('sidebar-name').textContent = adminData.nama;
  document.getElementById('sidebar-role').textContent = adminData.role;
  setAvatarInitial(adminData.nama);
}

function setAvatarInitial(nama) {
  const parts    = nama.trim().split(' ');
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nama[0].toUpperCase();
  const el = document.getElementById('avatar-initials');
  if (el) el.textContent = initials;
  document.getElementById('sidebar-avatar').textContent = initials[0];
}

function syncDisplayName() {
  const val = document.getElementById('input-nama').value.trim();
  if (val) document.getElementById('display-nama').textContent = val;
}

/* ── TABS ──────────────────────────────────────────────── */
function switchTab(tab) {
  const panels = ['profil', 'keamanan'];
  panels.forEach(p => {
    document.getElementById('panel-' + p).classList.toggle('hidden', p !== tab);
    const btn = document.getElementById('tab-' + p);
    btn.className = p === tab
      ? 'tab-btn tab-active px-5 py-3 text-sm font-semibold relative'
      : 'tab-btn tab-inactive px-5 py-3 text-sm font-semibold relative';
  });
}

/* ── AVATAR UPLOAD ─────────────────────────────────────── */
function handleAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const display = document.getElementById('avatar-display');
    display.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover rounded-xl" alt="Avatar"/>`;
  };
  reader.readAsDataURL(file);
}

/* ── SIMPAN PROFIL ─────────────────────────────────────── */
function simpanProfil() {
  const nama  = document.getElementById('input-nama').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const telp  = document.getElementById('input-telp').value.trim();

  if (!nama)  return showToast('Nama lengkap tidak boleh kosong.', 'error');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
               return showToast('Format email tidak valid.', 'error');
  if (!telp)  return showToast('Nomor telepon tidak boleh kosong.', 'error');

  // Simulate save
  adminData.nama  = nama;
  adminData.email = email;
  adminData.telp  = telp;

  updateSidebarUser();
  document.getElementById('display-nama').textContent = nama;

  const btn = document.getElementById('btn-update-profil');
  btn.innerHTML = '<i class="fa-solid fa-check text-xs"></i> Tersimpan!';
  btn.classList.add('bg-green-600');
  btn.classList.remove('bg-[#1e4d2b]');
  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk text-xs"></i> Update Profil';
    btn.classList.remove('bg-green-600');
    btn.classList.add('bg-[#1e4d2b]');
  }, 2000);

  showToast('Profil berhasil diperbarui.');
}

/* ── NIK ───────────────────────────────────────────────── */
function checkNIKMatch() {
  const baru   = document.getElementById('nik-baru').value;
  const konfir = document.getElementById('nik-konfirmasi').value;
  const icon   = document.getElementById('nik-match-icon');
  const inputK = document.getElementById('nik-konfirmasi');

  if (!konfir) {
    inputK.classList.remove('input-match', 'input-mismatch');
    icon.className = 'fa-solid fa-check-circle absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm';
    return;
  }
  if (baru === konfir) {
    inputK.classList.add('input-match');
    inputK.classList.remove('input-mismatch');
    icon.className = 'fa-solid fa-check-circle absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm';
  } else {
    inputK.classList.add('input-mismatch');
    inputK.classList.remove('input-match');
    icon.className = 'fa-solid fa-circle-xmark absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm';
  }
}

function simpanNIK() {
  const lama   = document.getElementById('nik-lama').value.trim();
  const baru   = document.getElementById('nik-baru').value.trim();
  const konfir = document.getElementById('nik-konfirmasi').value.trim();

  hideNIKError();

  if (!lama || !/^\d{16}$/.test(lama)) return showNIKError('NIK saat ini harus tepat 16 digit angka.');
  if (lama !== adminData.nik)           return showNIKError('NIK saat ini tidak sesuai dengan data sistem.');
  if (!baru || !/^\d{16}$/.test(baru)) return showNIKError('NIK baru harus tepat 16 digit angka.');
  if (baru === lama)                    return showNIKError('NIK baru tidak boleh sama dengan NIK lama.');
  if (baru !== konfir)                  return showNIKError('Konfirmasi NIK baru tidak cocok.');

  adminData.nik = baru;
  document.getElementById('nik-lama').value      = '';
  document.getElementById('nik-baru').value      = '';
  document.getElementById('nik-konfirmasi').value = '';
  document.getElementById('nik-konfirmasi').classList.remove('input-match', 'input-mismatch');
  showToast('NIK berhasil diperbarui.');
}

function showNIKError(msg) {
  document.getElementById('nik-error-msg').textContent = msg;
  document.getElementById('nik-error').classList.remove('hidden');
}
function hideNIKError() {
  document.getElementById('nik-error').classList.add('hidden');
}

/* ── PASSWORD ──────────────────────────────────────────── */
function togglePass(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eye   = document.getElementById(eyeId);
  if (input.type === 'password') {
    input.type = 'text';
    eye.className = eye.className.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    eye.className = eye.className.replace('fa-eye-slash', 'fa-eye');
  }
}

function checkPasswordStrength() {
  const val = document.getElementById('pass-baru').value;
  const bars = ['s1', 's2', 's3', 's4'];
  const label = document.getElementById('strength-label');

  const checks = {
    length:  val.length >= 8,
    upper:   /[A-Z]/.test(val),
    number:  /[0-9]/.test(val),
    special: /[^A-Za-z0-9]/.test(val),
  };

  // Update requirement indicators
  setReq('req-length',  checks.length);
  setReq('req-upper',   checks.upper);
  setReq('req-number',  checks.number);
  setReq('req-special', checks.special);

  const score = Object.values(checks).filter(Boolean).length;
  const configs = [
    { label: 'Terlalu lemah',  color: 'strength-weak',   filled: 1 },
    { label: 'Lemah',          color: 'strength-weak',   filled: 1 },
    { label: 'Cukup',          color: 'strength-fair',   filled: 2 },
    { label: 'Kuat',           color: 'strength-good',   filled: 3 },
    { label: 'Sangat Kuat',    color: 'strength-strong',  filled: 4 },
  ];

  const cfg = configs[score];
  bars.forEach((id, i) => {
    const bar = document.getElementById(id);
    bar.className = 'strength-bar ' + (i < cfg.filled ? cfg.color : '');
  });

  label.textContent = val.length === 0 ? 'Masukkan password baru untuk mengecek kekuatannya.' : cfg.label;
  label.style.color = score >= 3 ? '#16a34a' : score === 2 ? '#d97706' : '#ef4444';
}

function setReq(id, pass) {
  const el = document.getElementById(id);
  el.classList.toggle('req-pass', pass);
  el.classList.toggle('req-fail', !pass);
}

function checkPassMatch() {
  const baru  = document.getElementById('pass-baru').value;
  const konf  = document.getElementById('pass-konfirmasi');
  if (!konf.value) { konf.classList.remove('input-match', 'input-mismatch'); return; }
  if (baru === konf.value) {
    konf.classList.add('input-match'); konf.classList.remove('input-mismatch');
  } else {
    konf.classList.add('input-mismatch'); konf.classList.remove('input-match');
  }
}

function simpanPassword() {
  const lama  = document.getElementById('pass-lama').value;
  const baru  = document.getElementById('pass-baru').value;
  const konfir = document.getElementById('pass-konfirmasi').value;

  hidePassError();

  if (!lama)             return showPassError('Password lama tidak boleh kosong.');
  if (baru.length < 8)   return showPassError('Password baru minimal 8 karakter.');
  if (!/[A-Z]/.test(baru))  return showPassError('Password harus mengandung huruf kapital.');
  if (!/[0-9]/.test(baru))  return showPassError('Password harus mengandung angka.');
  if (baru !== konfir)   return showPassError('Konfirmasi password tidak cocok.');

  // Simulate — in real app, verify old password server-side
  document.getElementById('pass-lama').value      = '';
  document.getElementById('pass-baru').value      = '';
  document.getElementById('pass-konfirmasi').value = '';
  document.getElementById('pass-konfirmasi').classList.remove('input-match', 'input-mismatch');
  checkPasswordStrength(); // reset strength bars

  showToast('Password berhasil diperbarui. Silakan login kembali jika diminta.');
}

function showPassError(msg) {
  document.getElementById('pass-error-msg').textContent = msg;
  document.getElementById('pass-error').classList.remove('hidden');
}
function hidePassError() {
  document.getElementById('pass-error').classList.add('hidden');
}

/* ── SESSION ───────────────────────────────────────────── */
function akhiriSesi() {
  showToast('Sesi perangkat lain berhasil diakhiri.', 'warning');
}
function akhiriSemuaSesi() {
  showToast('Semua sesi lain telah diakhiri.', 'warning');
}

/* ── TOAST ─────────────────────────────────────────────── */
let toastTimeout;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toast-icon');
  document.getElementById('toast-msg').textContent = msg;

  const styles = {
    success: { bg: '#1e4d2b', iconClass: 'fa-solid fa-check-circle text-green-300' },
    error:   { bg: '#ef4444', iconClass: 'fa-solid fa-circle-exclamation text-white' },
    warning: { bg: '#d97706', iconClass: 'fa-solid fa-triangle-exclamation text-white' },
  };
  const s = styles[type] || styles.success;
  toast.style.background = s.bg;
  icon.className = s.iconClass;

  toast.classList.remove('hidden');
  toast.classList.add('toast-in');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-in');
  }, 3500);
}
