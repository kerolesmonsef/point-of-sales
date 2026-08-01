# POS & Transactions

Kembali ke indeks dokumentasi: `docs/README.md`

## Daftar Isi

- Tujuan
- Fitur Saat Ini
- Halaman dan Route
- Permission
- Alur User
- Integrasi Data
- Batasan Saat Ini
- File Sentral

## Tujuan

Menyediakan alur kasir cepat untuk pencarian product, pengelolaan cart, checkout, hold/resume, dan distribusi dokumen transaksi.

## Fitur Saat Ini

- cari product via pencarian teks (title/barcode) dengan hasil dipaginasi di sisi server (default 50/halaman, overridable via `?limit=`), filter `?search=` (title/barcode, `whereLike`) dan `?category=` di query SQL
- filter `?show_zero_stock=1` untuk menyertakan product stok 0 (default: hanya product dengan stok > 0); toggle tersedia lewat ikon filter di toolbar product POS
- scan barcode: ketik barcode di kolom pencarian lalu Enter, sistem mencari ke database (`POST transactions.searchProduct`, stok per-gudang shift) dan langsung menambah ke cart
- cart multi-item
- update qty cart
- hold transaction
- resume held cart
- clear held cart
- checkout  (cash),  (card),  pay later
- print invoice / receipt / shipping label
- share invoice publik
- add customer langsung dari POS

## Halaman dan Route

- `dashboard/transactions`
- `dashboard/transactions/history`
- `transactions.searchProduct`
- `transactions.addToCart`
- `transactions.updateCart`
- `transactions.destroyCart`
- `transactions.hold`
- `transactions.resume`
- `transactions.clearHold`
- `transactions.held`
- `transactions.store`
- `transactions.print`
- `transactions.public`

## Permission

- `transactions-access`

Operasi transaksional tertentu juga mewajibkan middleware `active_shift`.

## Alur User

1. kasir membuka halaman transaksi
2. jika shift aktif, kasir dapat cari product dan membangun cart
3. cart dapat di-hold lalu di-resume
4. checkout membuat transaksi, detail, profit, dan pengurangan stok
5. jika `pay_later`, sistem membuat receivable
6. user diarahkan ke dokumen print / invoice

## Integrasi Data

- `transactions`
- `transaction_details`
- `profits`
- `receivables`
- `payment_settings`

## Batasan Saat Ini

- operasi cart dan checkout bergantung pada shift aktif
- pembayaran non-tunai (card) langsung tercatat `paid` — tidak ada alur pending/konfirmasi manual
- checkout masih menjadi pusat perubahan stok penjualan
- pemilihan satuan (unit) belum ada di UI cart — backend sudah siap, lihat `docs/features/unit-conversion.md`

## File Sentral

- `routes/web.php`
- `app/Http/Controllers/Apps/TransactionController.php`
- `resources/js/Pages/Dashboard/Transactions`
