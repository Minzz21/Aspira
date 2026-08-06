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

    const prompt = `Berikan solusi langsung, singkat, dan praktis untuk laporan warga berikut:
- Subjek: ${subjek}
- Kategori: ${kategori || 'Tidak ditentukan'}
- Kritis: ${kritis ? 'Ya (Penanganan segera)' : 'Tidak'}
- Laporan: ${transkripsi || 'Tidak tersedia'}

Berikan maksimal 3-5 poin langkah tindakan konkret yang harus dilakukan admin desa. Langsung pada intinya (to the point), tanpa basa-basi, tanpa ringkasan, tanpa kata pengantar, tanpa estimasi waktu atau prioritas. Gunakan format bullet points atau penomoran biasa.`;

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
