import type { Colorway, ProductDoc } from "@/lib/cms/types";
import { PATHS } from "./Garment";

const W = 400;
const H = 460;
const imgCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImg(src: string) {
  if (!imgCache.has(src)) {
    imgCache.set(
      src,
      new Promise((res) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = src;
      }),
    );
  }
  return imgCache.get(src)!;
}

function contain(im: HTMLImageElement) {
  const s = Math.min(W / im.width, H / im.height);
  const w = im.width * s;
  const h = im.height * s;
  return [(W - w) / 2, (H - h) / 2, w, h] as const;
}

/**
 * Paints a garment (same shapes/photos as the 2D showcase) onto a canvas for use as a
 * three.js texture. Transparent outside the garment. Resolves once photos have loaded.
 */
export async function paintGarment(canvas: HTMLCanvasElement, product: ProductDoc, colorway: Colorway | undefined, side: "front" | "back", scale = 1.25) {
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const hex = colorway?.hex ?? "#eeeeee";

  const exact = side === "front" ? colorway?.frontImage : colorway?.backImage;
  const photo = side === "front" ? product.frontImage : product.backImage;
  if (exact || photo) {
    const im = await loadImg((exact || photo)!);
    if (im) {
      const r = contain(im);
      try {
        if (exact) {
          ctx.drawImage(im, ...r);
        } else {
          // grayscale photo × garment colour, masked to the photo's alpha
          ctx.filter = "grayscale(1) contrast(1.05)";
          ctx.drawImage(im, ...r);
          ctx.filter = "none";
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = hex;
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(im, ...r);
          ctx.globalCompositeOperation = "source-over";
        }
        return;
      } catch {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, W, H);
      }
    }
  }

  const shape = PATHS[product.category] ?? PATHS.tee;
  const body = new Path2D(shape.body);
  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, W, H);
  // fabric noise
  const n = ctx.createImageData(W, H);
  for (let i = 0; i < n.data.length; i += 4) {
    const v = Math.random() * 255;
    n.data[i] = n.data[i + 1] = n.data[i + 2] = v;
    n.data[i + 3] = 18;
  }
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  tmp.getContext("2d")!.putImageData(n, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(tmp, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  // side shading
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(0,0,0,.24)");
  g.addColorStop(0.2, "rgba(0,0,0,0)");
  g.addColorStop(0.5, "rgba(255,255,255,.1)");
  g.addColorStop(0.8, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.26)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const d = ctx.createLinearGradient(0, 0, 0, H);
  d.addColorStop(0, "rgba(0,0,0,0)");
  d.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = d;
  ctx.fillRect(0, 0, W, H);
  // folds
  ctx.filter = "blur(9px)";
  ctx.strokeStyle = "rgba(0,0,0,.15)";
  ctx.lineWidth = 22;
  ctx.stroke(new Path2D("M140 200 C150 260 140 330 150 430"));
  ctx.lineWidth = 20;
  ctx.stroke(new Path2D("M262 190 C250 270 268 340 255 430"));
  ctx.filter = "none";
  // print
  const text = (side === "front" ? product.frontPrint : product.backPrint) || "";
  const lines = text.split("\n").filter(Boolean);
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const fs = Math.min(64, (shape.print.w / longest) * 1.75);
  ctx.fillStyle = colorway?.printHex ?? "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${fs}px Poppins, "Arial Black", Impact, sans-serif`;
  lines.forEach((l, i) => ctx.fillText(l, shape.print.x, shape.print.y + i * fs * 0.92));
  ctx.restore();
  // seams
  ctx.strokeStyle = "rgba(0,0,0,.2)";
  ctx.lineWidth = 1.5;
  ctx.stroke(body);
  ctx.setLineDash([4, 3]);
  shape.extras.forEach((p, i) => {
    ctx.setLineDash(i === 0 ? [] : [4, 3]);
    ctx.lineWidth = 2;
    ctx.stroke(new Path2D(p));
  });
  ctx.setLineDash([]);
}
