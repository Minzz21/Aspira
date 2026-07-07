export function calculateAgeFromNIK(nik: string | undefined): number | null {
  if (!nik || nik.length < 12) return null;
  
  // NIK pattern: PP KK CC DD MM YY NNNN (digits 7-12 is DDMMYY)
  let day = parseInt(nik.substring(6, 8), 10);
  let month = parseInt(nik.substring(8, 10), 10);
  const yearStr = nik.substring(10, 12);
  let year = parseInt(yearStr, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  // Tanggal lahir perempuan di NIK ditambah 40
  if (day > 40) day -= 40;

  const currentYear = new Date().getFullYear();
  const currentYear2Digits = currentYear % 100;
  
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
