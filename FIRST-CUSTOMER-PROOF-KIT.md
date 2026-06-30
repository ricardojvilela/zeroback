# BatchCutout - first customer proof kit

Goal: collect real proof without inventing testimonials or publishing customer images without consent.

## Who to ask first

- Paying users who processed at least one useful batch.
- Free users who downloaded PNG/ZIP and replied positively.
- Store owners or assistants who can show product photos publicly.

Operational support:

- `/admin` now lists Pro/manual users as proof candidates.
- Email templates are available in `emails/proof-request.html` and `emails/proof-request-pt.html`.
- SQL review query is available in `CUSTOMER-RECOVERY-SEGMENTS.sql`.

## Message to request permission

Subject:
Can we feature your BatchCutout workflow?

Message:
Hi,

Thanks for using BatchCutout.

We are collecting a few real ecommerce workflows to show how sellers prepare product photos in batches. Would you be open to sharing:

- 1 before image and 1 after image;
- your store type, for example Shopify, Etsy, WooCommerce, Amazon, or eBay;
- one short sentence about what BatchCutout helped you do;
- permission for NexaFlow Labs to show that example on the BatchCutout website and marketing pages.

We can show your store name or keep it anonymous.

Thanks,
NexaFlow Labs

## Consent text to store

I give NexaFlow Labs permission to use the submitted before/after product images, store type, and quote to promote BatchCutout on its website, ads, emails, and social channels. I confirm that I have the rights to share these images. I understand I can ask NexaFlow Labs to remove the material from future marketing use.

## Proof fields

- Customer email
- Store or company name
- Store type
- Country
- Before image file
- After image file
- Quote
- Permission status
- Date permission granted
- Public attribution preference: named / anonymous

## Site section to add after first 3 approvals

Headline:
Real product batches cleaned with BatchCutout

Cards:

- Store type
- Batch size
- Before/after image
- Short quote

Rules:

- Do not use fake quotes.
- Do not use images without written permission.
- Do not publish private store data.
- Keep the section small until there are at least 3 credible examples.
