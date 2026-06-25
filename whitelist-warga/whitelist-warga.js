/* ── Whitelist Warga JS (TERINTEGRASI FIREBASE COMPAT) ── */

let rawData = [];
let filteredData = [];
let currentFilter = 'semua';
let searchQuery = '';

// Pagination state
let currentPage = 1;
const itemsPerPage = 4;

let deleteTargetId = null;

// Referensi ke Collection 'whitelist' di Firestore (didefinisikan di firebase-config.js)
const whitelistCol = db.collection('whitelist');

function init() {
  // Gunakan onSnapshot agar tabel langsung update ketika data di Firestore berubah
  whitelistCol.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    rawData = [];
    snapshot.forEach((docSnap) => {
      rawData.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    updateTotalWarga();
    applyFilters();
  }, (error) => {
    console.error("Error mengambil data: ", error);
    showToast("Gagal terhubung ke database.", "error");
  });
}

/* ── Render & Filter ──────────────────────────────────── */

function applyFilters() {
  filteredData = rawData.filter(item => {
    const matchFilter = currentFilter === 'semua' || item.status.toLowerCase() === currentFilter;
    const s = searchQuery.toLowerCase();
    const matchSearch = item.nama.toLowerCase().includes(s) || 
                        item.nik.includes(s) || 
                        item.dusun.toLowerCase().includes(s);
    return matchFilter && matchSearch;
  });
  currentPage = 1;
  renderTable();
  renderPagination();
}

function setFilter(filter) {
  currentFilter = filter;
  ['semua', 'aktif', 'nonaktif'].forEach(f => {
    const btn = document.getElementById(`chip-${f}`);
    btn.className = (f === filter) ? 'chip chip-active' : 'chip chip-inactive';
  });
  applyFilters();
}

function handleSearch() {
  searchQuery = document.getElementById('search-input').value;
  applyFilters();
}

