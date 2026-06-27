/* ── Aspirasi Warga JS (TERINTEGRASI FIREBASE COMPAT) ── */

let dataAspirasi = [];
const aspirasiCol = db.collection('aspirasi');

let activeFilter = 'semua';
let searchQuery = '';
let activeReport = dataAspirasi[0];
let currentPage = 1;
const itemsPerPage = 5;

function renderTable() {
  const tbody = document.getElementById('aspirasi-table');
  
  if (dataAspirasi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 text-sm">Belum ada aspirasi warga.</td></tr>`;
    // Clear detail panel if empty
    document.getElementById('detail-subjek').textContent = "-";
    document.getElementById('detail-pelapor').textContent = "-";
    document.getElementById('detail-transkripsi').textContent = "Tidak ada laporan yang dipilih.";
    document.getElementById('page-info').textContent = "Menampilkan 0-0 dari 0 laporan";
    document.getElementById('pagination-container').innerHTML = "";
    return;
  }

  const filtered = dataAspirasi.filter(item => {
    const matchFilter = activeFilter === 'semua' || 
                        (activeFilter === 'kritis' ? item.kritis === true : item.status === activeFilter);
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.subjek.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const paginatedItems = filtered.slice(startIndex, endIndex);

  if (totalItems === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 text-sm">Tidak ada laporan yang cocok dengan filter/pencarian.</td></tr>`;
      document.getElementById('page-info').textContent = "Menampilkan 0-0 dari 0 laporan";
      document.getElementById('pagination-container').innerHTML = "";
      return;
  }

  tbody.innerHTML = paginatedItems.map(item => `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${item.id === activeReport?.id ? 'bg-green-50/30' : ''}" onclick="selectReport('${item.id}')">
      <td class="py-3 px-4 text-xs font-mono text-gray-500">${item.id}</td>
      <td class="py-3 px-4">
        <p class="text-sm font-semibold text-gray-800">${item.nama}</p>
        <p class="text-[10px] text-gray-400">${item.waktu}</p>
      </td>
      <td class="py-3 px-4 text-xs text-gray-600">${item.kategori}</td>
      <td class="py-3 px-4">
        <span class="badge-status status-${item.status}-bg text-[10px] font-bold px-2 py-0.5 rounded-full">${item.status.toUpperCase()}</span>
        ${item.kritis ? '<span class="ml-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-triangle-exclamation"></i> KRITIS</span>' : ''}
      </td>
      <td class="py-3 px-4">
        <button class="text-[#1e4d2b] hover:text-[#164020] text-sm"><i class="fa-solid fa-chevron-right"></i></button>
      </td>
    </tr>
  `).join('');

  document.getElementById('page-info').textContent = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems} laporan`;
  
  // render pagination controls
  let paginationHtml = `
    <button onclick="changePage(-1)" class="px-2 py-1 rounded border border-gray-200 hover:bg-white" ${currentPage === 1 ? 'disabled style="opacity:0.5"' : ''}>&lt;</button>
  `;
  for(let i=1; i<=totalPages; i++) {
     if (i === currentPage) {
       paginationHtml += `<button class="px-2 py-1 rounded border border-gray-200 bg-white font-bold">${i}</button>`;
     } else {
       paginationHtml += `<button onclick="goToPage(${i})" class="px-2 py-1 rounded border border-gray-200 hover:bg-white">${i}</button>`;
     }
  }
  paginationHtml += `
    <button onclick="changePage(1)" class="px-2 py-1 rounded border border-gray-200 hover:bg-white" ${currentPage === totalPages ? 'disabled style="opacity:0.5"' : ''}>&gt;</button>
  `;
  document.getElementById('pagination-container').innerHTML = paginationHtml;
}

function changePage(dir) {
    currentPage += dir;
    renderTable();
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function setFilter(filter) {
  activeFilter = filter;
  currentPage = 1;
  ['semua', 'kritis', 'selesai'].forEach(f => {
    const btn = document.getElementById('filter-' + f);
    if(f === filter) {
      btn.className = 'filter-btn filter-active px-3 py-1.5 rounded-md text-xs font-semibold';
    } else {
      btn.className = 'filter-btn filter-inactive px-3 py-1.5 rounded-md text-xs font-semibold';
    }
  });
  renderTable();
}

function searchLaporan(val) {
  searchQuery = val;
  currentPage = 1;
  renderTable();
}

function selectReport(id) {
  activeReport = dataAspirasi.find(item => item.id === id);
  renderTable();
  updateDetailPanel();
}

function updateDetailPanel() {
  document.getElementById('detail-id').textContent = activeReport.id;
  document.getElementById('detail-subjek').textContent = activeReport.subjek;
  document.getElementById('detail-pelapor').textContent = activeReport.nama;
  document.getElementById('detail-waktu').textContent = activeReport.waktu;
  document.getElementById('detail-kategori').textContent = activeReport.kategori;
  document.getElementById('detail-transkripsi').textContent = activeReport.transkripsi;
  document.getElementById('detail-avatar').textContent = activeReport.nama[5]; 
  
  const badge = document.getElementById('detail-badge');
  badge.className = `badge-status status-${activeReport.status}-bg text-[10px] font-bold px-2 py-0.5 rounded-full`;
  badge.innerHTML = activeReport.status.toUpperCase() + (activeReport.kritis ? ' <span class="ml-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full"><i class="fa-solid fa-triangle-exclamation"></i> KRITIS</span>' : '');

  updateStatus(activeReport.status);
  resetAudio();
}

function updateStatus(status) {
  activeReport.status = status;
  const btns = document.querySelectorAll('.status-btn');
  btns[0].className = `status-btn rounded text-xs font-medium py-2 border ${status==='menunggu' ? 'active-menunggu' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`;
  btns[1].className = `status-btn rounded text-xs font-medium py-2 border ${status==='proses' ? 'active-proses' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`;
  btns[2].className = `status-btn rounded text-xs font-medium py-2 border ${status==='selesai' ? 'active-selesai' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`;
}

async function simpanPerubahan() {
  if (!activeReport) return;
  try {
    await aspirasiCol.doc(activeReport.id).update({
      status: activeReport.status
    });
    showToast(`Status laporan berhasil diperbarui.`);
  } catch (error) {
    console.error("Gagal update status:", error);
    showToast("Gagal mengupdate status laporan.", "error");
  }
}

function copyTranskripsi() {
  navigator.clipboard.writeText(activeReport.transkripsi);
  showToast('Transkripsi berhasil disalin ke clipboard.');
}

function eksporLaporan() {
  showToast('PDF Laporan sedang dibuat...');
}

/* Audio Player Real Implementation */
let isPlaying = false;
let currentAudio = null;

function resetAudio() {
  isPlaying = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const duration = activeReport.durationSeconds || activeReport.duration || 0;
  document.getElementById('play-icon').className = 'fa-solid fa-play ml-0.5';
  document.getElementById('audio-current').textContent = '0:00';
  document.getElementById('audio-total').textContent = `0:${duration.toString().padStart(2, '0')}`;
  generateVisualizer();
}

function generateVisualizer() {
  const vis = document.getElementById('audio-visualizer');
  let barsHtml = '';
  // Generate random heights for waveform
  for(let i=0; i<40; i++) {
    const height = Math.floor(Math.random() * 100) + 20;
    barsHtml += `<div class="vis-bar" style="height: ${height}%" id="bar-${i}"></div>`;
  }
  vis.innerHTML = barsHtml;
}

function base64ToBlobUrl(dataUrl) {
  try {
    const parts = dataUrl.split(',');
    const contentType = parts[0].split(':')[1].split(';')[0];
    const b64Data = parts[1];
    
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: contentType});
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Gagal convert base64 ke blob:", e);
    return dataUrl; // fallback
  }
}

function toggleAudio() {
  if (!activeReport || !activeReport.audioUrl) {
    showToast("Rekaman suara tidak tersedia untuk laporan ini.");
    return;
  }

  // Inisialisasi audio jika belum ada atau berganti laporan
  if (!currentAudio || currentAudio.datasetId !== activeReport.id) {
    if (currentAudio) {
        currentAudio.pause();
        if (currentAudio.src.startsWith('blob:')) URL.revokeObjectURL(currentAudio.src);
    }
    
    // Ubah base64 string yang sangat panjang menjadi file virtual (Blob) agar browser tidak error
    const blobUrl = base64ToBlobUrl(activeReport.audioUrl);
    currentAudio = new Audio(blobUrl);
    currentAudio.datasetId = activeReport.id;
    
    currentAudio.addEventListener('ended', () => {
        resetAudio();
    });

    currentAudio.addEventListener('timeupdate', () => {
        const currentTime = Math.floor(currentAudio.currentTime);
        document.getElementById('audio-current').textContent = `0:${currentTime.toString().padStart(2, '0')}`;
        updateVisualizerColors();
    });
  }

  isPlaying = !isPlaying;
  document.getElementById('play-icon').className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play ml-0.5';
  
  if (isPlaying) {
    currentAudio.play().catch(e => {
        console.error("Gagal memutar audio:", e);
        showToast("Browser memblokir pemutaran audio otomatis.");
        isPlaying = false;
        document.getElementById('play-icon').className = 'fa-solid fa-play ml-0.5';
    });
  } else {
    currentAudio.pause();
  }
}

function updateVisualizerColors() {
  if (!currentAudio) return;
  const repDuration = activeReport.durationSeconds || activeReport.duration || 1;
  const duration = currentAudio.duration && !isNaN(currentAudio.duration) && currentAudio.duration > 0 
                   ? currentAudio.duration : repDuration;
  const pct = currentAudio.currentTime / duration;
  const activeBarIndex = Math.floor(pct * 40);
  for(let i=0; i<40; i++) {
    const bar = document.getElementById(`bar-${i}`);
    if (!bar) continue;
    if(i < activeBarIndex) bar.className = 'vis-bar played';
    else if(i === activeBarIndex) bar.className = 'vis-bar active';
    else bar.className = 'vis-bar';
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
  }, 3000);
}

function initFirebase() {
  // Ambil data aspirasi dari Firestore secara real-time
  aspirasiCol.onSnapshot((snapshot) => {
    dataAspirasi = [];
    snapshot.forEach((docSnap) => {
      dataAspirasi.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    // Sort terbaru (contoh: berdasarkan field createdAt)
    dataAspirasi.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
      const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
      return timeB - timeA;
    });

    if(dataAspirasi.length > 0 && !activeReport) {
      activeReport = dataAspirasi[0];
    }
    
    // Jika data yang sedang aktif dihapus dari DB, reset
    if (activeReport && !dataAspirasi.find(d => d.id === activeReport.id)) {
      activeReport = dataAspirasi.length > 0 ? dataAspirasi[0] : null;
    }

    // Update stats
    let diproses = dataAspirasi.filter(d => d.status === 'proses').length;
    let kritis = dataAspirasi.filter(d => d.kritis === true).length;
    
    if (document.getElementById('stat-aspirasi-total')) {
      document.getElementById('stat-aspirasi-total').textContent = dataAspirasi.length;
      document.getElementById('stat-aspirasi-proses').textContent = diproses;
      document.getElementById('stat-aspirasi-kritis').textContent = kritis;
    }

    renderTable();
    if (activeReport) updateDetailPanel();
  }, (error) => {
    console.error("Error mengambil data aspirasi: ", error);
  });
}

// Simulasi seed data (hanya sekali jika database masih kosong)
async function seedDummyAspirasi() {
  const snapshot = await aspirasiCol.limit(1).get();
  if (snapshot.empty) {
    console.log("Database aspirasi kosong. Menyuntikkan data dummy awal...");
    const dummies = [
      { nama: 'Bpk. Wawan Sutanto', waktu: 'Hari ini, 08:30 WIB', kategori: 'Infrastruktur & Jalan', status: 'menunggu', kritis: true, subjek: 'Jembatan Dusun Wariagin Ambruk Sebagian', transkripsi: '"Assalamualaikum Pak Kades, ini saya Wawan dari Dusun Wariagin RT 3. Tolong segera ditindaklanjuti jembatan penghubung yang ke arah persawahan itu ambruk separuh gara-gara banjir semalam. Warga nggak bisa lewat bawa hasil panen. Bahaya sekali kalau dibiarkan, tolong secepatnya ada perbaikan sementara."', duration: 45, createdAt: firebase.firestore.FieldValue.serverTimestamp() },
      { nama: 'Ibu Siti Aminah', waktu: 'Kemarin, 14:15 WIB', kategori: 'Bantuan Sosial', status: 'proses', subjek: 'Distribusi Bansos Belum Merata', transkripsi: '"Pak, tolong dicek lagi data penerima bansos di Dusun Krajan. Masih banyak lansia yang belum dapat, malah yang mampu yang dapat. Mohon didata ulang."', duration: 28, createdAt: firebase.firestore.FieldValue.serverTimestamp() },
      { nama: 'Sdr. Budi Setiawan', waktu: '10 Okt 2024, 09:00 WIB', kategori: 'Keamanan Lingkungan', status: 'selesai', subjek: 'Permintaan Lampu Penerangan Jalan', transkripsi: '"Alhamdulillah lampu jalan di pertigaan dekat balai desa sudah dipasang. Terima kasih atas respon cepatnya dari pihak desa."', duration: 15, createdAt: firebase.firestore.FieldValue.serverTimestamp() },
    ];
    for (const d of dummies) {
      await aspirasiCol.add(d);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  seedDummyAspirasi(); // Memasukkan dummy agar tabel tidak kosong di awal
});
