# BatchCutout - revenue maximization operating plan

Updated: 2026-07-13

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
- The highest-intent result-ready and post-download CTAs now point first to the
  100 image pack at 5 EUR, while still keeping the founder subscription path for
  recurring production.

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
- On 2026-07-18, Search Console reported three redirected legal URLs last crawled on 2026-07-08 to 2026-07-10. All 12 legal/contact pages, canonical and hreflang tags, internal links, `sitemap.xml` and `llms.txt` now use the final extensionless URLs produced by Vercel `cleanUrls`; regression tests prevent redirected `.html` URLs from returning to the sitemap.
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
- The highest-volume `/bulk-background-remover/` landing now has a compact sticky action bar for the 2-image free test and Pack 100 checkout, tracked through existing SEO CTA events, to improve its recent 25-view / 2-click / 0-pricing-click baseline without increasing ad spend.
- The main tool now shows a direct Pack 100 action beside the download buttons as soon as a free result is ready, keeping the free download open while putting the 100-image paid upgrade at the highest-intent moment in the workflow.
- `/admin` now separates clicks on that result-actions paid CTA, so the newest high-intent upgrade position can be evaluated independently from older post-download and sticky CTAs.
- The account step shown after a Pro click now offers a low-friction "continue later" email capture for users not ready to create an account, with autoresponder support and `/admin` reporting as "Leads conta checkout".
- `/bulk-background-remover/` now has a decision strip directly below the hero with three intent paths: validate 2 free images, activate Pack 100 for a real product batch, or view annual Pro for monthly catalog work. Each path uses distinct UTM campaigns so pricing clicks from the highest-traffic SEO page can be measured separately.
- `/en/bulk-background-remover/`, used by Google Ads and English SEO, now has the same intent-path structure and sticky Pack 100 CTA as the Portuguese bulk landing, with English-specific UTM campaigns for Pack 100, annual and free-test decisions.
- `/es/` and `/es/quitar-fondo-fotos-producto-lote/`, both referenced from Spanish Google Ads assets, now have Spanish intent paths and a sticky Pack 100 CTA, preserving `lang=es` and separating free-test, Pack 100, annual/product-flow clicks by UTM campaign.
- The pricing page now uses `WebPage` and `Service` structured offer markup instead of `Product`, avoiding Google Search Console product-snippet warnings about missing reviews or aggregate ratings until real customer reviews exist.
- `/admin` support replies now include ready templates for interested prospects, pricing/limits, privacy/payment, fit qualification and opt-outs, reducing response time when outreach replies arrive and keeping warm leads pointed to the free test plus founder checkout path.
- Lead autoreplies, manual recovery templates, support replies and outreach copy now lead with the 5 EUR Pack 100 as the first paid step, keeping Pro as the recurring-volume option instead of the first ask.
- The main app's over-limit and inline upgrade prompts now also lead with Pack 100, and the homepage pricing link/default visible paid prompt opens the pack checkout instead of the founder subscription.
- The pricing page now leads with Pack 100 across hero, recommended plan, calculator and default checkout selection, while Pro is positioned as the recurring-production option.
- Core PT/EN/ES acquisition landings now send the first paid intent to Pack 100 instead of founder checkout, aligning SEO and Ads traffic with the current low-friction purchase path.
- Long-tail PT/EN/ES SEO, platform, alternative, proof and launch pages now also send first paid intent to Pack 100, keeping Pro/founder copy only for recurring monthly production.
- Reusable recovery emails, directory kit, Google Ads docs/import files, partner links, prospecting templates and LLM discovery now also lead with Pack 100, preventing future outreach or campaign imports from reverting to the old founder-first pitch.
- The live site now defaults generic checkout intent to Pack 100, removes founder wording from public checkout copy, and `/admin` includes a Pack 100 funnel block showing result-ready users, Pack clicks, Stripe Pack sessions, Pack purchases and step-by-step conversion rates.
- The inline paid prompt inside the tool now reduces choice friction by showing only Pack 100 as the primary action, Pro recurring as the secondary action, and a small "compare all plans" link for users who need the full pricing table.
- The account-before-payment step now shows plan-specific reassurance: Pack purchases are labelled as one-time, include the exact credit count, and say there is no automatic renewal; subscription plans are labelled separately as recurring access. Pricing also makes Pack 100 the visually dominant checkout action.
- The Pack 100 checkout can now open Stripe with email only before account creation, and `/admin` separates email-missing attempts, email-only checkout starts and email-to-Stripe failures so the low-friction path can be diagnosed without mixing it with subscription login friction.
- `/admin` now also distinguishes Stripe sessions actually created through the email-only Pack path, calculates email-completion and email-to-Stripe rates, and ranks Pack activity by acquisition source so traffic and checkout decisions can be made from the same funnel.
- The anonymous free offer is now a 2-image total quality test per browser instead of an endlessly repeatable 2-image batch. Public `?limit=` overrides no longer increase free access, the completed state routes directly to Pack 100, and `/admin` measures free-test completions and attempts to continue after the test.
- The new free-test funnel is now measured by unique visitor from completed test through Pack click, Stripe session and paid Pack. The admin recommendation ignores legacy repeat-free results, and 30-day visitor totals now distinguish unique visitors from summed visitor-days.
- `/admin` now breaks acquisition down by UTM campaign, ad content and search term, with unique visitors, upload/download rates, paid intent, Pack clicks, Stripe sessions, purchases and revenue. Budget decisions must use this campaign view instead of the aggregate `Google Ads` source row.
- Browser measurement now falls back to one page-memory visitor/session identifier when local or session storage is blocked, preserving unique funnel attribution without adding cookies or personal data collection.
- The main tool and pricing checkout now also keep language, consent state, free-test usage, campaign attribution, captured email and pending checkout functional in page memory when browser storage is blocked, preventing privacy-restricted visitors from losing the purchase path.
- Normal mobile and tablet visits now show the working upload area before account, promotion and demo content; explicit checkout links and Stripe returns keep the account/payment step first.
- Pack checkout now presents a single primary email-to-Stripe action on the main tool and pricing page, supports Enter without hidden-password validation, uses Pack-specific guidance/tracking, and keeps the consent banner from covering the mobile payment action.
- The main tool now becomes interactive without eagerly downloading the background-removal and ZIP modules; they load only when processing or ZIP export is requested, while authentication initializes in the background and engine/ZIP failures are measured separately in `/admin`.
- Paid-intent reporting now separates acquisition clicks, Pack offer impressions and actual plan selections; real Pack/Pro choices in the tool are tracked explicitly, while opening the tool or merely seeing an upgrade prompt no longer inflates paid-click totals.
- A live 14-day audit on 2026-07-13 found 98 unique visitors, 31 uploads, 22 ready results, 20 downloads and 12 upgrade-prompt views, but no Pack choice inside the result flow, no Stripe session and no purchase. The next experiment therefore removes the account/password detour at the highest-intent moment.
- The result-ready offer now uses one email field for direct Pack 100 checkout and for the secondary link/checklist request. A valid Pack choice opens Stripe immediately without password or account-panel navigation, while saving the link keeps the Pack purchase control available.
- The result-ready sticky offer now stays hidden while the full email/Pack offer is visible and appears only after that offer leaves the viewport, preventing mobile overlap while preserving a later conversion reminder.
- Email-only checkout attribution now records `result_ready_checkout` through the browser event and Stripe-session metadata, so the admin funnel can distinguish this reduced-friction path from account-panel Pack checkout.

