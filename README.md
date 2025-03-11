Anime API
Aplikasi web Express.js dengan fitur lengkap untuk melihat dan mengelola data anime beserta fitur visualisasi.
Fitur

Dashboard dengan Statistik: Tampilan visual dari koleksi anime termasuk distribusi genre
Operasi CRUD: Membuat, membaca, memperbarui, dan menghapus entri anime
Fungsi Pencarian: Menemukan anime berdasarkan nama, penulis, atau genre
Sistem Favorit: Menandai anime favorit Anda
Pengurutan & Penyaringan: Mengorganisir anime berdasarkan berbagai kriteria
Visualisasi Data: Grafik yang menampilkan distribusi genre dan peringkat
Endpoint API: Akses data secara terprogram
Import: Import massal koleksi anime

Instalasi

Clone repositori ini
Instal dependensi
npm install

Jalankan server
npx nodemon server.js

Kunjungi http://localhost:3000 di browser Anda

Dependensi

Express.js - Framework web
Body-parser - Middleware parsing body request
Chart.js - Untuk visualisasi data
nodemon.js - server otomatis restart saat ada perubahan code

Rute
Antarmuka Web

/ - Halaman utama dan dashboard
/items - Daftar semua anime dengan opsi pengurutan dan penyaringan
/add - Tambah anime baru
/edit/:id - Edit anime yang ada
/items/:id - Lihat detail anime
/search - Cari anime
/favorites - Lihat anime favorit
/stats - Lihat statistik dan grafik
/export - Ekspor semua data sebagai JSON

Endpoint API

GET /api/items - Dapatkan semua anime dalam format JSON
GET /api/items/:id - Dapatkan anime spesifik berdasarkan ID
POST /api/import - Impor data anime secara massal

Struktur Data
Setiap entri anime berisi:

id - Pengenal unik
name - Judul anime
genre - Kategori (misal: Shonen, Adventure)
author - Nama pencipta
yearStarted - Tahun pertama rilis
yearEnded - Tahun akhir (null jika masih berlangsung)
episodes - Jumlah total episode
rating - Peringkat dari 0 hingga 5

Contoh Penggunaan
Menambahkan Anime Baru
Kunjungi add dan isi formulir dengan semua detail anime yang relevan.
Pencarian
Gunakan halaman pencarian untuk menemukan anime berdasarkan nama, penulis, atau genre.
Favorit
Klik tombol "Favorite" pada anime manapun untuk menambahkannya ke daftar favorit Anda.
Penyaringan dan Pengurutan
Pada halaman daftar anime, gunakan filter dropdown untuk mengatur berdasarkan genre atau mengurutkan berdasarkan nama, peringkat, atau tahun.
