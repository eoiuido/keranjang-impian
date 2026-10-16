# spec.md: Keranjang Impian (EOI app #2)

Status: **APPROVED by the owner on 2026-10-13.**
Brief: `Downloads\EOI\Markdown app\Spirit Belongings.md` (working name "Spirit Belongings").
Number format everywhere: Indonesian (Rp79.000, 35,5%).

---

## 0. Decisions from the interview (2026-10-12/13)

| Topic | Decision |
|---|---|
| Name | **Keranjang Impian** |
| Look | Cute pastel, our own icons, no real brand logos or designs |
| Free | 3 fake checkouts (including the sample item), balance and hutang included |
| Paid | Unlimited checkouts, savings goal, total saved, monthly recap, online backup, push reminders |
| Prices | **Weekly Rp10.000** (7 days, no auto-renew), **Yearly Rp79.000** |
| Decline offer | Shown once: weekly stays Rp10.000, **yearly becomes Rp59.000** |
| Account | No login while free (data on the phone). Email at payment, then data is backed up online |
| Photos | On the phone only, compressed. Never uploaded |
| Onboarding | 2 sliders: monthly money and monthly expenses. Rp0 to Rp20.000.000, steps of Rp100.000, with − / + buttons |
| Checkout | Item, then one address box (typed by the user, phone only), then a payment choice with generic names, then fake QRIS (PALSU), then "Scan & Bayar" with a scanning animation, then "Rp0 · Berhasil" |
| Not enough balance | Gentle warning, then they can still finish, or use **hutang** |
| Hutang | Full feature in v1: 5% per month, taken from next month's balance; any leftover carries over and gets 5% again |
| Rollover | Unused balance carries into later months |
| Reminders | **Web push for paid users only**, asked after payment: the day before 9.9 / 10.10 / 11.11 / 12.12, and payday |

---

## 1. Premise

- **Who:** young Indonesians (students and young workers) who impulse-buy on Shopee and TikTok Shop, especially on twin-date sales and payday.
- **Problem:** they buy pretty, expensive things (a tumbler is the classic example) on impulse and regret it.
- **Promise:** "Checkout palsu. Dompet aman." Do the full checkout ritual, get the item in your digital collection, keep your real money, and watch it grow toward something useful (a laptop, a phone).

---

## 2. User flow, screen by screen

