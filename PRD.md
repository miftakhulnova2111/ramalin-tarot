# Product Requirements Document (PRD): Tarot Reader Interactive WebApp (Consolidated Master Specification)

**Versi Dokumen**: 2.0 (Consolidated Master Document — End-to-End Architecture)  
**Target Platform**: Web Application (Mobile-First 100dvh, Desktop Responsive)  
**Target Infrastruktur**: Vercel (Next.js App Router + Serverless Functions + Vercel CDN)  
**Target Pengguna**: Pengguna Internet Indonesia (Gen Z & Milenial)  
**Status Dokumen**: Final & Siap Eksekusi (Engineering + Visual Production Ready)  

---

## 1. Visi Produk, Target Pengguna & Rasional Keputusan UX

### 1.1 Ringkasan Produk
Aplikasi ini adalah permainan simulasi pembacaan kartu tarot interaktif berbasis web yang dipandu oleh karakter peramal beranimasi (diadaptasi dari rekaman orang asli yang diubah menjadi ilustrasi bergerak berformat Animated WebP/GIF). Seluruh interaksi dirancang untuk layar ponsel pintar tanpa memaksa pengguna melakukan *scroll* yang merusak imersi, menggunakan mekanisme **Continuous Shuffle & Stop 3x**, terintegrasi dengan **Gemini API** untuk tafsir kontekstual berbahasa Indonesia, dan dilengkapi generator **Social Share Card (9:16)** otomatis.

### 1.2 Profil Target Pengguna & Gaya Bahasa
* **Segmen Utama**: Pengguna Indonesia (Gen Z dan Milenial) yang menyukai hiburan interaktif, refleksi psikologis/diri, dan gemar membagikan hasil kuis atau bacaan personal ke Instagram Story maupun WhatsApp Status.
* **Personalisasi Sesi**: Pengguna langsung mengetik pertanyaan atau kegundahan yang ingin dikonsultasikan di awal sesi (misal: *"Bagaimana kelanjutan karierku bulan depan?"* atau *"Apa yang perlu kupersiapkan saat ini?"*). Desain sengaja memangkas chip kategori agar alur interaksi terasa instan, minim hambatan (frictionless), dan langsung terhubung secara emosional.
* **Tone of Voice (Gaya Bahasa Peramal)**: Bahasa Indonesia yang hangat, empatik, sedikit puitis/mistis namun tetap rasional, membumi, dan relevan dengan keseharian anak muda Indonesia.

### 1.3 Rasional Keputusan Arsitektur UI/UX (Mengapa Desain Ini Dikunci)
1. **Penolakan Jajaran 78 Kartu (Anti-Clutter)**: Menjejerkan 78 kartu secara terbuka di layar ponsel yang sempit membuat area sentuh (*hit target*) terlalu kecil, membebani memori render DOM, dan merusak estetika. Solusinya adalah mekanisme **Continuous Shuffle & Stop 3x** yang memusatkan aksi pada satu tombol di area jangkauan ibu jari (*thumb zone*).
2. **Penolakan Siklus Acak Ulang yang Lambat**: Memaksa pengguna mengulang layar dari awal sebanyak tiga kali akan memicu kebosanan (*drop-off*). Dengan sistem **Slot Drop**, animasi acak terus berjalan dan setiap klik **Stop** langsung meluncurkan satu kartu tertutup ke slot penampung.
3. **Koreografi Ruang Vertikal (Solusi Formasi 2 Atas - 1 Bawah)**: Kartu tarot memiliki rasio memanjang (1:1,75). Menampilkan karakter peramal, dek pengacak, formasi kartu 2 Atas - 1 Bawah, dan teks bacaan sekaligus dalam satu layar ponsel (tinggi rata-rata 660px–840px) akan membuat elemen saling bertumpuk. Oleh karena itu, layar dibagi menjadi **3 Fase Transisi Adaptif (`100dvh`)** yang mengubah komposisi layar secara otomatis di setiap tahapan permainan.
4. **Sinkronisasi Jeda AI (Zero-Wait Illusion)**: Tembakan ke Gemini API dilakukan tepat pada milidetik tombol **Stop ke-3** ditekan. Kartu yang sudah masuk ke formasi 2 Atas - 1 Bawah ditahan tetap tertutup dengan efek pendar cahaya (*pulsing glow*) selama 2–4 detik hingga JSON dari Gemini diterima, barulah ketiga kartu dibuka satu per satu secara 3D. Pengguna merasakan ketegangan dramatis, bukan layar *loading* yang membosankan.

---

## 2. Arsitektur Layout Mobile-First (3 Fase Transisi Layar 100dvh)

Seluruh kontainer permainan utama menggunakan tinggi layar dinamis (`h-dvh overflow-hidden` pada Tailwind CSS) dengan pembagian proporsi vertikal yang presisi:

