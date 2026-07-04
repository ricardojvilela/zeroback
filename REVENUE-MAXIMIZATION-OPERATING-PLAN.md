# BatchCutout - revenue maximization operating plan

Updated: 2026-07-04

## Objective

Maximize renewable revenue from BatchCutout with autonomous daily execution across:

- qualified traffic;
- conversion from free test to Pro;
- recovery of high-intent users;
- manual prospecting and follow-up;
- partner/directories distribution;
- accurate MRR and subscription hygiene.

Ask Ricardo only when an action needs account approval, spend changes, legal/business judgment, or access that is not available from the project.

## Current baseline

Live 14-day funnel snapshot on 2026-07-03:

- Visitors: 171.
- Uploads started: 152.
- Processing completed: 121.
- Downloads: 96.
- Pro clicks: 6.
- Pricing CTA clicks: 2.
- Account signup starts: 1.
- Checkout starts: 0.
- Stripe checkout sessions created: 0.
- Paid subscriptions from live funnel: 0.
- Lead captures: 0.
- Main source: Google Ads generated 110 visitors, 138 uploads and 86 downloads, but 0 checkout starts.
- Manual/direct outreach sent: 69 prospects.
- Demo outreach batch sent on 2026-07-02: 13 prospects.
- Current real renewable MRR after internal cleanup: 0 EUR.

Interpretation:

- Google Ads is producing product usage, not just empty visits.
- The main conversion gap is downloads not becoming plan clicks, account creation or checkout starts.
- Warm recovery is currently limited because lead capture is still 0.
- Outreach is active but must be paced to protect domain reputation.

## Revenue priorities

1. Convert existing product usage into checkout starts.
2. Capture more emails after successful free tests.
3. Follow up with prospects on the scheduled dates only.
4. Keep Google Ads spend focused on queries that produce uploads/downloads.
5. Add low-cost directory and partner loops once the conversion path is clean.
6. Keep internal/test subscriptions out of MRR.

## Operating rules

- Do not count internal/manual Pro accounts as MRR.
- Do not send a second cold outreach batch on the same day.
- Send only one follow-up per prospect.
- Stop on any opt-out or negative reply.
- Leads who explicitly ask to save the tool link after download can receive one automatic link email.
- Do not manually email a captured lead if `lead_capture_autoreply_sent` already exists.
- Do not raise ad spend until checkout starts or paid subscriptions appear.
- Prioritize fixes that reduce the gap between download, Pro click, account creation, and checkout.

## Immediate backlog

1. Strengthen the post-download upgrade path so users who received a result see a clearer reason to start checkout.
2. Improve lead capture after successful free test because current lead captures are 0.
   - Done: captured leads now receive an automatic link email when eligible.
3. Review Google Ads search terms and negatives before increasing spend.
4. Prepare 2026-07-06 and 2026-07-07 follow-ups, but send only when due.
5. Prepare directory launch assets for Product Hunt/Uneed after the conversion path is improved.

## Executed conversion fixes

