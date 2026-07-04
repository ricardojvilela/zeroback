# BatchCutout - focused Search execution

Status: active and verified on 2026-06-30.

## Rule for competitor-intent campaigns

Google Ads can target competitor searches with keywords, but keep competitor names out of ad headlines and descriptions to reduce trademark review risk. Use competitor names only in the keyword set and on the destination pages where the comparison is factual and clearly independent.

Reference:
https://support.google.com/adspolicy/answer/6118

Google Ads text limits used for prepared RSA assets:
https://support.google.com/google-ads/answer/1704389

## Budget

Do not increase total launch spend above 10 EUR/day yet.

Current allocation:

- `Search - BatchCutout - Pro Launch`: 8 EUR/day.
- `Search - BatchCutout - Alternatives`: 2 EUR/day.

Total active Search budget: 10 EUR/day.

## New campaign

Name:
Search - BatchCutout - Alternatives

Settings:

- Status: active.
- Campaign ID: `23991783535`.
- Network: Google Search only.
- Search partners: off.
- Display Network: off.
- Languages: English.
- Locations: United States, United Kingdom, Canada, Australia, Ireland.
- Bid strategy: Maximize conversions.
- Conversion goal: account default `Subscribe`, backed by `Pro Paid Subscription BatchCutout`.
- Daily budget: 2 EUR/day.

Verified on 2026-06-30:

- `Search - BatchCutout - Pro Launch` uses account-default conversion goal `Subscrever` and `Maximizar as conversoes`.
- `Search - BatchCutout - Alternatives` uses account-default conversion goal `Subscrever` and `Maximizar as conversoes`.
- Broad match and Search Max / Maxima IA recommendations were not applied yet.

## Ad groups

### remove.bg alternative

Landing page:
https://batchcutout.com/en/remove-bg-alternative-for-bulk-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=remove_bg_alternative&utm_content=search

Keywords:

- [remove.bg alternative]
- [remove bg alternative]
- [remove.bg bulk background remover]
- [remove bg bulk background remover]
- [remove.bg for product photos]
- [remove.bg pricing alternative]
- "remove.bg alternative"
- "remove bg alternative"
- "remove.bg bulk"
- "remove.bg product photos"

### Photoroom alternative

Landing page:
https://batchcutout.com/en/photoroom-alternative-for-ecommerce/?utm_source=google_ads&utm_medium=cpc&utm_campaign=photoroom_alternative&utm_content=search

Keywords:

- [photoroom alternative]
- [photoroom for ecommerce]
- [photoroom product photos]
- [photoroom bulk background remover]
- [photoroom pricing alternative]
- "photoroom alternative"
- "photoroom for ecommerce"
- "photoroom product photos"
- "photoroom bulk background remover"

### Pixelcut alternative

Landing page:
https://batchcutout.com/en/pixelcut-alternative-for-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=pixelcut_alternative&utm_content=search

Keywords:

- [pixelcut alternative]
- [pixelcut product photos]
- [pixelcut background remover alternative]
- [pixelcut bulk background remover]
- [pixelcut pricing alternative]
- "pixelcut alternative"
- "pixelcut product photos"
- "pixelcut background remover"
- "pixelcut bulk background remover"

### Canva alternative

Landing page:
https://batchcutout.com/en/canva-background-remover-alternative-for-product-photos/?utm_source=google_ads&utm_medium=cpc&utm_campaign=canva_alternative&utm_content=search

Keywords:

- [canva background remover alternative]
- [canva alternative for product photos]
- [canva product photo background remover]
- [canva bulk background remover]
- [canva background remover ecommerce]
- [canva pro background remover alternative]
- "canva background remover alternative"
- "canva product photo background remover"
- "canva bulk background remover"
- "canva alternative product photos"

## Ad copy

Do not use remove.bg, Photoroom, Pixelcut, or Canva in the ad text.

Headlines:

- Bulk Product Cutouts
- Remove Backgrounds Fast
- Transparent PNG Export
- Product Photos To PNG
- Export One ZIP
- Built For Ecommerce
- BatchCutout For Shops
- Try 2 Images Free
- Pro From EUR 15/Month
- 100 Images Per Batch
- Clean Product Photos
- Browser-Based Workflow

Descriptions:

- Remove backgrounds from product photos in batch and export transparent PNGs or ZIP.
- Built for ecommerce teams that need repeat product image cutouts, not a full design suite.
- Try 2 images free. Pro supports 100 images per batch and 2,000 per month.
- Use BatchCutout for store pages, marketplaces, product ads and catalog updates.

## Negative keyword handling

