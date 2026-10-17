# SIKARYA METRA

> **Sistem Informasi Keuangan & Transparansi Dana Punia**  
> Panitia Karya Pura Dalem Desa Adat Metra

SIKARYA METRA adalah aplikasi web terpadu yang dirancang untuk mendukung tata kelola pembukuan kas otomatis (*Auto-Ledger Sync*), akuntabilitas laporan per seksi, serta transparansi dana punia pada pelaksanaan Karya di Pura Dalem Desa Adat Metra.

---

## Fitur Utama

- **Dashboard Keuangan Terintegrasi**: Pemantauan pemasukan, pengeluaran, dan saldo kas secara real-time untuk Bendahara Umum dan Bendahara Seksi.
- **Pencatatan & Verifikasi Dana Punia**: Pengelolaan donasi tunai maupun transfer dari krama dan pamedek lengkap dengan pencetakan bukti kuitansi.
- **Portal Publik Krama**: Halaman transparansi terbuka bagi masyarakat dan krama desa adat untuk memantau ringkasan kas secara akuntabel tanpa perlu login.
- **Layar TV Kiosk**: Tampilan display informasi dinamis yang dirancang khusus untuk monitor/TV di posko karya pura.
- **Hak Akses Berbasis Peran (RBAC)**: Pengelolaan wewenang terstruktur untuk Super Admin, Bendahara Umum, Bendahara Seksi, dan Petugas Punia.

---

## Teknologi

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Ikon**: Lucide React
- **Backend & Data**: Next.js API Routes & In-Memory Data Service

---

## Memulai (Quick Start)

### 1. Prasyarat
Pastikan Node.js (versi 18.x atau lebih baru) dan npm sudah terpasang.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban dan akses:
- **Login Petugas/Panitia**: `http://localhost:3000/login`
- **Portal Publik Krama**: `http://localhost:3000/public`
- **Layar TV Kiosk**: `http://localhost:3000/kiosk`

---

## Lisensi
Hak Cipta © 2026 Pura Dalem Desa Adat Metra. Seluruh hak cipta dilindungi undang-undang.