### Fase 0: Layar Sapaan & Input (`INPUT_FORM`)
* **Zona Atas (45% Tinggi Layar)**: Karakter peramal berukuran besar (`Animasi 1: Idle/Menyambut`) dengan balon sapaan ramah di bawahnya.
* **Zona Bawah (55% Tinggi Layar)**: Kartu formulir interaktif minimalis berisi:
  * Input Teks Pertanyaan: Area teks elegan tempat pengguna langsung menuliskan hal yang ingin ditanyakan (maks 140 karakter, dengan teks placeholder otomatis seperti *"Bagaimana arah karierku selanjutnya?"* atau *"Petunjuk semesta untuk langkahku hari ini"*).
  * CTA Utama: Tombol **Mulai Ramalan** yang lebar dan nyaman dijangkau ibu jari, langsung mengunci pertanyaan dan memulai putaran acak kartu.

### Fase A: Mode Pengacakan & Kunci Kartu (`SHUFFLING` & `CARD_LOCKING`)
Fokus penuh pada ekspresi karakter peramal dan ketukan ibu jari pengguna untuk menghentikan kartu. Formasi besar 2 Atas - 1 Bawah belum ditampilkan di fase ini agar layar tidak penuh.
* **Zona Atas (42% Tinggi Layar)**: Karakter peramal ukuran besar (`Animasi 2: Mengocok` yang otomatis berubah ke `Animasi 3: Fokus/Tunjuk` selama 0,8 detik setiap kali tombol Stop ditekan) beserta teks instruksi dinamis.
* **Zona Tengah (33% Tinggi Layar)**: Tumpukan dek kartu di tengah layar yang berputar/bergeser cepat dengan efek suara gesekan kartu.
* **Zona Bawah (25% Tinggi Layar)**:
  * **Baris 3 Slot Mini**: Tiga kotak indikator kecil berjajar (`[1: Masa Lalu]`, `[2: Masa Kini]`, `[3: Masa Depan]`) yang terisi ikon punggung kartu setiap kali pengguna menekan Stop.
  * **Tombol STOP Utama**: Tombol lebar di bagian paling bawah dengan label progres **STOP (Ambil Kartu 1/3)**, **(2/3)**, dan **(3/3)**.

### Fase B: Panggung Formasi Segitiga 2-1 (`FETCHING_READING` & `REVEALING_CARDS`)
Begitu tombol Stop ke-3 ditekan dan kartu ke-3 terkunci, dek pengacak serta tombol Stop menghilang dari layar.
* **Zona Atas (22% Tinggi Layar - Compact Header)**: Area karakter peramal (`Animasi 4: Meramal`) menyusut secara halus menjadi *header* ringkas di bagian atas layar bersama indikator status (*"Membaca benang merah energimu..."*).
* **Zona Tengah-Bawah (78% Tinggi Layar - Formasi 2 Atas, 1 Bawah)**:
  * Ketiga kartu dari slot mini membesar dan berpindah posisi secara mulus (menggunakan `layoutId` Framer Motion) membentuk **Segitiga Terbalik (2 Atas, 1 Bawah)**:
    * **Kiri Atas**: Kartu 1 (Masa Lalu) — Ukuran ~115px x 201px.
    * **Kanan Atas**: Kartu 2 (Masa Kini) — Ukuran ~115px x 201px.
    * **Tengah Bawah**: Kartu 3 (Masa Depan) — Ukuran ~125px x 218px (sedikit lebih menonjol sebagai klimaks).
  * **Aturan Buka Satu-Satu**: Ketiga kartu tetap tertutup rapat dengan efek *pulsing glow* selama menunggu Gemini API. Begitu respons JSON valid diterima browser, kartu berputar 180 derajat pada sumbu Y (*3D Flip*) satu per satu secara berurutan (Kartu 1 -> jeda 0,8 detik -> Kartu 2 -> jeda 0,8 detik -> Kartu 3).

### Fase C: Mode Bacaan & Panel Geser (`READING_COMPLETE`)
Menampilkan penjelasan mendalam tanpa mengorbankan visibilitas kartu yang sudah terbuka.
* **Latar Belakang Interaktif**: Formasi 2 Atas - 1 Bawah tetap terlihat di bagian atas-tengah layar. Kartu yang sedang dibaca memiliki sorotan cahaya emas (*active border glow*).
* **Bottom Sheet (55% Tinggi Layar dari Bawah)**: Panel geser (*drawer*) naik dari bawah layar memuat hasil bacaan Gemini API:
  * **Navigasi Tab Cepat**: `[Pengantar & Lalu]` | `[Masa Kini]` | `[Masa Depan]` | `[Kesimpulan]`.
  * Pengguna dapat menggeser tab atau langsung mengetuk gambar Kartu 1, 2, atau 3 di atas untuk mengganti isi teks penjelasan.
  * **Sticky Action Bar**: Di bagian dasar panel terdapat tombol utama **Bagikan Hasil (Story 9:16)** dan tombol sekunder **Ramal Lagi**.

