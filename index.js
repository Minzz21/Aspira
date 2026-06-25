/* ── Login JS (TERINTEGRASI FIREBASE COMPAT) ── */

// Referensi ke Collection 'admins' di Firestore (didefinisikan di shared/firebase-config.js)
const adminsCol = db.collection('admins');

function togglePassword() {
  const input = document.getElementById('input-password');
  const icon = document.getElementById('eye-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  
  toast.classList.remove('hidden');
  toast.classList.add('toast-animate');
  
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-animate');
  }, 3500);
}

function toggleLoading(isLoading) {
  const btnText = document.getElementById('btn-text');
  const btnIcon = document.getElementById('btn-icon');
  const btnSpinner = document.getElementById('btn-spinner');
  const btn = document.getElementById('btn-login');

  if (isLoading) {
    btn.disabled = true;
    btnText.textContent = 'Memverifikasi...';
    btnIcon.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    btnText.textContent = 'Masuk';
    btnIcon.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const nik = document.getElementById('input-nik').value.trim();
  const password = document.getElementById('input-password').value;

  if (!nik || !password) {
    showToast('Harap masukkan NIK dan Kata Sandi.');
    return;
  }

  toggleLoading(true);

  try {
    // Mencari admin berdasarkan NIK di database Firestore
    const snapshot = await adminsCol.where('nik', '==', nik).get();

    if (snapshot.empty) {
      // NIK tidak ditemukan
      toggleLoading(false);
      showToast('Kredensial tidak valid. NIK tidak ditemukan.');
      return;
    }

    let isAuthenticated = false;
    let adminData = null;

    // Memeriksa apakah password cocok
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.password === password) {
        isAuthenticated = true;
        adminData = { id: doc.id, ...data };
      }
    });

    if (isAuthenticated) {
      // Simpan status login sementara di localStorage agar bisa dibaca halaman lain
      localStorage.setItem('aspira_admin_logged_in', 'true');
      localStorage.setItem('aspira_admin_name', adminData.nama || 'Administrator');
      localStorage.setItem('aspira_admin_nik', adminData.nik);
      
      // Redirect ke Dashboard Utama
      window.location.href = 'dashboard.html';
    } else {
      toggleLoading(false);
      showToast('Kredensial tidak valid. Kata Sandi salah.');
    }

  } catch (error) {
    console.error("Login error:", error);
    toggleLoading(false);
    showToast('Terjadi kesalahan jaringan. Cek koneksi internet Anda.');
  }
}

// Fungsi otomatis untuk menambahkan Admin (Sesuai Permintaan) jika database masih kosong
async function seedAdmin() {
  try {
    const targetNik = '1122334455667788';
    const snapshot = await adminsCol.where('nik', '==', targetNik).get();
    
    // Jika admin dengan NIK tersebut belum ada di database, kita tambahkan otomatis!
    if (snapshot.empty) {
      console.log('Menyiapkan data Admin default ke Firestore...');
      await adminsCol.add({
        nama: 'Admin Utama',
        nik: targetNik,
        password: 'Admin12345',
        role: 'superadmin',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Data Admin berhasil disuntikkan ke database!');
    } else {
      console.log('Data Admin sudah ada di database.');
    }
  } catch (error) {
    console.error('Gagal memeriksa data admin:', error);
  }
}

// Jalankan fungsi seeder saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  seedAdmin();
});