## Pack 100 validation sprint - 2026-07-14 to 2026-08-13

The project is now in a bounded commercial validation period rather than open-ended feature development.

Decision targets:

- 50 unique visitors completing the current 2-image free test.
- 3 genuine Pack 100 purchases from unrelated customers.
- Stripe sessions, attempts after the free test, and the main non-purchase objection measured separately.

Decision rule:

- 3 or more Pack purchases: continue and repeat the sources that converted.
- 1 or 2 purchases: review repeat usage and customer feedback before further investment.
- 0 purchases and fewer than 3 Stripe sessions after the sample target or deadline: stop paid investment and decide between archiving the product or repositioning it as a catalogue-preparation workflow.

The post-download question now measures four concrete objections: no immediate photo volume, insufficient cutout quality, missing catalogue-ready finish, or insufficient value at 5 EUR. `/admin` shows the experiment period, progress, Stripe activity, purchases, and the leading objection without mixing the cohort with the older subscription-first history.

The admin now separates the minimum offer-change gate (30 completed free tests plus 7 full days, counted from 2026-07-12) from the broader validation sprint (50 completed tests plus 3 genuine Pack purchases from 2026-07-14 to 2026-08-13). Gate counts remain anchored to the rollout date even when the dashboard is opened with a shorter reporting window.

## Paid campaign attribution repair - 2026-07-21

The authenticated 14-day review showed 113 unique visitors, 28 uploads, 19 downloads, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. The support inbox had no unresolved messages. The offer gate remained blocked at 5 of 30 completed free tests, with the time requirement already met.

Campaign reporting was splitting one paid journey across two rows: `pro launch` showed 49 landing visitors and no uploads, while the landing page's hard-coded `bulk_background_remover` campaign received the downstream tool activity. Internal landing links now retain incoming paid source, medium, campaign, content, term and click IDs instead of replacing them with page defaults. The page's own CTA campaign is kept separately as `cta_campaign` for click analysis. Prices, offers, campaign settings and budgets were not changed.

## Checkout and Google Ads audit - 2026-07-21

The grouped `cannot_access_waitingplan_before_initialization` account failures were last recorded on 2026-07-17 before commit `2fb1ff0` corrected checkout-plan initialization. No newer instance was present in the authenticated review. A regression test now requires the pending plan to be initialized before signup tracking, redirect generation or existing-account recovery can use it.

Google Ads reported 65 clicks, 584 impressions, 176.45 EUR cost and 2.71 EUR average CPC for 2026-07-07 through 2026-07-20. The `Purchase` goal is a primary conversion action active for all three campaigns and contains the genuine 9 EUR purchase. The 400 EUR spend promotion and the 250 EUR conversion-tracking promotion both remained `Processing`; the latter requires a qualifying website conversion by 2026-08-16. The visible search terms were high-intent background-removal searches, so no defensible negative keyword or campaign change was made. Budgets remained unchanged.

## Search Console indexing review - 2026-07-21

The authenticated URL-prefix property reported 215 impressions, two organic clicks, 0.9% CTR and average position 63.9 over the available three-month period. The strongest pages were `/bulk-background-remover/` with one click and 63 impressions, and `/transparent-png-batch/` with one click, 15 impressions and average position 15.7.