**S1. Landing** (opened from a Meta ad, inside Instagram's browser)
- Headline: **"Checkout palsu. Dompet aman."**
- One line: "Beli barang impianmu tanpa keluar uang beneran."
- A pastel tumbler illustration and one button: **"Coba checkout palsu"**.
- Small link at the bottom: "Sudah bayar? Masuk" (restore), plus Privacy, Terms and Contact.
- Must load fast (Lighthouse mobile 90+). Nothing heavy loads before this screen.

**S2. Onboarding 1: monthly money**
- "Uang bulanan kamu berapa?" (allowance or salary)
- Slider Rp0 to Rp20.000.000, starting at Rp1.500.000, with − / + buttons (Rp100.000 per tap). The amount shows big.
- Explanation line: *"Biar terasa nyata: kamu belanja pakai uangmu sendiri, bukan uang tak terbatas."*

**S3. Onboarding 2: monthly expenses**
- "Pengeluaran rutin sebulan kira-kira?" (food, transport, kos and so on, as one rough number)
- Same slider. It can't go above the monthly money (shows "Pengeluaran gak bisa lebih dari uang bulanan").
- Shows the result: **"Saldo impian bulan ini: Rp…"** (money minus expenses).

**S4. Your dream item**
- A sample item is already filled in: "Tumbler Pastel 1,2L, Rp850.000" with our own illustration.
- Button "Ganti dengan barangmu": take a photo or pick a screenshot, then type a name (optional) and the price.
- Button **"Checkout"**.

**S5. Fake checkout: cart and address**
- Looks like a familiar checkout, in our pastel style: item, price, one big **Alamat** box (province down to house number, typed by the user, saved on the phone only).
- Balance check:
  - Enough: "Saldo kamu: Rp1.400.000 → Rp550.000"
  - Not enough: *"Saldo kamu kurang Rp300.000. Kalau beli beneran, kamu bakal minus."* Two buttons: **"Tetap checkout"** (the balance goes to Rp0, nothing else happens) or **"Pakai Hutang"** (see S5b).

**S5b. Hutang (fake paylater)**
- Shows the true cost: *"Hutang Rp300.000. Bulan depan dipotong Rp315.000 dari saldomu (bunga 5%/bulan). Kalau belum lunas, sisanya kena 5% lagi."*
- Clear label: "Simulasi. Bukan pinjaman beneran."
- Confirm, then continue to payment.

**S6. Fake checkout: payment choice**
- Generic options with our own icons: QRIS, E-wallet, Transfer bank, Kartu kredit, COD. No real company names or logos.
- Every option leads to the same fake payment screen (QRIS style).

**S7. Fake QRIS**
- A pastel QR with a big **"PALSU"** stamp, the amount and "Kamu bayar: Rp0".
- Button **"Scan & Bayar"**: a fake camera frame with a moving scan line (the real camera is never used, no permission asked), then a loading spinner.

**S8. Success (the "aha")**
- Confetti. **"Kamu baru saja menyelamatkan Rp850.000"**
- "Barang masuk ke koleksimu." Shows the new balance, and the hutang if used.
- Buttons: "Lihat koleksi" and "Checkout barang lain".

**S9. Home / collection**
- Top: balance this month, **Sisa hutang** (only if above Rp0), total saved.
- Grid of collected items (photo, name, price, date).
- Free users see "Checkout gratis: 2 dari 3 tersisa".
- Paid users also see their goal progress: "Laptop impian: 35% (Rp2.800.000 dari Rp8.000.000)".

**S10. Paywall** (appears on the **4th** checkout attempt, never earlier)
- Title: "Lanjut checkout palsu tanpa batas"
- What you get: unlimited checkouts, savings goal, total saved, monthly recap, online backup (works on a new phone), sale-day reminders.
- Two plans, each with its price and period in plain words:
  - **Mingguan Rp10.000 / 7 hari.** Doesn't renew automatically; pay again when you want to continue.
  - **Tahunan Rp79.000 / 1 tahun.** Badge: "Paling hemat: cuma Rp1.519/minggu".
- Footer: "Bantuan: eoi.uido@gmail.com" and the refund policy link.
- Button "Nanti saja" closes it, then S10b.

**S10b. Decline offer** (once per device, ever)
- "Tunggu! Tahunan cuma **Rp59.000** (hemat Rp20.000). Penawaran ini cuma muncul sekali."
- Weekly stays Rp10.000. Closing it again returns to home; the collection stays visible, but new checkouts lead back to S10 (without the offer).

**S11. Email** (before real payment)
- "Email kamu (buat simpan akses & backup)." Shows the email again for confirmation: "Pastikan benar: nama@email.com".

**S12. Real payment (DOKU Checkout page)**: must look clearly different from the fake one
- Before leaving our app: a **"Pembayaran ASLI"** screen in a different colour (no pastel PALSU stamp) with the real amount (Rp10.000 / Rp79.000 / Rp59.000), and "Kamu akan dibawa ke halaman pembayaran DOKU."
- **DOKU's own payment page** shows QRIS and e-wallets (OVO, DANA, ShopeePay, LinkAja). E-wallet buttons open the e-wallet app on the same phone; QRIS can be scanned or saved.
- After paying, DOKU sends the user back to our app: "Menunggu konfirmasi…", checked every few seconds, then S13.

**S13. Paid**
- "Terima kasih! Akses aktif sampai [tanggal]."
- Their data on this phone is backed up online (numbers only, no photos or address).
- Set a savings goal: pick a type (Laptop / HP / Lainnya), a name and a target price.
- Then: "Mau diingetin sebelum 11.11 & gajian?" If they're in Instagram's browser, explain "Buka di Chrome / Tambahkan ke layar utama", then log in there with an email code and ask permission for notifications.

**S14. Restore / log in** (new phone, new browser, or Chrome after Instagram)
- Type the email, get a **6-digit code** by email, type it. Data comes back, with photos replaced by a placeholder picture.

**S15. Monthly recap** (paid)
- On or after the 1st: "Bulan Oktober kamu menyelamatkan Rp2.350.000 dari 4 barang." A pastel card image they can save or share. It shows no income or address.

**S16. Settings**
- Change monthly money or expenses, the goal and reminders.
- **Hapus semua data** (delete all data on the phone, plus the account and backup if paid). Privacy, Terms, Refund, Contact.

---

## 3. Money rules (balance, hutang, rollover)

- Each calendar month (starting on the 1st), the app adds **(monthly money − monthly expenses)** to the balance. Unused balance carries over.
- A fake checkout takes the price from the balance. Total saved goes up by the **full price** (their real money was never spent).
- If the price is more than the balance:
  - "Tetap checkout": the balance goes to Rp0 and no debt is created.
  - "Pakai Hutang": the balance goes to Rp0 and the shortfall becomes debt.
- At each month change, in this order:
  1. debt = debt × 1,05 (rounded up to the nearest Rp100)
  2. balance = balance + (money − expenses)
  3. payment = the smaller of the balance and the debt; balance −= payment; debt −= payment
- If the app wasn't opened for several months, these steps run once per missed month, in order.
- The balance never shows below Rp0. Debt shows separately as "Sisa hutang".
- Example: Rp300.000 hutang in October becomes Rp315.000 on 1 November. If November's new balance is Rp200.000, Rp200.000 is paid and Rp115.000 is left. On 1 December that becomes Rp120.800 (Rp120.750 rounded up), and so on.

---

## 4. Data model (what is saved, where)

**On the phone (browser storage: IndexedDB). Free and paid users:**
- `profile`: monthly money, monthly expenses, start month
- `wallet`: balance, debt, last month processed
- `items`: id, name, price, photo (compressed, about 100 KB max), payment method chosen, hutang used, date
- `address`: the last address typed (**phone only, never sent anywhere**)
- `counters`: fake checkouts used, decline offer seen (yes/no)
- `goal`: type, name, target price (paid)
- `session`: login token and email (paid), pending order id
- `anon_id`: a random id for analytics (not linked to a name)

**On our server (Cloudflare D1). Paid users only:**
- `users`: id, email, created date
- `orders`: id, email, plan (weekly / yearly), price, decline offer (yes/no), status (pending / paid / expired / failed), DOKU reference, created, paid at
- `access`: user, plan, ends at. Paying again adds time on top: the new end = the later of now or the current end, plus 7 days or 1 year.
- `backups`: user, profile + wallet + items (**without photos or address**) + goal, updated at
- `login_codes`: email, code (stored scrambled), expires in 10 minutes
- `push_subscriptions`: user, browser push address, which reminders

**Not stored anywhere:** photos on the server, the address on the server, real names, phone numbers, bank details.

---

## 5. Payment flow with DOKU Checkout (QRIS + e-wallets)

_Changed 2026-10-16 (owner decision): DOKU Checkout (DOKU's hosted page) instead of a direct QRIS API. Direct QRIS needs a separate QRIS registration (merchant/terminal ID) and more complex signing; Checkout also lets e-wallets open on the same phone._

Development uses **DOKU sandbox** (test mode). The owner must finish DOKU merchant registration before going live.

1. The user picks a plan (S10/S10b) and enters their email (S11).
2. The app asks **our server** (a Cloudflare Worker) to create an order. The server sets the price itself, so the browser can't change it. The decline price is allowed only if the device hasn't used the offer before (also checked on the server, per email).
3. The server asks DOKU Checkout for a payment page (QRIS + e-wallets, valid 30 minutes) and gets back its link. The order is saved as `pending`. If an unpaid, unexpired order for the same email, plan and price already exists, its link is reused instead (prevents double payment).
4. The app opens DOKU's page (S12). After paying, DOKU sends the user back to our app, which asks our server about the order every 3 seconds.
5. The user pays with QRIS or an e-wallet. **DOKU sends a notification (webhook) to our server.** The server checks DOKU's signature, marks the order `paid` and gives access. **Paid features unlock only from this server step, never because the browser says so.**
6. The app sees `paid` and shows S13. The server sends the Meta "Purchase" event (Conversions API).

**What if…**
- **The webhook is late:** the screen shows "Menunggu konfirmasi…". After 1 minute without news, our server asks DOKU directly about the status (still server-side). The order stays checkable for 24 hours. A note says "Sudah bayar tapi belum aktif? Hubungi eoi.uido@gmail.com dengan bukti bayar."
- **The payment page expires before payment (30 minutes):** "Waktu bayar habis" with a "Coba lagi" button. The order is marked `expired`.
- **Payment fails or is cancelled:** "Pembayaran gagal, tidak ada uang yang terpotong" with a "Coba lagi" button.
- **They paid, then closed the page:** the pending order id is saved on the phone. On next open, the app checks it and unlocks if paid. On another device, they restore with their email code.
- **They paid twice:** the second payment adds more time (it's never lost). The refund policy covers accidental double payments.
- **The webhook arrives twice:** handled only once (an order can only change to `paid` once).
- **Paid amount differs from the price:** the order is flagged for a manual check (refund policy).
- **Server safety net:** every 5 minutes the server asks DOKU about pending orders, in case a notification was lost.
- **DOKU's page and e-wallet hand-off inside Instagram's browser must be tested on a real phone before ads start.**

---

## 6. Tracking events

**Meta Pixel (browser) + Conversions API (server)**, each with the same event id so Meta doesn't count them twice:

| Event | When |
|---|---|
| PageView | Landing opens |
| CompleteRegistration | Onboarding done (after S3) |
| ViewContent (custom name "PaywallView") | Paywall shown |
| InitiateCheckout | Real order created (S12) |
| Purchase (value in IDR, plan) | Server confirms payment (sent from the server) |

**Product analytics (OpenPanel, light):**
`landing_view`, `start_tapped`, `onboarding_complete`, `item_photo_added`, `first_fake_checkout_done` (the aha), `fake_checkout_done` (with a count), `hutang_used`, `paywall_view`, `paywall_declined`, `decline_offer_viewed`, `purchase_started` (plan, price), `purchase` (plan, price), `restore_login`, `push_enabled`.
No income, address, photos or email are sent to analytics.

**Daily view for the owner:** one simple private page showing each day's counts in funnel order (landing, then start, then onboarding, then first checkout, then paywall, then decline, then offer, then purchase), and the percentage moving from each step to the next, so the weakest step stands out.

---

## 7. Rules and edge cases

- **Empty collection on day one:** the sample tumbler is already filled in, so the first checkout takes one tap.
- **The sample checkout counts** as free checkout 1 of 3.
- **Photo upload fails / too large:** compress on the phone; if it still fails, use a pastel placeholder and let them continue. A photo is never required.
- **No price typed:** the checkout button stays disabled ("Isi harga dulu"). Price limit: Rp1.000 to Rp100.000.000.
- **No signal:** fake checkouts work fully offline (everything is on the phone). Real payment, restore and backup show "Butuh internet" and retry.
- **The user closes the paywall:** decline offer once, then home. The collection stays visible; only new checkouts are locked.
- **Weekly access ends:** a gentle banner, "Akses mingguan habis. Lanjut lagi?" with yearly highlighted. Data is never deleted. They go back to the free limit (all free checkouts already used).
- **Clearing browser data while free:** the collection and the free counter are lost (a known, acceptable limit; the paid backup solves it).
- **Moving from Instagram's browser to Chrome:** free data doesn't move. Paid users log in with an email code, and their data comes back, without photos.
- **Expenses higher than money:** the slider blocks it.
- **Changing money or expenses later:** applies from the next month; this month's balance doesn't change.
- **Hutang larger than a year of income:** allowed (it's a simulation), but with an extra warning: "Ini butuh lebih dari 12 bulan buat lunas."
- **Push permission refused:** no nagging; they can turn it on later in Settings.
- **Push schedule (paid):** 19:00 WIB on the day before 9.9, 10.10, 11.11 and 12.12, and on payday (default the 25th; the user can change it in Settings). Sent by a scheduled job on the Cloudflare Worker.
- **Delete data:** removes everything on the phone, and (if paid) the account, backup and push subscription on the server. Order records are kept anonymously for accounting. UU PDP.
- **Inside Instagram's browser:** the whole flow, including real payment, must work there. It will be tested on a cheap Android phone with a slow connection.

---

## 8. Legal and trust

- Privacy Policy and Terms in Indonesian and English. They say honestly what's stored: income and expense numbers and item photos (on the phone), address (on the phone only), email (if paid). Users can delete their data.
- Refund and contact policy: a contact email, refunds for double payments or if access doesn't turn on.
- Disclaimer on checkout and hutang screens: "Simulasi. Tidak terhubung dengan toko, bank, atau penyedia pembayaran mana pun. Bukan pinjaman beneran." No real brand logos or designs anywhere.

---

## 9. Technical

- **Expo (React Native) for web**, so a phone app can be built later from the same code.
- **Cloudflare:** one Worker serves both the web app (static files) and the server API (orders, DOKU webhook, login codes, backup, push, Meta Conversions API), with D1 for the database. Same address for both, so no cross-site setup. No R2 (photos aren't stored online).
- **Email** (login codes): a light email service (e.g. Resend's free tier).
- **Push:** standard Web Push (works on Android Chrome; iPhone only after "Add to Home Screen").
- Code saved to the owner's GitHub.

---

## 10. Before launching ads (owner's checklist)

Breakeven ad cost per buyer = price × 0,993 / 1,11 (0,993 assumes the QRIS fee of 0,7%; e-wallet payments have a higher fee, so check DOKU's price list):

| Plan | Price | Breakeven per buyer |
|---|---|---|
| Weekly | Rp10.000 | ≈ Rp8.900 |
| Yearly | Rp79.000 | ≈ Rp70.600 |
| Yearly (decline offer) | Rp59.000 | ≈ Rp52.700 |

- [ ] **Target CAC:** depends on how many buyers pick weekly vs yearly. Write down a number a bit below the breakeven of your expected mix (start cautious, e.g. Rp30.000), and adjust after the first 10 buyers.
- [ ] **Kill rule:** for each ad, 0 sales after 2 × target CAC means kill. Early sales mean more budget. Clicks but no sales mean stop adding money.
- [ ] **Total test budget:** only money you can afford to lose.

---

## 11. Please confirm (small details I chose for you)

1. **Login by 6-digit email code** instead of a magic link, because a link opens outside Instagram's browser and leaves the user in the wrong place.
2. **Payday default = the 25th**, changeable in Settings.
3. **Month starts on the 1st** of the calendar month.
4. **The sample tumbler counts** as free checkout 1 of 3.
5. **Contact email:** `eoi.uido@gmail.com` (confirmed by the owner). Used on the paywall, the payment screens, the refund policy and the privacy policy.
