# BatchCutout - demo video assets

Updated: 2026-07-02

## Files

Horizontal website/email version:

- Local: `assets/video/batchcutout-demo-horizontal.mp4`
- Public: `https://batchcutout.com/assets/video/batchcutout-demo-horizontal.mp4?v=20260702-no-sweep`
- Poster: `assets/video/batchcutout-demo-horizontal-poster.png`
- Format: 1920 x 1080, about 22 seconds, no audio.

Vertical social version:

- Local: `assets/video/batchcutout-demo-vertical.mp4`
- Public: `https://batchcutout.com/assets/video/batchcutout-demo-vertical.mp4?v=20260702-no-sweep`
- Poster: `assets/video/batchcutout-demo-vertical-poster.png`
- Format: 1080 x 1920, about 22 seconds, no audio.

Generation script:

- `tools/create-demo-video.mjs`
- Requires temporary local packages: `playwright-core` and `@ffmpeg-installer/ffmpeg`.
- It uses Chrome and the existing `assets/product-before-after-v5.png` image.

## Where it is used

- The horizontal MP4 is embedded on `/customer-results/`.
- `/admin` outreach templates link to `/customer-results/` when a prospect has `outreach_variant=demo_video`.
- The current 13 ready direct-email prospects are staged with `outreach_variant=demo_video`.
- Use the vertical MP4 for short-form social posts or direct social messages.
- Do not attach video files to cold outreach emails while the domain is warming. Prefer linking to the public page or video URL.

## Email line

Short line for manual outreach:

> I also made a 22-second demo so you can see the flow before testing it: https://batchcutout.com/customer-results/

For measurable manual outreach, use:

`https://batchcutout.com/customer-results/?utm_source=manual_outreach&utm_medium=email&utm_campaign=[niche]_demo`

## LinkedIn / social caption

BatchCutout removes backgrounds from product photos in batches.

Free test: 2 images, no card needed.
Pro: 100 images per batch and 2,000 per month.

https://batchcutout.com/

## Portuguese caption

O BatchCutout remove fundos de fotos de produto em lote.

Teste grátis: 2 imagens, sem cartão.
Pro: 100 imagens por lote e 2.000 por mês.

https://batchcutout.com/