The coverage snapshot, last updated by Google on 2026-07-10, contained 45 indexed and 28 non-indexed URLs: 21 discovered but not indexed, one crawled but not indexed, three redirects and three correct canonical alternatives. `/sitemap.xml` remained successful with 62 discovered pages and was resubmitted on 2026-07-21. Validation was started for both the 21 discovered URLs and the single crawled URL. The three redirect examples were obsolete `.html` or tracking-parameter URLs that correctly redirect to clean canonical paths, so no attempt was made to index them.

## Product photo locale targeting - 2026-07-21

Search Console showed that the Portuguese `/product-photo-background-remover/` page received 60 impressions, zero clicks and average position 80.7; 48 of those impressions came from the United States and the visible queries were English. The English equivalent received only 19 impressions at average position 92.8. All three reciprocal PT, EN and ES pages declared the Portuguese URL as `x-default`, which made it the fallback for international searches.

The reciprocal locale group now uses the English product-photo page as `x-default` while retaining explicit `pt-PT`, `en` and `es` alternates. The sitemap dates for the three pages were updated and an automated test protects the complete alternate set. Titles, offers, prices and page copy were left unchanged so the language-targeting correction can be measured independently.

## Bulk remover locale targeting - 2026-07-21

Search Console showed that `/bulk-background-remover/` received 63 impressions, one click and average position 78; 41 impressions came from the United States and every visible query was in English. The English equivalent received only four impressions at average position 49.8. Both reciprocal PT and EN pages declared the Portuguese URL as `x-default`.

The reciprocal locale group now uses the English bulk-remover page as `x-default` while retaining explicit `pt-PT` and `en` alternates. The sitemap dates for both pages were updated and an automated test protects the complete alternate set. Titles, offers, prices and page copy were left unchanged so the language-targeting correction can be measured independently.

## Transparent PNG locale targeting - 2026-07-21

Search Console showed that `/transparent-png-batch/` received 15 impressions, one click, 6.7% CTR and average position 15.7. Its visible queries were English and the reported countries were India, Lithuania and the United States. The English equivalent was confirmed as indexed and eligible to appear in Google, but both reciprocal pages declared the Portuguese URL as `x-default`.

The reciprocal locale group now uses the English transparent-PNG page as `x-default` while retaining explicit `pt-PT` and `en` alternates. The sitemap dates for both pages were updated and an automated test protects the complete alternate set. Titles, offers, prices and page copy were left unchanged so the language-targeting correction can be measured independently.

## Global locale fallback audit - 2026-07-21

After Search Console exposed the same international-to-Portuguese mismatch on the product-photo, bulk-remover and transparent-PNG page groups, the complete localized HTML set was audited. Of 56 documents with an English alternate, only 11 already used that English URL as `x-default`; 45 still used the Portuguese URL.

The remaining 44 indexable PT/EN/ES documents now use their declared English alternate as the global fallback, including the home, platform, competitor, legal and white-background groups. Their sitemap dates were updated. `/pricing/` remains the single intentional exception because its PT/EN/ES variants share one canonical URL and switch language through a query parameter. A repository-wide automated test now protects this rule. No page copy, price, offer or campaign setting changed.

## Structured data resolution - 2026-07-21

The repository contains no remaining `Product` schema or fabricated `aggregateRating` or `review` data. The authenticated Search Console reports, last updated on 2026-07-20, showed zero invalid and zero affected items for both Product snippets and Merchant listings. The historical optional-warning rows for ratings, reviews, shipping details and merchant return policy each contained zero items.

No validation request or further markup was necessary. BatchCutout remains described as a software application/service with real offers, avoiding physical-product shipping metadata and customer-rating claims that do not apply.

## Google Ads promotion status - 2026-07-21

The authenticated Promotions report confirmed that the 250 EUR conversion-tracking credit is `Active`: Google states that it has been applied to the account and is financing the campaigns. It was redeemed on 2026-07-17 and expires on 2026-09-19; the amount spent from the credit was not yet available in the report.

The separate 400 EUR spend promotion remained `Processing`, with Google confirming that its criteria were met and that the credit should be applied soon. No campaign or budget setting was changed during this verification.

## Daily commercial review - 2026-07-22

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean before this checkpoint. The authenticated dashboard reported 112 unique visitors, 28 uploads, 23 ready results, 19 downloads, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue over 14 days. The same period contained five completed `free_total_2` tests, so the offer-change gate remains blocked at 5 of 30 despite the seven-day requirement being met. There were no processing, ZIP or checkout failures, no unresolved support messages, no paying renewable subscription and zero real MRR.

The genuine Pack 250 customer remains active with all 250 credits available, so no paid usage has occurred yet. The activation email must not be resent. The 250 EUR Google Ads credit remains active and financing the campaigns, with 7.99 EUR used, while the separate 400 EUR credit remains processing after its criteria were met.

Google Ads reported 563 impressions, 63 clicks, 178.93 EUR cost and one purchase conversion from 2026-07-08 through 2026-07-21. Over the trailing 30 days it reported 2,828 impressions, 162 clicks, 272.31 EUR cost and the same single conversion. The authorized budgets remain 8 EUR/day for Pro Launch and 2 EUR/day for Alternatives, and Campaign #1 remains paused. No budget increase is justified before the repaired attribution and current free-test cohort produce enough post-click activation data.

## Result-ready Pack checkout consolidation - 2026-07-23

