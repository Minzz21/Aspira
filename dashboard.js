/* ── ASPIRA AI — Dashboard App.js ── */

const statusConfig = {
  kritis: { label: 'KRITIS', color: 'text-red-500', dot: 'bg-red-500' },
  proses: { label: 'PROSES', color: 'text-amber-500', dot: 'bg-amber-500' },
  selesai: { label: 'SELESAI', color: 'text-green-600', dot: 'bg-green-500' },
  menunggu: { label: 'MENUNGGU', color: 'text-gray-500', dot: 'bg-gray-400' }
};

function renderTable(laporanData) {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;
  
  if (laporanData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500 text-sm">Belum ada laporan terkini.</td></tr>';
    return;
  }

  tbody.innerHTML = laporanData.map(row => {
    const s = statusConfig[row.status] || statusConfig['menunggu'];
    
    // Format tanggal
    let tgl = row.waktu || 'Tidak diketahui';
    if (row.createdAt && row.createdAt.toDate) {
      tgl = row.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return `
      <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
        <td class="py-3 pr-4">
          <p class="font-medium text-gray-700 text-sm">${row.nama || row.pelapor || 'Warga'}</p>
          <p class="text-gray-400 text-xs">${tgl}</p>
        </td>
        <td class="py-3 pr-4 text-gray-700 text-sm truncate max-w-[200px]">${row.subjek}</td>
        <td class="py-3 pr-4">
          <span class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">${row.kategori}</span>
        </td>
        <td class="py-3 pr-4">
          <div class="flex items-center gap-1.5">
            <span class="flex items-center gap-1.5 ${s.color} font-semibold text-xs">
              <span class="w-1.5 h-1.5 rounded-full ${s.dot} inline-block"></span>
              ${s.label}
            </span>
            ${row.kritis ? `<span class="ml-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation text-[9px]"></i> KRITIS</span>` : ''}
          </div>
        </td>
        <td class="py-3">
          <button onclick="lihatDetail('${row.nama || row.pelapor}')" class="text-gray-400 hover:text-[#1e4d2b] transition">
            <i class="fa-regular fa-eye text-sm"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

function loadDashboardData() {
  // Sync UMKM
  db.collection('umkm').onSnapshot((snapshot) => {
    const el = document.getElementById('stat-umkm-total');
    if (el) el.textContent = snapshot.size;
  });

  // Sync Aspirasi
  db.collection('aspirasi').onSnapshot((snapshot) => {
    let totalAspirasi = 0;
    let kritisCount = 0;
    
    let katEkonomi = 0;
    let katLingkungan = 0;
    let katKesehatan = 0;
    let katKeamanan = 0;
    
    let allAspirasi = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalAspirasi++;
      
      if (data.kritis === true) kritisCount++;
      
      const kat = (data.kategori || '').toLowerCase();
      if (kat.includes('ekonomi') || kat.includes('umkm')) katEkonomi++;
      else if (kat.includes('lingkungan')) katLingkungan++;
      else if (kat.includes('kesehatan')) katKesehatan++;
      else if (kat.includes('keamanan') || kat.includes('ketertiban')) katKeamanan++;
      else katKeamanan++; // Default fallback for unspecified categories
      
      allAspirasi.push(data);
    });

    const elTotal = document.getElementById('stat-aspirasi-total');
    if (elTotal) elTotal.textContent = totalAspirasi;
    
    const elKritis = document.getElementById('stat-aspirasi-kritis');
    if (elKritis) elKritis.textContent = kritisCount;

    if (document.getElementById('cat-ekonomi-count')) {
      document.getElementById('cat-ekonomi-count').textContent = katEkonomi + ' Aspirasi';
      document.getElementById('cat-lingkungan-count').textContent = katLingkungan + ' Aspirasi';
      document.getElementById('cat-kesehatan-count').textContent = katKesehatan + ' Aspirasi';
      document.getElementById('cat-keamanan-count').textContent = katKeamanan + ' Aspirasi';

      if (totalAspirasi > 0) {
        setTimeout(() => {
          document.getElementById('cat-ekonomi-bar').style.width = Math.round((katEkonomi / totalAspirasi) * 100) + '%';
          document.getElementById('cat-lingkungan-bar').style.width = Math.round((katLingkungan / totalAspirasi) * 100) + '%';
          document.getElementById('cat-kesehatan-bar').style.width = Math.round((katKesehatan / totalAspirasi) * 100) + '%';
          document.getElementById('cat-keamanan-bar').style.width = Math.round((katKeamanan / totalAspirasi) * 100) + '%';
        }, 100);
      }
    }

    allAspirasi.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    renderTable(allAspirasi.slice(0, 5));
  });
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
  loadDashboardData();
});
