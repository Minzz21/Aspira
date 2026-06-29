let akunWargaData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;
let currentFilterDusun = 'semua';
let searchQuery = '';

const tableBody = document.getElementById('tableBody');
const filterContainer = document.getElementById('filterContainer');
const totalWargaEl = document.getElementById('totalWarga');
const totalLakiEl = document.getElementById('totalLaki');
const persenLakiEl = document.getElementById('persenLaki');
const totalPerempuanEl = document.getElementById('totalPerempuan');
const persenPerempuanEl = document.getElementById('persenPerempuan');
const searchInput = document.getElementById('searchInput');

// Colors for avatars
const avatarColors = [
  'bg-emerald-400 text-emerald-900',
  'bg-orange-300 text-orange-900',
  'bg-blue-300 text-blue-900',
  'bg-purple-300 text-purple-900',
  'bg-pink-300 text-pink-900',
  'bg-yellow-300 text-yellow-900'
];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRandomColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function initFirebase() {
  if (typeof db === 'undefined') {
    console.error("Firebase tidak terinisialisasi. Pastikan firebase-config.js dimuat.");
    tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-red-500">Error: Database connection failed.</td></tr>';
    return;
  }

  const akunCol = db.collection('akun_warga');
  
  akunCol.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    akunWargaData = [];
    let dusunSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      akunWargaData.push(data);
      if (data.dusun) dusunSet.add(data.dusun);
    });

    updateStats();
    renderDusunFilters(Array.from(dusunSet));
    applyFilters();
  }, (error) => {
    console.error("Error mengambil data akun warga: ", error);
    tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-red-500">Gagal memuat data.</td></tr>';
  });
}

function updateStats() {
  const total = akunWargaData.length;
  totalWargaEl.textContent = total.toLocaleString('id-ID');
  
  const laki = akunWargaData.filter(d => (d.gender || '').toLowerCase() === 'laki-laki' || (d.gender || '').toLowerCase() === 'l').length;
  const perempuan = akunWargaData.filter(d => (d.gender || '').toLowerCase() === 'perempuan' || (d.gender || '').toLowerCase() === 'p').length;
  
  totalLakiEl.textContent = laki.toLocaleString('id-ID');
  totalPerempuanEl.textContent = perempuan.toLocaleString('id-ID');

  if (total > 0) {
    persenLakiEl.textContent = ((laki / total) * 100).toFixed(1) + '% dari populasi';
    persenPerempuanEl.textContent = ((perempuan / total) * 100).toFixed(1) + '% dari populasi';
  } else {
    persenLakiEl.textContent = '0% dari populasi';
    persenPerempuanEl.textContent = '0% dari populasi';
  }
}

function renderDusunFilters(dusunList) {
  // Simpan button "Semua"
  filterContainer.innerHTML = '<button class="filter-btn active" data-filter="semua">Semua</button>';
  
  // Sort dusun alphabetically
  dusunList.sort().forEach(dusun => {
    if(!dusun) return;
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = dusun;
    btn.textContent = dusun;
    filterContainer.appendChild(btn);
  });

  // Re-attach event listeners
  const buttons = filterContainer.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.dataset.filter === currentFilterDusun) {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', (e) => {
      buttons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilterDusun = e.target.dataset.filter;
      currentPage = 1;
      applyFilters();
    });
  });
}

function applyFilters() {
  filteredData = akunWargaData.filter(item => {
    // Filter Dusun
    if (currentFilterDusun !== 'semua' && item.dusun !== currentFilterDusun) {
      return false;
    }
    // Filter Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const namaMatch = (item.nama || '').toLowerCase().includes(q);
      const nikMatch = (item.nik || '').toLowerCase().includes(q);
      if (!namaMatch && !nikMatch) return false;
    }
    return true;
  });

  renderTable();
}