```
[FASE 0: INPUT]        [FASE A: ACAK & STOP]    [FASE B: BUKA 2-1]       [FASE C: BACA & SHARE]
+------------------+   +------------------+     +------------------+     +------------------+
|  [GIF 1: Idle]   |   | [GIF 2/3: Acak]  |     | [GIF 4 Mini]     |     | [GIF 4 Mini]     |
|  "Halo, siapa    |   | "Tekan Stop..."  |     | "Membaca kartu"  |     | [Kartu1] [Kartu2]|
|   namamu?"       |   +------------------+     +------------------+     |     [Kartu3]     |
+------------------+   |  [ Dek Berputar] |     |                  |     +------------------+
|                  |   +------------------+     | [Kartu1] [Kartu2]|     | [Lalu][Kini][Dpn]|
| [Tuliskan        |   |  [1]  [2]  [3]   | --> |  (Lalu)   (Kini) | --> | Teks interpretasi|
|  Pertanyaanmu]   |   |  (Slot Mini)     |     |                  |     | Gemini API yang  |
|                  |   |                  |     |     [Kartu3]     |     | nyaman dibaca... |
| [MULAI RAMALAN]  |   | [ TOMBOL STOP ]  |     |     (Depan)      |     | [BAGIKAN HASIL]  |
+------------------+   +------------------+     +------------------+     +------------------+
```

---

## 3. Matriks Alur Sesi, State Sistem & Trigger Animasi

| Urutan | State Sistem (`GameStage`) | Animasi Karakter Aktif | Trigger Perpindahan | Aksi Sistem di Balik Layar |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `INPUT_FORM` | `anim_1_idle.webp` | Halaman dibuka | Preload `anim_2`, `anim_3`, `anim_4`, dan gambar `back.webp` ke memori browser. |
| **2** | `SHUFFLING` (Putaran 1–3) | `anim_2_shuffle.webp` | Klik "Mulai Ramalan" atau selesai jeda kunci kartu | Acak array 78 kartu (*Fisher-Yates*). Geser pointer indeks aktif setiap 50ms. |
| **3** | `CARD_LOCKING` (0,8 dtk) | `anim_3_pick.webp` | Klik tombol **STOP** (1/3, 2/3, atau 3/3) | Kunci kartu pada indeks aktif, tentukan *Upright/Reversed*, hapus dari dek, kunci tombol Stop selama 0,8 detik. |
| **4** | `FETCHING_READING` | `anim_4_read.webp` | Selesai jeda kunci kartu ke-3 | Tembak POST `/api/tarot` ke Gemini API. Transisikan 3 kartu tertutup ke formasi 2 Atas - 1 Bawah dengan efek bersinar. |
| **5** | `REVEALING_CARDS` | `anim_4_read.webp` | JSON dari `/api/tarot` diterima browser | Preload 3 gambar depan kartu terpilih, lalu jalankan animasi *3D Flip* Kartu 1, 2, dan 3 secara berurutan (jeda 0,8 detik). |
| **6** | `READING_COMPLETE` | `anim_4_read.webp` | Kartu ke-3 selesai berputar terbuka | Munculkan *Bottom Sheet* berisi teks ramalan, simpan sesi ke `localStorage`, aktifkan fitur render *Share Card*. |

---

## 4. Mekanisme Dek 78 Kartu & Algoritma Pengacakan

### 4.1 Komposisi 78 Kartu Lengkap
* **Major Arcana (22 Kartu — ID `0` s/d `21`)**: *The Fool (0)* hingga *The World (21)*.
* **Minor Arcana (56 Kartu — ID `22` s/d `77`)**:
  * **Suit of Wands (Tongkat — Elemen Api)**: *Ace of Wands* s/d *King of Wands* (14 kartu).
  * **Suit of Cups (Cawan — Elemen Air)**: *Ace of Cups* s/d *King of Cups* (14 kartu).
  * **Suit of Swords (Pedang — Elemen Udara)**: *Ace of Swords* s/d *King of Swords* (14 kartu).
  * **Suit of Pentacles (Koin — Elemen Tanah)**: *Ace of Pentacles* s/d *King of Pentacles* (14 kartu).

### 4.2 Algoritma Real-Time Tick Shuffle & Orientasi Kartu
1. **Inisialisasi Dek**: Saat masuk ke state `SHUFFLING` pertama kali, array 78 kartu dikocok menggunakan algoritma *Fisher-Yates*:
   ```typescript
   function shuffleDeck<T>(array: T[]): T[] {
     const copy = [...array];
     for (let i = copy.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [copy[i], copy[j]] = [copy[j], copy[i]];
     }
     return copy;
   }
   ```
