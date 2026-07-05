# BatchCutout - prospecting system

Goal: turn manual outreach into a controlled pipeline that finds ecommerce stores with a visible product-photo problem and moves them toward a paid subscription.

## Qualification score

Only contact prospects with a score of 70 or above unless they are a strategic partner.

Score:

- 25 points: many product photos or repeated SKU variations.
- 25 points: visible background inconsistency, lifestyle/table/home photos, or product photos that would benefit from transparent PNGs.
- 20 points: visual product category where image quality affects conversion.
- 15 points: public business email or usable contact form.
- 15 points: small/medium store, owner-led brand, or likely accessible decision maker.

Best-fit niches:

- Candles, wax melts, diffusers, home fragrance.
- Jewelry, crystals, accessories.
- Bath, body, skincare, soap, cosmetics.
- Custom gifts, tumblers, favors, boutique products.
- Handmade home decor, ceramics, textile/fiber products, wood products.
- Pet accessories.
- Product photographers, ecommerce assistants and small Shopify/WooCommerce agencies.

## Outreach rules

- Use only public business contact channels.
- Do not claim the prospect used BatchCutout.
- Do not say their current photos are bad.
- Do not send more than one follow-up.
- Stop immediately on any negative reply or opt-out.
- Keep daily direct email batches small while the domain is still building reputation.
- Use `BatchCutout <support@batchcutout.com>` and reply-to `support@batchcutout.com`.
- When using the proof variant, link English prospects to `/en/customer-results/` and Portuguese prospects to `/customer-results/`; do not attach video files to cold outreach emails.

## Status workflow

- `ready`: public email found and prospect is ready for domain email.
- `ready_form`: no clean email or form is the better channel.
- `sent_YYYY-MM-DD`: contacted through domain email or form.
- `replied`: prospect replied and needs manual handling.
- `converted`: prospect became a paying customer.
- `blocked_captcha`: contact form requires CAPTCHA/hCaptcha; do not automate or bypass.
- `blocked_*`: do not contact for now.

## Next action values

- `send_domain_email`: send first email through `support@batchcutout.com`.
- `submit_contact_form`: open the form and paste the prepared message.
- `follow_up_if_no_reply`: send one short follow-up on the follow-up date if there was no reply.
- `watch_replies`: monitor support inbox.
- `ask_for_proof`: ask a happy user for before/after proof with permission.
- `manual_captcha_required`: submit manually only if a human is available to solve the CAPTCHA.
- `do_not_contact`: leave out of outreach.

## Outreach variants

- `outreach_variant=demo_video`: historical CSV value; use the visual proof page before asking the prospect to test the 2 free images.
- English proof email links must use `/en/customer-results/?utm_source=manual_outreach&utm_medium=email&utm_campaign=[niche]_demo`.
- Portuguese proof email links must use `/customer-results/?utm_source=manual_outreach&utm_medium=email&utm_campaign=[niche]_demo`.
- Keep the normal tool link after the proof link so the prospect can self-test immediately.

## First email structure

Subject:
Quick way to clean product photos in batches

Body shape:

Hi,

I found [store] and noticed your [niche] photos could benefit from a faster way to create clean, consistent catalog images.

We built BatchCutout for small ecommerce teams that need to remove backgrounds from product photos in batches, export transparent PNGs, and download everything as one ZIP.

I put together a visual proof page so you can see the result before testing it:
https://batchcutout.com/en/customer-results/?utm_source=manual_outreach&utm_medium=email&utm_campaign=[niche]_demo

You can test 2 images free here, no account or card needed:
https://batchcutout.com/?utm_source=manual_outreach&utm_medium=email&utm_campaign=[niche]#tool

If you need larger batches after testing, Pro unlocks up to 100 images per batch and 2,000 images per month. The current founder plan is 15 EUR/month.

If this is not relevant, reply "no thanks" and I will not contact you again.

Thanks,
Ricardo
NexaFlow Labs

## Partner email structure

Subject:
Batch background removal for ecommerce photo workflows

Use this for product photographers, ecommerce assistants and small agencies. The message should position BatchCutout as a utility for repeat cutouts before final editing or client delivery, not as a replacement for their service.

The partner email must link to the visual proof page first:

https://batchcutout.com/en/customer-results/?utm_source=manual_outreach&utm_medium=email&utm_campaign=partner_outreach_demo

Then point to the self-service test:

https://batchcutout.com/?utm_source=manual_outreach&utm_medium=email&utm_campaign=partner_outreach#tool

Do not ask the prospect to send product images for evaluation. If they reply with images anyway, answer normally and also point them to the free test.

## Follow-up

Send only once, 3 to 4 business days after the first contact.

Subject:
Re: product photo batches

Body:

Hi,

Quick follow-up. BatchCutout is useful if you regularly prepare product photos for listings and want transparent PNGs or ZIP export without editing one by one.

You can test it free with 2 images:
https://batchcutout.com/?utm_source=manual_outreach&utm_medium=email&utm_campaign=founder_first_customers_followup#tool

No account or card is needed for the free test. If you need larger batches after testing, Pro unlocks up to 100 images per batch and 2,000 images per month.

If this is not relevant, reply "no thanks" and I will not contact you again.

Thanks,
Ricardo

## Proof collection

When a user replies positively, pays, or shares approved example photos:

- Ask for permission before using images.
- Collect one before image, one after image, store type, country and one short quote.
- Offer anonymous attribution.
- Add approved proof to the website only after at least 3 credible examples exist.

The consent text is kept in `FIRST-CUSTOMER-PROOF-KIT.md`.

## Daily routine

1. Open `/admin`.
2. Review replies in `support@batchcutout.com`.
3. Send or submit only the highest-score ready prospects.
4. Record status, follow-up date, `outreach_variant` and notes in `sales-outreach-prospects-2026-06-30.csv`.
5. Stop contacting any lead that replies negatively.
