# Akordium Webhook Router

Cloudflare Worker berbasis [Hono](https://hono.dev/) untuk memusatkan dan merutekan webhook dari Payment Gateway (**Xendit** / **Midtrans**) ke berbagai produk & layanan SaaS di bawah ekosistem Akordium Lab.

## Fitur Utama

- **Single Webhook URL**: Gunakan 1 URL callback di dashboard payment gateway untuk seluruh SaaS Akordium.
- **Dynamic Prefix-based Routing**: Tanpa perlu mengubah kode saat ada SaaS baru! Cukup tambahkan environment variable di Cloudflare Workers:
  - Pola: `${PREFIX.toUpperCase()}_WEBHOOK_URL`
  - Contoh: Prefix `dompiku-*` atau `dompiku_*` akan otomatis dirutekan ke `DOMPIKU_WEBHOOK_URL`.
  - Contoh: Prefix `layangan-*` akan otomatis dirutekan ke `LAYANGAN_WEBHOOK_URL`.
- **ROUTES_CONFIG JSON Fallback**: Mendukung konfigurasi routing table via JSON string `ROUTES_CONFIG` (opsional jika ingin memetakan banyak produk sekaligus dalam 1 env var).
- **Default / Legacy Fallback**: Tetap mendukung rute bawaan (`visteo`, `crm`).
- **Multi Gateway**: Mendukung endpoint terpisah untuk `/xendit` dan `/midtrans`.
- **Token Verification**: Memverifikasi `x-callback-token` Xendit di level edge worker sebelum request diteruskan.
- **Test / Simulation Friendly**: Otomatis mengenali tes dummy simulasi (`invoice_123*`) dari dashboard Xendit dan membalas dengan `200 OK`.
- **Zero Cold Start**: Berjalan di atas Cloudflare Workers global V8 isolate.

## Konfigurasi Routing Dinamis

Ketika Akordium Lab membuat SaaS baru (misal **Dompiku**):
1. Pastikan setiap transaksi membuat `external_id` (Xendit) atau `order_id` (Midtrans) dengan format:
   ```
   dompiku-<id_transaksi>  atau  dompiku_<id_transaksi>
   ```
2. Tambahkan Environment Variable di Cloudflare Worker (via dashboard Cloudflare atau `wrangler.toml` / secrets):
   ```bash
   DOMPIKU_WEBHOOK_URL="https://dompiku.akordium.id/api/webhooks/xendit"
   ```
3. Selesai! Webhook router langsung mengenali dan meneruskan request tanpa redeploy kode.

Alternatifnya, jika ingin menggunakan 1 variabel JSON `ROUTES_CONFIG`:
```json
{
  "dompiku": "https://dompiku.akordium.id/api/webhooks/xendit",
  "visteo": "https://visteo-app.akordium.id/api/payment/webhook",
  "crm": "https://crm.akordium.id/api/payment/webhook"
}
```

## Endpoints

- `GET /health` — Health check endpoint
- `POST /xendit` — Webhook endpoint untuk Xendit Invoices & Payments
- `POST /midtrans` — Webhook endpoint untuk Midtrans Notifications

## Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Atur Environment Variables Lokal**:
   Salin `.dev.vars.example` menjadi `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. **Jalankan Secara Lokal**:
   ```bash
   npm run dev
   ```

4. **Jalankan Unit Tests**:
   ```bash
   npm test
   ```

## Deployment ke Cloudflare Workers

1. **Set Secret di Cloudflare Workers**:
   ```bash
   npx wrangler secret put XENDIT_WEBHOOK_TOKEN
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Atur Webhook URL di Dashboard Xendit**:
   Masukkan URL worker yang sudah dideploy:
   ```
   https://webhook.akordium.id/xendit
   ```

## Lisensi

Apache-2.0 © [Akordium Lab](https://akordium.id)