2. **Real-Time Pointer Tick**: Selama state `SHUFFLING`, `setInterval` berjalan setiap **50 milidetik** untuk memajukan pointer `currentIndex = (currentIndex + 1) % remainingDeck.length`. Dengan demikian, milidetik saat jari pengguna menyentuh tombol **STOP** secara autentik menentukan kartu mana yang terambil.
3. **Eliminasi Duplikasi**: Kartu yang terambil pada klik Stop langsung dikeluarkan dari `remainingDeck` menggunakan `splice(currentIndex, 1)` sehingga klik Stop ke-2 dan ke-3 dijamin tidak akan pernah menghasilkan kartu kembar.
4. **Probabilitas Posisi Kartu (Upright vs Reversed)**:
   * Setiap kartu yang dikunci langsung dihitung orientasinya: `const isReversed = Math.random() < 0.30;` (**70% Tegak / Upright**, **30% Terbalik / Reversed**).
   * Jika `isReversed === true`, gambar kartu depan diberi transformasi CSS `rotate-180` saat terbuka dan label namanya diberi keterangan `(Terbalik / Reversed)`.

### 4.3 Struktur Skema Database Lokal (`src/data/tarotDeck.json`)
File JSON statis ini digunakan untuk merender data visual kartu sekaligus menjadi **Fallback Otomatis** jika koneksi ke Gemini API mengalami gangguan:
```json
[
  {
    "id": 0,
    "slug": "00-the-fool",
    "name": "The Fool",
    "arcana": "Major",
    "image": "/cards/00-the-fool.webp",
    "keywords_upright": ["Awal baru", "Kepolosan", "Spontanitas", "Lompatan keyakinan"],
    "keywords_reversed": ["Kecerobohan", "Takut melangkah", "Kurang perhitungan"],
    "fallback_upright": "Energi awal yang segar sedang terbuka di hadapanmu. Jangan terlalu lama terjebak dalam keraguan analisis; inilah waktunya melangkah dengan hati terbuka meski belum semua jawaban terlihat jelas.",
    "fallback_reversed": "Ada ketakutan tersembunyi atau justru sikap terburu-buru yang membuat langkahmu goyah. Berhentilah sejenak untuk memeriksa kembali pijakanmu sebelum mengambil keputusan besar."
  }
]
```

---

## 5. Integrasi Gemini API, Panduan Prompt & Keamanan Server

### 5.1 Konfigurasi Teknis & Keamanan
* **Model AI**: `gemini-2.5-flash` melalui SDK resmi `@google/genai` (atau `@google/generative-ai`).
* **Serverless Endpoint**: `src/app/api/tarot/route.ts` (Metode `POST`). Kunci `GEMINI_API_KEY` hanya disimpan di sisi server (Vercel Environment Variables).
* **Structured JSON Output**: Menggunakan fitur `responseMimeType: "application/json"` dan `responseSchema` agar balasan Gemini dijamin 100% berformat JSON murni tanpa tambahan teks pengantar atau blok kode markdown yang bisa merusak `JSON.parse()` di frontend.
* **Perlindungan Kuota & Timeout**:
  * Validasi panjang input di server (`userName <= 30` karakter, `question <= 150` karakter) untuk mencegah *prompt injection* dan pemborosan token.
  * Batas waktu tunggu (*AbortController timeout*) disetel pada **8 detik**. Jika lewat dari 8 detik atau kuota habis, endpoint otomatis merakit respons JSON menggunakan teks `fallback_upright` / `fallback_reversed` dari `tarotDeck.json` sehingga pengguna tetap mendapatkan hasil bacaan tanpa pesan *error*.

### 5.2 System Instruction & Prompt Template (Bahasa Indonesia)

