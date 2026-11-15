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

// Helper to format keywords list into smooth, lowercase Indonesian
function formatKeywords(kws: string[]): string {
  if (!kws || kws.length === 0) return 'perenungan dan kebijaksanaan batin';
  const clean = kws.map((k) => k.trim().toLowerCase()).filter(Boolean);
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} dan ${clean[1]}`;
  return `${clean[0]}, ${clean[1]}, serta ${clean[2]}`;
}

// Helper to detect topic domain and supply contextual narrative anchors
function detectTopicDomain(question: string) {
  const q = question.toLowerCase();
  if (/karier|karir|rezeki|pekerjaan|usaha|bisnis|uang|kerja|finansial|profesi/.test(q)) {
    return {
      domain: 'karier',
      label: 'arah karier dan kelancaran rezekimu',
      pastContext: 'perjalanan usaha dan kariermu terdahulu',
      presentContext: 'dinamika profesional dan pekerjaan yang tengah kamu jalani saat ini',
      futureContext: 'fajar kelapangan rezeki dan perkembangan masa depan',
      adviceFocus: 'pintu kelapangan rezeki dan keberhasilan terbaikmu',
    };
  }
  if (/asmara|cinta|hubungan|jodoh|pasangan|hati|perasaan|nikah|kekasih/.test(q)) {
    return {
      domain: 'asmara',
      label: 'jalinan asmara dan ikatan hatimu',
      pastContext: 'jejak rasa dan ikatan di masa lalumu',
      presentContext: 'ombak perasaan dan dinamika hubungan yang sedang kamu arungi saat ini',
      futureContext: 'pintu kebahagiaan dan kejelasan ikatan batin ke depan',
      adviceFocus: 'ketenangan dan ketulusan ikatan hatimu',
    };
  }
  if (/galau|gelisah|batin|jiwa|cemas|takut|bimbang|bingung|tenang|stres/.test(q)) {
    return {
      domain: 'batin',
      label: 'kedamaian batin dan kejernihan jiwamu',
      pastContext: 'akar kegelisahan dan pengalaman yang membekas di relung batinmu',
      presentContext: 'proses penerimaan rasa dan pergulatan batin hari ini',
      futureContext: 'fajar ketenangan jiwa dan kejernihan nurani ke depan',
      adviceFocus: 'kedamaian dan ketenteraman batin yang hakiki',
    };
  }
  return {
    domain: 'umum',
    label: 'langkah hidup dan pencarian batinmu',
    pastContext: 'akar perjalanan dan tempaan hidupmu di masa lalu',
    presentContext: 'dinamika dan kenyataan yang sedang kamu hadapi hari ini',
    futureContext: 'fajar potensi dan kemungkinan baru di masa depan',
    adviceFocus: 'kebahagiaan dan keteguhan takdirmu',
  };
}

// Knowledge Base Fallback Generator (Deeply contextual storytelling without robotic templates or card translations)
function generateKnowledgeBaseReading(
  name: string,
  topic: string,
  cards: SelectedCard[]
): GeminiReadingResponse {
  const tInfo = detectTopicDomain(topic);

  const getCardDetails = (card: SelectedCard) => {
    const fromDeck = deckLookup.get(card.id);
    const cardName = fromDeck?.name || card.name;
    const isRev = !!card.isReversed;
    const keywords = isRev
      ? fromDeck?.keywords_reversed || card.keywords_reversed || ['kehati-hatian', 'refleksi diri']
      : fromDeck?.keywords_upright || card.keywords_upright || ['peluang positif', 'kejernihan langkah'];

    return {
      name: cardName,
      isReversed: isRev,
      orientation: isRev ? 'Terbalik' : 'Tegak',
      kwText: formatKeywords(keywords),
    };
  };

  const c1 = getCardDetails(cards[0]);
  const c2 = getCardDetails(cards[1]);
  const c3 = getCardDetails(cards[2]);

  const isChallenging = (kw: string) =>
    /duka|kehilangan|penyesalan|patah|hancur|krisis|beban|konflik|kegagalan|takut/.test(kw);

  // Card 1 (Past / Akar) Narrative
  const pastNarration = c1.isReversed
    ? `Menelusuri jejak awal ${tInfo.pastContext}, ${name}, kartu ${c1.name} hadir dalam posisi terbalik mencerminkan adanya fase ${c1.kwText}. Rintangan serta keraguan masa lalu itulah yang sebenarnya menempa ketangguhanmu dan menjadi akar pijakan yang mendewasakanmu hari ini.`
    : isChallenging(c1.kwText)
    ? `Menelusuri jejak awal ${tInfo.pastContext}, ${name}, kartu ${c1.name} memperlihatkan masa lalu yang pernah diwarnai oleh ${c1.kwText}. Pengalaman serta tempaan batin itulah yang membentuk kedalaman nuranimu dan menjadi fondasi ketangguhanmu hari ini.`
    : `Menelusuri jejak awal ${tInfo.pastContext}, ${name}, kartu ${c1.name} memancarkan energi positif tentang ${c1.kwText}. Ritme dan benih baik yang kamu tanam di masa lalu telah membentuk insting yang tajam dan menjadi fondasi kokoh bagi perjalananmu hari ini.`;

  // Card 2 (Present / Ombak Hari Ini) Narrative
  const presentNarration = c2.isReversed
    ? `Di tengah ${tInfo.presentContext}, kartu ${c2.name} hadir dalam posisi terbalik sebagai cermin kewaspadaan terhadap ${c2.kwText}. Ujian dan gesekan ini hadir bukan untuk menghentikan langkahmu, melainkan melatih kesabaran batinmu dalam mengelola kendali diri.`
    : isChallenging(c2.kwText)
    ? `Di tengah ${tInfo.presentContext}, kartu ${c2.name} mencerminkan tantangan nyata berupa ${c2.kwText}. Ombak ujian ini menguji daya tahanmu; hadapilah dengan kepala dingin karena di balik kesulitan inilah jalan keluar dan kedewasaanmu sedang ditempa.`
    : `Di tengah ${tInfo.presentContext}, kartu ${c2.name} membawa dorongan kuat tentang ${c2.kwText}. Ombak tantangan yang sedang kamu hadapi adalah ruang pembuktian di mana kedewasaan serta ketulusan niatmu bersinar terang.`;

  // Card 3 (Future / Fajar Potensi) Narrative
  const futureNarration = c3.isReversed
    ? `Menyongsong ${tInfo.futureContext}, terbitlah kartu ${c3.name} dalam posisi terbalik. Semesta berbisik agar kamu berani menyembuhkan luka batin dan melepaskan ${c3.kwText}. Ketika kamu berani berdamai dengan kenyataan, pintu kemungkinan baru akan terbuka lebar menyambut langkah beranimu.`
    : isChallenging(c3.kwText)
    ? `Menyongsong ${tInfo.futureContext}, kartu ${c3.name} hadir sebagai pengingat bijak agar kamu berhati-hati terhadap ${c3.kwText} dan tidak berlarut-larut meratapi masa lalu. Semesta membentangkan jalan terbaik saat kamu memusatkan pandangan pada peluang baru yang masih berdiri tegak di hadapanmu.`
    : `Menyongsong ${tInfo.futureContext}, terbitlah kartu ${c3.name} yang menyiratkan fajar harapan baru tentang ${c3.kwText}. Semesta membentangkan jalan terbaik saat ketulusan niatmu dipadukan dengan keberanian mengambil tindakan nyata.`;

  return {
    greeting: `Salam hangat, ${name}. Tiga cermin takdir telah terbuka di hadapan kita, membiaskan cahaya untuk menerangi ${tInfo.label}.`,
    readings: [
      {
        position: 'Past',
        card_title: `${c1.name} — ${c1.orientation}`,
        interpretation: pastNarration,
      },
      {
        position: 'Present',
        card_title: `${c2.name} — ${c2.orientation}`,
        interpretation: presentNarration,
      },
      {
        position: 'Future',
        card_title: `${c3.name} — ${c3.orientation}`,
        interpretation: futureNarration,
      },
    ],
    final_advice: `Jejak perjalananmu bersama ${c1.name} telah mengantarmu pada titik penempaan ${c2.name}. Jangan biarkan keraguan memudarkan keyakinanmu. Jadikan hikmah ${c3.name} sebagai lentera penuntun, dan percayalah bahwa keteguhan batinmu adalah kunci pembuka ${tInfo.adviceFocus}.`,
    share_summary: `Ditempa oleh ${c1.name} dan diuji oleh ${c2.name}, percayalah fajar ${c3.name} akan membimbing langkahmu menuju ${tInfo.adviceFocus}.`,
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

    // Clean any parenthesized translations from knowledge base prompt
    const cleanCardMeaning = (meaning: string) =>
      meaning.replace(/\s*\([^)]*\)/g, '').replace(/Energi elemen [^p]+ pada /g, 'Energi ').trim();

    const c1CleanMeaning = cleanCardMeaning(c1Meaning);
    const c2CleanMeaning = cleanCardMeaning(c2Meaning);
    const c3CleanMeaning = cleanCardMeaning(c3Meaning);

    const prompt = `
