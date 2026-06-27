/* ── Profil Desa JS ── */

let wilayahData = [];
let currentPage = 1;
const rowsPerPage = 3;
let filteredData = [];
let allUmkmData = [];

function loadUMKMData() {
  const umkmCol = db.collection('umkm');
  umkmCol.onSnapshot((snapshot) => {
    const umkmCountByWilayah = {};
    allUmkmData = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      allUmkmData.push(data);

      const wilayah = data.wilayah || 'Tidak Diketahui';
      if (!umkmCountByWilayah[wilayah]) {
        umkmCountByWilayah[wilayah] = 0;
      }
      umkmCountByWilayah[wilayah]++;
    });

    wilayahData = Object.keys(umkmCountByWilayah).map(w => ({
      wilayah: w,
      umkm: umkmCountByWilayah[w]
    }));
    
    wilayahData.sort((a, b) => a.wilayah.localeCompare(b.wilayah));
    filterTable();
    renderSektorUnggulan(allUmkmData);
  }, (error) => {
    console.error('Error memuat data UMKM:', error);
  });
}

function renderSektorUnggulan(data) {
  const container = document.getElementById('sektor-unggulan-list');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = '<p class="text-xs text-green-200 mt-2">Belum ada data UMKM.</p>';
    return;
  }

  const counts = {};
  data.forEach(item => {
    const s = item.sektor_usaha || 'Lainnya';
    counts[s] = (counts[s] || 0) + 1;
  });

  const sortedSektors = Object.keys(counts).map(k => ({
    name: k,
    count: counts[k]
  })).sort((a, b) => b.count - a.count); // Show all sectors

  const styleMap = {
    'Kuliner': { icon: 'fa-utensils', textClass: 'text-green-300', bgClass: 'bg-green-400' },
    'Kerajinan': { icon: 'fa-hands-holding', textClass: 'text-amber-300', bgClass: 'bg-amber-400' },
    'Fashion': { icon: 'fa-shirt', textClass: 'text-blue-300', bgClass: 'bg-blue-400' },
    'Jasa': { icon: 'fa-wrench', textClass: 'text-purple-300', bgClass: 'bg-purple-400' },
    'Lainnya': { icon: 'fa-box', textClass: 'text-gray-300', bgClass: 'bg-gray-400' }
  };

  let html = '';
  sortedSektors.forEach((s, index) => {
    const pct = Math.round((s.count / data.length) * 100);
    const style = styleMap[s.name] || styleMap['Lainnya'];
    const mbClass = index === sortedSektors.length - 1 ? 'mb-5' : 'mb-3';

    html += `
      <div class="${mbClass}">
        <div class="flex justify-between items-center mb-1">
          <span class="flex items-center gap-1.5 text-xs font-medium"><i class="fa-solid ${style.icon} ${style.textClass} text-[10px]"></i> ${s.name}</span>
          <span class="text-xs font-bold">${s.count} Unit</span>
        </div>
        <div class="umkm-bar-track"><div class="umkm-bar-fill ${style.bgClass}" style="width:0%" data-target="${pct}%"></div></div>
      </div>
    `;
  });

  container.innerHTML = html;
  
  // Re-trigger animation for the new bars
  setTimeout(() => {
    container.querySelectorAll('[data-target]').forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 100);
}

