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
- Leads captados
- Auto-respostas a leads
- Checkout sem login
- Contas criadas
- Checkouts iniciados
- Sessões Stripe criadas
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
- One-time pack: 100 image credits for 5 EUR
- One-time pack: 250 image credits for 9 EUR
- Founder plan: 15 EUR/month
- Pro monthly: 19 EUR/month
- Pro annual: 190 EUR/year

Do not add more subscription tiers until at least 20 paying customers exist.

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
- Lead captures receive an immediate link email and do not require manual follow-up unless the auto-email fails.

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

- Added 4 English competitor-intent pages:
  - `/en/remove-bg-alternative-for-bulk-product-photos/`
  - `/en/photoroom-alternative-for-ecommerce/`
  - `/en/pixelcut-alternative-for-product-photos/`
  - `/en/canva-background-remover-alternative-for-product-photos/`
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
- At activation, verified both active Search campaigns used the account-default `Subscrever` conversion goal and `Maximizar as conversoes`.

## Executed growth work - prospecting system

- Added `SALES-PROSPECTION-SYSTEM.md` with lead scoring, outreach rules, statuses, next actions, follow-up copy and proof collection rules.
- Expanded the outreach pipeline from 30 to 80 prospects in `sales-outreach-prospects-2026-06-30.csv`.
- Added scoring, contact source, next action, follow-up date, Resend send ID and notes to the prospect CSV.
- Updated `/admin` prospecting panel with score, filters, qualified count, follow-up count and niche-specific templates.
- Sent a controlled batch of 20 qualified direct emails through `support@batchcutout.com`.

## Executed growth work - daily prospecting queue

- Expanded the prospect pipeline to 93 prospects.
- Added 13 new ready direct-email prospects with public contact emails verified on 2026-07-01.
- Added `SALES-PROSPECTION-DAILY-QUEUE.md` with the daily sending cap, ready queue, follow-up timing and CSV update rules.
- Updated `/admin` to show contacts sent today separately from total contacted prospects.
- No new emails were sent automatically from this update.

## Executed growth work - July 8 follow-ups

- Checked `support@batchcutout.com` before sending: 2 historical inbound emails, 0 unresolved.
- Sent 13 follow-ups through `support@batchcutout.com` from `OUTREACH-FOLLOWUP-2026-07-08.md`.
- Updated the prospect CSV with `sent_2026-07-08_followup`, `watch_replies`, blank follow-up dates and Resend IDs.
- Do not send more direct outreach on 2026-07-08.

## Prepared growth work - July 10 follow-ups

- Prepared `OUTREACH-FOLLOWUP-2026-07-10.md` for the 5 proof-page prospects originally contacted on 2026-07-06.
- No emails were sent from this preparation.
- Before sending, check `support@batchcutout.com` for replies, negative responses or opt-outs.
- After sending, update the CSV with `sent_2026-07-10_followup`, `watch_replies`, blank follow-up dates and Resend IDs.

## Executed growth work - July 9 prospect batch

- Prepared `OUTREACH-BATCH-2026-07-09.md` with 10 high-score ready prospects across jewellery, candles, skincare and handmade home decor.
- Checked `support@batchcutout.com` before sending: 2 historical inbound emails, 0 unresolved.
- Sent 10 new prospect emails through `support@batchcutout.com`.
- Updated the CSV with `sent_2026-07-09`, follow-up date `2026-07-14` and Resend IDs.
- Do not send more direct outreach on 2026-07-09.

## Executed growth work - July 13 follow-ups

- Checked `support@batchcutout.com` before sending: 2 historical inbound emails, 0 unresolved, and no replies or opt-outs from the selected recipients.
- Sent the 5 follow-ups prepared for July 10 and the 10 highest-score overdue follow-ups from the July 1 batch.
- All 15 emails were accepted through `support@batchcutout.com`.
- Updated the prospect CSV with Resend IDs, `watch_replies`, and no additional follow-up date.
- Reached the daily warm-up cap; do not send another direct outreach batch on 2026-07-13.

