# BatchCutout - Commercial execution plan

## North star

Maximize renewable revenue from ecommerce users who repeatedly process product photos.

Primary KPI:

- MRR renovavel
- Subscricoes pagas ativas
- Custo por subscricao

Secondary KPIs:

- Visitantes por origem
- Uploads iniciados
- Downloads
- Cliques em planos
- Checkout sem login
- Contas criadas
- Checkouts iniciados
- Subscricoes pagas
- Receita atribuida por origem
- Portal aberto

## Positioning

BatchCutout is not a generic photo editor. It is a bulk background remover for ecommerce product photos.

Core promise:

> Remove backgrounds from product photos in batch. Export transparent PNGs or one organized ZIP.

Best audiences:

- Shopify and WooCommerce stores
- Etsy, eBay and Amazon sellers
- Catalog teams
- Ecommerce assistants
- Small agencies managing product photos for clients

## Offer ladder

Current public offer:

- Free: 2 images per batch
- Founder plan: 15 EUR/month
- Pro monthly: 19 EUR/month
- Pro annual: 190 EUR/year

Do not add more paid plans until at least 20 paying customers exist.

Future upsell:

- Deferred for now. Do not increase prices or add higher tiers until there is enough paid demand and usage data.
- Revisit only after at least 20 paying customers or repeated monthly limit pressure.

## 30-day execution

### Week 1

- Launch Search campaigns only.
- Budget: 10 EUR/day.
- Split budget:
  - 4 EUR/day bulk background remover
  - 3 EUR/day Shopify
  - 3 EUR/day Etsy
- Review search terms every 48 hours.
- Add negatives aggressively for free-only, tutorial, wallpaper and generic editor traffic.

Success signal:

- Visitors upload images.
- Downloads happen.
- At least some users click Pro plans.

### Week 2

- Pause weak keywords.
- Move budget toward the campaign with the most downloads and plan clicks.
- Review account-to-checkout gap in `/admin`.
- If checkout without login is high, make account panel copy more direct.
- If uploads are high and Pro clicks are low, strengthen post-download Pro CTA.

Success signal:

- First paid subscriptions from cold traffic or account creation from paid traffic.

### Week 3

- Start manual outreach to high-fit users:
  - Shopify stores
  - Etsy sellers with many product listings
  - WooCommerce agencies
  - Ecommerce virtual assistants
- Offer founder plan.
- Ask first customers why they bought and what stopped them.

Success signal:

- 5 paying customers or strong account/checkout intent.

### Week 4

- Calculate CAC by channel.
- Keep campaigns with measurable product usage.
- Pause campaigns that only generate visits.
- If annual plan has low uptake, test copy: "2 months free".
- If users hit monthly limits, record the demand and review limits later without changing prices now.

Success signal:

- 10 to 20 paid users or clear evidence of which segment converts.

## Daily dashboard routine

Open `/admin` once per day and record:

- Visitors 14 days
- Uploads 14 days
- Downloads
- Clicks in plans
- Checkout without login
- Signups
- Checkouts
- Paid subscriptions
- Attributed revenue
- Active subscriptions
- Renewable MRR

Decision rules:

- Traffic without uploads: landing page or keyword mismatch.
- Uploads without downloads: product quality or processing issue.
- Downloads without Pro clicks: pricing/CTA issue.
- Pro clicks without accounts: account friction.
- Accounts without checkout: offer or checkout friction.
- Checkout without payment: payment trust, price or Stripe flow issue.

## Executed growth work - 2026-06-30

- Added paid subscription conversion tracking for Google Ads: `Pro Paid Subscription BatchCutout`.
- Added checkout and paid purchase ecommerce events for Google Analytics/Google Ads.
- Added browser-side audit event `pro_purchase_conversion_sent` after Stripe checkout sync.
- Added remarketing audience signals for upload intent, result readiness, Pro interest, checkout intent and paid-customer exclusion.
- Added Free vs Pro contrast on the main tool page and purchase reassurance on `/pricing/`.
- Added 8 English long-tail SEO pages and included them in `sitemap.xml`.
- Kept current prices unchanged: Founder 15 EUR/month, Pro 19 EUR/month, annual 190 EUR/year.
- No recovery or promotional emails were sent automatically.

## Executed growth work - competitor intent and recovery

- Added 3 English competitor-intent pages:
  - `/en/remove-bg-alternative-for-bulk-product-photos/`
  - `/en/photoroom-alternative-for-ecommerce/`
  - `/en/pixelcut-alternative-for-product-photos/`
- Added those pages to `sitemap.xml` and linked them from the English product-photo page.
- Expanded `CUSTOMER-RECOVERY-EMAILS.md` with recovery segments, PT/EN copy, sender setup, and opt-out language.
- Added ready-to-use HTML recovery/onboarding email templates in `/emails/`.
- Added `FIRST-CUSTOMER-PROOF-KIT.md` to collect real before/after proof with consent.
- No recovery or promotional emails were sent automatically.

## Executed growth work - campaign activation pack

- Added focused Search execution plan in `GOOGLE-ADS-SEARCH-EXECUTION.md`.
- Added Google Ads import files under `google-ads-imports/` for the competitor alternative campaign.
- Separated competitor-name negatives from the general negative list so alternative campaigns are not blocked.
- Added Supabase SQL recovery/proof segments in `CUSTOMER-RECOVERY-SEGMENTS.sql`.
- Added proof request HTML email templates in `emails/proof-request.html` and `emails/proof-request-pt.html`.
- Added manual recovery/proof candidate section to `/admin`.
- Activated `Search - BatchCutout - Alternatives` with 2 EUR/day and kept total active Search spend at 10 EUR/day.
- Verified both active Search campaigns use the account-default `Subscrever` conversion goal and `Maximizar as conversoes`.

## Executed growth work - prospecting system

- Added `SALES-PROSPECTION-SYSTEM.md` with lead scoring, outreach rules, statuses, next actions, follow-up copy and proof collection rules.
- Expanded the outreach pipeline from 30 to 80 prospects in `sales-outreach-prospects-2026-06-30.csv`.
- Added scoring, contact source, next action, follow-up date, Resend send ID and notes to the prospect CSV.
- Updated `/admin` prospecting panel with score, filters, qualified count, follow-up count and niche-specific templates.
- Sent a controlled batch of 20 qualified direct emails through `support@batchcutout.com`.
- Kept remaining ready leads staged instead of sending the full list at once, to protect sender reputation.

## First revenue targets

Target 1:

- 20 paying customers
- 300 to 380 EUR MRR

Target 2:

- 100 paying customers
- 1,500 to 2,000 EUR MRR

Acceptable CAC:

- Monthly subscriber: up to 25 to 35 EUR initially.
- Annual subscriber: up to 50 to 70 EUR initially.

## Do not do yet

- Do not build complex team accounts before paid demand exists.
- Do not create many pricing tiers before 20 paying customers.
- Do not spend on broad Meta campaigns before Search data is clear.
- Do not compete on "free background remover" traffic.
- Do not rewrite the whole product before measuring real conversion.
