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
const sourceImagePath = path.join(rootDir, "assets", "product-before-after-v5.png");

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
      html,
      body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #f6f3ea;
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

      function text(value, x, y, size, color, weight = 700, maxWidth, align = "left") {
        ctx.fillStyle = color;
        ctx.font = \`\${weight} \${size}px Arial, Helvetica, sans-serif\`;
        ctx.textAlign = align;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(value, x, y, maxWidth);
      }

      function wrapText(value, x, y, size, lineHeight, color, weight, maxWidth) {
        ctx.font = \`\${weight} \${size}px Arial, Helvetica, sans-serif\`;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        const words = value.split(" ");
        let line = "";
        let currentY = y;

        for (const word of words) {
          const test = line ? \`\${line} \${word}\` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            currentY += lineHeight;
            line = word;
          } else {
            line = test;
          }
        }

        if (line) {
          ctx.fillText(line, x, currentY);
        }

        return currentY + lineHeight;
      }

      function drawContain(image, x, y, w, h, zoom = 1) {
        const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight) * zoom;
        const iw = image.naturalWidth * scale;
        const ih = image.naturalHeight * scale;
        const ix = x + (w - iw) / 2;
        const iy = y + (h - ih) / 2;
        ctx.drawImage(image, ix, iy, iw, ih);
      }

      function drawBackground(w, h) {
        ctx.fillStyle = "#f6f3ea";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(23, 26, 32, 0.055)";
        ctx.lineWidth = 1;
        const gap = Math.max(54, Math.round(w / 28));
        for (let x = -h; x < w + h; x += gap) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + h * 0.12, h);
          ctx.stroke();
        }
      }

      function sceneCopy(progress) {
        const scene = progress * 4;
        if (scene < 1) {
          return {
            title: "Remove product backgrounds in batches",
            body: "Test 2 images free. No card needed.",
          };
        }
        if (scene < 2) {
          return {
            title: "Turn busy product photos into clean cutouts",
            body: "Use the result in stores, marketplaces and catalogues.",
          };
        }
        if (scene < 3) {
          return {
            title: "Download transparent PNGs or one ZIP",
            body: "Useful when you prepare many listings at once.",
          };
        }
        return {
          title: "Pro is for larger product-photo batches",
          body: "100 images per batch. 2,000 images per month.",
        };
      }

      function drawImageStage({ image, x, y, w, h, progress, vertical }) {
        const zoom = 1 + Math.sin(progress * Math.PI) * 0.012;
        const radius = vertical ? 18 : 20;

        ctx.save();
        ctx.shadowColor = "rgba(23, 26, 32, 0.18)";
        ctx.shadowBlur = vertical ? 24 : 30;
        ctx.shadowOffsetY = vertical ? 14 : 18;
        fillRound(x, y, w, h, radius, "#ffffff");
        ctx.restore();

        ctx.save();
        roundRect(x, y, w, h, radius);
        ctx.clip();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, w, h);
        drawContain(image, x, y, w, h, zoom);

        const sweep = ease((progress - 0.28) / 0.44);
        if (sweep > 0 && sweep < 1) {
          const sweepX = x + w * sweep;
          const gradient = ctx.createLinearGradient(sweepX - 170, 0, sweepX + 170, 0);
          gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
          gradient.addColorStop(0.5, "rgba(18, 91, 220, 0.18)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(sweepX - 170, y, 340, h);
          ctx.strokeStyle = "#125bdc";
          ctx.lineWidth = vertical ? 5 : 6;
          ctx.beginPath();
          ctx.moveTo(sweepX, y + 24);
          ctx.lineTo(sweepX, y + h - 24);
          ctx.stroke();
        }
        ctx.restore();

        strokeRound(x, y, w, h, radius, "rgba(23, 26, 32, 0.14)", 2);

        const captionY = y + h + (vertical ? 42 : 42);
        const leftX = x;
        const rightX = x + w;
        text("Original photo", leftX, captionY, vertical ? 24 : 25, "#5d6472", 700);
        text("Transparent PNG", rightX, captionY, vertical ? 24 : 25, "#0f6b4f", 800, undefined, "right");
      }

      function drawStepLine({ x, y, w, progress, vertical }) {
        const labels = ["Upload", "Remove", "Export"];
        ctx.strokeStyle = "rgba(23, 26, 32, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();

        const active = Math.min(2, Math.floor(progress * 3));
        labels.forEach((label, index) => {
          const px = x + (w * index) / (labels.length - 1);
          ctx.fillStyle = index <= active ? "#0f6b4f" : "#c8cfc5";
          ctx.beginPath();
          ctx.arc(px, y, vertical ? 11 : 12, 0, Math.PI * 2);
          ctx.fill();
          text(label, px, y + (vertical ? 42 : 44), vertical ? 22 : 23, index <= active ? "#171a20" : "#6d7480", 800, undefined, "center");
        });
      }

      function drawCta({ x, y, w, vertical }) {
        fillRound(x, y, w, vertical ? 86 : 82, 10, "#171a20");
        text("batchcutout.com", x + (vertical ? 30 : 34), y + (vertical ? 55 : 53), vertical ? 31 : 30, "#ffffff", 900);

        fillRound(x, y + (vertical ? 108 : 102), vertical ? 405 : 375, vertical ? 58 : 56, 8, "#e5f2eb");
        text("2-image free test", x + (vertical ? 28 : 26), y + (vertical ? 146 : 140), vertical ? 24 : 23, "#0f6b4f", 900);
      }

      function drawFinalOffer({ x, y, w, vertical, alpha }) {
        ctx.globalAlpha = alpha;
        fillRound(x, y, w, vertical ? 172 : 104, 10, "#0f6b4f");
        text("Founder plan: 15 EUR/month", x + 34, y + (vertical ? 62 : 42), vertical ? 35 : 30, "#ffffff", 900);
        text("100 images per batch • 2,000 per month • cancel anytime", x + 34, y + (vertical ? 113 : 75), vertical ? 25 : 24, "#d9f4e9", 750, w - 68);
        ctx.globalAlpha = 1;
      }

      function drawFrame(spec, image, progress) {
        const w = spec.width;
        const h = spec.height;
        const vertical = h > w;
        const p = clamp(progress);
        const copy = sceneCopy(p);

        canvas.width = w;
        canvas.height = h;
        drawBackground(w, h);

        const mx = vertical ? 72 : 96;
        const top = vertical ? 84 : 72;

        text("BatchCutout", mx, top, vertical ? 50 : 52, "#171a20", 900);
        text("NexaFlow Labs", mx, top + (vertical ? 48 : 50), vertical ? 23 : 24, "#0f6b4f", 800);

        if (vertical) {
          const titleY = top + 145;
          const titleBottom = wrapText(copy.title, mx, titleY, 58, 66, "#171a20", 900, w - mx * 2);
          wrapText(copy.body, mx, titleBottom + 8, 31, 43, "#5d6472", 500, w - mx * 2);
          drawCta({ x: mx, y: 430, w: 470, vertical });
          drawImageStage({
            image,
            x: mx,
            y: 640,
            w: w - mx * 2,
            h: Math.round((w - mx * 2) * 9 / 16),
            progress: p,
            vertical,
          });
          drawStepLine({ x: mx + 10, y: 1276, w: w - mx * 2 - 20, progress: p, vertical });
          drawFinalOffer({ x: mx, y: h - 245, w: w - mx * 2, vertical, alpha: ease((p - 0.72) / 0.18) });
          return;
        }

        const copyX = mx;
        const copyTop = 220;
        const imageX = 770;
        const imageY = 138;
        const imageW = 1055;
        const imageH = Math.round(imageW * 9 / 16);

        const titleBottom = wrapText(copy.title, copyX, copyTop, 58, 68, "#171a20", 900, 660);
        wrapText(copy.body, copyX, titleBottom + 12, 32, 44, "#5d6472", 500, 650);
        drawCta({ x: copyX, y: 570, w: 505, vertical });
        drawStepLine({ x: copyX + 8, y: 840, w: 520, progress: p, vertical });
        drawImageStage({ image, x: imageX, y: imageY, w: imageW, h: imageH, progress: p, vertical });
        drawFinalOffer({ x: mx, y: h - 145, w: w - mx * 2, vertical, alpha: ease((p - 0.72) / 0.18) });
      }

      async function createVideo({ spec, imageData, durationMs }) {
        const image = new Image();
        image.src = imageData;
        await image.decode();
        drawFrame(spec, image, 0);

        const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
        const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
        if (!mimeType) {
          throw new Error("No supported MediaRecorder format");
        }

        const chunks = [];
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: spec.name === "vertical" ? 6_500_000 : 7_500_000,
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
        drawFrame(spec, image, 0.12);
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
    "-r",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-vf",
    `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
    mp4Path,
  ]);

  return { mp4Path, posterPath, mimeType: result.mimeType };
}

await mkdir(outputDir, { recursive: true });
const imageBase64 = await readFile(sourceImagePath, "base64");
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