```text
Anda adalah pembaca kartu tarot profesional yang bijaksana, intuitif, empatik, dan tajam dalam membaca psikologi manusia.
Tugas Anda adalah memberikan pembacaan tebaran 3 kartu (Masa Lalu, Masa Kini, Masa Depan) dalam Bahasa Indonesia yang alami dan menyentuh bagi pengguna.

ATURAN GAYA BAHASA & ETIKA:
1. Gunakan Bahasa Indonesia yang hangat, mengalir, reflektif, dan relevan dengan konteks kehidupan generasi muda/dewasa di Indonesia. Hindari terjemahan kaku seperti mesin.
2. Sapa pengguna dengan nama panggilannya pada kalimat pertama di bagian `greeting`.
3. Kaitkan simbolisme masing-masing kartu secara langsung dengan Pertanyaan Pengguna. Jangan hanya menyebutkan definisi kartu secara umum.
4. Untuk kartu dengan orientasi "Terbalik (Reversed)", tafsirkan sebagai energi yang tertahan, penolakan internal, ketakutan yang belum disadari, atau kebutuhan untuk melihat dari sudut pandang baru—bukan sebagai kutukan atau nasib buruk mutlak.
5. BATASAN MUTLAK: Dilarang meramal kematian, memberikan diagnosis penyakit medis, menjanjikan kemenangan judi/investasi spekulatif, atau memberikan kepastian hukum. Arahkan semuanya menjadi refleksi diri dan langkah strategis yang bisa dikendalikan pengguna.

DATA SESI PENGGUNA:
- Pertanyaan Pengguna: "{{question}}"
- Kartu 1 (Posisi Masa Lalu / Akar Situasi): {{card1Name}} — Orientasi: {{card1Orientation}}
- Kartu 2 (Posisi Masa Kini / Tantangan Saat Ini): {{card2Name}} — Orientasi: {{card2Orientation}}
- Kartu 3 (Posisi Masa Depan / Potensi & Saran): {{card3Name}} — Orientasi: {{card3Orientation}}

SKEMA OUTPUT JSON (WAJIB PATUH):
{
  "greeting": "Sapaan personal menyebut nama pengguna dan kalimat pengantar yang merespons inti pertanyaannya (1-2 kalimat).",
  "readings": [
    {
      "position": "Masa Lalu",
      "card_title": "Nama Kartu 1 beserta orientasinya",
      "interpretation": "Tafsir mendalam bagaimana jejak masa lalu atau akar masalah ini membentuk kondisi pengguna sekarang (3-4 kalimat padat)."
    },
    {
      "position": "Masa Kini",
      "card_title": "Nama Kartu 2 beserta orientasinya",
      "interpretation": "Analisis objektif mengenai dinamika yang sedang terjadi saat ini dan hal krusial yang sering luput dari perhatian pengguna (3-4 kalimat padat)."
    },
    {
      "position": "Masa Depan",
      "card_title": "Nama Kartu 3 beserta orientasinya",
      "interpretation": "Gambaran potensi arah ke depan jika pola saat ini berlanjut, disertai langkah konkret yang disarankan (3-4 kalimat padat)."
    }
  ],
  "final_advice": "Pesan penutup yang merangkum benang merah ketiga kartu menjadi satu kalimat reflektif yang kuat dan mudah diingat (1-2 kalimat).",
  "share_summary": "Ringkasan padat yang menyatukan inti ketiga kartu khusus untuk dicetak pada kartu bagikan media sosial (WAJIB maksimal 170 karakter agar muat di layout 2 Atas - 1 Bawah)."
}
```

---

## 6. Spesifikasi Aset Visual & Pipeline Produksi Karakter

### 6.1 Tabel Spesifikasi Teknis Aset

| Kategori Aset | Jumlah File | Dimensi Kanvas | Rasio | Format Utama (Fallback) | Target Ukuran File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Animasi Karakter Peramal** | 4 File | 720 x 720 px | 1:1 | Animated WebP (`GIF` fallback) | Maks 1,2 MB / file |
| **Ilustrasi Depan Kartu** | 78 File | 500 x 875 px | 1:1.75 | WebP | Maks 100 KB / file |
| **Ilustrasi Punggung Kartu** | 1 File | 500 x 875 px | 1:1.75 | WebP | Maks 80 KB |
| **Latar Belakang Meja/Ruang** | 1 File | 1080 x 1920 px | 9:16 | WebP | Maks 200 KB |
| **Bingkai Overlay Share Card** | 1 File | 1080 x 1920 px | 9:16 | PNG Transparan | Maks 200 KB |
| **Audio Musik Latar & SFX** | 4 File | — | — | MP3 / WebM Audio (64–96 kbps) | Maks 500 KB (BGM), 40 KB (SFX) |

### 6.2 SOP Produksi Karakter (Dari Orang Asli ke Ilustrasi GIF/WebP)
Agar karakter peramal memiliki gerakan tubuh manusia yang luwes namun tampil dalam balutan seni ilustrasi yang konsisten, ikuti alur kerja 4 tahap ini:

