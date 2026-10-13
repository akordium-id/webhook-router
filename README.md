# Akordium Webhook Router

Cloudflare Worker berbasis [Hono](https://hono.dev/) untuk memusatkan dan merutekan webhook dari Payment Gateway (**Xendit** / **Midtrans**) ke berbagai produk & layanan SaaS di bawah ekosistem Akordium Lab.

## Fitur Utama

- **Single Webhook URL**: Gunakan 1 URL callback di dashboard payment gateway untuk seluruh SaaS Akordium.
- **Prefix-based Routing**: Otomatis mendeteksi produk target berdasarkan prefix `external_id` / `order_id`:
  - `visteo-*` ➔ `https://visteo-app.akordium.id/api/payment/webhook`
  - `crm-*` ➔ `https://crm.akordium.id/api/payment/webhook`
  - Produk lain cukup didaftarkan ke routing table.
- **Multi Gateway**: Mendukung endpoint terpisah untuk `/xendit` dan `/midtrans`.
- **Token Verification**: Memverifikasi `x-callback-token` Xendit di level edge worker sebelum request diteruskan.
- **Test / Simulation Friendly**: Otomatis mengenali tes dummy simulasi (`invoice_123*`) dari dashboard Xendit dan membalas dengan `200 OK`.
- **Zero Cold Start**: Berjalan di atas Cloudflare Workers global V8 isolate.

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