## Executed growth work - support reply workflow

- Added quick reply templates to the `/admin` support mailbox for interested prospects, pricing/limits, privacy/payment, fit qualification, opt-out and free response handling.
- Templates point interested replies to the 2-image free test first and then to the founder checkout, keeping support responses aligned with the current commercial funnel.
- No extra outreach was sent from this update.

## Executed growth work - demo video

- Added horizontal and vertical silent demo videos under `assets/video/`.
- Added `DEMO-VIDEO-ASSETS.md` with public URLs, usage notes and short captions.
- Embedded the horizontal demo on `/customer-results/`.
- Added `tools/create-demo-video.mjs` so the asset can be regenerated from the current before/after image.
- Connected the demo page to `/admin` outreach templates and staged the 13 ready prospects with `outreach_variant=demo_video`.
- Sent the 13 ready demo-variant direct emails through `support@batchcutout.com` on 2026-07-02.
- Follow-up for this demo batch is scheduled for 2026-07-08 if there is no reply.

## Executed growth work - self-service free test

- Strengthened the homepage message around testing 2 images free before paying.
- Added a compact "upload, inspect PNG, upgrade for volume" flow in the first screen.
- Added a pricing-page prompt for users who reached plans before testing the product.
- Kept remaining ready leads staged instead of sending the full list at once, to protect sender reputation.

## Executed growth work - lead capture, proof and partners

- Added optional post-download email capture for free/anonymous users without blocking the free test.
- Added lead capture events to Supabase tracking, source breakdown and `/admin` recovery queue.
- Strengthened Google Ads enhanced conversion readiness by setting user email in Google tag only after measurement consent.
- Added `SoftwareApplication` structured data improvements for free and paid offers.
- Added public pages:
  - `/customer-results/`
  - `/partners/`
- Added partner and launch operating docs:
  - `PARTNER-PROGRAM.md`
  - `LAUNCH-DIRECTORIES-PLAN.md`
- Added directory source classification for Product Hunt, Uneed, BetaList, Indie Hackers and SaaSHub.
- Expanded `DIRECTORY-SUBMISSION-KIT.md` with ready-to-submit fields for Product Hunt, Uneed, BetaList and SaaSHub, plus reply snippets for privacy, pricing and target audience questions.

## Executed growth work - revenue hygiene

- Created `REVENUE-MAXIMIZATION-OPERATING-PLAN.md` with the autonomous revenue objective, live baseline and daily decision rules.
- Cancelled renewal for the remaining internal/test Stripe subscription that was still active at 59 EUR/month.
- Improved `/admin` subscription classification so Stripe subscriptions can be matched to Supabase accounts by email when Stripe IDs are out of sync.
- Added `Pagamento sem acesso` detection for cases where a customer has an active payment but no Pro access.
- Confirmed current real renewable MRR after internal cleanup is 0 EUR.

## Executed growth work - founder checkout alignment

- Updated SEO, customer-result, use-case and recovery-email pricing links so they preselect the founder plan and jump directly to the checkout panel.
- Aligned single-offer English SEO structured data with the current founder entry price of 15 EUR/month.
- Kept monthly and annual alternatives available on the pricing page.
- Added `/en/` as an English ecommerce resource hub and linked it from the homepage so English SEO pages are no longer isolated behind the sitemap only.

## Executed growth work - one-time pack offer

- Added one-time paid image packs as a lower-friction bridge from free usage to Pro without changing the 15 EUR/month founder price.
- Public packs:
  - 100 image credits for 5 EUR.
  - 250 image credits for 9 EUR.
- Packs are paid through Stripe Checkout, credited automatically to the logged-in account and do not renew.
- Active pack accounts keep functional tool UI focused on processing, while still being able to buy another pack or move to Pro.
- `/admin` now tracks pack checkout sessions, pack purchases and pack revenue separately from renewable MRR.

## Executed growth work - campaign profitability reporting

