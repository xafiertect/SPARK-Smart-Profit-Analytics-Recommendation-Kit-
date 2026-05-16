# SPARK Antigravity UI Revision (Aesthetics & Fixes)

## 1. Centered Aesthetic Login & Register
- Halaman Login dan Register tidak lagi menggunakan split 60/40.
- Kembalikan ke layout **tengah (centered)** yang elegan.
- Berikan efek **3D Glassmorphism** pada kontainer utama (Card) dengan bayangan yang dalam (`box-shadow` berlapis) dan *border* neon yang sangat tipis.
- Background menggunakan partikel atau gradien dinamis yang mewah, tidak kosong.

## 2. Konsistensi Mode Gelap (Dark Mode)
- **Input & Dropdown**: Background input di mode gelap harus selaras (misal `var(--bg-base)` atau `rgba(255,255,255,0.05)`), tidak boleh transparan sehingga teks bertumpuk atau background putih di mode gelap.
- **Teks**: Pastikan teks placeholder dan teks input kontras (putih/abu-abu terang di mode gelap).
- **Select/Option**: Elemen `<select>` sering kali memiliki *styling default* browser yang jelek di mode gelap. Pastikan diberikan *styling* khusus atau *background-color* gelap.

## 3. Perbaikan Baseline Setup (Onboarding)
- Halaman setup awal ("Info Bisnis Kamu", "Review & Konfirmasi") yang sebelumnya sangat sempit dan tidak proporsional harus diperbaiki.
- Gunakan kontainer tengah (*centered card*) dengan lebar maksimum yang wajar (misal `max-width: 500px` atau `600px`).
- Berikan padding yang luas (`padding: 32px`), tipografi yang berhierarki jelas (Heading besar), dan jarak (`gap`) yang cukup antar elemen form.
- Tombol aksi utama ("Mulai Pakai SPARK") harus terlihat dominan dengan efek *glow*.