function renderTable() {
  const tbody = document.getElementById('whitelist-table');
  
  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 text-sm">Belum ada data warga. Klik Tambah Warga untuk memasukkan data.</td></tr>`;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const paged = filteredData.slice(start, start + itemsPerPage);

  tbody.innerHTML = paged.map(item => `
    <tr class="border-b border-gray-50 hover:bg-gray-50/80 transition">
      <td class="py-4 px-5">
        <p class="font-bold text-gray-800 text-sm">${item.nama}</p>
      </td>
      <td class="py-4 px-5">
        <span class="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${item.nik}</span>
      </td>
      <td class="py-4 px-5 text-sm text-gray-600">${item.dusun}</td>
      <td class="py-4 px-5">
        <span class="badge-${item.status.toLowerCase()} text-[10px] font-bold px-2.5 py-1 rounded-full">${item.status}</span>
      </td>
      <td class="py-4 px-5 text-xs text-gray-500">${item.tanggal}</td>
      <td class="py-4 px-5 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="editData('${item.id}')" class="w-7 h-7 rounded border border-green-200 text-green-600 hover:bg-green-50 transition flex items-center justify-center" title="Edit">
            <i class="fa-solid fa-pen text-[10px]"></i>
          </button>
          <button onclick="confirmDeleteModal('${item.id}')" class="w-7 h-7 rounded border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center" title="Hapus">
            <i class="fa-solid fa-trash-can text-[10px]"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateTotalWarga() {
  document.getElementById('total-warga').textContent = rawData.length;
}

/* ── Pagination ───────────────────────────────────────── */

function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const container = document.getElementById('page-numbers');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `w-8 h-8 rounded border text-xs transition ${i === currentPage ? 'page-btn-active' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`;
    btn.textContent = i;
    btn.onclick = () => goToPage(i);
    container.appendChild(btn);
  }

  const startIdx = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredData.length);
  document.getElementById('pagination-info').textContent = `Menampilkan ${startIdx} - ${endIdx} dari ${filteredData.length} warga`;
}

function goToPage(page) {
  currentPage = page;
  renderTable();
  renderPagination();
}
function prevPage() { if(currentPage > 1) goToPage(currentPage - 1); }
function nextPage() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if(currentPage < totalPages) goToPage(currentPage + 1);
}

/* ── Form Modal (Tambah/Edit) ─────────────────────────── */

function openFormModal(id = null) {
  const modal = document.getElementById('form-modal');
  const title = document.getElementById('form-modal-title');
  const errNik = document.getElementById('error-nik');
  
  errNik.classList.add('hidden');

  if (id) {
    title.textContent = 'Edit Warga Whitelist';
    const item = rawData.find(d => d.id === id);
    document.getElementById('form-id').value = item.id;
    document.getElementById('input-nama').value = item.nama;
    document.getElementById('input-nik').value = item.nik;
    document.getElementById('input-dusun').value = item.dusun;
    if (item.status === 'Aktif') document.getElementById('radio-aktif').checked = true;
    else document.getElementById('radio-nonaktif').checked = true;
  } else {
    title.textContent = 'Tambah Warga Whitelist';
    document.getElementById('form-id').value = '';
    document.getElementById('input-nama').value = '';
    document.getElementById('input-nik').value = '';
    document.getElementById('input-dusun').value = '';
    document.getElementById('radio-aktif').checked = true;
  }

  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('modal-show'), 10);
}

function closeFormModal() {
  const modal = document.getElementById('form-modal');
  modal.classList.remove('modal-show');
  setTimeout(() => modal.classList.add('hidden'), 200);
}

async function saveData() {
  const id = document.getElementById('form-id').value;
  const nama = document.getElementById('input-nama').value.trim();
  const nik = document.getElementById('input-nik').value.trim();
  const dusun = document.getElementById('input-dusun').value;
  const status = document.getElementById('radio-aktif').checked ? 'Aktif' : 'Nonaktif';

  const errNik = document.getElementById('error-nik');
  
  if (!nama || !nik || !dusun) {
    showToast('Harap lengkapi semua field.', 'error');
    return;
  }
  if (nik.length !== 16) {
    errNik.classList.remove('hidden');
    return;
  }
  errNik.classList.add('hidden');

  try {
    if (id) {
      // EDIT: Perbarui document di Firestore
      const isDup = rawData.some(d => d.nik === nik && d.id !== id);
      if(isDup) { showToast('NIK sudah terdaftar!', 'error'); return; }

      await whitelistCol.doc(id).update({ nama, nik, dusun, status });
      showToast('Data warga berhasil diperbarui.');

    } else {
      // TAMBAH: Buat document baru di Firestore
      const isDup = rawData.some(d => d.nik === nik);
      if(isDup) { showToast('NIK sudah terdaftar!', 'error'); return; }

      const today = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
      await whitelistCol.add({
        nama, 
        nik, 
        dusun, 
        status, 
        tanggal: today,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('Warga baru berhasil ditambahkan.');
    }
    
    closeFormModal();
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    showToast("Terjadi kesalahan sistem. Coba lagi.", "error");
  }
}

function editData(id) {
  openFormModal(id);
}

/* ── Delete Modal ─────────────────────────────────────── */

function confirmDeleteModal(id) {
  deleteTargetId = id;
  const item = rawData.find(d => d.id === id);
  document.getElementById('delete-nama').textContent = item.nama;
  
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('modal-show'), 10);
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('modal-show');
  setTimeout(() => modal.classList.add('hidden'), 200);
  deleteTargetId = null;
}

async function confirmDelete() {
  if (deleteTargetId) {
    try {
      // HAPUS: Menghapus document dari Firestore
      await whitelistCol.doc(deleteTargetId).delete();
      showToast('Data warga berhasil dihapus.');
      closeDeleteModal();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      showToast("Gagal menghapus data.", "error");
    }
  }
}

/* ── Toast Notification ───────────────────────────────── */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  
  document.getElementById('toast-msg').textContent = msg;
  
  if(type === 'error') {
    toast.style.background = '#ef4444';
    icon.className = 'fa-solid fa-circle-exclamation text-white';
  } else {
    toast.style.background = '#1e4d2b';
    icon.className = 'fa-solid fa-check-circle text-green-300';
  }

  toast.classList.remove('hidden');
  toast.classList.add('toast-animate');
  
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-animate');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