Anda adalah peramal kartu tarot bijaksana yang bertutur hangat, empatik, mendalam, dan puitis layaknya seorang sahabat jiwa.

DATA PEMAIN:
- Nama Pemain: "${cleanName}"
- Hal yang Diresapi / Fokus Niat: "${cleanQuestion}"

KNOWLEDGE BASE RESMI TAROT (FONDASI MAKNA):
1. Kartu 1 (Masa Lalu / Akar Perjalanan): ${c1Deck.name} — ${cards[0].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c1CleanMeaning}
   Kata Kunci: ${c1Keywords}

2. Kartu 2 (Masa Kini / Ombak & Tantangan Hari Ini): ${c2Deck.name} — ${cards[1].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c2CleanMeaning}
   Kata Kunci: ${c2Keywords}

3. Kartu 3 (Masa Depan / Fajar & Potensi Langkah): ${c3Deck.name} — ${cards[2].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
   Makna Baku: ${c3CleanMeaning}
   Kata Kunci: ${c3Keywords}

ATURAN GAYA BAHASA & STRUKTUR PENULISAN:
1. GAYA NARASI MENGALIR: Tuliskan pembacaan ini sebagai satu KISAH HIDUP yang mengalir utuh (storytelling). DILARANG KERAS menggunakan frasa robotik seperti "terkait pertanyaan", "mengenai pertanyaanmu", "pertanyaan yang kamu ajukan", atau menempelkan tanda kutip pada topik.
2. ANYAM TOPIK KE DALAM KISAH: Serap esensi kegelisahan/fokus niat "${cleanQuestion}" dan masukkan secara mendalam dan personal ke dalam jalinan cerita perjalanan ${cleanName} (jika karier dan rezeki, anyam dengan usaha, pekerjaan, rezeki, dan profesionalitas; jika asmara, anyam dengan ikatan hati; jika batin, anyam dengan ketenangan jiwa).
3. TIGA BABAK CERITA:
   - Masa Lalu: Kisahkan benih atau pengalaman terdahulu yang menempa ketangguhan batin ${cleanName} dalam konteks topiknya.
   - Masa Kini: Kisahkan ombak atau penempaan yang sedang dialami dengan penuh kehangatan dan penguatan.
   - Masa Depan: Kisahkan fajar harapan dan pintu kemungkinan yang terbuka bila ${cleanName} melangkah dengan berani dan bijak.
4. NASIHAT LANGSUNG TANPA EMBEL-EMBEL: Tuliskan nasihat (final_advice) secara LANGSUNG ke inti petuah bijak. DILARANG KERAS menggunakan awalan seperti "Pesan untuk...", "Pesan Hikmah untuk...", "Pesan semesta untuk...", atau tanda titik dua. Mulai langsung dengan untaian kalimat hikmah yang menggetarkan hati.
5. DILARANG menggunakan kata "AI", "model bahasa", "algoritma", atau disclaimer robotik. Gunakan Bahasa Indonesia sastrawi yang membumi, mudah dipahami, dan menggetarkan hati.
6. DILARANG KERAS menggunakan emoji dalam bentuk apa pun di seluruh respons (greeting, interpretation, maupun final_advice).
7. DILARANG MEMBERIKAN TERJEMAHAN NAMA KARTU DI DALAM KURUNG: Gunakan HANYA nama kartu tarot resminya secara natural (contoh: gunakan "${c1Deck.name}", "${c2Deck.name}", "${c3Deck.name}". JANGAN SEKALI-KALI menuliskan terjemahan seperti "(Eight Tongkat)" atau "(Si Pandir)").
8. DILARANG menggunakan huruf kapital ganjil di tengah kalimat (contoh: jangan tulis "menunjukkan bahwa Kemajuan", tulis "menunjukkan bahwa kemajuan").

FORMAT OUTPUT WAJIB BERUPA JSON MURNI DENGAN STRUKTUR INI:
{
  "greeting": "Sapaan pembuka hangat yang menyapa ${cleanName} dan menyentuh hal yang sedang ia resapi secara anggun tanpa kata 'pertanyaan' (1-2 kalimat).",
  "readings": [
    {
      "position": "Past",
      "card_title": "${c1Deck.name} — ${cards[0].isReversed ? 'Terbalik' : 'Tegak'}",
      "interpretation": "Narasi 3-4 kalimat yang mengalir tentang akar masa lalu dan bagaimana pengalaman itu membentuk pijakan ${cleanName} hari ini dalam konteks topiknya."
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

    // 8-second auto-fallback timeout with fallback model chain
    const fetchWithTimeout = async (): Promise<GeminiReadingResponse> => {
      let text = '';
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        const result = await model.generateContent(prompt);
        text = result.response.text();
      } catch (err1) {
        console.warn('Gagal dengan gemini-1.5-flash, mencoba gemini-2.0-flash:', err1);
        const model2 = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        const result2 = await model2.generateContent(prompt);
        text = result2.response.text();
      }

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
