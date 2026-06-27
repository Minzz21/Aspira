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
  loadPopulationData();
});

/* ── Population Infographic – Firebase Sync ── */

function loadPopulationData() {
  const whitelistCol = db.collection('whitelist');

  // onSnapshot = real-time listener, infografis auto-update ketika whitelist berubah
  whitelistCol.onSnapshot((snapshot) => {
    let total = 0;
    let male = 0;
    let female = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      if (data.gender === 'Perempuan') female++;
      else male++; // default ke laki-laki jika field gender belum ada
    });

    updatePopulationInfographic(total, male, female);
  }, (error) => {
    console.error('Error memuat data penduduk:', error);
    document.getElementById('stat-total').textContent = 'Error';
  });
}

function updatePopulationInfographic(total, male, female) {
  const malePct = total > 0 ? ((male / total) * 100) : 0;
  const femalePct = total > 0 ? ((female / total) * 100) : 0;
  const ratio = female > 0 ? (male / female).toFixed(2) : '–';

  // Animate counters
  animateCounter('stat-total', total);
  animateCounter('stat-male', male);
  animateCounter('stat-female', female);

  // Update subtitle
  document.getElementById('stat-total-sub').innerHTML =
    `<i class="fa-solid fa-database mr-1"></i>${total} warga terdaftar`;

  // Update percentages
  document.getElementById('stat-male-pct').textContent =
    `${malePct.toFixed(1)}% dari total`;
  document.getElementById('stat-female-pct').textContent =
    `${femalePct.toFixed(1)}% dari total`;

  // Update ratio text
  document.getElementById('ratio-text').textContent = ratio;

  // Update gender ring SVG
  const ringMale = document.querySelector('.pop-ring-male');
  const ringFemale = document.querySelector('.pop-ring-female');

  if (ringMale) {
    ringMale.dataset.target = malePct.toFixed(1);
    ringMale.setAttribute('stroke-dasharray', `${malePct} ${100 - malePct}`);
  }
  if (ringFemale) {
    ringFemale.dataset.target = femalePct.toFixed(1);
    ringFemale.dataset.offset = malePct.toFixed(1);
    ringFemale.setAttribute('stroke-dasharray', `${femalePct} ${100 - femalePct}`);
    ringFemale.setAttribute('stroke-dashoffset', `-${malePct}`);
  }

  // Update per-dusun distribution bars (if data has dusun breakdown)
  updateDusunBreakdown();
}

function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 1400;
  const startVal = parseInt(el.textContent.replace(/\D/g, '')) || 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString('id-ID');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function updateDusunBreakdown() {
  // Future: bisa query per-dusun dari whitelist untuk breakdown
  // Saat ini distribusi usia tetap statis karena data whitelist belum punya field usia
}