Do not add `[removebg]`, `[remove.bg]`, `[photoroom]`, `[pixelcut]`, or `[canva]` as account-level negatives. They can block this campaign.

Use competitor-name negatives only inside non-alternative campaigns if those campaigns start wasting spend on competitor searches.

Keep these negatives on the alternatives campaign:

- free
- free app
- tutorial
- coupon
- promo code
- cracked
- apk
- job
- hiring
- wallpaper
- video background
- passport photo
- logo maker
- presentation
- resume
- template
- templates
- poster
- flyer
- font
- logo design

## Import files

Files prepared for Google Ads Editor or manual bulk import:

- `google-ads-imports/batchcutout-competitor-campaigns.csv`
- `google-ads-imports/batchcutout-competitor-keywords.csv`
- `google-ads-imports/batchcutout-competitor-responsive-ads.csv`
- `google-ads-imports/batchcutout-competitor-negatives.csv`

## Prepared Spanish campaign

Status: prepared only. Do not import as active without Ricardo approving spend.

Campaign:
`Search - BatchCutout - ES - Producto Lote`

Import files:

- `google-ads-imports/batchcutout-spanish-product-campaign.csv`
- `google-ads-imports/batchcutout-spanish-product-adgroups.csv`
- `google-ads-imports/batchcutout-spanish-product-keywords.csv`
- `google-ads-imports/batchcutout-spanish-product-rsa.csv`
- `google-ads-imports/batchcutout-spanish-product-negatives.csv`
- `google-ads-imports/batchcutout-spanish-platform-adgroups.csv`
- `google-ads-imports/batchcutout-spanish-platform-keywords.csv`
- `google-ads-imports/batchcutout-spanish-platform-rsa.csv`

Initial setup in the files:

- Status: paused.
- Budget: 2 EUR/day.
- Language: Spanish.
- Locations: Spain, United States, Mexico, Chile, Colombia.
- Core ad groups: `quitar fondo fotos producto` and `removedor fondos lote`.
- Prepared platform ad groups: `shopify fotos producto`, `woocommerce fotos producto`, `etsy fotos producto`, `ebay fotos producto` and `amazon fotos producto`.
- Core landing pages: `/es/quitar-fondo-fotos-producto-lote/` and `/es/`.
- Platform landing pages: `/es/quitar-fondo-fotos-shopify/`, `/es/quitar-fondo-fotos-woocommerce/`, `/es/quitar-fondo-fotos-etsy/`, `/es/quitar-fondo-fotos-ebay/` and `/es/quitar-fondo-fotos-amazon/`.
- Conversion goal: use the same account-default subscription goal when imported.

Activation rule:

- Start only if the total Search budget remains at or below the approved limit, or if Ricardo explicitly approves a new budget.
- Review after 48 hours or 20 clicks.
- Keep only search terms that produce upload, download, Pro click, checkout start or paid subscription.

## Prepared Spanish alternatives campaign

Status: prepared only. Do not import as active without Ricardo approving spend.

Campaign:
`Search - BatchCutout - ES - Alternatives`

Import files:

- `google-ads-imports/batchcutout-spanish-alternatives-campaign.csv`
- `google-ads-imports/batchcutout-spanish-alternatives-adgroups.csv`
- `google-ads-imports/batchcutout-spanish-alternatives-keywords.csv`
- `google-ads-imports/batchcutout-spanish-alternatives-rsa.csv`
- `google-ads-imports/batchcutout-spanish-alternatives-negatives.csv`

Initial setup in the files:

- Status: paused.
- Budget: 2 EUR/day.
- Language: Spanish.
- Locations: Spain, United States, Mexico, Chile, Colombia.
- Ad groups: `remove bg alternativa`, `photoroom alternativa`, `pixelcut alternativa` and `canva alternativa`.
- Landing pages: Spanish alternative-intent pages for remove.bg, Photoroom, Pixelcut and Canva.
- Ad copy does not use competitor names in headlines or descriptions.
- Competitor names are not added as negatives inside this campaign.
- Conversion goal: use the same account-default subscription goal when imported.

Activation rule:

- Start only if the total Search budget remains at or below the approved limit, or if Ricardo explicitly approves a new budget.
- Keep this campaign separate from generic Spanish product searches so competitor-intent terms can be paused independently.
- Review after 48 hours or 20 clicks.
- Keep only search terms that produce upload, download, Pro click, checkout start or paid subscription.

## First review

Review after 48 hours from activation or 20 clicks, whichever comes first.

Keep only traffic that creates at least one of these signals:

- upload started;
- result ready;
- download;
- Pro click;
- checkout started;
- paid subscription.

Pause any ad group that spends 1.5x monthly plan value without account creation, checkout, or paid subscription.