- The app now preserves the selected Pro plan through login so a user who clicks a plan before signing in is sent to the same Stripe Checkout after authentication.
- Pricing hero CTAs now stay on `/pricing/` and jump to the direct checkout panel with the plan selected, instead of sending high-intent users back to the homepage.
- Stripe Checkout session creation is now recorded server-side as `pro_checkout_session_created`, so checkout-start measurement no longer depends only on browser-side tracking.
- SEO, customer-result, use-case and recovery-email links to pricing now preselect the founder plan and jump to the checkout panel, reducing clicks from intent page to payment.
- Single-offer English SEO structured data now reflects the current founder entry price of 15 EUR/month instead of the generic monthly 19 EUR price.
- The post-download moment now shows a compact next-step panel with founder checkout and save-link actions, tracked separately as `post_download_next_shown`, `post_download_founder_clicked` and `post_download_save_link_clicked`.
- The pricing page now includes a value case for the founder plan, showing break-even logic and estimated cost per image before the checkout panel.
- The pricing page now answers purchase blockers directly before checkout: account requirement, automatic Pro activation, cancellation, and free test.
- Legacy `/shopify` and `/etsy` landing URLs now redirect permanently to the stronger current SEO pages, consolidating search signals and avoiding duplicate intent pages.
- Pro CTAs across SEO landing pages now send high-intent users directly to `/pricing/` with the selected checkout plan instead of jumping to the homepage account panel.
- The admin funnel now separates tool Pro clicks from pricing-page CTA clicks, making the gap between pricing interest and checkout starts easier to diagnose.
- The post-download panel now shows an inline email field immediately after a successful download, reducing friction in the lead capture step and reusing the existing automatic follow-up email.
- The result-ready CTA now sends high-intent free users directly toward the founder checkout flow instead of opening another explanatory Pro block.
- Pricing checkout buttons now visibly highlight the selected plan from URL parameters or user clicks, reducing ambiguity before account creation/payment.
- The pricing checkout panel now repeats the selected plan beside the account form and labels the account buttons as continuation actions, making the account step feel connected to payment.
- Checkout session creation failures are now stored as `pro_checkout_session_failed` and surfaced in `/admin`, making Stripe/customer/price configuration problems visible instead of blending into account-to-checkout drop-off.
- The pricing checkout account form now treats account creation as the primary action, so new buyers can create an account and continue to Stripe with Enter or the main button while existing users still have a secondary sign-in path.
- The pricing checkout email field now reuses a locally captured lead email when available, reducing repeat typing between the free-test download moment and account creation.
- The main tool account panel now also treats account creation as the primary action and reuses captured email locally, aligning the post-download Pro path with the pricing checkout path.
- Account signup/login failures are now tracked and surfaced in the admin funnel, making authentication friction visible before the checkout-start step.
- The partner page now gives partners a ready-to-copy tracked referral link and client message, reducing the need to request a manual link before sharing BatchCutout.
- Lead autoreplies, recovery templates, outreach docs and directory profile links now point to the founder plan selected in the pricing checkout, reducing clicks from warm intent to payment.
- Partner referral link/message copy actions are now stored in the internal funnel, so partner-page intent is measurable beyond Google events.
- Legacy `/shopify/` and `/etsy/` trailing-slash URLs now redirect to the current SEO pages, avoiding duplicate outdated landing pages.
- The `/customer-results/` outreach proof page now uses static before/after proof and ecommerce steps instead of leading with the weaker demo video.
- The `/customer-results/` proof page now records internal page-view and CTA-click events, making proof-page outreach measurable in the admin funnel.
- The pricing page now captures high-volume prospects above 2,000 images/month and exposes those contacts in the admin funnel.
- Pro users who hit the monthly image limit or batch limit now see a direct high-volume contact action, while the admin funnel records limit events and contact clicks.
- The homepage account panel now visibly shows "Plano escolhido" when a user selected the founder plan before login, with account buttons framed as payment continuation.
- The pricing checkout panel now uses the same "Plano escolhido" framing on desktop and mobile, making the account step feel part of the Stripe flow instead of a separate form.
- The automatic checkout-link email now reinforces the selected plan benefits and clarifies that the CTA resumes the same secure Stripe session if the user abandons or loses the tab.
- The partners page now records page views and CTA clicks, and `/admin` surfaces partner page views, partner CTA clicks and referral-copy actions separately.
- Internal validation probes are excluded from admin stats so verification events do not inflate commercial metrics.
- SEO landing clicks now store richer destination context, and `/admin` shows a page-level SEO intent table to identify which landing pages deserve more content, ads, or outreach support.
- The inline post-download email capture now qualifies for the automatic link email, so users who click "Enviar link por email" receive the recovery email instead of only being stored as leads.
- Post-download feedback is now stored server-side and `/admin` highlights explicit "larger batches" feedback as a commercial intent signal.
- Commercial SEO landings now have consistent SoftwareApplication and BreadcrumbList structured data, improving crawl clarity across Portuguese and English acquisition pages.
- SEO landings now preserve inbound UTM and ad click identifiers on internal tool/pricing links, reducing attribution loss between acquisition page, free test and checkout.
- Pricing, proof and partner pages also preserve inbound UTM/ad identifiers on internal links, keeping paid/source attribution intact when users move between proof, free test and checkout.
- `/admin` now shows conversion rates for post-download founder clicks, pricing-to-Stripe sessions, Stripe-to-paid subscriptions and lead-to-autoreply, making funnel bottlenecks visible without manual calculations.
- Pricing and checkout now default to the founder plan when no explicit plan is selected, matching the current commercial offer and reducing accidental 19 EUR/month friction.
- Post-download email capture now offers a concrete link plus product-photo checklist, and the automatic email delivers that checklist before pointing to the founder plan.
- Public SEO/proof/use-case pages now include a consistent social preview image, improving link presentation in directories, communities and manual outreach.
- The sitemap now includes `lastmod` dates for all public URLs, helping search crawlers notice the updated commercial pages.
- Manual recovery templates in `/admin` now match the link-plus-checklist lead capture and default recovery checkout links to the founder plan.
- Five new qualified ecommerce/product-photo prospects were added to the outreach CSV as ready proof-page candidates, staged for a small domain-safe batch after support replies are checked.
- Added an English Canva background remover alternative landing page focused on product-photo batches, transparent PNGs and ZIP export, with founder-plan CTAs and UTM tracking.
- English ecommerce and product-photo pages now link internally to the Canva alternative page, giving the new acquisition page crawl support from relevant existing content.
- Added a Portuguese Canva alternative landing page and linked it from relevant Portuguese product-photo pages, expanding the same competitor-intent acquisition route to Portuguese users.
- Prepared the Canva alternative ad group in Google Ads documentation/import files with competitor-safe ad copy, targeted keywords and generic-design negatives.
- Added a Spanish ecommerce landing page for "quitar fondo de fotos de producto en lote", linked with hreflang from the Portuguese and English product-photo pages and added to sitemap/LLM discovery.
- Added Spanish language support to the pricing page so Spanish landing traffic can view the founder offer, checkout account step, ROI calculator and FAQ in Spanish.
- Added a Spanish `/es/` hub for generic Spanish acquisition, linking the free test, product-photo Spanish landing and Spanish pricing checkout flow.
- Prepared paused Google Ads import files for a Spanish product-photo/bulk background removal search campaign, ready for review without changing live spend.
- Added Spanish recovery/onboarding email copy for lead autoreplies, checkout-continuation links, Pro welcome emails and manual lead follow-up templates.