The Pack 100 buttons beside the download controls, in the result-ready sticky bar and in the post-download panel still sent anonymous visitors without a known email to the account/password panel. Those three high-intent actions now share the existing email-only Pack checkout path. A visitor without an email is focused on the result-ready email field with explicit no-password guidance; a visitor with a known email proceeds directly to Stripe.

The existing Pack-click event remains intact, email-missing attempts and checkout failures retain their separate diagnostics, and each Stripe request records its exact result-stage source. No price, offer, free-test limit or campaign setting changed. Automated coverage protects all three entry points, and a local browser validation confirmed the complete image-processing and checkout handoff on desktop and mobile.

## Paid customer first-use activation - 2026-07-23

Authenticated Pack and Pro customers previously finished magic-link or password authentication at the account panel even when paid access was already active. Paid authentication now lands directly on the working upload area, focuses the upload control and removes completed Pack activation parameters, including the Stripe session identifier, from the visible URL. Account and credit information remains available above the tool without interrupting the first-use path.

Three new operational signals distinguish access from real use: paid workspace ready, first Pack batch started, and first Pack batch completed with at least one successful result. These counters are visible in `/admin` and preserve their acquisition source. The change does not send email, alter prices or change paid limits.

## Successful-output credit reservation - 2026-07-23

Paid usage previously reserved credits for every pending image before background removal started. A per-image processing failure after that reservation could therefore consume a Pack credit without producing a downloadable result. Paid batches now process into temporary local outputs first, reserve only the number of successful results through the authenticated usage API, and expose the PNGs only after the server confirms the balance update.

The current account balance is still checked before processing, while an authoritative reservation failure keeps the original images ready for retry and exposes a separate admin counter instead of consuming or displaying unconfirmed output. The free path remains unchanged; a browser validation confirmed background removal and enabled PNG/ZIP downloads after this change.

## Stripe delayed-payment reconciliation - 2026-07-23

The fulfillment audit found that the webhook handled immediate `checkout.session.completed` events but not `checkout.session.async_payment_succeeded`, which Stripe uses when a delayed payment method confirms later. Pack credit application now has its own payment-status guard, both immediate and delayed successful Checkout events use the same idempotent reconciliation path, and authenticated checkout sync refuses to alter Pack or subscription access while the session remains unpaid.

Asynchronous payment failures and expired Checkout sessions are stored as operational events, and `/admin` now includes expired sessions alongside failed-payment counts and value. The enabled production webhook was audited directly on Stripe; delayed success, delayed failure, session expiration and invoice payment failure were the four missing event subscriptions and were added without removing the existing events. No price, offer, email campaign or advertising setting changed.

## Deterministic Pack credit reconciliation - 2026-07-23

Pack fulfillment previously incremented the current credit limit before storing the `pack_credits_applied` marker. A retry between those two operations, or a concurrent webhook and checkout-return sync, could therefore apply one paid session more than once. Paid Pack sessions recorded in `pack_purchase_paid` now form the entitlement ledger: rows are selected through the account, Stripe customer and payment email identities, deduplicated by Checkout Session ID, and converted back into the authoritative credit limit.

The paid-session event is stored before the profile is changed, the current session must be present in that ledger, and retries reconcile the same total even when an applied marker already exists. After each profile write, the ledger is read again; a concurrent second purchase causes another deterministic pass, while continuous changes stop safely for a Stripe retry. The applied event is written only after the profile matches the verified ledger and records the resulting total for later diagnosis. This changes neither the Pack allowance nor any public offer; it removes a revenue and support risk from retry handling.

The production ledger was validated against the existing paid Pack on 2026-07-23. One paid session was processed, deduplicated to a 250-credit entitlement and left with a 250-credit limit; no credits were attributed again. The validation also reconciled one divergent profile field through the same deterministic patch.

## Daily commercial review - 2026-07-24

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean at commit `528d57f` before this checkpoint. The authenticated dashboard reported two unique visitors and no upload, result, download or revenue today. Over 14 days it reported 111 unique visitors, 23 uploads, 20 ready results, 14 downloads, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. Over 30 days it reported 270 unique visitors, 117 uploads, 88 ready results, 73 downloads, the same two Pack Stripe sessions, one Pack purchase and 9 EUR revenue. There were no processing, ZIP, checkout, payment or credit-reservation failures and no unresolved support messages.

The offer-change gate remains blocked at five of 30 completed `free_total_2` tests; 12 full days have elapsed, so the remaining condition is 25 additional completed tests. The validation sprint is at five of 50 completed tests and one of three genuine Pack purchases. The paid Pack account remains active with all 250 credits available and no first batch started. The other two Pro profiles are manual, all three Stripe subscriptions are scheduled to cancel, and real renewable MRR remains zero.

Google Ads reported 17 impressions, two clicks and 10.73 EUR cost on 2026-07-23; 550 impressions, 65 clicks and 192.87 EUR cost over the trailing 14 complete days; and 2,873 impressions, 166 clicks, 293.32 EUR cost and one conversion over the trailing 30 complete days. Pro Launch remains at 8 EUR/day, Alternatives at 2 EUR/day and Campaign #1 remains paused. The 250 EUR credit is active and financing the campaigns, with 29.58 EUR spent and an expiry date of 2026-09-19. The separate 400 EUR credit remains processing after its criteria were met. No campaign, budget, price, offer or email was changed: the largest demonstrated constraint remains qualified activation and accumulation of the current experiment sample, not a technical or payment failure.

