# REVISION_HISTORY.md - Ramalin Tarot
Log Riwayat Revisi, Masukan Pengguna & Aturan Preferensi Proyek

File ini mencatat setiap kritik, revisi, preferensi visual, dan umpan balik dari pengguna (Nova Miftakhul Huda) beserta tindakan teknis yang diambil.
WAJIB dibaca oleh asisten AI sebelum melakukan generate code atau refaktor baru agar tidak pernah mengulangi pola yang tidak disukai pengguna.

---

## 1. Riwayat Revisi & Masukan Pengguna

### Revisi 1: Diksi, Layout Share Card, BGM, dan Background
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Diksi "Pemandu Langkah Batin" diganti karena terdengar kaku.
  2. Layout Share Card diperbaiki, kotak nasihat di bawah jangan terpotong elipsis (...), isi rangkuman nasihat harus lengkap.
  3. Di bagian nasihat tidak boleh ada tulisan "Pesan untuk [nama]..." atau "Pesan Hikmah untuk...", langsung ke inti kalimat.
  4. Suara latar (BGM) jelek/monoton, cari suara dari YouTube, kompres MP3 berkualitas tinggi.
  5. Background aplikasi masih sangat jelek (terlalu flat ungu kusam).
- Solusi & Tindakan:
  1. Mengganti diksi menjadi "Pembacaan Takdir: [nama]".
  2. Memperbesar kotak nasihat canvas menjadi 205px dengan helper `wrapTextLines` multi-baris (tanpa pemotongan paksa).
  3. Memperbarui system prompt AI di `/api/tarot/route.ts` dan fallback function agar menghasilkan petuah langsung tanpa prefiks klise.
  4. Mengganti BGM dengan track ambient etereal berkualitas tinggi (Cocorrina Tarot Atmosphere) dikompres stereo 80kbps (`public/audio/tarot-bgm.mp3`).
  5. Memperbarui background web di `globals.css` dan `page.tsx` menjadi gradasi kosmik mendalam dengan radial aura lilin altar.

### Revisi 2: Identitas Pembuat & Sound Effect Kartu (Acoustic SFX)
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Ingin mencantumkan keterangan bahwa web ini buatannya, disepakati teks: "✦ Crafted with magic by Nova Miftakhul Huda ✦", tulisan kecil dan elegan.
  2. Sound effect masih jelek (efek oscillator Web Audio terdengar robotik/8-bit), minta carikan efek suara kartu yang nendang (kocokan kartu, kartu diambil/ditarik, dll).
- Solusi & Tindakan:
  1. Menambahkan watermark signature "✦ Crafted with magic by Nova Miftakhul Huda ✦" berukuran kecil elegan di bagian paling bawah Share Card Canvas (y=1868) dan di bawah tombol input form web.
  2. Mengunduh sampel kartu akustik nyata tanpa hak cipta dari YouTube, memotong dan menormalkannya via FFmpeg:
     - `card-shuffle.mp3`: Riffle shuffle kasino 1.2s.
     - `card-slide.mp3`: Gesekan tarik kartu renyah 0.38s.
     - `card-flip.mp3`: Snap buka kartu 0.48s.
  3. Merombak `src/utils/audio.ts` menggunakan Web Audio `AudioBuffer` untuk pemutaran nol-latensi dan variasi pitch alami, menghapus oscillator sintetis yang terdengar robotik.

### Revisi 3: Alur Pintu Depan (Onboarding), Dialog Mascot, dan Ketuk Buka Kartu
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Jangan ujug-ujug disodori form input nama dan pertanyaan di awal (menghilangkan blank canvas paralysis).
  2. Ingin ada prolog percakapan peramal (mascot) yang bertahap (user klik next-next) untuk membangun suasana magis.
  3. Ingin ada layar transisi khusus saat mascot sedang bersiap membaca pikiran/aura sembari menunggu AI.
  4. Saat sesi selesai dan user memilih ulang, ulangnya HARUS langsung dari form/meja kartu, TIDAK mengulang percakapan prolog.
  5. Saat membuka kartu, JANGAN otomatis berputar sendiri, buat menjadi "Ketuk untuk Buka Kartu" (manual tap-to-reveal) secara bertahap (Masa Lalu -> Masa Kini -> Masa Depan).
  6. Audio sound effect yang sekarang masih jelek. Suara harus benar-benar tebal, berbobot, cinematic/ASMR kartu nyata, dan tidak boleh tercampur frekuensi beeps oscillator sintetis.
