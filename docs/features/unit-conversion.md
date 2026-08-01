# Unit Conversion (Multi-Satuan)

Kembali ke indeks dokumentasi: `docs/README.md`

## Tujuan

Satu product dalam multiple satuan — pcs, box, karton, kg — dengan konversi stok otomatis dan harga berbeda per satuan.

## Definisi

| Istilah | Arti |
|---------|------|
| Base Unit | Satuan dasar untuk stok. Semua stok disimpan dalam base unit |
| Conversion Factor | Faktor konversi ke base unit (1 box = 12 pcs) |

## Fitur Saat Ini

- 8 default unit: PCS, BOX, KARTON, KG, LITER, METER, PAK, DUS
- Produk bisa memiliki multiple satuan dengan konversi berbeda
- Harga beli dan jual berbeda per satuan
- Satuan dasar (base unit) untuk stok
- Barcode spesifik per satuan
- Stok dikelola di base unit, otomatis dikonversi saat checkout

## Status Implementasi

- **Selesai**: skema (`carts`/`transaction_details`.`unit_id`+`conversion_factor`), `UnitConversionService`, dan `TransactionController::addToCart`/`store` sudah resolve unit, convert qty ke base unit, dan cek stok berbasis base qty (`app/Http/Controllers/Apps/TransactionController.php`).
- **Belum ada**: dropdown pilih satuan di layar POS. `resources/js/Pages/Dashboard/Transactions/Index.jsx` selalu kirim `qty: 1` tanpa `unit_id` — kasir belum bisa pilih satuan lain saat checkout, jadi backend selalu jatuh ke base unit.
- **Bug diketahui**: menambah product yang sama dengan `unit_id` berbeda ke cart yang sudah ada baris-nya tidak update `unit_id`/`conversion_factor` (tetap pakai punya baris pertama). `TransactionController::updateCart` juga cek stok pakai raw qty, bukan qty terkonversi.

## Database

- `units` table — master satuan (code, name, symbol)
- `product_units` pivot — (product_id, unit_id, is_base, conversion_factor, buy_price, sell_price, barcode)
- `carts` — unit_id + conversion_factor
- `transaction_details` — unit_id + conversion_factor

## Service

`UnitConversionService` methods:

| Method | Fungsi |
|--------|--------|
| `toBaseUnit(product, unitId, qty)` | Konversi qty dari unit tertentu ke base unit |
| `fromBaseUnit(product, unitId, baseQty)` | Konversi base stock ke qty di unit tertentu |
| `getPrice(product, unitId, type)` | Harga untuk unit tertentu (buy/sell) |
| `getUnitLabel(product, unitId)` | Label satuan untuk display |

## Alur

1. Admin: setup base unit + additional units per product (via DB seeder atau langsung insert)
2. POS: backend siap terima `unit_id` per baris cart (lihat Status Implementasi) — tinggal tunggu dropdown pilih satuan di UI
3. Checkout: qty dikonversi ke base unit untuk cek stok dan decrement
4. Stok mutation selalu dalam base unit

## Catatan

- Produk existing dianggap punya base unit PCS dengan conversion factor 1
- Unit tidak bisa dihapus jika masih dipakai product
- Harga per unit disimpan di pivot, bukan hitungan dari base price * factor
