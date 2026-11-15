import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SelectedCard, GeminiReadingResponse } from '@/types/tarot';
import rawDeckData from '@/data/tarotDeck.json';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface DeckCard {
  id: number;
  slug: string;
  name: string;
  name_id: string;
  arcana: string;
  suit: string | null;
  image: string;
  keywords_upright: string[];
  keywords_reversed: string[];
  fallback_upright: string;
  fallback_reversed: string;
}

const deckLookup = new Map<number, DeckCard>(
  (rawDeckData as DeckCard[]).map((c) => [c.id, c])
);

// Knowledge Base Fallback Generator (Storytelling narrative without robotic template repetitions)
function generateKnowledgeBaseReading(
  name: string,
  topic: string,
  cards: SelectedCard[]
): GeminiReadingResponse {
  const getCardDetails = (card: SelectedCard) => {
    const fromDeck = deckLookup.get(card.id);
    const cardName = fromDeck?.name || card.name;
    const cardNameId = fromDeck?.name_id || card.name_id || '';
    const meaning = card.isReversed
      ? fromDeck?.fallback_reversed || card.fallback_reversed || 'mengingatkan untuk lebih mawas diri dan berhati-hati.'
      : fromDeck?.fallback_upright || card.fallback_upright || 'membuka peluang dan potensi positif yang nyata.';
    const keywords = card.isReversed
      ? fromDeck?.keywords_reversed || card.keywords_reversed || ['refleksi', 'kehati-hatian']
      : fromDeck?.keywords_upright || card.keywords_upright || ['peluang', 'kejernihan'];

    return {
      name: cardName,
      nameId: cardNameId,
      meaning,
      keywords: keywords.join(', '),
      orientation: card.isReversed ? 'Terbalik' : 'Tegak',
    };
  };

  const c1 = getCardDetails(cards[0]);
  const c2 = getCardDetails(cards[1]);
  const c3 = getCardDetails(cards[2]);

  return {
    greeting: `Salam hangat, ${name}. Tiga cermin takdir telah terbuka di hadapan kita, membiaskan cahaya untuk menerangi perjalanan jiwamu.`,
    readings: [
      {
        position: 'Past',
        card_title: `${c1.name} — ${c1.orientation}`,
        interpretation: `Dari jejak awal perjalananmu, ${name}, kartu ${c1.name} memperlihatkan benih yang tertanam di masa lalu. Energi ini ${c1.meaning} Pengalaman serta tempaan batin itulah yang membentuk caramu memandang dunia dan menjadi akar pijakanmu hari ini.`,
      },
      {
        position: 'Present',
        card_title: `${c2.name} — ${c2.orientation}`,
        interpretation: `Di fase yang sedang kamu arungi saat ini, kartu ${c2.name} hadir mencerminkan gejolak yang tengah kamu hadapi. Situasi ini ${c2.meaning} Sambutlah ombak kehidupan ini dengan ketenangan batin, karena di sinilah titik ujian dan kedewasaanmu sedang dibentuk.`,
      },
      {
        position: 'Future',
        card_title: `${c3.name} — ${c3.orientation}`,
        interpretation: `Menatap fajar di ufuk depan, terbitlah kartu ${c3.name}. Semesta membisikkan bahwa ${c3.meaning} Jalan terbaik akan membentang luas saat niat tulusmu bersatu padu dengan keberanian mengambil langkah nyata.`,
      },
    ],
    final_advice: `Jejak masa lalumu (${c1.name}) telah mengantarmu ke titik penempaan hari ini (${c2.name}). Jangan biarkan keraguan mengaburkan nuranimu. Jadikan hikmah ${c3.name} sebagai lentera penuntun, dan percayalah bahwa kendali takdir terindah selalu berada di tanganmu sendiri.`,
    share_summary: `Ditempa oleh ${c1.name} dan diuji oleh ${c2.name}, percayalah fajar ${c3.name} akan menyinari keberanianmu dalam mengambil langkah nyata.`,
  };
}

