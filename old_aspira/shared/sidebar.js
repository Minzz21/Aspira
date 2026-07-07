document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      // Toggle class on the <html> tag (document.documentElement)
      document.documentElement.classList.toggle('sidebar-is-collapsed');
      
      // Save to localStorage
      const currentlyCollapsed = document.documentElement.classList.contains('sidebar-is-collapsed');
      localStorage.setItem('sidebar_collapsed', currentlyCollapsed);
    });
  }

  // Handle Logout secara global
  const logoutBtn = document.querySelector('a[data-title="Keluar"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Konfirmasi keluar
      if (!confirm('Apakah Anda yakin ingin keluar?')) return;
      
      // Bersihkan semua sesi dari localStorage
      localStorage.removeItem('aspira_admin_logged_in');
      localStorage.removeItem('aspira_admin_id');
      localStorage.removeItem('aspira_admin_name');
      localStorage.removeItem('aspira_admin_nik');
      localStorage.removeItem('aspira_admin_role');
      localStorage.removeItem('aspira_admin_email');
      localStorage.removeItem('aspira_admin_telp');
      
      // Deteksi apakah pengguna berada di subfolder atau folder utama
      // Jika head memuat '../dashboard.css', berarti di subfolder
      const isSubfolder = document.querySelector('link[href="../dashboard.css"]') !== null;
      window.location.href = isSubfolder ? '../index.html' : 'index.html';
    });
  }

  // Update profil sidebar secara dinamis
  updateGlobalSidebarProfile();
});

// Fungsi untuk memperbarui profil admin di semua sidebar secara dinamis
window.updateGlobalSidebarProfile = function() {
  const nameEl = document.querySelector('.sidebar-user-section .sidebar-text p:nth-child(1)');
  const roleEl = document.querySelector('.sidebar-user-section .sidebar-text p:nth-child(2)');
  const avatarImg = document.querySelector('.sidebar-user-section img');
  const avatarDiv = document.querySelector('#sidebar-avatar'); // Fallback untuk pengaturan.html

  const nama = localStorage.getItem('aspira_admin_name') || 'Admin Utama';
  const role = localStorage.getItem('aspira_admin_role') || 'Administrator';

  const avatarUrl = localStorage.getItem('aspira_admin_avatar');

  if (nameEl) nameEl.textContent = nama;
  if (roleEl) roleEl.textContent = role;

  if (avatarUrl) {
    if (avatarImg) {
      avatarImg.src = avatarUrl;
    } else if (avatarDiv) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.className = avatarDiv.className;
      img.id = 'sidebar-avatar';
      img.style.objectFit = 'cover';
      avatarDiv.parentNode.replaceChild(img, avatarDiv);
    }
  } else {
    if (avatarImg) {
      avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=4ade80&color=1e4d2b&size=40`;
    } else if (avatarDiv) {
      const parts = nama.trim().split(' ');
      const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : nama[0].toUpperCase();
      avatarDiv.textContent = initials;
    }
  }
};