## Daily commercial review - 2026-07-25

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean at commit `fa13fa5` before this checkpoint. On 2026-07-24 the product recorded five unique visitors, six page views and no upload, result, download, checkout or revenue. Over the trailing 14 days it recorded 103 unique visitors, 19 uploads, 15 ready results, 11 downloads, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. Over 30 days it recorded 271 unique visitors, 114 uploads, 79 ready results, 70 downloads, the same two Pack Stripe sessions, one purchase and 9 EUR revenue. There were no engine, ZIP, checkout, payment or paid-credit reservation failures and no unresolved support messages.

The offer-change gate remains blocked at five of 30 completed `free_total_2` tests after 13 full days, leaving 25 completed tests to collect. The validation sprint remains at five of 50 tests and one of three genuine Pack purchases. The paid Pack account still has all 250 credits available and has not started a first paid batch. The two other Pro profiles remain manual, all three Stripe subscriptions are scheduled to cancel, and real renewable MRR remains zero.

Google Ads reported 34 impressions, four clicks, 11.85 EUR cost and no conversion on 2026-07-24. Over 14 complete days it reported 521 impressions, 62 clicks, 189.24 EUR cost and one conversion; over 30 days it reported 2,907 impressions, 170 clicks, 305.17 EUR cost and the same conversion. Budgets remain 8 EUR/day for Pro Launch and 2 EUR/day for Alternatives, while Campaign #1 remains paused. The 250 EUR credit is active with 32.86 EUR spent and the separate 400 EUR credit remains processing.

The clearest current acquisition defect is a language mismatch in Pro Launch. Its two highest-click search terms in the 30-day report are the English queries `image background remover` and `bulk background remover`, while the current paid landing is the Portuguese `/bulk-background-remover/` page. The authenticated application attribution contains 40 Pro Launch visitors on that Portuguese landing over 14 days and no upload or download. The recommended campaign action is to send this English-intent ad group to `/en/bulk-background-remover/`, preserving its tracking parameters. This live-ad change was not made because it requires explicit confirmation; no price, offer, budget or email was changed.

## Paid English funnel locale consistency - 2026-07-25

The active Bulk Background Remover ad was confirmed to use the English `/en/bulk-background-remover/` landing page and to preserve its Google Ads source, medium, campaign and content parameters when opening the upload tool. The landing and upload flow were in English, but the ecommerce workflow section below the tool still displayed 14 Portuguese cards and linked visitors back to Portuguese pages.

The tool now renders 14 English workflow cards with English destinations and 11 Spanish cards where Spanish destinations exist. In languages without a complete matching workflow set, the promotional section is hidden instead of showing content in another language. Production was verified in English, Spanish and French after deployment at commit `a571f3e`; the English ad-to-tool transition retained all campaign parameters. No price, offer, budget or live-ad setting changed.

## Free-test Google Ads measurement - 2026-07-25

The Google Ads conversion audit found one recorded Pack purchase, seven ZIP-download conversions and three batch-limit conversions over the displayed 30-day period, but no action dedicated to completion of the current two-image free test. `Free Test Completed BatchCutout` was created under Sign-up as a secondary, one-per-click, zero-value conversion that is not included in account-level goals.

Production now sends that conversion once when the second successful free result records `free_test_completed`. The action remained secondary after deployment at commit `cfc4c88`, and the live site loaded the matching tagged script. No campaign, budget, bid strategy, primary conversion, price or offer changed.

## Commercial locale consistency - 2026-07-25

The main tool exposed 12 language options, but only Portuguese, English and Spanish had complete current translations for the free test, Pack offer, account access, password recovery and result-stage conversion flow. The other nine options mixed an older translated tool surface with newer English commercial content; the pricing page already supported only PT, EN and ES.

The tool selector now matches the three complete commercial locales. Requests and saved preferences for unsupported locales fall back to a fully English interface, and legacy `lang` URLs are normalized to `lang=en` while retaining attribution parameters and the page anchor. Production was verified for PT, EN, ES and a legacy FR request after deployment at commit `0bc7c2a`. No price, offer, campaign or budget changed.

## Product-photo search-intent response - 2026-07-25

The authenticated Search Console performance report contained 225 impressions, two clicks, 0.9% CTR and average position 64 over the available three-month period. The commercially relevant query `how to i remove a background with a product image?` had two impressions, zero clicks and average position 12. Its historical impressions were attributed to the Portuguese product-photo URL before the 2026-07-21 international fallback correction.

The current English product-photo page now answers that question directly with a three-step upload, removal and download workflow, while its primary action remains the two-image free test. Its H1 was aligned with batch product-photo removal, the sitemap date was updated and automated coverage protects the search-intent copy and acquisition link.

Production was verified after deployment at commit `5c8b0dd`. Search Console's live test confirmed that the English URL is available to Google and can be indexed, and the subsequent indexing request was accepted into the priority crawl queue. No price, allowance, offer, campaign or budget changed.

## Intraday commercial review - 2026-07-25 11:17 Europe/Lisbon

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean at commit `807d3ae`. Today had two unique visitors, 12 page views and one SEO CTA click, but no upload, result, download, checkout or revenue. The complete days from 2026-07-22 through 2026-07-24 had 14 visitors and 16 page views with no product use; including today's partial data, 16 visitors generated no upload over that interval.