1. **Tahap 1: Perekaman Video Referensi (Live-Action Shoot)**
   * Gunakan kamera di atas tripod yang terkunci mati (tidak boleh ada guncangan kamera) di depan layar hijau (*green screen*) dengan pencahayaan rata.
   * Pemeran mengenakan pakaian dengan siluet jelas (misalnya jubah atau pakaian bertekstur kontras) dan melakukan 4 gerakan terpisah berdurasi **2,5 hingga 3 detik** per video:
     * **Pose 1 (`anim_1_idle`)**: Duduk tenang, tersenyum tipis penuh misteri, satu tangan menyapa perlahan lalu kembali ke posisi awal.
     * **Pose 2 (`anim_2_shuffle`)**: Kedua tangan di depan dada melakukan gerakan mengocok kartu tarot secara ritmis.
     * **Pose 3 (`anim_3_pick`)**: Gerakan tangan berhenti mendadak dan menunjuk/menahan satu kartu ke arah kamera dengan tatapan mata fokus.
     * **Pose 4 (`anim_4_read`)**: Kedua tangan membuka di atas meja seolah merasakan energi dari kartu yang terbuka, kepala sedikit mengangguk penuh pemahaman.
   * **Kunci Seamless Loop**: Pada setiap video, posisi tubuh dan tangan di *frame* terakhir wajib kembali ke posisi *frame* pertama (atau gunakan teknik *ping-pong loop* untuk gerakan idle dan meramal) agar tidak terlihat melompat saat diputar berulang.

2. **Tahap 2: Pembersihan Latar & Pembuatan Keyframe Ilustrasi**
   * Hapus latar hijau (*chroma key*) di Adobe After Effects, Premiere, atau CapCut, lalu ekspor potongan video pendek dengan latar polos kontras.
   * Ekstrak 1 *frame* diam terbaik dari masing-masing video (total 4 *frame* kunci), lalu gambar ulang (*paint over*) oleh ilustrator menjadi gaya seni ilustrasi tarot yang diinginkan dengan palet warna yang seragam.

3. **Tahap 3: Konversi Video ke Animasi Ilustrasi (Rotoscoping / AI Stylization)**
   * **Opsi Presisi Tinggi (EbSynth)**: Masukkan urutan *frame* video asli dan *frame* kunci hasil gambar ilustrator ke perangkat lunak **EbSynth** untuk memindahkan goresan kuas ilustrasi ke seluruh pergerakan video secara konsisten tanpa efek berkedip (*flicker-free*).
   * **Opsi AI Video-to-Video (DomoAI / Runway / ComfyUI AnimateDiff + ControlNet)**: Gunakan video asli sebagai referensi gerak (*ControlNet Depth/OpenPose*) dan gambar ilustrator sebagai referensi gaya (*IP-Adapter*) untuk menghasilkan urutan *frame* ilustrasi.

4. **Tahap 4: Optimasi Frame Rate & Ekspor Web**
   * Ubah kecepatan frame (*frame rate*) ke **12 fps** atau **15 fps**. Kecepatan ini memberikan nuansa animasi *hand-drawn* 2D yang artistik sekaligus memangkas ukuran file hingga setengahnya dibanding 30 fps.
   * Konversi urutan *frame* PNG transparan menjadi **Animated WebP** menggunakan perintah CLI `ffmpeg` atau `img2webp`:
     ```bash
     ffmpeg -i frame_%03d.png -vcodec libwebp -lossless 0 -compression_level 6 -q:v 75 -loop 0 -preset picture -an -vsync 0 anim_1_idle.webp
     ```

---

## 7. Spesifikasi Fitur Share Card (9:16 Social Story) & Penyimpanan Riwayat

### 7.1 Anatomi Visual Share Card (1080 x 1920 px)
Komponen khusus yang di-render menjadi gambar PNG vertikal beresolusi tinggi untuk Instagram Story / WhatsApp Status:
* **Zona Header (Tinggi 260px)**:
  * Teks kecil di atas: *"BACAAN TAROT HARI INI"*
  * Kutipan Pertanyaan Elegan: *"[Pertanyaan Pengguna]"* (ukuran font proporsional, maks 80 karakter agar tampilan estetis dan personal).
* **Zona Panggung Kartu 2 Atas - 1 Bawah (Tinggi 980px)**:
  * **Baris Atas**: Kartu 1 (Masa Lalu) di kiri & Kartu 2 (Masa Kini) di kanan, masing-masing dilengkapi label posisi dan nama kartu di bawahnya (gambar otomatis terputar 180 derajat jika *Reversed*).
  * **Baris Bawah**: Kartu 3 (Masa Depan) tepat di tengah bawah dengan bingkai aksen emas.
* **Zona Intisari Ramalan (Tinggi 480px)**:
  * Kotak berbingkai ornamen tipis memuat teks `share_summary` (maksimal 170 karakter) dan kutipan `final_advice` dari Gemini API.
* **Zona Footer / Branding (Tinggi 200px)**:
  * Avatar mini karakter peramal di samping teks ajakan: *"Cek ramalan kartumu di [domain-kamu.vercel.app]"*.

