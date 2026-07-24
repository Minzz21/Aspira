import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjek, kategori, transkripsi, status, kritis } = body;

    if (!subjek) {
      return NextResponse.json(
        { error: 'Data laporan tidak lengkap.' },
        { status: 400 }
      );
    }

    const prompt = `Kamu adalah asisten AI untuk sistem administrasi desa bernama ASPIRA. Tugasmu adalah memberikan saran solusi yang praktis dan actionable kepada admin desa untuk menyelesaikan masalah/laporan dari warga.

Berikut detail laporan warga:
- Subjek Laporan: ${subjek}
- Kategori: ${kategori || 'Tidak ditentukan'}
- Status Saat Ini: ${status || 'menunggu'}
- Tingkat Kritis: ${kritis ? 'KRITIS - Perlu penanganan segera' : 'Normal'}
- Isi Laporan/Transkripsi: ${transkripsi || 'Tidak ada transkripsi tersedia'}

Berikan saran solusi dalam format berikut:
1. **Ringkasan Masalah**: Jelaskan inti masalah dalam 1-2 kalimat.
2. **Saran Tindakan** (3-5 langkah konkret yang bisa dilakukan admin desa):
   - Langkah-langkah harus spesifik, praktis, dan realistis untuk level pemerintahan desa.
   - Sertakan pihak terkait yang perlu dihubungi jika perlu.
3. **Estimasi Waktu Penyelesaian**: Berikan perkiraan waktu yang realistis.
4. **Prioritas**: Tentukan level prioritas (Rendah/Sedang/Tinggi/Sangat Tinggi).

Jawab dalam Bahasa Indonesia yang formal namun mudah dipahami. Jangan gunakan format markdown header (#), cukup gunakan bold (**) dan bullet points. Langsung ke inti saran, jangan bertele-tele.`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API Error:', geminiResponse.status, errorData);
      return NextResponse.json(
        { error: `Gagal menghubungi AI Gemini (${geminiResponse.status}). Silakan coba lagi.` },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();

    const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!suggestion) {
      return NextResponse.json(
        { error: 'AI tidak menghasilkan saran. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion });
  } catch (error: any) {
    console.error('AI Suggestion Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