Over 14 days the authenticated dashboard reported 104 unique visitors, 19 uploads, 15 ready results, 11 downloads, five completed `free_total_2` tests, one attempt to continue, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. The current offer gate remains blocked at five of 30 completed tests after 13 full days. The same-day 30-day snapshot contained 271 unique visitors, 114 uploads, 79 ready results, 70 downloads and the same single purchase. There were no engine, ZIP, checkout, payment or paid-credit reservation failures.

The genuine Pack customer remains active with all 250 credits unused and has not started a first paid batch. Real renewable MRR remains zero; all three Stripe subscriptions terminate at period end and must not be counted as future revenue. The support mailbox contained two closed messages and zero unresolved messages, with no new buying objection, opt-out or support request.

Google Ads reported 34 impressions, four clicks, 11.85 EUR cost and zero conversions on 2026-07-24. Over 14 complete days it reported 521 impressions, 62 clicks and 189.24 EUR cost; over 30 complete days it reported 2,907 impressions, 170 clicks and 305.17 EUR cost, with the one genuine Pack conversion. Pro Launch remains active at 8 EUR/day, Alternatives at 2 EUR/day and Campaign #1 remains paused. The 250 EUR credit is active with 35.79 EUR spent; the separate 400 EUR credit remains processing after its criteria were met.

Search Console, last updated through 2026-07-22, reported 28 impressions and zero clicks over seven days, 78 impressions and zero clicks over 28 days, and 225 impressions with two clicks over three months. The product-photo search-intent update deployed today is therefore not represented in those delayed figures.

The largest demonstrated bottleneck is activation before the free test, not Stripe or price: only five of 104 visitors completed the test, while one of two Pack Stripe sessions paid. The recent English paid-landing correction has too little post-change traffic to judge. Prices, offers, campaigns, keywords and budgets were left unchanged; the next decision requires a measurable post-change sample rather than another simultaneous intervention.

## Intraday commercial review - 2026-07-27 11:17 Europe/Lisbon

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean at commit `b6a8851` before this checkpoint. Today had three unique visitors and three page views but no upload, result, download, checkout or revenue. The complete day 2026-07-26 had six visitors, three uploads, two ready results and one download, while 2026-07-25 had six visitors, one upload, one ready result and one download. This is a limited recovery from the inactive 2026-07-22 to 2026-07-24 interval, not yet evidence of a sustained conversion improvement.

Over 14 days the authenticated dashboard reported 106 unique visitors, 22 uploads, 17 ready results, 13 downloads, six completed `free_total_2` tests, one attempt to continue, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. The offer gate remains blocked at six of 30 completed tests after 15 full days, leaving 24 completed tests to collect. The same-day 30-day report contained 258 unique visitors, 410 page views, 101 uploads, 74 ready results, 65 downloads, the same six completed tests, two Pack Stripe sessions, one purchase and 9 EUR revenue. There were no engine, ZIP, checkout, payment or paid-credit reservation failures.

The genuine Pack customer remains active with all 250 credits unused and has not started a first paid batch. Real renewable MRR remains zero: the three Stripe subscriptions are scheduled to terminate at period end and must not be counted as future revenue. The support mailbox contained two closed messages and zero unresolved messages, with no new buying objection, opt-out or support request.

Google Ads reported 58 impressions, six clicks, 14.26 EUR cost and no purchase on 2026-07-26. From 2026-07-13 through 2026-07-26 it reported 576 impressions, 62 clicks, 184.89 EUR cost and one conversion; Pro Launch accounted for 43 clicks and 140.64 EUR, while Alternatives accounted for 19 clicks and 44.25 EUR. Over the 30 complete days from 2026-06-27 through 2026-07-26, Ads reported 2,729 impressions, 174 clicks, 324.91 EUR cost and the same single conversion. Pro Launch remains active at 8 EUR/day, Alternatives at 2 EUR/day and Campaign #1 remains paused.

The 250 EUR Google Ads credit remains active and is financing the campaigns, with 65.34 EUR used and an expiry date of 2026-09-19. The separate 400 EUR credit remains processing after its criteria were met. The billing overview showed a 177.01 EUR balance on 2026-07-27, with the next automatic payment indicated for 2026-08-01 or when the balance reaches 200 EUR.

Search Console, last updated through 2026-07-25, reported 28 impressions, zero clicks and average position 46.9 over seven days; 90 impressions, zero clicks and average position 51.5 over 28 days; and 240 impressions, two clicks, 0.8% CTR and average position 62 over the available three-month report. Relative to the 2026-07-25 checkpoint, recent average position improved and 28-day impressions rose from 78 to 90, but organic acquisition has not yet produced a new click.

Activation before the free test remains the largest demonstrated constraint. The completed-test count advanced from five to six, and Stripe still converted one of two Pack sessions, but the current English Pro Launch landing has only three attributed visitors and no upload in the 14-day application report. That sample is too small to judge the 2026-07-25 correction. No price, offer, campaign, keyword, budget or email setting changed. The next commercial decision remains gated by 24 additional completed tests; the paid-landing read also needs a materially larger post-change sample.

## Paid-search direct activation - 2026-07-27

The attributed 14-day application funnel showed the largest avoidable loss before the first upload: the historical Pro Launch landing path produced three uploaders from 44 visitors, while the direct tool path produced five uploaders from six visitors and the remove.bg alternative page produced five from 20. Paid Google Ads visits to the English bulk-remover landing now continue automatically to the English upload workspace, eliminating the extra CTA click while retaining source, medium, campaign, content, term and Google click IDs.

