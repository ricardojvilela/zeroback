import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

const rootDir = process.cwd();
const toolsDir = process.env.VIDEO_TOOLS_DIR || path.join(process.env.TEMP || process.env.TMP || "", "batchcutout-video-tools");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.join(rootDir, "assets", "video");
const productImagePath = path.join(rootDir, "assets", "product-before-after-v5.png");

if (!existsSync(chromePath)) {
  throw new Error(`Chrome not found at ${chromePath}`);
}

const { chromium } = require(path.join(toolsDir, "node_modules", "playwright-core"));
const ffmpeg = require(path.join(toolsDir, "node_modules", "@ffmpeg-installer", "ffmpeg"));

const specs = [
  {
    name: "horizontal",
    width: 1920,
    height: 1080,
    fileBase: "batchcutout-demo-horizontal",
    posterBase: "batchcutout-demo-horizontal-poster",
  },
  {
    name: "vertical",
    width: 1080,
    height: 1920,
    fileBase: "batchcutout-demo-vertical",
    posterBase: "batchcutout-demo-vertical-poster",
  },
];

const durationMs = 22000;

function pageHtml() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #f7f5ef;
      }
      canvas {
        display: block;
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <canvas id="stage"></canvas>
    <script>
      const canvas = document.querySelector("#stage");
      const ctx = canvas.getContext("2d");
      const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
      const ease = (value) => {
        const t = clamp(value);
        return t * t * (3 - 2 * t);
      };

      function fitRect(srcW, srcH, dstX, dstY, dstW, dstH, cover = true) {
        const scale = cover ? Math.max(dstW / srcW, dstH / srcH) : Math.min(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        return {
          x: dstX + (dstW - w) / 2,
          y: dstY + (dstH - h) / 2,
          w,
          h,
        };
      }

      function roundRect(x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
      }

      function fillRound(x, y, w, h, r, color) {
        roundRect(x, y, w, h, r);
        ctx.fillStyle = color;
        ctx.fill();
      }

      function strokeRound(x, y, w, h, r, color, lineWidth = 2) {
        roundRect(x, y, w, h, r);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      function text(value, x, y, size, color, weight = 700, maxWidth = undefined, align = "left") {
        ctx.fillStyle = color;
        ctx.font = \`\${weight} \${size}px Arial, Helvetica, sans-serif\`;
        ctx.textAlign = align;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(value, x, y, maxWidth);
      }

      function wrapText(value, x, y, size, lineHeight, color, weight, maxWidth) {
        ctx.font = \`\${weight} \${size}px Arial, Helvetica, sans-serif\`;
        const words = value.split(" ");
        let line = "";
        let currentY = y;
        ctx.fillStyle = color;
        ctx.textBaseline = "alphabetic";
        for (const word of words) {
          const test = line ? \`\${line} \${word}\` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
      }

      function drawChecker(x, y, w, h, cell) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        for (let yy = y; yy < y + h; yy += cell) {
          for (let xx = x; xx < x + w; xx += cell) {
            const odd = (Math.floor((xx - x) / cell) + Math.floor((yy - y) / cell)) % 2;
            ctx.fillStyle = odd ? "#f0f2f5" : "#ffffff";
            ctx.fillRect(xx, yy, cell, cell);
          }
        }
        ctx.restore();
      }

      function drawImageCrop(image, source, dest) {
        const [sx, sy, sw, sh] = source;
        const fit = fitRect(sw, sh, dest.x, dest.y, dest.w, dest.h, true);
        ctx.drawImage(image, sx, sy, sw, sh, fit.x, fit.y, fit.w, fit.h);
      }

      function drawFrame(spec, image, progress) {
        const w = spec.width;
        const h = spec.height;
        canvas.width = w;
        canvas.height = h;
        const vertical = h > w;
        const p = clamp(progress);
        const palette = {
          ink: "#171a20",
          muted: "#5d6472",
          line: "#d8ddd2",
          green: "#0f6b4f",
          teal: "#0c8a7d",
          blue: "#125bdc",
          soft: "#f7f5ef",
          white: "#ffffff",
          yellow: "#f1c84b",
        };

        ctx.fillStyle = palette.soft;
        ctx.fillRect(0, 0, w, h);
        const grid = vertical ? 54 : 64;
        ctx.strokeStyle = "rgba(23, 26, 32, 0.05)";
        ctx.lineWidth = 1;
        for (let x = -grid; x < w + grid; x += grid) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + h * 0.15, h);
          ctx.stroke();
        }

        const mx = vertical ? 72 : 96;
        const top = vertical ? 86 : 72;
        const mainX = vertical ? mx : 900;
        const mainY = vertical ? 610 : 150;
        const mainW = vertical ? w - mx * 2 : 900;
        const mainH = vertical ? 780 : 690;
        const titleX = mx;
        const titleY = top;
        const titleW = vertical ? w - mx * 2 : 720;
        const scene = p * 5;

        text("BatchCutout", titleX, titleY, vertical ? 48 : 52, palette.ink, 900);
        text("NexaFlow Labs", titleX, titleY + (vertical ? 46 : 50), vertical ? 22 : 24, palette.green, 700);

        let headline = "Remove product backgrounds in batches";
        let subline = "Test 2 images free. Upgrade only when you need volume.";
        if (scene >= 1 && scene < 2) {
          headline = "Upload product photos";
          subline = "Drag images in. No account or card for the free test.";
        } else if (scene >= 2 && scene < 3) {
          headline = "BatchCutout removes the background";
          subline = "Keep the product, remove the busy scene around it.";
        } else if (scene >= 3 && scene < 4) {
          headline = "Download transparent PNGs";
          subline = "Use clean cutouts in stores, marketplaces and catalogues.";
        } else if (scene >= 4) {
          headline = "Pro handles larger batches";
          subline = "100 images per batch. 2,000 images per month.";
        }

        const headSize = vertical ? 58 : 68;
        const lineH = vertical ? 66 : 76;
        const afterHeadlineY = wrapText(headline, titleX, titleY + (vertical ? 145 : 150), headSize, lineH, palette.ink, 900, titleW);
        const afterSublineY = wrapText(subline, titleX, afterHeadlineY + 8, vertical ? 31 : 34, vertical ? 43 : 46, palette.muted, 500, titleW);

        const ctaY = Math.max(vertical ? 430 : 445, afterSublineY + (vertical ? 24 : 30));
        fillRound(titleX, ctaY, vertical ? 470 : 505, vertical ? 72 : 74, 12, palette.ink);
        text("batchcutout.com", titleX + (vertical ? 34 : 36), ctaY + (vertical ? 47 : 49), vertical ? 28 : 30, palette.white, 800);
        fillRound(titleX, ctaY + (vertical ? 94 : 98), vertical ? 360 : 390, vertical ? 54 : 58, 9, "#e7f2ee");
        text("2-image free test", titleX + (vertical ? 24 : 26), ctaY + (vertical ? 130 : 136), vertical ? 22 : 24, palette.green, 800);

        fillRound(mainX, mainY, mainW, mainH, 28, "#ffffff");
        strokeRound(mainX, mainY, mainW, mainH, 28, "rgba(23, 26, 32, 0.13)", 2);
        fillRound(mainX + 28, mainY + 28, mainW - 56, 54, 16, "#f2f4f0");
        text("BatchCutout workspace", mainX + 56, mainY + 65, vertical ? 22 : 24, palette.ink, 800);
        fillRound(mainX + mainW - 235, mainY + 38, 174, 34, 8, "#e7f2ee");
        text("Pro ready", mainX + mainW - 207, mainY + 63, 18, palette.green, 800);

        const contentX = mainX + (vertical ? 44 : 54);
        const contentY = mainY + 112;
        const contentW = mainW - (vertical ? 88 : 108);
        const contentH = mainH - 154;
        const beforeSrc = [0, 0, image.naturalWidth / 2, image.naturalHeight];
        const afterSrc = [image.naturalWidth / 2, 0, image.naturalWidth / 2, image.naturalHeight];

        const uploadAlpha = clamp(1 - (scene - 1.65) / 0.55);
        ctx.globalAlpha = uploadAlpha;
        fillRound(contentX, contentY, contentW, contentH, 24, "#f8faf7");
        strokeRound(contentX, contentY, contentW, contentH, 24, "rgba(15, 107, 79, 0.35)", 3);
        text("Drop product photos here", contentX + 42, contentY + 72, vertical ? 32 : 34, palette.ink, 850);
        text("JPG, PNG, WebP", contentX + 42, contentY + 112, vertical ? 23 : 24, palette.muted, 600);
        const tileW = vertical ? 240 : 250;
        const tileH = vertical ? 200 : 220;
        const tileY = contentY + (vertical ? 170 : 175);
        for (let i = 0; i < 3; i++) {
          const tx = contentX + 42 + i * (tileW + 24);
          fillRound(tx, tileY + Math.sin((p * 20) + i) * 6, tileW, tileH, 18, "#ffffff");
          strokeRound(tx, tileY + Math.sin((p * 20) + i) * 6, tileW, tileH, 18, "rgba(23, 26, 32, 0.12)", 2);
          drawImageCrop(image, beforeSrc, { x: tx + 12, y: tileY + 12 + Math.sin((p * 20) + i) * 6, w: tileW - 24, h: tileH - 24 });
        }
        fillRound(contentX + 42, contentY + contentH - 108, contentW - 84, 28, 14, "#dfe9dd");
        fillRound(contentX + 42, contentY + contentH - 108, (contentW - 84) * clamp((scene - 1) / 1.1), 28, 14, palette.green);
        text("Processing batch...", contentX + 42, contentY + contentH - 46, vertical ? 24 : 25, palette.muted, 700);
        ctx.globalAlpha = 1;

        const resultAlpha = ease((scene - 1.5) / 0.55);
        ctx.globalAlpha = resultAlpha;
        const gap = vertical ? 26 : 32;
        const panelW = vertical ? contentW : (contentW - gap) / 2;
        const panelH = vertical ? (contentH - gap) / 2 : contentH;
        const beforeDest = { x: contentX, y: contentY, w: panelW, h: panelH };
        const afterDest = vertical
          ? { x: contentX, y: contentY + panelH + gap, w: panelW, h: panelH }
          : { x: contentX + panelW + gap, y: contentY, w: panelW, h: panelH };

        fillRound(beforeDest.x, beforeDest.y, beforeDest.w, beforeDest.h, 22, "#ffffff");
        strokeRound(beforeDest.x, beforeDest.y, beforeDest.w, beforeDest.h, 22, "rgba(23, 26, 32, 0.11)", 2);
        ctx.save();
        roundRect(beforeDest.x, beforeDest.y, beforeDest.w, beforeDest.h, 22);
        ctx.clip();
        drawImageCrop(image, beforeSrc, beforeDest);
        ctx.restore();
        fillRound(beforeDest.x + 22, beforeDest.y + 22, 112, 42, 10, "rgba(23, 26, 32, 0.80)");
        text("Before", beforeDest.x + 42, beforeDest.y + 51, 21, "#ffffff", 800);

        fillRound(afterDest.x, afterDest.y, afterDest.w, afterDest.h, 22, "#ffffff");
        ctx.save();
        roundRect(afterDest.x, afterDest.y, afterDest.w, afterDest.h, 22);
        ctx.clip();
        drawChecker(afterDest.x, afterDest.y, afterDest.w, afterDest.h, 34);
        drawImageCrop(image, afterSrc, afterDest);
        if (scene < 3.25) {
          const wipe = ease((scene - 2.2) / 0.9);
          ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
          ctx.fillRect(afterDest.x + afterDest.w * wipe, afterDest.y, afterDest.w * (1 - wipe), afterDest.h);
          ctx.strokeStyle = palette.blue;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(afterDest.x + afterDest.w * wipe, afterDest.y + 12);
          ctx.lineTo(afterDest.x + afterDest.w * wipe, afterDest.y + afterDest.h - 12);
          ctx.stroke();
        }
        ctx.restore();
        strokeRound(afterDest.x, afterDest.y, afterDest.w, afterDest.h, 22, "rgba(18, 91, 220, 0.32)", 3);
        fillRound(afterDest.x + 22, afterDest.y + 22, 100, 42, 10, palette.blue);
        text("After", afterDest.x + 43, afterDest.y + 51, 21, "#ffffff", 800);
        ctx.globalAlpha = 1;

        const exportAlpha = ease((scene - 3.1) / 0.55);
        ctx.globalAlpha = exportAlpha;
        const dockW = vertical ? contentW - 70 : 560;
        const dockH = vertical ? 154 : 142;
        const dockX = contentX + contentW - dockW - 35;
        const dockY = contentY + contentH - dockH - 34;
        fillRound(dockX, dockY, dockW, dockH, 20, "rgba(23, 26, 32, 0.88)");
        text("Export ready", dockX + 34, dockY + 48, vertical ? 26 : 28, "#ffffff", 850);
        fillRound(dockX + 34, dockY + 72, 150, 46, 9, palette.yellow);
        text("PNG", dockX + 76, dockY + 103, 22, palette.ink, 900);
        fillRound(dockX + 204, dockY + 72, 140, 46, 9, "#ffffff");
        text("ZIP", dockX + 254, dockY + 103, 22, palette.ink, 900);
        ctx.globalAlpha = 1;

        const finalAlpha = ease((scene - 4.05) / 0.55);
        ctx.globalAlpha = finalAlpha;
        const finalH = vertical ? 156 : 112;
        const finalY = vertical ? h - 260 : h - 154;
        fillRound(mx, finalY, w - mx * 2, finalH, 18, "#0f6b4f");
        text("Founder plan: 15 EUR/month", mx + 34, finalY + (vertical ? 54 : 44), vertical ? 32 : 28, "#ffffff", 900);
        const detail = "100 images per batch • 2,000 per month • cancel anytime";
        wrapText(detail, mx + 34, finalY + (vertical ? 104 : 82), vertical ? 24 : 24, vertical ? 35 : 30, "#d8f3e8", 650, vertical ? w - mx * 2 - 68 : 780);
        if (!vertical) {
          text("Test free first", w - mx - 34, finalY + 70, 27, "#ffffff", 900, undefined, "right");
        }
        ctx.globalAlpha = 1;
      }

      async function createVideo({ spec, imageData, durationMs }) {
        const image = new Image();
        image.src = imageData;
        await image.decode();
        drawFrame(spec, image, 0);

        const mimeTypes = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
        ];
        const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
        if (!mimeType) throw new Error("No supported MediaRecorder format");

        const chunks = [];
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: spec.name === "vertical" ? 7_000_000 : 8_000_000,
        });
        recorder.ondataavailable = (event) => {
          if (event.data?.size) chunks.push(event.data);
        };

        await new Promise((resolve, reject) => {
          recorder.onerror = () => reject(recorder.error || new Error("Recorder failed"));
          recorder.onstop = resolve;
          recorder.start(100);
          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            drawFrame(spec, image, Math.min(elapsed / durationMs, 1));
            if (elapsed < durationMs) {
              requestAnimationFrame(tick);
            } else {
              drawFrame(spec, image, 1);
              setTimeout(() => recorder.stop(), 250);
            }
          }
          requestAnimationFrame(tick);
        });

        const videoBlob = new Blob(chunks, { type: mimeType });
        drawFrame(spec, image, 0.86);
        const poster = canvas.toDataURL("image/png");
        return {
          video: Array.from(new Uint8Array(await videoBlob.arrayBuffer())),
          poster,
          mimeType,
        };
      }
    </script>
  </body>
</html>`;
}

async function renderSpec(browser, spec, imageData) {
  const page = await browser.newPage({ viewport: { width: spec.width, height: spec.height } });
  await page.setContent(pageHtml(), { waitUntil: "load" });
  const result = await page.evaluate(
    async ({ spec: browserSpec, imageData: browserImageData, durationMs: browserDurationMs }) =>
      window.createVideo({ spec: browserSpec, imageData: browserImageData, durationMs: browserDurationMs }),
    { spec, imageData, durationMs },
  );
  await page.close();

  const webmPath = path.join(toolsDir, `${spec.fileBase}.webm`);
  const mp4Path = path.join(outputDir, `${spec.fileBase}.mp4`);
  const posterPath = path.join(outputDir, `${spec.posterBase}.png`);
  await writeFile(webmPath, Buffer.from(result.video));
  await writeFile(posterPath, Buffer.from(result.poster.split(",")[1], "base64"));

  await execFileAsync(ffmpeg.path, [
    "-y",
    "-i",
    webmPath,
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-vf",
    `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
    mp4Path,
  ]);

  return { webmPath, mp4Path, posterPath, mimeType: result.mimeType };
}

await mkdir(outputDir, { recursive: true });
const imageBase64 = await readFile(productImagePath, "base64");
const imageData = `data:image/png;base64,${imageBase64}`;

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});

try {
  const outputs = [];
  for (const spec of specs) {
    outputs.push(await renderSpec(browser, spec, imageData));
  }
  console.log(JSON.stringify(outputs, null, 2));
} finally {
  await browser.close();
}
