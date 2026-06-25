/* ── Profil Desa JS ── */

const wilayahData = [
  { id: 'dusun1', wilayah: 'Dusun I - Krajan', umkm: 128, tenaga: 312, omzet: '4.2 Juta', growth: 'up' },
  { id: 'dusun2', wilayah: 'Dusun II - Sidomulyo', umkm: 97, tenaga: 241, omzet: '3.1 Juta', growth: 'mid' },
  { id: 'dusun3', wilayah: 'Dusun III - Wariagin', umkm: 117, tenaga: 289, omzet: '3.8 Juta', growth: 'up' },
];

let currentPage = 1;
const rowsPerPage = 3;
let filteredData = [...wilayahData];

function renderWilayahTable() {
  const tbody = document.getElementById('wilayah-table-body');
  if (!tbody) return;
  const start = (currentPage - 1) * rowsPerPage;
  const paged = filteredData.slice(start, start + rowsPerPage);

  tbody.innerHTML = paged.map(row => `
    <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
      <td class="py-3 pr-4 font-semibold text-gray-700">${row.wilayah}</td>
      <td class="py-3 pr-4 text-gray-600">${row.umkm} UMKM</td>
      <td class="py-3 pr-4 text-gray-600">${row.tenaga} Orang</td>
      <td class="py-3 pr-4 text-gray-600">Rp ${row.omzet}</td>
      <td class="py-3 pr-4">
        <span class="badge-growth-${row.growth}">
          ${row.growth === 'up' ? '▲ Tumbuh' : row.growth === 'mid' ? '● Stabil' : '▼ Turun'}
        </span>
      </td>
      <td class="py-3">
        <button onclick="lihatDetailWilayah('${row.wilayah}')" class="text-[#1e4d2b] text-xs font-medium hover:underline">Detail</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('pagination-info').textContent =
    `Menampilkan ${paged.length} dari ${filteredData.length} Dusun`;
}

function filterTable() {
  const dusun = document.getElementById('filter-dusun').value;
  filteredData = dusun === 'semua' ? [...wilayahData] : wilayahData.filter(w => w.id === dusun);
  currentPage = 1;
  renderWilayahTable();
}

function changePage(dir) {
  const total = Math.ceil(filteredData.length / rowsPerPage);
  currentPage = Math.max(1, Math.min(total, currentPage + dir));
  renderWilayahTable();
}

function animateBars() {
  setTimeout(() => {
    document.querySelectorAll('[data-target]').forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 400);
}

function initMap() {
  const map = L.map('map').setView([-7.250445, 112.768845], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  const markers = [
    { lat: -7.248, lng: 112.766, label: 'Kantor Desa' },
    { lat: -7.252, lng: 112.771, label: 'Pasar Desa' },
    { lat: -7.246, lng: 112.774, label: 'Balai Warga' },
  ];
  markers.forEach(m => {
    L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.label);
  });
}

function lihatDetailWilayah(nama) {
  showModal('Detail Wilayah', `Menampilkan detail UMKM untuk ${nama}.`);
}
function eksporData() {
  showModal('Export Data', 'Data UMKM sedang diekspor ke format Excel.');
}
function registrasiUMKM() {
  showModal('Registrasi UMKM', 'Formulir registrasi UMKM baru akan segera dibuka.');
}
function showModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  renderWilayahTable();
  animateBars();
  initMap();
});