Organic and untagged visitors remain on the indexable English landing page, so its SEO content, canonical URL and internal conversion choices are unchanged. A dedicated `paid_landing_tool_redirect` event and the `Entrada paga direta` admin counter expose how many paid visits received the shorter path. `Ferramenta aberta` and the new `Seletor de ficheiros` counter separate workspace arrival from a click to choose files; uploads and completed free tests remain the subsequent outcome measures. Desktop and mobile browser checks confirmed the paid redirect and visible upload workspace, while an organic visit remained on the landing. No price, free allowance, campaign, keyword, budget or email setting changed.

## Paid-search query quality review - 2026-07-27

The authenticated Google Ads search-term report confirms that purchase intent is concentrated in explicitly multi-image queries. From 2026-07-13 through 2026-07-26, `remove background for multiple images` produced the account's only conversion at 5.16 EUR. The keyword `[bulk remove background from images]` generated 12 clicks, 49.57 EUR cost and one conversion in the same period.

By contrast, `[product photo background remover]` generated 18 clicks and 49.59 EUR cost over 14 complete days, and 42 clicks and 94.56 EUR over 30 complete days, with zero conversions in both periods. It represented 26.8% of total 14-day account spend and 29.1% of total 30-day account spend without a purchase. Its visible close variants were dominated by single-photo, question and transparent-PNG intent rather than batch intent.

The approved live action was applied on 2026-07-27. `[product photo background remover]` was paused in `Search - BatchCutout - Pro Launch`, and the ten entries in `google-ads-imports/batchcutout-pro-launch-negatives-applied-2026-07-27.csv` were added at campaign level with exact matching. This preserves all queries containing `bulk`, `batch`, `multiple` or `mass`, including the query that converted. The applied terms accounted for 17.30 EUR of identifiable spend over the latest 14 complete days; this amount overlaps the keyword spend and must not be added to it when estimating impact.

Google Ads confirmed the keyword as paused and displayed all ten exclusions under Pro Launch as campaign-level exact matches. Pro Launch remained active at 8 EUR/day, Alternatives remained active at 2 EUR/day and Campaign #1 remained paused. No bid strategy, campaign, price, offer or other keyword changed. The next quality review should use the later of seven complete days or 30 new paid clicks, and should compare paid direct entry, file-picker use, upload, completed free test and purchase against this checkpoint.

## Search Console indexing review - 2026-07-28

The authenticated Page indexing report, last updated on 2026-07-24, contained 61 indexed URLs and 24 excluded URLs. Eleven exclusions were alternate parameter or language URLs with a selected canonical, and seven were intentional redirects from legacy `.html` URLs to their current clean destinations. The remaining reported technical URLs were internal API endpoints: `/api/track` returned the expected method response, `/api/account` required authentication and `/api/auth-config` returned configuration data. None is a public page that should appear in search results.

Three public URLs were still in Google's discovered-but-not-indexed queue: the Canva alternative page, the English privacy page and the partners page. All returned HTTP 200, exposed self-referencing canonical URLs and were present in the sitemap; Search Console already showed validation started for this group. The English product-photo page also remained in the requested priority crawl queue from the prior search-intent update.

Internal API routes are now explicitly disallowed in `robots.txt`, and Vercel returns `X-Robots-Tag: noindex, nofollow` for every `/api/` response. This prevents protected and method-specific application endpoints from being treated as indexable content without changing their runtime behavior. No validation request was started for the intentional redirect, canonical or API exclusions, and no commercial page, price, offer, campaign or budget changed.

## Intraday commercial review - 2026-07-28 10:27 Europe/Lisbon

Production returned HTTP 200 for the public site, pricing and admin routes, and the repository was clean at commit `338f0bc` before this checkpoint. Today had one unique visitor, two page views and one landing CTA click, but no upload, completed result, download, checkout or revenue. Over 14 days the authenticated dashboard reported 104 unique visitors, 154 page views, 22 uploads, 18 completed results, 13 downloads, six completed `free_total_2` tests, one attempt to continue, two Pack Stripe sessions, one genuine Pack purchase and 9 EUR revenue. Over 30 days it reported 226 unique visitors, 358 page views, 73 uploads, 59 completed results, 46 downloads and the same six tests, two Stripe sessions, one purchase and 9 EUR revenue. There were no engine, ZIP, checkout, payment or paid-credit reservation failures.

The offer-change gate remains blocked at six of 30 completed tests after 16 full days, leaving 24 completed tests to collect. The genuine Pack customer remains active with all 250 credits unused and has not started a first paid batch. Direct Stripe reconciliation showed one paid Pack, 9 EUR revenue and no paid case requiring action. All three Stripe subscriptions terminate at period end, real renewable MRR remains zero, and no manual or test account was counted as revenue. The support mailbox contained two closed messages and zero unresolved messages.

Google Ads reported six impressions, one click, 6.39 EUR cost and no conversion on today's incomplete day. From 2026-07-14 through 2026-07-27 it reported 558 impressions, 62 clicks, 183.78 EUR cost and one conversion; over the 30 complete days from 2026-06-28 through 2026-07-27 it reported 2,172 impressions, 162 clicks, 331.28 EUR cost and the same conversion. Pro Launch remains active at 8 EUR/day, Alternatives at 2 EUR/day and Campaign #1 remains paused. The 250 EUR credit is active, has financed 72.33 EUR and expires on 2026-09-19. The separate 400 EUR credit remains processing after its requirements were met.