function renderTable() {
  if (filteredData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>';
    updatePaginationInfo();
    return;
  }

  tableBody.innerHTML = '';
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);

  pageData.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50/50 transition';
    
    const globalIndex = startIndex + index + 1;
    const initial = getInitials(item.nama);
    const colorClass = getRandomColor(item.nama || 'U');
    
    // Parse Gender to L / P
    let genderCode = '-';
    if (item.gender) {
      const g = item.gender.toLowerCase();
      if (g === 'laki-laki' || g === 'l') genderCode = 'L';
      else if (g === 'perempuan' || g === 'p') genderCode = 'P';
    }

    const dusunText = item.dusun || '-';
    // Format dusun tag for UI like 'Dusun' \n 'Mawar'
    let dusunHtml = `<div class="tag-dusun-label bg-gray-100 text-gray-600">${dusunText}</div>`;
    if(dusunText.toLowerCase().startsWith('dusun ')) {
      const splitName = dusunText.substring(6);
      dusunHtml = `<div class="tag-dusun text-center"><span class="text-[10px] text-gray-500">Dusun</span><span class="tag-dusun-label bg-gray-100">${splitName}</span></div>`;
    }

    tr.innerHTML = `
      <td class="px-6 py-4 text-sm text-gray-500">${globalIndex}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="avatar-circle ${colorClass}">${initial}</div>
          <span class="font-medium text-gray-800">${item.nama || '-'}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 font-mono">${item.nik || '-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${genderCode}</td>
      <td class="px-6 py-4">${dusunHtml}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${formatDate(item.createdAt)}</td>
      <td class="px-6 py-4 text-center">
        <div class="flex items-center justify-center gap-3">
          <button class="text-gray-400 hover:text-[#1e4d2b] transition" title="Edit" onclick="editWarga('${item.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="text-gray-400 hover:text-red-500 transition" title="Hapus" onclick="hapusWarga('${item.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  updatePaginationInfo();
  renderPaginationControls();
}

function updatePaginationInfo() {
  const start = filteredData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const end = Math.min(currentPage * itemsPerPage, filteredData.length);
  
  document.getElementById('paginationInfo').innerHTML = `Menampilkan <span class="font-medium text-gray-800">${end > 0 ? itemsPerPage : 0}</span> dari <span class="font-medium text-gray-800">${filteredData.length.toLocaleString('id-ID')}</span> data`;
}

function renderPaginationControls() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const container = document.getElementById('paginationControls');
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  
  // Prev button
  html += `
    <button onclick="goToPage(${currentPage - 1})" class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left text-xs"></i>
    </button>
  `;

  // Page numbers (simplified)
  let startP = Math.max(1, currentPage - 1);
  let endP = Math.min(totalPages, startP + 2);
  
  if (endP - startP < 2 && totalPages > 2) {
    startP = Math.max(1, endP - 2);
  }

  if (startP > 1) {
    html += `<button onclick="goToPage(1)" class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">1</button>`;
    if (startP > 2) html += `<span class="w-8 flex items-center justify-center text-gray-400">...</span>`;
  }

  for (let i = startP; i <= endP; i++) {
    if (i === currentPage) {
      html += `<button class="w-8 h-8 flex items-center justify-center rounded bg-[#1e4d2b] text-white text-sm font-medium">${i}</button>`;
    } else {
      html += `<button onclick="goToPage(${i})" class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">${i}</button>`;
    }
  }

  if (endP < totalPages) {
    if (endP < totalPages - 1) html += `<span class="w-8 flex items-center justify-center text-gray-400">...</span>`;
    html += `<button onclick="goToPage(${totalPages})" class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">${totalPages}</button>`;
  }

  // Next button
  html += `
    <button onclick="goToPage(${currentPage + 1})" class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right text-xs"></i>
    </button>
  `;

  container.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  currentPage = 1;
  applyFilters();
});

function exportPDF() {
  showToast("Fitur Export PDF sedang dikembangkan.");
}

function openTambahWargaModal() {
  showToast("Fitur Tambah Warga sedang dikembangkan.");
}

function editWarga(id) {
  showToast("Fitur Edit Warga sedang dikembangkan.");
}

function hapusWarga(id) {
  if(confirm("Apakah Anda yakin ingin menghapus akun warga ini?")) {
    db.collection('akun_warga').doc(id).delete().then(() => {
      showToast("Akun warga berhasil dihapus.");
    }).catch(err => {
      console.error(err);
      showToast("Gagal menghapus akun warga.");
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-full', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});