### 7.2 Mekanisme Render Klien & Web Share API
1. Aplikasi menyiapkan elemen DOM tersembunyi di luar layar (`position: fixed; left: -9999px; width: 540px; height: 960px;`) dengan rasio `pixelRatio: 2` pada `html-to-image` sehingga menghasilkan gambar tajam **1080 x 1920 piksel**.
2. Seluruh gambar kartu di dalam *Share Card* wajib menggunakan atribut `crossOrigin="anonymous"` atau dimuat dari domain lokal (`/cards/...`) agar kanvas HTML5 tidak terkena blokir keamanan *Tainted Canvas* di browser Safari iOS.
3. Saat pengguna menekan **Bagikan Hasil**:
   * Jika browser mendukung `navigator.canShare({ files: [file] })`, sistem langsung memunculkan panel berbagi bawaan ponsel (langsung kirim ke Instagram Story, WhatsApp, atau X).
   * Jika tidak didukung (misalnya di browser desktop), sistem otomatis memicu unduhan file `tarot-[nama]-[tanggal].png`.

### 7.3 Riwayat Sesi Lokal (`localStorage`)
* Setiap bacaan yang selesai otomatis disimpan ke dalam kunci `tarot_reading_history` di `localStorage` (maksimal 5 sesi terakhir menggunakan sistem antrean *FIFO*).
* Pengguna dapat membuka daftar riwayat dari halaman awal untuk membaca kembali tafsir lengkap atau mengunduh ulang *Share Card* tanpa memotong kuota Gemini API.

---

## 8. Arsitektur Teknis, Struktur Proyek & Implementasi Kode Inti

### 8.1 Struktur Folder Lengkap (Next.js App Router)
```text
tarot-reader-webapp/
├── public/
│   ├── animations/
│   │   ├── anim_1_idle.webp
│   │   ├── anim_2_shuffle.webp
│   │   ├── anim_3_pick.webp
│   │   └── anim_4_read.webp
│   ├── cards/
│   │   ├── back.webp
│   │   ├── 00-the-fool.webp
│   │   └── ... (78 file kartu dalam format WebP)
│   └── audio/
│       ├── bgm-mystic.mp3
│       ├── sfx-shuffle.mp3
│       ├── sfx-lock.mp3
│       └── sfx-flip.mp3
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tarot/
│   │   │       └── route.ts         # Serverless Endpoint pemanggil Gemini API
│   │   ├── globals.css              # Konfigurasi Tailwind & utilitas 3D Flip CSS
│   │   ├── layout.tsx               # Root layout & konfigurasi font
│   │   └── page.tsx                 # State Machine Utama (3 Fase Adaptive 100dvh)
│   ├── components/
│   │   ├── CharacterHeader.tsx      # Komponen GIF/WebP peramal (Ukuran penuh vs Compact)
│   │   ├── InputFormStage.tsx       # Fase 0: Form Input Pertanyaan Langsung
│   │   ├── ShuffleStage.tsx         # Fase A: Dek acak + 3 Slot Mini + Tombol Stop
│   │   ├── TriangleSpreadStage.tsx  # Fase B: Formasi 2 Atas - 1 Bawah + 3D Flip
│   │   ├── ReadingBottomSheet.tsx   # Fase C: Panel geser tafsir + Tab Navigasi
│   │   └── ShareCardGenerator.tsx   # Kanvas 9:16 & integrasi html-to-image
│   ├── data/
│   │   └── tarotDeck.json           # Database 78 kartu & teks fallback
│   ├── hooks/
│   │   └── useAssetPreloader.ts     # Hook pemuat animasi GIF/WebP di awal sesi
│   └── types/
│       └── tarot.ts                 # Kontrak TypeScript (State, Card, API Response)
├── .env.local                       # GEMINI_API_KEY=your_key_here
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### 8.2 Kontrak Data TypeScript (`src/types/tarot.ts`)
```typescript
export type GameStage =
  | 'INPUT_FORM'        // Fase 0: Input pertanyaan langsung (Animasi 1)
  | 'SHUFFLING'         // Fase A: Kartu berputar, tunggu klik Stop (Animasi 2)
  | 'CARD_LOCKING'      // Fase A: Jeda 0.8 detik kartu turun ke slot mini (Animasi 3)
  | 'FETCHING_READING'  // Fase B: Formasi 2-1 tertutup bersinar, tunggu Gemini (Animasi 4)
  | 'REVEALING_CARDS'   // Fase B: Buka kartu 1 -> 2 -> 3 satu per satu (Animasi 4)
  | 'READING_COMPLETE'; // Fase C: Bottom Sheet tafsir terbuka + Share Card (Animasi 4)

export interface TarotCardData {
  id: number;
  slug: string;
  name: string;
  arcana: 'Major' | 'Minor';
  image: string;
  keywords_upright: string[];
  keywords_reversed: string[];
  fallback_upright: string;
  fallback_reversed: string;
}

export interface SelectedCard extends TarotCardData {
  positionIndex: 0 | 1 | 2;
  positionLabel: 'Masa Lalu' | 'Masa Kini' | 'Masa Depan';
  isReversed: boolean;
  isFlipped: boolean;
}

