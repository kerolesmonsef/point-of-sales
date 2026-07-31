# Settings & Payments

Kembali ke indeks dokumentasi: `docs/README.md`

## Tujuan

Mengelola konfigurasi bisnis dan pembayaran yang dipakai aplikasi secara operasional.

## Fitur Saat Ini

- payment gateway settings
- bank account management
- store profile settings
- target penjualan

## Halaman dan Route

- `dashboard/settings/payments`
- `dashboard/settings/bank-accounts`
- `dashboard/settings/store`
- `dashboard/settings/target`

## Permission

- `payment-settings-access`
- `dashboard-access` untuk profil toko dan target

## Alur User

1. admin mengatur gateway pembayaran (default: cash / card)
2. admin menambah rekening bank aktif (untuk pembayaran receivable/payable)
3. admin mengatur profil toko
4. admin mengisi target penjualan

## Integrasi Data

- `payment_settings`
- `bank_accounts`
- `settings`
- transaksi dan receivable/payable payment yang memakai bank account

## Efek Bisnis Penting

- `default_gateway` menentukan metode pembayaran yang terpilih saat membuka halaman kasir
- bank account aktif hanya dipakai pembayaran receivable/payable — checkout POS kini memakai cash/card tanpa alur transfer manual

## Batasan Saat Ini

- hanya dua metode di checkout: `cash` dan `card` (card langsung `paid`)
- `bank_transfer_enabled` masih ada di kolom DB lama, tapi tidak lagi dipakai di UI

## File Sentral

- `app/Http/Controllers/Apps/PaymentSettingController.php`
- `app/Http/Controllers/Apps/BankAccountController.php`
- `app/Http/Controllers/Apps/SettingController.php`
