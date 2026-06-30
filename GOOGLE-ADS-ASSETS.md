# BatchCutout - Google Ads assets to apply

Use these assets with the existing Search campaign. Keep the current prices unchanged.

## Final URLs

Bulk:
https://batchcutout.com/en/bulk-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=bulk_background_remover&utm_content=search

Shopify:
https://batchcutout.com/en/remove-background-for-shopify/?utm_source=google_ads&utm_medium=cpc&utm_campaign=shopify_background_remover&utm_content=search

Etsy:
https://batchcutout.com/en/etsy-product-photo-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=etsy_background_remover&utm_content=search

Pricing:
https://batchcutout.com/pricing/?lang=en&utm_source=google_ads&utm_medium=cpc&utm_campaign=pro_pricing&utm_content=search

Long-tail SEO/search pages:

Product photo background remover:
https://batchcutout.com/en/product-photo-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=product_photo_background_remover&utm_content=search

Ecommerce background remover:
https://batchcutout.com/en/background-remover-for-ecommerce/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ecommerce_background_remover&utm_content=search

Transparent PNG batch converter:
https://batchcutout.com/en/transparent-png-batch-converter/?utm_source=google_ads&utm_medium=cpc&utm_campaign=transparent_png_batch_converter&utm_content=search

AI product cutout tool:
https://batchcutout.com/en/ai-product-photo-cutout-tool/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ai_product_cutout_tool&utm_content=search

Amazon product background remover:
https://batchcutout.com/en/amazon-product-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=amazon_background_remover&utm_content=search

eBay product background remover:
https://batchcutout.com/en/ebay-product-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ebay_background_remover&utm_content=search

WooCommerce product background remover:
https://batchcutout.com/en/woocommerce-product-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=woocommerce_background_remover&utm_content=search

Remove white background from product photos:
https://batchcutout.com/en/remove-white-background-from-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=remove_white_background_product_photos&utm_content=search

remove.bg alternative:
https://batchcutout.com/en/remove-bg-alternative-for-bulk-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=remove_bg_alternative&utm_content=search

Photoroom alternative:
https://batchcutout.com/en/photoroom-alternative-for-ecommerce/?utm_source=google_ads&utm_medium=cpc&utm_campaign=photoroom_alternative&utm_content=search

Pixelcut alternative:
https://batchcutout.com/en/pixelcut-alternative-for-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=pixelcut_alternative&utm_content=search

## Sitelinks

Bulk Background Remover
Description 1: Remove backgrounds in batch
Description 2: Export PNGs or one ZIP
URL: https://batchcutout.com/en/bulk-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=sitelink_bulk

Shopify Photos
Description 1: Prepare product photos
Description 2: Built for store updates
URL: https://batchcutout.com/en/remove-background-for-shopify/?utm_source=google_ads&utm_medium=cpc&utm_campaign=sitelink_shopify

Etsy Photos
Description 1: Clean listing images
Description 2: Useful for shop updates
URL: https://batchcutout.com/en/etsy-product-photo-background-remover/?utm_source=google_ads&utm_medium=cpc&utm_campaign=sitelink_etsy

Plans
Description 1: Pro from EUR 15/month
Description 2: Up to 100 images per batch
URL: https://batchcutout.com/pricing/?lang=en&utm_source=google_ads&utm_medium=cpc&utm_campaign=sitelink_pricing

## Callouts

- Batch background removal
- Transparent PNG export
- ZIP download
- Built for product photos
- Ecommerce workflow
- Ideal for catalogs
- Useful for marketplaces
- Up to 100 images per batch
- Up to 2,000 images per month

## Structured snippets

Header: Use cases
Values:
- Shopify
- Etsy
- WooCommerce
- eBay
- Amazon
- Catalogs
- Product ads
- Marketplace listings

Header: Outputs
Values:
- Transparent PNG
- ZIP export
- Product cutouts
- Catalog images
- Listing photos

## Remarketing signals

The site sends a Google event named `batchcutout_audience_signal` for these funnel signals:

- `upload_started`: user started uploading product photos.
- `result_ready`: processed result became available.
- `pro_interest`: user clicked a Pro plan/CTA.
- `checkout_login_required`: user tried checkout before login.
- `checkout_started`: user reached Stripe checkout.
- `paid_customer`: paid subscription confirmed; use as exclusion from acquisition campaigns.

Build audiences from these signals when volume is sufficient. Start with observation/remarketing only; do not optimize cold search traffic to soft signals while paid subscription data is still sparse.

## Review routine

Every 48 hours:

- Add irrelevant search terms as negatives.
- Keep keywords that produce uploads, downloads, checkout starts, or paid subscriptions.
- Pause traffic that only produces page views.
- Move budget only toward origins with product usage or paid subscriptions.

## Competitor-intent page rules

- Use competitor alternative pages only for users already searching alternatives.
- Do not claim BatchCutout is universally better.
- Keep the message narrow: ecommerce batches, transparent PNGs, ZIP export, simple pricing.
- Exclude paid customers from acquisition campaigns when the `paid_customer` audience is large enough.
- Import/search execution files are in `GOOGLE-ADS-SEARCH-EXECUTION.md` and `google-ads-imports/`.
- Do not use competitor names in ad headlines/descriptions. Keep them in keywords and factual landing pages.
- Do not apply `[removebg]`, `[remove.bg]`, `[photoroom]` or `[pixelcut]` as account-level negatives, otherwise the alternative campaign can be blocked.
