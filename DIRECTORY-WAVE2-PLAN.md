# BatchCutout - directory wave 2

Updated: 2026-07-05

Goal: add a second acquisition wave without mass-submitting to weak directories. Use only platforms with relevant audience, durable listing value, or comparison-search intent.

## Research notes

- Smol Launch's 2026 directory guide recommends a narrow shortlist over mass submissions and names Smol Launch, Product Hunt and Launching Next as the strongest default trio for indie products.
- The same guide names AlternativeTo as useful for comparison-shopping traffic and recommends only three or four launch-week submissions, then one or two more per quarter.
- AlternativeTo's FAQ says new applications are submitted through "Suggest new application", require fields such as platform, license, description and tags, and are reviewed before approval. New accounts may need to wait one week before submitting.
- Startup Stash has a public "List A Product" path and positions itself as a large directory of tools and resources for startups.
- AISO's 2026 AI directory list recommends focusing on quality platforms, relevant categories and avoiding spammy broad submissions.

Sources checked:

- https://smollaunch.com/best-of/directories-to-submit-startup-2026
- https://alternativeto.net/faq/
- https://startupstash.com/add-listing/
- https://aiso.blog/best-directories-ai-tools/

## Priority order

1. Smol Launch
2. Launching Next
3. AlternativeTo
4. Startup Stash
5. AI Tools Directory or Best AI Brands only if the category fit is accepted as AI image/productivity, not generic AI spam

## Source names

Use these exact `utm_source` values so `/admin` groups traffic cleanly:

- `smol_launch`
- `launching_next`
- `alternativeto`
- `startup_stash`
- `ai_tools_directory`
- `best_ai_brands`

## Links

Smol Launch:
https://batchcutout.com/launch/?utm_source=smol_launch&utm_medium=directory&utm_campaign=directory_wave2

Launching Next:
https://batchcutout.com/launch/?utm_source=launching_next&utm_medium=directory&utm_campaign=directory_wave2

AlternativeTo:
https://batchcutout.com/en/remove-bg-alternative-for-bulk-product-photos/?utm_source=alternativeto&utm_medium=comparison&utm_campaign=directory_wave2

Startup Stash:
https://batchcutout.com/launch/?utm_source=startup_stash&utm_medium=directory&utm_campaign=directory_wave2

AI Tools Directory:
https://batchcutout.com/launch/?utm_source=ai_tools_directory&utm_medium=ai_directory&utm_campaign=directory_wave2

Best AI Brands:
https://batchcutout.com/launch/?utm_source=best_ai_brands&utm_medium=ai_directory&utm_campaign=directory_wave2

## Submission payload

Product name:
BatchCutout

Tagline:
Bulk background remover for ecommerce product photos.

Short description:
BatchCutout removes backgrounds from product photos in batches and exports transparent PNGs or one organized ZIP for ecommerce workflows.

Category:
Ecommerce tools, image tools, product photography, marketplace seller tools.

Tags:
background remover, ecommerce, product photos, transparent PNG, batch editing, Shopify, Etsy, WooCommerce, Amazon, eBay.

Logo:
`favicon.svg`

Primary image:
`assets/social-preview.png`

Screenshots:

- `assets/product-before-after-v5.png`
- `assets/use-cases-proof.webp`

## Platform-specific notes

Smol Launch:
Submit the main launch URL. If it requires a badge for a dofollow path, do not add a visible badge to the site without review; use the free standard listing first.

Launching Next:
Submit the main launch URL with the same tagline and description. Use it mainly for durable directory presence.

AlternativeTo:
Submit BatchCutout as a web app. Suggested alternatives should be relevant comparison pages only, for example remove.bg, Photoroom, Pixelcut and Canva background remover workflows. Do not imply affiliation.

Startup Stash:
Use the "List A Product" route and the ecommerce/productivity category where available.

AI directories:
Use only if the form accepts browser-based AI/image utilities. Position BatchCutout as an ecommerce image workflow, not a generic AI assistant.

## Tracking checklist

- After each submission, open the submitted URL and confirm it uses the correct `utm_source`.
- Watch `/admin` source table for the source name.
- If visitors arrive but do not upload, revise the launch-page hero copy.
- If uploads happen but pricing clicks do not, revise post-download and pricing CTAs.
- If pricing clicks happen but checkout does not, inspect pricing-page friction before adding more directories.