- Added campaign-level attribution to `/api/stats` using the UTM campaign, ad content and search term already preserved throughout the customer journey.
- Added an operational `/admin` table with unique visitors, uploads, downloads, paid-intent clicks, Pack clicks, accounts, Stripe sessions, purchases and revenue per campaign/ad combination.
- Added upload, download and paid-intent rates so weak paid traffic can be identified without increasing budget or relying on aggregate Google Ads totals.
- Use this view to identify which campaign reaches Pack or Stripe before making any permanent budget reallocation.

## Executed growth work - Pack conversion and promotion credit

- Created `Pack 100 Purchase BatchCutout` as a primary Google Ads purchase conversion, separate from the renewable Pro subscription conversion.
- Published checkout-return tracking that selects the correct Google Ads conversion after the Stripe payment is verified: Pack for one-time credits and subscription for Pro.
- Verified both active Search campaigns now use the account-default `Compras, Subscrever` goals with `Maximizar as conversoes`.
- Temporarily changed daily budgets on 2026-07-15:
  - `Search - BatchCutout - Pro Launch`: 8 EUR to 14 EUR/day.
  - `Search - BatchCutout - Alternatives`: 2 EUR to 4 EUR/day.
- The Google Ads promotion card showed 58.35 EUR still to spend by 2026-07-19 to unlock 400 EUR in ad credit.
- Daily monitoring is authorized to restore 8 EUR/day and 2 EUR/day immediately after the credit unlocks, or on 2026-07-20 at the latest.
- Do not enable the paused legacy `Campaign #1`.

## First real Pack payment - 2026-07-16

- Stripe confirmed the first real customer payment: Pack 250 for 9 EUR.
- Google Ads recorded the matching 9 EUR Pack purchase conversion.
- The customer completed the email-only checkout without creating a BatchCutout account, so no credits could be attached yet.
- Added direct Stripe Pack payment reporting to `/admin`, separate from event-based attribution and renewable MRR.
- Fixed Pack fulfillment so a paid checkout is recorded as revenue even when the customer account does not exist yet, while credit application remains independently idempotent.
- Reconciled the historical payment: 1 paid Pack, 9 EUR recorded revenue, 0 EUR renewable MRR and 1 paid customer awaiting account activation.
- Sent one transactional activation email from `support@batchcutout.com` on 2026-07-17 with the secure checkout-return link and instructions to create or sign in with the payment email.
- Duplicate protection is active for this Stripe session; do not send another activation message unless the customer replies and support requires it.
- Future paid Pack checkouts without an existing account now trigger the same activation email automatically from the Stripe webhook; failed sends cause a webhook retry, while successful sends remain idempotent.
- Added an anonymized account-failure diagnostic to `/admin` on 2026-07-17 after the first buyer remained without an account.
- The diagnostic confirmed that all 8 signup failures came from one visitor and were caused by a checkout-state initialization error in the account form; the same session then produced 5 invalid-login attempts.
- Fixed and deployed the account-creation error in commit `2fb1ff0`. The original activation link remains valid, but the buyer still needs to retry account creation before the 250 credits can be attached.
- Sent one transactional recovery email from `support@batchcutout.com` on 2026-07-17 after the fix, using the same secure activation link and no commercial offer. The recovery send has its own duplicate protection; do not send another message unless the customer replies.
- Deployed passwordless Pack activation on 2026-07-17. Future activation emails now contain a one-time Supabase access link sent by BatchCutout; opening it starts the session and attaches the paid credits through the existing idempotent Stripe synchronization.
- Existing activation-page links now offer a fresh access link by email, so the first buyer can complete activation without creating a password. Password login remains available only as an alternative for customers who already have one.
- Added `/admin` counters for access links requested, sent, failed and successfully authenticated.
- Verified the production return flow and the authenticated admin panel in Chrome without sending a test email. The normal account form remains unchanged outside a paid Pack return.
- Do not count this one-time Pack payment as a subscription or MRR.

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
