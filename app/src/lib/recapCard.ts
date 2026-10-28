// Draws the monthly recap as a 1080×1350 PNG (Instagram portrait size) and shares or saves it.
// Web only. Shows what was saved; never income, expenses or address.
import { Platform } from 'react-native';
import { rupiah } from './format';
import { monthLabel, type Recap } from './recap';

const W = 1080;
const H = 1350;
const PAD = 96;
const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const C = { text: '#111114', soft: '#6B6B73', faint: '#A1A1AA', line: '#E7E7EB', accent: '#D6336C', surface: '#F5F5F7' };

function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, maxWidth: number): number {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && s > 24) {
    s -= 4;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  return s;
}

function ellipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

export async function recapImage(r: Recap): Promise<Blob | null> {
  if (Platform.OS !== 'web') return null;
  await Promise.all([800, 700, 600, 400].map((w) => document.fonts?.load(`${w} 40px "Plus Jakarta Sans"`).catch(() => undefined)));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const inner = W - PAD * 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = C.text;
  ctx.font = `700 30px ${FONT}`;
  ctx.letterSpacing = '6px';
  ctx.fillText('SPIRIT BELONGINGS', PAD, 150);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = C.soft;
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText(`Rekap ${monthLabel(r.month)}`, PAD, 260);

  ctx.fillStyle = C.text;
  ctx.font = `600 52px ${FONT}`;
  ctx.fillText('Aku menyelamatkan', PAD, 420);

  const amount = rupiah(r.total);
  ctx.fillStyle = C.accent;
  fit(ctx, amount, 800, 150, inner);
  ctx.fillText(amount, PAD - 4, 580);

  ctx.fillStyle = C.soft;
  ctx.font = `400 40px ${FONT}`;
  ctx.fillText(`dari ${r.count} barang yang gak jadi aku beli`, PAD, 660);

  let y = 790;
  for (const item of r.top) {
    ctx.fillStyle = C.line;
    ctx.fillRect(PAD, y - 62, inner, 2);
    const price = rupiah(item.price);
    ctx.font = `700 40px ${FONT}`;
    const priceW = ctx.measureText(price).width;
    ctx.fillStyle = C.text;
    ctx.fillText(price, W - PAD - priceW, y);
    ctx.font = `400 40px ${FONT}`;
    ctx.fillStyle = C.soft;
    ctx.fillText(ellipsis(ctx, item.name, inner - priceW - 40), PAD, y);
    y += 110;
  }

  ctx.fillStyle = C.text;
  ctx.font = `800 46px ${FONT}`;
  ctx.fillText('Checkout palsu. Dompet aman.', PAD, 1180);
  ctx.fillStyle = C.faint;
  ctx.font = `400 32px ${FONT}`;
  ctx.fillText('spirit-belongings.eoi-apps.my.id', PAD, 1240);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

// Share sheet where the phone supports sharing files; otherwise download the picture.
export async function shareOrSave(blob: Blob, fileName: string, text: string, preferShare: boolean): Promise<'shared' | 'saved'> {
  const file = new File([blob], fileName, { type: 'image/png' });
  if (preferShare && typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch {
      // closed the share sheet or not allowed: fall back to saving
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
  return 'saved';
}