Today's search-term report exposed `photoshop batch remove background` and `remove bg change background`, both with impressions and no click; the query responsible for the reported click was not yet available. The active Pro Launch ad still points to the English bulk-remover page. In the 14-day application funnel, the historical Pro Launch path had 44 visitors but only three unique uploaders, while the remove.bg alternative page had 19 visitors, five uploaders and three downloaders. This confirms that activation before the first upload remains the largest demonstrated constraint.

Search Console, with performance data through 2026-07-25, remained at 28 impressions and zero clicks over seven days, 90 impressions and zero clicks over 28 days, and 240 impressions with two clicks over the available three-month report. The paid direct-entry and search-quality changes made on 2026-07-27 have only one incomplete day and one paid click of observation. No price, offer, campaign, keyword, budget or email changed; the next paid-search decision remains the later of seven complete days or 30 new paid clicks from that checkpoint.

## Touch-friendly first-upload action - 2026-07-28

A desktop and mobile review of the direct upload workspace confirmed that the dropzone is visible without an extra navigation step, but its primary instruction led with dragging photos. That action is not natural on a touch screen and created avoidable ambiguity at the largest measured funnel loss, before the first upload.

The Portuguese, English and Spanish upload instructions now lead with selecting photos while preserving drag-and-drop as the second option. Desktop and 390-pixel mobile browser checks confirmed that the shorter copy remains legible and correctly contained. Automated coverage protects all three commercial translations. No price, offer, free allowance, campaign, keyword, budget or email setting changed.

The next measurement is the direct workspace sequence from tool page view to file-picker open, upload and completed free test. Conversion impact must be evaluated only after post-deployment traffic is available.

## Activation measurement integrity - 2026-07-28

The activation audit found that `tool_file_picker_opened` was sent by the browser but rejected by the tracking API, so the historical file-picker counter was artificially zero. Five other operational events were accepted by the API and used by the dashboard but omitted from the browser's server-event list: engine and ZIP failures, account confirmation resends, and the required-email and failed-email steps before checkout. Their historical zero values must not be treated as evidence that those conditions never occurred.

The browser and API event contracts are now aligned and protected by an automated consistency test. New tool events include a non-identifying screen-format context based on viewport dimensions and input mode; no user agent, personal data or new persistent identifier is collected.

The admin dashboard now reports unique visitors through tool view, file picker, accepted upload, completed free test and download for mobile, tablet and desktop. Historical events without screen-format context are intentionally excluded from this breakdown, so measurement begins with this deployment. No price, offer, free allowance, campaign, keyword, budget or email action changed.

## Account-failure recency audit - 2026-07-28

The eight `cannot_access_waitingplan_before_initialization` signup failures shown in the 14-day dashboard came from one visitor and ended on 2026-07-17 at 16:16 Europe/Lisbon. The duplicate checkout-plan declaration that caused this error was removed later that day in commit `2fb1ff0`; the error did not recur during the following 11 days. The five invalid-login attempts were from the same visitor at the same time, and the final temporary rate-limit event was recorded on 2026-07-17 at 17:41.

This is historical evidence of a resolved incident, not a current account blocker. The dashboard now states when there have been no access failures in the latest seven days while retaining the 14-day history below. Account failure groups are also limited to the requested reporting window instead of the longer event window retained for the Pack validation experiment. Automated coverage requires exactly one checkout-plan declaration in the signup handler. No price, offer, campaign, budget or email action changed.

## Pricing URL crawl cleanup - 2026-07-28

The authenticated three-month Search Console report exposed one impression for a historical pricing URL containing `checkout_plan`, `utm_source=pricing`, `utm_medium=hero` and `utm_campaign=pro_annual`. The current pricing source no longer contained that annual campaign, but still exposed replacement self-referential pricing links with internal UTM parameters that Google could discover.

Pricing CTAs now expose only the functional `checkout_plan`, language when needed and account-section anchor. CTA placement and campaign labels remain attached to the click event, while incoming external campaign attribution is persisted before a clean same-page plan link reloads. Campaign parameters still propagate to other internal destinations where they support acquisition measurement, but are not appended to pricing self-links.

Automated coverage prevents pricing self-links from regaining internal UTM parameters and verifies that plan selection plus CTA attribution remain present. No price, offer, free allowance, campaign, keyword, budget or email action changed.

Production was verified after deployment at commit `535ced6`. Search Console confirmed that the clean pricing URL was already indexed and served through HTTPS, then accepted a new indexing request into the priority crawl queue.

## Paid direct-entry measurement repair - 2026-07-30

The authenticated same-day funnel contained two Google Ads visitors attributed to the active English bulk-remover landing and two tool views, but zero `paid_landing_tool_redirect` events. The redirect was functioning, while the implementation audit confirmed that the landing script emitted this event and the dashboard consumed it, but the tracking API did not include it in its allowed-event contract.

The tracking API now accepts the direct paid-landing handoff and automated coverage requires the browser, API and dashboard sides of that event to remain connected. The two historical handoffs cannot be backfilled and remain excluded from the direct-entry counter; measurement starts with the production deployment. No price, offer, free allowance, campaign, keyword, budget or email action changed.