export interface GeminiReadingResponse {
  greeting: string;
  readings: {
    position: 'Masa Lalu' | 'Masa Kini' | 'Masa Depan';
    card_title: string;
    interpretation: string;
  }[];
  final_advice: string;
  share_summary: string;
}
```

### 8.3 Implementasi Serverless Endpoint Gemini (`src/app/api/tarot/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const readingResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    greeting: { type: Type.STRING },
    readings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.STRING },
          card_title: { type: Type.STRING },
          interpretation: { type: Type.STRING },
        },
        required: ['position', 'card_title', 'interpretation'],
      },
    },
    final_advice: { type: Type.STRING },
    share_summary: { type: Type.STRING },
  },
  required: ['greeting', 'readings', 'final_advice', 'share_summary'],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, cards } = body;

    if (!cards || cards.length !== 3) {
      return NextResponse.json({ error: 'Data sesi tidak lengkap' }, { status: 400 });
    }

    const prompt = `
Anda adalah pembaca kartu tarot profesional yang bijaksana, intuitif, empatik, dan objektif.
Berikan pembacaan tebaran 3 kartu dalam Bahasa Indonesia untuk pertanyaan berikut:
- Pertanyaan Pengguna: "${String(question || 'Mohon petunjuk terbaik untuk situasiku saat ini').slice(0, 150)}"
- Kartu 1 (Masa Lalu): ${cards[0].name} — Orientasi: ${cards[0].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
- Kartu 2 (Masa Kini): ${cards[1].name} — Orientasi: ${cards[1].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}
- Kartu 3 (Masa Depan): ${cards[2].name} — Orientasi: ${cards[2].isReversed ? 'Terbalik (Reversed)' : 'Tegak (Upright)'}

Pastikan share_summary maksimal 170 karakter dan bahasa mengalir hangat serta kontekstual.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: readingResponseSchema,
        temperature: 0.7,
      },
    });

    const resultJson = JSON.parse(response.text || '{}');
    return NextResponse.json(resultJson);
  } catch (error) {
    console.error('Gemini API Error, menggunakan fallback:', error);
    return NextResponse.json({ error: 'FALLBACK_TRIGGERED' }, { status: 503 });
  }
}
```

### 8.4 Utilitas CSS 3D Flip Kartu (`src/app/globals.css`)
Agar efek membalik kartu satu per satu terlihat nyata dan mulus di browser seluler (terutama Safari iOS):
```css
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
```

---

## 9. Konfigurasi Deployment Vercel & Checklist Kesiapan Produksi

### 9.1 Langkah Deployment ke Vercel
1. Hubungkan repositori GitHub proyek ke Dashboard Vercel.
2. Tambahkan Environment Variable di pengaturan proyek Vercel:
   * `GEMINI_API_KEY` = `[Kunci API dari Google AI Studio]`
3. Atur header *Cache-Control* di `next.config.mjs` untuk folder `/animations/*` dan `/cards/*` menjadi `public, max-age=31536000, immutable` agar Vercel CDN menyimpan aset animasi dan kartu secara permanen di tepi jaringan (*edge cache*).

### 9.2 Checklist Penerimaan Akhir (Definition of Done)
- [ ] **Preload 4 Animasi Karakter**: Keempat file Animated WebP/GIF (`anim_1` s/d `anim_4`) sudah selesai dimuat di memori saat pengguna mengetik nama di `INPUT_FORM` sehingga transisi antar-state berlangsung 0 milidetik tanpa kedipan putih.
- [ ] **Kunci Tombol Stop (Anti Double-Tap)**: Tombol **STOP** langsung terkunci (`disabled`) selama 800ms setiap kali ditekan (`CARD_LOCKING`) agar ketukan beruntun yang tidak sengaja tidak mengambil 2 kartu sekaligus.
- [ ] **Bebas Scroll Liar (100dvh Lock)**: Diuji pada ukuran layar ponsel kecil (360x640px) hingga besar (430x932px); tidak ada elemen yang terpotong pada Fase A (`SHUFFLING`) maupun Fase B (`REVEALING_CARDS` formasi 2 Atas - 1 Bawah).
- [ ] **Urutan Reveal Terjaga**: Ketiga kartu tidak boleh terbuka sebelum JSON bacaan siap, dan wajib membuka secara berurutan (Kartu 1 -> Kartu 2 -> Kartu 3) dengan jeda 0,8 detik.
- [ ] **Validasi Share Card 9:16**: Gambar hasil unduhan berukuran tepat 1080x1920 piksel, menampilkan nama pengguna, 3 kartu dengan orientasi *Upright/Reversed* yang akurat, serta teks ringkasan yang tidak keluar dari batas bingkai.