- Solusi & Rencana:
  1. Menambahkan stage `PROLOGUE` interaktif (3 frame dialog sang Peramal dengan tombol "Lanjut ✦" dan opsi "Lewati").
  2. Menyediakan 4 Quick Chips topik instan (Asmara, Karier, Kegalauan, Pesan Hari Ini) dan nama dibuat santai (opsional).
  3. Menampilkan layar transisi khusus "Sedang Membaca Pikiranmu" saat status `FETCHING_READING` dengan teks dinamis.
  4. Logika `resetSession` mengarahkan stage langsung ke `INPUT_FORM`, bukan ke `PROLOGUE`.
  5. Mekanisme membuka kartu diubah menjadi manual tap-to-reveal: kartu pertama berdenyut pendar emas, pengguna mengetuknya untuk membuka dengan efek suara snap kartu, lalu lanjut ke kartu kedua dan ketiga.
  6. Mengganti seluruh aset SFX dengan audio foley/cinematic card pack berkualitas tinggi (shuffle tebal bertempo mantap, snap kartu berat berbobot dengan thud meja/felt, tanpa beeps oscillator sama sekali).

### Revisi 4: Layout Tahap Buka Kartu & Penghapusan Label Posisi
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Tulisan petunjuk "buka kartu" ditaruh di dalam kartu (card back), jangan terpisah di luar.
  2. DILARANG menuliskan label "PAST", "PRESENT", "FUTURE" di bawah kartu.
  3. Tombol "Baca Penjelasan Lengkap" tenggelam di bawah layar smartphone sehingga pengguna tidak bisa melanjutkan ke pembahasan kartu.
- Solusi & Tindakan:
  1. Memindahkan petunjuk buka kartu langsung ke dalam kartu tertutup (overlay badge di tengah punggung kartu yang berdenyut pendar emas).
  2. Menghapus teks "PAST", "PRESENT", "FUTURE" di bawah kartu, menyisakan nama kartu dan orientasi (Tegak/Terbalik) saat kartu terbuka.
  3. Memperbaiki tata letak vertikal mobile:
     - Mengompres ukuran mascot dan gelembung dialog pada tahap `REVEALING_CARDS` agar hemat ruang vertikal.
     - Mengurangi skala tinggi kartu segitiga pada mobile (sekitar 135px–145px) agar Row 1 dan Row 2 muat rapi dalam viewport tanpa overflow.
     - Memastikan tombol aksi CTA di bagian bawah selalu terlihat utuh (pinned/visible dalam viewport) dan langsung bisa diklik saat ketiga kartu terbuka.

### Revisi 5: Posisi Bubble Text Dialog & Eliminasi Penggunaan Emoji
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Posisi bubble text kurang ke atas (ada celah kosong terlalu jauh antara avatar peramal dan kotak dialog di bawah).
  2. Kurangi penggunaan emoji di aplikasi.
- Solusi & Tindakan:
  1. Merestrukturisasi tata letak vertikal `PrologueStage.tsx`:
     - Menyatukan avatar maskot, cincin altar, badge nama babak, dan kotak bubble dialog ke dalam satu wadah tengah terpadu (`flex-1 flex-col items-center justify-center`).
     - Menaikkan posisi kotak dialog tepat di bawah maskot dengan margin ringkas (`mt-4`), sehingga ekor dialog (*speech bubble pointer*) tepat menunjuk ke arah karakter peramal.
     - Tombol "Lanjut ✦" tetap terjangkar rapi dan proporsional di bagian bawah layar.
  2. Menghapus seluruh emoji berwarna bawaan OS:
     - Mengganti emoji pada 4 tombol fokus cepat di `InputFormStage.tsx` (`❤️`, `💼`, `🌙`, `⚡`) dengan ikon SVG vektor elegan monokrom dari `lucide-react` (`Heart`, `Briefcase`, `Moon`, `Compass`).
     - Mengganti teks tombol prolog `Buka Altar Tarot 🔮` menjadi `Buka Altar Tarot ✦`.
     - Menambahkan instruksi ketat pada system prompt Gemini API (`/api/tarot/route.ts`) agar dilarang menghasilkan emoji dalam sapaan, narasi bacaan, maupun nasihat.

### Revisi 6: Refaktor Kalimat Narasi, Eliminasi Terjemahan Kartu, & Koreksi Model Gemini
- Tanggal: 15 November 2026
- Masukan Pengguna:
  1. Pengguna sudah memasang Gemini API Key sebelum deploy Vercel, namun hasil pembacaan masih memakai fallback.
  2. Minta refaktor kalimat penjelasan kartu agar mengalir rapi dan kontekstual terhadap topik yang dipilih.
  3. DILARANG memberikan terjemahan kartu di dalam kurung (seperti `(Eight Tongkat)`, `(King Tongkat)`, `(Five Cawan)`).
