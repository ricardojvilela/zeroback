# BatchCutout - revenue maximization operating plan

Updated: 2026-07-09

## Objective

Maximize renewable revenue from BatchCutout with autonomous daily execution across:

- qualified traffic;
- conversion from free test to Pro;
- recovery of high-intent users;
- manual prospecting and follow-up;
- partner/directories distribution;
- accurate MRR and subscription hygiene.
- one-time pack revenue as a low-friction bridge to Pro.

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
- One-time packs were added on 2026-07-09 to test whether free users will pay a
  smaller first amount before committing to a subscription.

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
7. Treat pack purchases as first revenue, then convert repeat pack buyers to Pro.

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
- Removed outdated "request Pro access" wording from localized batch-limit messages so all supported languages now point users toward choosing Pro directly.
- Added English and Spanish legal/support pages and made pricing legal links switch by selected language, reducing checkout trust friction for non-Portuguese buyers.
- Added subscription attribution in `/admin`: each Stripe subscription now shows source/campaign/medium and the subscriptions panel summarizes renewing MRR by origin.
- Stripe Checkout success/cancel return URLs now preserve EN/ES language, so buyers return to the same localized experience after paying or abandoning checkout.
- Manual recovery templates for account-created and checkout-not-paid prospects now support PT/ES variants and checkout recoveries choose the template from the stored checkout language.
- The main tool now localizes its Pro pricing and policy/legal links for EN/ES, avoiding Portuguese legal pages or pricing after users switch language in the app.
- Added Spanish acquisition pages for Shopify, WooCommerce, Etsy, eBay and Amazon product-photo workflows, linked from the Spanish hub, sitemap, llms discovery and PT/EN hreflang clusters.
- Prepared paused Spanish Google Ads import files for the new Shopify, WooCommerce, Etsy, eBay and Amazon landing pages without changing live spend.
- Added Spanish alternative-intent SEO pages for remove.bg, Photoroom, Pixelcut and Canva, linked from the Spanish hub and product-photo page with hreflang/discovery support.
- Prepared a paused Spanish Google Ads alternatives campaign for remove.bg, Photoroom, Pixelcut and Canva queries, with competitor names kept out of ad copy and no live spend changes.
- Added Portuguese alternative-intent SEO pages for remove.bg, Photoroom and Pixelcut, linked from Portuguese product-photo pages with PT/EN/ES hreflang and discovery support.
- Prepared a paused Portuguese Google Ads alternatives campaign for remove.bg, Photoroom, Pixelcut and Canva queries, with competitor names kept out of ad copy and no live spend changes.
- Added visible FAQ blocks and FAQPage structured data to Portuguese alternative pages to reduce pre-upgrade objections and improve search result eligibility.
- Added a dedicated `/launch/` directory landing page with source-specific CTAs and tracking for Product Hunt, Uneed, BetaList, SaaSHub and Indie Hackers traffic.
- Added an English `/en/customer-results/` proof page so international directory visitors can inspect examples without switching to Portuguese.
- Added directory launch events to `/api/track` and `/admin`, including Product Hunt and Indie Hackers source classification for launch page views and CTAs.
- Added an English ecommerce agency/assistant landing page for recurring client product-photo workflows, linked from the English hub, product-photo page, sitemap and LLM discovery.
- Prepared a paused English Google Ads campaign for ecommerce assistants, product listing services and bulk product photo editing searches, pointing to the new agency workflow landing page without changing live spend.
- Live data on 2026-07-06 showed strong product usage from Google Ads, with 83 visitors, 78 uploads and 48 downloads in 14 days, but no pricing clicks or checkout sessions from that source.
- The result-ready moment in the main tool now shows a stronger founder-plan upgrade block as soon as a free user has processed images, including a direct checkout CTA for one-image and multi-image results, while remaining hidden for active Pro subscribers.
- The same result-ready block now also offers a secondary "link and checklist" action for free users without a known email, reusing the existing lead-capture and automatic follow-up flow instead of waiting until after a download.
- Lead capture events now preserve an explicit `capture_source`, and `/admin` separates leads captured from the result-ready block so the new recovery option can be evaluated without confusing traffic attribution.
- The account panel shown after a Pro click now displays a compact three-step checkout guide, clarifying that account creation/sign-in leads directly to Stripe and automatic Pro activation.
- The internal admin panel now adds an automatic funnel diagnosis so the daily routine identifies whether the current bottleneck is result-to-Pro, pricing-to-Stripe, checkout-to-paid, or upload-to-download.
- Live data on 2026-07-07 showed 154 visitors, 85 uploads, 53 downloads, 11 combined Pro/pricing clicks, 3 checkout-login-required events, 1 signup and 0 Stripe checkout sessions in the previous 14 days. `/bulk-background-remover/` was the highest-volume landing with 21 visitors and 0 pricing clicks.
- The PT and EN bulk-background-remover landings now make the paid batch path the primary hero CTA for visitors who already have a real product batch, while keeping the 2-image free test as the secondary validation path. This is meant to increase pricing clicks from the highest-volume landing without increasing ad spend.
- Checkout sessions started from the main tool now send the active site language to Stripe/session recovery, and email-confirmation redirects preserve the selected app language, avoiding Portuguese buyers being returned to English by default.
- The funnel now tracks accounts that require email confirmation separately from completed account access, and `/admin` shows this step in totals, source rows and the automatic diagnosis so account-to-Stripe drop-off is easier to diagnose.
- `/admin` now also surfaces unconfirmed Supabase Auth accounts as manual recovery opportunities with PT/EN/ES follow-up templates, so confirmation-blocked buyers can be handled without automatic extra email volume.
- Added an English product catalog background remover acquisition page for supplier photos, SKU updates and variant batches, linked from the English hub, product-photo page, agency workflow, sitemap and LLM discovery.
- Prepared paused Google Ads import files for the new product catalog page, targeting catalog cleanup, supplier image cleanup and SKU/variant photo batches without changing live spend.
- Added a checkout-account reassurance note in the main tool explaining that the account only connects Stripe payment to Pro access and images stay in the browser, reducing friction after a Pro click.
- Localized Portuguese social-preview alt metadata that still used English copy across PT acquisition pages, improving consistency for shared links and localized page quality.
- Added the same account/Stripe reassurance note to the pricing checkout panel in PT/EN/ES, reducing account-step friction for visitors arriving from landing pages or ads.
- Made the 6-character password requirement explicit in the main tool and pricing checkout placeholders in PT/EN/ES to reduce avoidable account-creation validation failures before Stripe.
- Aligned pricing-page email confirmation redirects with the selected language, removing stale `lang` parameters when buyers switch back to Portuguese before account confirmation.
- Added tracking and admin reporting for local account-form validation failures before Supabase, including source/day breakdown and automatic diagnosis, so email/password friction is visible before Stripe.
- Cleaned source attribution classification so internal pricing-page labels do not appear as external traffic origins in the admin funnel.
- Added show/hide password controls to the main tool and pricing checkout account forms in PT/EN/ES, reducing password entry friction before Stripe.
- Buyers who try to sign in before confirming email now get a fresh confirmation link with the selected plan/language preserved, and `/admin` tracks confirmation resends as a separate pre-Stripe bottleneck.
- If a buyer clicks "create account" with an email that already exists, the app now tries to sign in with the entered password and continue to Stripe automatically, instead of leaving them at a generic signup error.
- The main tool account, billing, post-download and volume-limit messages now have explicit Spanish translations, avoiding English fallback text in the Spanish Pro conversion path.
- Google Ads/pricing campaign assets, partner referral links and structured offer URLs now point directly to the selected plan checkout panel; Pro welcome emails now send paying users to the account panel for billing management instead of generic pricing.
- Pricing-page CTA links now preserve the selected PT/EN/ES language when visitors move between free test and direct checkout, avoiding silent language resets in the purchase path.
- The main tool now uses a dedicated Pro prompt when free visitors select more images than the free batch allows, framing the moment as real batch demand instead of post-result copy.
- Homepage-to-pricing Pro links now preserve UTM/source/ad-click parameters, keeping campaign attribution intact when visitors move from the free tool to the direct checkout page.
- Checkout and Stripe subscription metadata now preserve first/last campaign context, including medium, content, search term and ad click IDs, so paid revenue can be tied back to acquisition journeys even when checkout happens after a later visit.
- Subscription MRR reporting now ignores internal sources such as `pricing_page` and falls back to the real first/last acquisition source, so revenue by source reflects marketing channels instead of checkout UI labels.
- Subscription, lead and checkout-recovery reporting now also ignores internal pricing campaigns such as `founder_plan`, falling back to the acquisition campaign that actually brought the visitor.
- Admin funnel diagnosis now flags Stripe session failures, checkout-link email failures, email non-clicks, tracking mismatches and repeated Stripe cancellations before generic conversion advice.
- Reordered admin diagnosis so repeated Stripe cancellations are shown before the generic "checkout opened but did not pay" recommendation.
- Source classification now uses first/last medium and ad click IDs, so delayed checkout events from prior Google Ads visits still group under Google Ads instead of Google organic or raw campaign labels.
- The result-ready block now includes a direct email field before download, using the existing link/checklist autoreply and tracking it as `result_ready_inline`, to address the current 54 downloads / 0 lead captures bottleneck.
- The highest-traffic bulk landing pages now make the 2-image free test the primary action again, while keeping the founder plan as the secondary path for visitors with a real batch, because `/bulk-background-remover/` had 24 visitors, 2 tool clicks and 0 pricing clicks.
- Account-step friction is now measured separately with `account_checkout_panel_shown` and `account_form_interacted`, while account copy clarifies that the account is free and payment only happens in Stripe. Result-ready leads are also eligible for the automatic link/checklist email.
- Main-tool sign-ins now refresh account state and start the pending Stripe checkout immediately after successful login, reducing the risk of buyers stopping between password entry and payment. Internal validation probes are also filtered from the admin lead queue so manual sales follow-up only sees real opportunities.
- A compact result-ready sticky CTA now stays visible after a free result is ready, offering founder checkout or link/checklist capture without blocking the free download, to increase the number of users who make a decision before leaving.
- Result-ready sticky impressions, founder clicks and link/checklist clicks are now reported separately in `/admin`, and sticky link requests are eligible for the automatic lead autoreply.
- Internal interface labels such as `result_ready_sticky`, `result_ready_inline`, `account_panel`, `checkout_plan`, stale `pro_trial`, self-referrals and support/email plumbing sources are excluded from acquisition-source attribution, so admin revenue/lead reporting falls back to the real first/last traffic source.
- `/admin` now includes a daily operating brief comparing today with yesterday and recommending the next action: generate traffic, adjust conversion, recover checkout, contact leads, observe, or increase acquisition.
- `/admin` daily stats now use the Europe/Lisbon day boundary instead of UTC, so the daily revenue brief matches Ricardo's operating day.
- Free users who try to upload more images than the free batch allows now see a batch-limit email capture inside the Pro prompt, tracked as `tool_limit_prompt` and surfaced in `/admin` as "Leads limite lote".
- The highest-volume `/bulk-background-remover/` landing now has a compact sticky action bar for the 2-image free test and founder checkout, tracked through existing SEO CTA events, to improve its recent 25-view / 2-click / 0-pricing-click baseline without increasing ad spend.
- The main tool now shows a direct founder-plan action beside the download buttons as soon as a free result is ready, keeping the free download open while putting the 100-image Pro upgrade at the highest-intent moment in the workflow.
- `/admin` now separates clicks on that result-actions founder CTA as "Fundador ações resultado", so the newest high-intent upgrade position can be evaluated independently from older post-download and sticky CTAs.
- The account step shown after a Pro click now offers a low-friction "continue later" email capture for users not ready to create an account, with autoresponder support and `/admin` reporting as "Leads conta checkout".
- `/bulk-background-remover/` now has a decision strip directly below the hero with three intent paths: validate 2 free images, activate the founder plan for a real product batch, or view annual Pro for monthly catalog work. Each path uses distinct UTM campaigns so pricing clicks from the highest-traffic SEO page can be measured separately.
- `/en/bulk-background-remover/`, used by Google Ads and English SEO, now has the same intent-path structure and sticky founder CTA as the Portuguese bulk landing, with English-specific UTM campaigns for founder, annual and free-test decisions.
- `/es/` and `/es/quitar-fondo-fotos-producto-lote/`, both referenced from Spanish Google Ads assets, now have Spanish intent paths and a sticky founder CTA, preserving `lang=es` and separating free-test, founder, annual/product-flow clicks by UTM campaign.
- The pricing page now uses `WebPage` and `Service` structured offer markup instead of `Product`, avoiding Google Search Console product-snippet warnings about missing reviews or aggregate ratings until real customer reviews exist.
- `/admin` support replies now include ready templates for interested prospects, pricing/limits, privacy/payment, fit qualification and opt-outs, reducing response time when outreach replies arrive and keeping warm leads pointed to the free test plus founder checkout path.
