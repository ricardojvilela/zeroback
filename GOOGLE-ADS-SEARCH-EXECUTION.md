# BatchCutout - focused Search execution

Status: ready to apply. Keep new campaigns paused until the final budget confirmation.

## Rule for competitor-intent campaigns

Google Ads can target competitor searches with keywords, but keep competitor names out of ad headlines and descriptions to reduce trademark review risk. Use competitor names only in the keyword set and on the destination pages where the comparison is factual and clearly independent.

Reference:
https://support.google.com/adspolicy/answer/6118

## Budget

Do not increase total launch spend above 10 EUR/day yet.

Recommended allocation:

- Core ecommerce/background removal intent: 8 EUR/day total.
- Competitor alternative intent: 2 EUR/day.

If an existing Search campaign is already spending 10 EUR/day, reduce the weakest current campaign/ad group by 2 EUR/day before enabling the competitor campaign.

## New campaign

Name:
Search - BatchCutout - Alternatives

Settings:

- Status: paused until final activation.
- Network: Google Search only.
- Search partners: off.
- Display Network: off.
- Languages: English.
- Locations: United States, United Kingdom, Canada, Australia, Ireland.
- Bid strategy: Maximize conversions.
- Primary conversion: Pro Paid Subscription BatchCutout.
- Daily budget after activation: 2 EUR/day.

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

## Ad copy

Do not use remove.bg, Photoroom, or Pixelcut in the ad text.

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

Do not add `[removebg]`, `[remove.bg]`, `[photoroom]`, or `[pixelcut]` as account-level negatives. They can block this campaign.

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

## Import files

Files prepared for Google Ads Editor or manual bulk import:

- `google-ads-imports/batchcutout-competitor-campaigns.csv`
- `google-ads-imports/batchcutout-competitor-keywords.csv`
- `google-ads-imports/batchcutout-competitor-responsive-ads.csv`
- `google-ads-imports/batchcutout-competitor-negatives.csv`

## First review

Review after 48 hours or 20 clicks, whichever comes first.

Keep only traffic that creates at least one of these signals:

- upload started;
- result ready;
- download;
- Pro click;
- checkout started;
- paid subscription.

Pause any ad group that spends 1.5x monthly plan value without account creation, checkout, or paid subscription.