- Solusi & Tindakan:
  1. Memperbaiki pemanggilan model Google Generative AI di `/api/tarot/route.ts`:
     - Menghapus nama model yang tidak valid `gemini-2.5-flash` (penyebab silent failure 404 yang memicu fallback otomatis).
     - Menggantinya dengan model resmi `gemini-1.5-flash` dengan mekanisme fallback otomatis ke `gemini-2.0-flash`.
  2. Menghapus seluruh terjemahan nama kartu tarot di dalam tanda kurung:
     - Menginstruksikan LLM Gemini secara ketat untuk HANYA menggunakan nama resmi kartu tarot secara natural tanpa embel-embel terjemahan.
     - Membersihkan raw knowledge base makna kartu dari tanda kurung terjemahan.
     - Mengganti tampilan nama kartu di riwayat sesi `HistoryDrawer.tsx` dari `c.name_id` menjadi `c.name`.
  3. Merombak total mesin narasi Fallback (`generateKnowledgeBaseReading`):
     - Membangun deteksi domain topik cerdas (Karier & Rezeki, Asmara, Kegalauan Batin, Panduan Hidup).
     - Menganyam topik secara kontekstual ke dalam babak Masa Lalu, Masa Kini, Masa Depan, dan Nasihat Akhir.
     - Menghapus glitch pengulangan kata ("Energi ini Energi..."), huruf kapital di tengah kalimat, dan kontradiksi kartu menantang (seperti Five of Cups yang kini ditafsirkan dengan bijak dan empati).

---

## 2. Daftar Pantangan & Aturan Mutlak (Do & Don't)

### DILARANG (Don'ts):
1. DILARANG menggunakan sound generator oscillator sintetis (sine/sawtooth beeps) yang terdengar seperti game 8-bit/robotik. Gunakan file audio akustik nyata di `public/audio/`.
2. DILARANG menyodorkan form kosong kaku yang mewajibkan input teks panjang tanpa opsi cepat (quick chips).
3. DILARANG membuka 3 kartu secara otomatis tanpa interaksi fisik pengguna. Pengguna harus mengetuknya sendiri.
4. DILARANG mengulang prolog percakapan saat pengguna menekan tombol "Mulai Ulang" / "Sesi Baru".
5. DILARANG memotong teks rangkuman nasihat di Share Card dengan tanda titik tiga (...). Teks harus terbungkus rapi (multi-line wrap).
6. DILARANG menambahkan kalimat klise seperti "Pesan untuk [nama]:" pada hasil ramalan.
7. DILARANG menggunakan background polos atau warna datar yang merusak atmosfer mistik.
8. DILARANG menuliskan label posisi "PAST", "PRESENT", "FUTURE" di bawah kartu pada tahap tebaran/buka kartu.
9. DILARANG membuat layout yang mendorong tombol aksi tenggelam di bawah layar viewport smartphone.
10. DILARANG menggunakan emoji berwarna OS (seperti 🔮, ❤️, 💼, ⚡, dsb) di antarmuka maupun pada hasil generate AI. Gunakan ikon SVG minimalis atau glif monokrom elegan (seperti ✦).
11. DILARANG membiarkan celah kosong terlalu jauh antara karakter maskot dan gelembung dialog (speech bubble). Bubble text harus selalu dekat dan terhubung visual dengan karakter yang berbicara.
12. DILARANG memberikan terjemahan nama kartu tarot ke Bahasa Indonesia di dalam tanda kurung (misalnya jangan tulis "Eight of Wands (Eight Tongkat)" atau "The Fool (Si Pandir)"). Cukup gunakan nama kartu aslinya secara natural.
13. DILARANG menggunakan nama model AI yang tidak terdaftar di Google API (gunakan selalu model resmi GA seperti `gemini-1.5-flash`).

### WAJIB DILAKUKAN (Dos):
1. WAJIB mempertahankan tanda tangan pembuat: "✦ Crafted with magic by Nova Miftakhul Huda ✦".
2. WAJIB menggunakan audio nyata untuk interaksi kartu (shuffle, slide, flip).
3. WAJIB menjaga performa responsif mobile-friendly, ukuran tap target minimal 44x44px.
4. WAJIB memprioritaskan kontrol taktil pengguna di setiap tahapan ritual.
