/* ── ASPIRA AI — Dashboard App.js ── */

const laporanData = [
  {
    pelapor: 'Bp. Sutisna',
    tanggal: '12 Okt 2024',
    subjek: 'Permohonan Izin Lokasi Pasar Desa Dadakan',
    kategori: 'Pasar Desa',
    status: 'kritis',
  },
  {
    pelapor: 'Ibu Rohaya',
    tanggal: '11 Okt 2024',
    subjek: 'Pendaftaran Pelatihan UMKM Digital',
    kategori: 'Pelatihan',
    status: 'proses',
  },
  {
    pelapor: 'Bpk. Sugeng',
    tanggal: '10 Okt 2024',
    subjek: 'Kendala Izin Usaha Kedai Kopi',
    kategori: 'UMKM',
    status: 'kritis',
  },
  {
    pelapor: 'Ibu Mariam',
    tanggal: '09 Okt 2024',
    subjek: 'Permohonan Bantuan Sosial Warga Kurang Mampu',
    kategori: 'Sosial',
    status: 'proses',
  },
  {
    pelapor: 'Pak Warsono',
    tanggal: '08 Okt 2024',
    subjek: 'Kerusakan Jalan Poros Dusun Tengah',
    kategori: 'Infrastruktur',
    status: 'selesai',
  },
];

const statusConfig = {
  kritis: { label: 'KRITIS', color: 'text-red-500', dot: 'bg-red-500' },
  proses: { label: 'PROSES', color: 'text-amber-500', dot: 'bg-amber-500' },
  selesai: { label: 'SELESAI', color: 'text-green-600', dot: 'bg-green-500' },
};

function renderTable() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;
  tbody.innerHTML = laporanData.map(row => {
    const s = statusConfig[row.status];
    return `
      <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
        <td class="py-3 pr-4">
          <p class="font-medium text-gray-700 text-sm">${row.pelapor}</p>
          <p class="text-gray-400 text-xs">${row.tanggal}</p>
        </td>
        <td class="py-3 pr-4 text-gray-700">${row.subjek}</td>
        <td class="py-3 pr-4">
          <span class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">${row.kategori}</span>
        </td>
        <td class="py-3 pr-4">
          <span class="flex items-center gap-1.5 ${s.color} font-semibold text-xs">
            <span class="w-1.5 h-1.5 rounded-full ${s.dot} inline-block"></span>
            ${s.label}
          </span>
        </td>
        <td class="py-3">
          <button onclick="lihatDetail('${row.pelapor}')" class="text-gray-400 hover:text-[#1e4d2b] transition">
            <i class="fa-regular fa-eye text-sm"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

function animateProgressBars() {
  const fills = document.querySelectorAll('.progress-fill[data-target]');
  setTimeout(() => {
    fills.forEach(f => { f.style.width = f.dataset.target; });
  }, 400);
}

function lihatDetail(nama) {
  showModal('Detail Laporan', `Membuka detail laporan dari ${nama}. Fitur lengkap tersedia di halaman Aspirasi Warga.`);
}
function eksporPDF() {
  showModal('Ekspor PDF', 'Laporan sedang digenerate. File akan tersedia dalam beberapa detik.');
}
function tindakLanjut() {
  showModal('Tindak Lanjut', 'Notifikasi telah dikirim ke penanggung jawab terkait.');
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
  renderTable();
  animateProgressBars();
});