function renderWilayahTable() {
  const tbody = document.getElementById('wilayah-table-body');
  if (!tbody) return;
  const start = (currentPage - 1) * rowsPerPage;
  const paged = filteredData.slice(start, start + rowsPerPage);

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-gray-500 text-sm">Belum ada data UMKM</td></tr>`;
  } else {
    tbody.innerHTML = paged.map(row => `
      <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
        <td class="py-3 pr-4 font-semibold text-gray-700">${row.wilayah}</td>
        <td class="py-3 pr-4 text-gray-600">${row.umkm} UMKM</td>
        <td class="py-3">
          <button onclick="lihatDetailWilayah('${row.wilayah}')" class="text-[#1e4d2b] text-xs font-medium hover:underline">Detail</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('pagination-info').textContent =
    `Menampilkan ${paged.length} dari ${filteredData.length} Wilayah`;
}

function filterTable() {
  const dusun = document.getElementById('filter-dusun').value;
  filteredData = dusun === 'semua' ? [...wilayahData] : wilayahData.filter(w => w.wilayah === dusun);
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



function closeDynamicModal() {
  document.getElementById('modal-dynamic-umkm').classList.add('hidden');
}

function lihatDetailWilayah(nama) {
  const modal = document.getElementById('modal-dynamic-umkm');
  const title = document.getElementById('modal-dynamic-title');
  const body = document.getElementById('modal-dynamic-body');
  const btnBack = document.getElementById('btn-back-dynamic');

  title.textContent = `UMKM di ${nama}`;
  btnBack.classList.add('hidden');

  const wilayahUmkm = allUmkmData.filter(u => u.wilayah === nama);

  if (wilayahUmkm.length === 0) {
    body.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Belum ada UMKM terdaftar di wilayah ini.</p>';
  } else {
    body.innerHTML = `
      <div class="space-y-3">
        ${wilayahUmkm.map(u => `
          <div onclick="lihatDetailUMKM('${u.id}', '${nama}')" class="p-4 border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-sm transition cursor-pointer bg-white group">
            <div class="flex justify-between items-center mb-1">
              <h4 class="font-bold text-gray-800 group-hover:text-[#1e4d2b] transition">${u.nama_umkm}</h4>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">${u.sektor_usaha}</span>
            </div>
            <p class="text-xs text-gray-500"><i class="fa-regular fa-user mr-1"></i> ${u.nama_pemilik}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  modal.classList.remove('hidden');
}

function lihatDetailUMKM(id, backWilayah) {
  const umkm = allUmkmData.find(u => u.id === id);
  if (!umkm) return;

  const title = document.getElementById('modal-dynamic-title');
  const body = document.getElementById('modal-dynamic-body');
  const btnBack = document.getElementById('btn-back-dynamic');

  title.textContent = 'Informasi Lengkap UMKM';
  btnBack.classList.remove('hidden');
  btnBack.onclick = () => lihatDetailWilayah(backWilayah);

  let tglDaftar = 'Tidak diketahui';
  if (umkm.tanggal_registrasi && umkm.tanggal_registrasi.toDate) {
    tglDaftar = umkm.tanggal_registrasi.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  body.innerHTML = `
    <div class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-[#1e4d2b] mb-1">${umkm.nama_umkm}</h3>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 inline-block">${umkm.sektor_usaha}</span>
        </div>
        <div class="flex gap-2">
          <button onclick="editUMKM('${umkm.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button onclick="hapusUMKM('${umkm.id}', '${umkm.nama_umkm}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition" title="Hapus">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Pemilik</p>
          <p class="text-sm font-medium text-gray-800">${umkm.nama_pemilik}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Wilayah</p>
          <p class="text-sm font-medium text-gray-800">${umkm.wilayah}</p>
        </div>
      </div>
      <div>
        <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Alamat Lengkap</p>
        <p class="text-sm text-gray-700 leading-relaxed mt-1">${umkm.alamat_lengkap || '-'}</p>
      </div>
      <div class="border-t border-gray-100 pt-3">
        <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Tanggal Registrasi</p>
        <p class="text-xs text-gray-600 mt-1"><i class="fa-regular fa-calendar mr-1"></i> ${tglDaftar}</p>
      </div>
    </div>
  `;
}

function eksporData() {
  alert('Data UMKM sedang diekspor ke format Excel.');
}

function registrasiUMKM() {
  document.getElementById('form-modal-umkm-title').textContent = 'Registrasi UMKM Baru';
  document.getElementById('input-id-umkm').value = '';
  document.getElementById('form-modal-umkm').classList.remove('hidden');
}

function closeFormUMKM() {
  document.getElementById('form-modal-umkm').classList.add('hidden');
  document.getElementById('input-id-umkm').value = '';
  document.getElementById('input-nama-umkm').value = '';
  document.getElementById('input-pemilik-umkm').value = '';
  document.getElementById('input-sektor-umkm').value = '';
  document.getElementById('input-wilayah-umkm').value = '';
  document.getElementById('input-alamat-umkm').value = '';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function simpanUMKM() {
  const id = document.getElementById('input-id-umkm').value;
  const nama = document.getElementById('input-nama-umkm').value.trim();
  const pemilik = document.getElementById('input-pemilik-umkm').value.trim();
  const sektor = document.getElementById('input-sektor-umkm').value;
  const wilayah = document.getElementById('input-wilayah-umkm').value;
  const alamat = document.getElementById('input-alamat-umkm').value.trim();

  if (!nama || !pemilik || !sektor || !wilayah || !alamat) {
    alert('Harap lengkapi semua data formulir!');
    return;
  }

  const umkmData = {
    nama_umkm: nama,
    nama_pemilik: pemilik,
    sektor_usaha: sektor,
    wilayah: wilayah,
    alamat_lengkap: alamat
  };

  if (id) {
    // Edit existing
    db.collection('umkm').doc(id).update(umkmData)
      .then(() => {
        closeFormUMKM();
        showToast('Data UMKM berhasil diperbarui!');
        closeDynamicModal();
      })
      .catch(error => {
        console.error('Error update UMKM:', error);
        alert('Terjadi kesalahan saat memperbarui data UMKM.');
      });
  } else {
    // Tambah baru
    umkmData.tanggal_registrasi = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('umkm').add(umkmData)
      .then(() => {
        closeFormUMKM();
        showToast('UMKM berhasil diregistrasi!');
      })
      .catch(error => {
        console.error('Error menambah UMKM:', error);
        alert('Terjadi kesalahan saat menyimpan data UMKM.');
      });
  }
}

function editUMKM(id) {
  const umkm = allUmkmData.find(u => u.id === id);
  if (!umkm) return;

  document.getElementById('form-modal-umkm-title').textContent = 'Edit Data UMKM';
  document.getElementById('input-id-umkm').value = umkm.id;
  document.getElementById('input-nama-umkm').value = umkm.nama_umkm;
  document.getElementById('input-pemilik-umkm').value = umkm.nama_pemilik;
  document.getElementById('input-sektor-umkm').value = umkm.sektor_usaha;
  document.getElementById('input-wilayah-umkm').value = umkm.wilayah;
  document.getElementById('input-alamat-umkm').value = umkm.alamat_lengkap;

  document.getElementById('form-modal-umkm').classList.remove('hidden');
}

let deleteUmkmId = null;

function hapusUMKM(id, nama) {
  deleteUmkmId = id;
  document.getElementById('delete-nama-umkm').textContent = nama;
  document.getElementById('delete-modal-umkm').classList.remove('hidden');
}

function closeDeleteModalUMKM() {
  deleteUmkmId = null;
  document.getElementById('delete-modal-umkm').classList.add('hidden');
}

function confirmDeleteUMKM() {
  if (!deleteUmkmId) return;

  db.collection('umkm').doc(deleteUmkmId).delete()
    .then(() => {
      closeDeleteModalUMKM();
      closeDynamicModal();
      showToast('Data UMKM berhasil dihapus!');
    })
    .catch(error => {
      console.error('Error delete UMKM:', error);
      alert('Gagal menghapus data UMKM.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  animateBars();
  loadUMKMData();
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
    
    const ageGroups = {
      '0-14': 0,
      '15-24': 0,
      '25-44': 0,
      '45-64': 0,
      '65+': 0
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      if (data.gender === 'Perempuan') female++;
      else male++; // default ke laki-laki jika field gender belum ada
      
      if (data.nik && data.nik.length === 16) {
        const age = calculateAgeFromNIK(data.nik);
        if (age !== null) {
          if (age >= 0 && age <= 14) ageGroups['0-14']++;
          else if (age >= 15 && age <= 24) ageGroups['15-24']++;
          else if (age >= 25 && age <= 44) ageGroups['25-44']++;
          else if (age >= 45 && age <= 64) ageGroups['45-64']++;
          else if (age >= 65) ageGroups['65+']++;
        }
      }
    });

    updatePopulationInfographic(total, male, female, ageGroups);
  }, (error) => {
    console.error('Error memuat data penduduk:', error);
    document.getElementById('stat-total').textContent = 'Error';
  });
}

function updatePopulationInfographic(total, male, female, ageGroups) {
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

  // Update Age Distribution
  updateAgeDistribution(ageGroups, total);
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

function updateAgeDistribution(ageGroups, total) {
  const groups = [
    { id: '0-14', count: ageGroups['0-14'] },
    { id: '15-24', count: ageGroups['15-24'] },
    { id: '25-44', count: ageGroups['25-44'] },
    { id: '45-64', count: ageGroups['45-64'] },
    { id: '65-plus', count: ageGroups['65+'] },
  ];

  groups.forEach(g => {
    const bar = document.getElementById(`bar-age-${g.id}`);
    const text = document.getElementById(`text-age-${g.id}`);
    
    if (bar && text) {
      const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
      
      // We use timeout to trigger CSS transition after element load
      setTimeout(() => {
        bar.style.width = `${pct}%`;
      }, 100);
      
      text.innerHTML = `${g.count.toLocaleString('id-ID')} <span class="font-normal text-gray-400">(${pct}%)</span>`;
    }
  });
}

function calculateAgeFromNIK(nik) {
  if (!nik || nik.length < 12) return null;
  // NIK pattern: PP KK CC DD MM YY NNNN (digits 7-12 is DDMMYY)
  let day = parseInt(nik.substring(6, 8));
  let month = parseInt(nik.substring(8, 10));
  let yearStr = nik.substring(10, 12);
  let year = parseInt(yearStr);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  // Tanggal lahir perempuan di NIK ditambah 40
  if (day > 40) day -= 40;

  let currentYear = new Date().getFullYear();
  let currentYear2Digits = currentYear % 100;
  
  // Asumsi: jika YY lebih besar dari tahun saat ini (2 digits), maka kelahiran 1900-an
  // Jika YY lebih kecil atau sama, kelahiran 2000-an
  if (year > currentYear2Digits) {
    year += 1900;
  } else {
    year += 2000;
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  
  return age >= 0 ? age : 0;
}