export async function POST(request: Request) {
  let cleanName = 'Pengelana';
  let cleanQuestion = 'Petunjuk semesta untuk langkah batin hari ini';
  let rawCards: SelectedCard[] = [];

  try {
    const body = await request.json();
    const { name, userName, question, cards } = body as {
      name?: string;
      userName?: string;
      question?: string;
      cards?: SelectedCard[];
    };

    if (!cards || !Array.isArray(cards) || cards.length !== 3) {
      return NextResponse.json(
        { error: 'Three cards spread is required.' },
        { status: 400 }
      );
    }

    rawCards = cards;
    cleanName = String(name || userName || 'Pengelana').slice(0, 40).trim() || 'Pengelana';
    cleanQuestion = String(question || 'Petunjuk semesta untuk langkah batin hari ini').slice(0, 150).trim();

    // If Gemini is not configured, immediately use rich knowledge base fallback (< 5ms)
    if (!genAI || !apiKey) {
      const fallback = generateKnowledgeBaseReading(cleanName, cleanQuestion, rawCards);
      return NextResponse.json(fallback);
    }

    // Prepare complete card info from official Knowledge Base
    const c1Deck = deckLookup.get(cards[0].id) || cards[0];
    const c2Deck = deckLookup.get(cards[1].id) || cards[1];
    const c3Deck = deckLookup.get(cards[2].id) || cards[2];

    const c1Meaning = cards[0].isReversed
      ? c1Deck.fallback_reversed || cards[0].fallback_reversed
      : c1Deck.fallback_upright || cards[0].fallback_upright;
    const c2Meaning = cards[1].isReversed
      ? c2Deck.fallback_reversed || cards[1].fallback_reversed
      : c2Deck.fallback_upright || cards[1].fallback_upright;
    const c3Meaning = cards[2].isReversed
      ? c3Deck.fallback_reversed || cards[2].fallback_reversed
      : c3Deck.fallback_upright || cards[2].fallback_upright;

    const c1Keywords = (cards[0].isReversed ? c1Deck.keywords_reversed : c1Deck.keywords_upright || []).join(', ');
    const c2Keywords = (cards[1].isReversed ? c2Deck.keywords_reversed : c2Deck.keywords_upright || []).join(', ');
    const c3Keywords = (cards[2].isReversed ? c3Deck.keywords_reversed : c3Deck.keywords_upright || []).join(', ');

    const prompt = `
Anda adalah peramal kartu tarot bijaksana yang bertutur hangat, empatik, mendalam, dan puitis layaknya seorang sahabat jiwa.

DATA PEMAIN:
- Nama Pemain: "${cleanName}"
- Hal yang Diresapi / Dihadapi: "${cleanQuestion}"

KNOWLEDGE BASE RESMI TAROT (FONDASI MAKNA MUTLAK):
Gunakan arti baku resmi di bawah ini sebagai fondasi kebenaran kartu:
1. Kartu 1 (Masa Lalu / Akar Perjalanan): ${c1Deck.name} — ${cards[0].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c1Meaning}
   Kata Kunci: ${c1Keywords}

2. Kartu 2 (Masa Kini / Ombak & Tantangan Hari Ini): ${c2Deck.name} — ${cards[1].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c2Meaning}
   Kata Kunci: ${c2Keywords}

3. Kartu 3 (Masa Depan / Fajar & Potensi Langkah): ${c3Deck.name} — ${cards[2].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c3Meaning}
   Kata Kunci: ${c3Keywords}

ATURAN GAYA BAHASA & STRUKTUR PENULISAN:
1. GAYA NARASI MENGALIR: Tuliskan pembacaan ini sebagai satu KISAH HIDUP yang mengalir utuh (storytelling). DILARANG KERAS menggunakan frasa robotik seperti "terkait pertanyaan", "mengenai pertanyaanmu", "pertanyaan yang kamu ajukan", atau menempelkan tanda kutip pada topik.
2. ANYAM TOPIK KE DALAM KISAH: Serap esensi kegelisahan/topik "${cleanQuestion}" dan masukkan secara anggun ke dalam jalinan cerita perjalanan ${cleanName}.
3. TIGA BABAK CERITA:
   - Masa Lalu: Kisahkan benih atau pengalaman terdahulu (${c1Meaning}) yang menempa ketangguhan batin ${cleanName}.
   - Masa Kini: Kisahkan ombak atau penempaan yang sedang dialami (${c2Meaning}) dengan penuh kehangatan dan penguatan.
   - Masa Depan: Kisahkan fajar harapan dan pintu kemungkinan (${c3Meaning}) yang terbuka bila ${cleanName} melangkah dengan berani dan bijak.
4. NASIHAT LANGSUNG TANPA EMBEL-EMBEL: Tuliskan nasihat (final_advice) secara LANGSUNG ke inti petuah bijak. DILARANG KERAS menggunakan awalan seperti "Pesan untuk...", "Pesan Hikmah untuk...", "Pesan semesta untuk...", atau tanda titik dua. Mulai langsung dengan untaian kalimat hikmah yang menggetarkan hati.
5. DILARANG menggunakan kata "AI", "model bahasa", "algoritma", atau disclaimer robotik. Gunakan Bahasa Indonesia sastrawi yang membumi, mudah dipahami, dan menggetarkan hati.
6. DILARANG KERAS menggunakan emoji dalam bentuk apa pun (seperti 🔮, ✨, 🌟, ❤️, dsb) di seluruh respons (greeting, interpretation, maupun final_advice). Gunakan kata-kata Bahasa Indonesia yang anggun, sastrawi, dan murni.

FORMAT OUTPUT WAJIB BERUPA JSON MURNI DENGAN STRUKTUR INI:
{
  "greeting": "Sapaan pembuka hangat yang menyapa ${cleanName} dan menyentuh hal yang sedang ia resapi secara anggun tanpa kata 'pertanyaan' (1-2 kalimat).",
  "readings": [
    {
      "position": "Past",
      "card_title": "${c1Deck.name} — ${cards[0].isReversed ? 'Terbalik' : 'Tegak'}",
      "interpretation": "Narasi 3-4 kalimat yang mengalir tentang akar masa lalu dan bagaimana pengalaman itu membentuk pijakan ${cleanName} hari ini."
    },
    {
      "position": "Present",
      "card_title": "${c2Deck.name} — ${cards[1].isReversed ? 'Terbalik' : 'Tegak'}",
      "interpretation": "Narasi 3-4 kalimat yang mengalir tentang dinamika serta penempaan yang sedang dihadapi ${cleanName} hari ini dan cara menyikapinya dengan bijak."
    },
    {
      "position": "Future",
      "card_title": "${c3Deck.name} — ${cards[2].isReversed ? 'Terbalik' : 'Tegak'}",
      "interpretation": "Narasi 3-4 kalimat yang mengalir tentang fajar kemungkinan baru yang menanti langkah nyata ${cleanName} di masa depan."
    }
  ],
  "final_advice": "Rangkuman 2-3 kalimat nasihat hidup yang menyejukkan dan menguatkan batin, DITULIS LANGSUNG tanpa awalan 'Pesan untuk...'.",
  "share_summary": "Rangkuman nasihat inti 1-2 kalimat puitis (maksimal 150 karakter) yang memadukan hikmah ketiga kartu sebagai pesan bijak yang utuh."
}
`;

    // 8-second auto-fallback timeout
    const fetchWithTimeout = async (): Promise<GeminiReadingResponse> => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as GeminiReadingResponse;
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), 8000)
    );

    const readingData = await Promise.race([fetchWithTimeout(), timeoutPromise]);
    return NextResponse.json(readingData);
  } catch (error) {
    console.warn('Menggunakan pembacaan kartu Knowledge Base:', error);
    const fallback = generateKnowledgeBaseReading(cleanName, cleanQuestion, rawCards);
    return NextResponse.json(fallback);
  }
}
