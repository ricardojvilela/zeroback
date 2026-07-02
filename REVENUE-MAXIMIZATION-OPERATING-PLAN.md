# BatchCutout - revenue maximization operating plan

Updated: 2026-07-02

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

Live 14-day funnel snapshot on 2026-07-02:

- Visitors: 179.
- Uploads started: 194.
- Downloads: 129.
- Pro clicks: 8.
- Checkout starts: 0.
- Paid subscriptions from live funnel: 0.
- Lead captures: 0.
- Manual/direct outreach sent: 69 prospects.
- Demo outreach batch sent on 2026-07-02: 13 prospects.
- Current real renewable MRR after internal cleanup: 0 EUR.

Interpretation:

- Google Ads is producing product usage, not just empty visits.
- The main conversion gap is downloads/Pro clicks not becoming checkout starts.
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
