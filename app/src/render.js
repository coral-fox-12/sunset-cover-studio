// Cover renderer for Sunset Cover Studio. Draws the multi-panel poster, the
// grade wash, the caption, grain and vignette onto a canvas. No libraries,
// no network: every pixel comes from the photos and the palettes.

import { GRADES } from './grades.js';

// Panel geometry for each layout. Returns rects {x, y, w, h} in cover pixels.
// gap scales with the cover width so the look holds at every export size.
export function panelRects(layout, W, H) {
  const g = Math.max(6, Math.round(W * 0.008));
  if (layout === 'trio') {
    const w = (W - 2 * g) / 3;
    return [0, 1, 2].map((i) => ({ x: i * (w + g), y: 0, w, h: H }));
  }
  if (layout === 'quad') {
    const w = (W - g) / 2;
    const h = (H - g) / 2;
    return [
      { x: 0, y: 0, w, h },
      { x: w + g, y: 0, w, h },
      { x: 0, y: h + g, w, h },
      { x: w + g, y: h + g, w, h },
    ];
  }
  // duo: one tall panel on the left, two stacked on the right
  const leftW = W * 0.62;
  const rightW = W - leftW - g;
  const halfH = (H - g) / 2;
  return [
    { x: 0, y: 0, w: leftW, h: H },
    { x: leftW + g, y: 0, w: rightW, h: halfH },
    { x: leftW + g, y: halfH + g, w: rightW, h: halfH },
  ];
}

function panelCount(layout) {
  return layout === 'trio' ? 3 : layout === 'quad' ? 4 : 3;
}

// Small deterministic generator so the grain looks the same on every render.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPhoto(ctx, photo, rect, zoom, ox, oy) {
  const img = photo && photo.img;
  if (!img || !img.naturalWidth) {
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    grad.addColorStop(0, '#3a2a1e');
    grad.addColorStop(1, '#171008');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  // Pan offsets are fractions of the panel; clamp so the photo still covers it.
  const maxOx = Math.max(0, (dw - rect.w) / 2 / rect.w);
  const maxOy = Math.max(0, (dh - rect.h) / 2 / rect.h);
  const cx = Math.max(-maxOx, Math.min(maxOx, ox));
  const cy = Math.max(-maxOy, Math.min(maxOy, oy));
  const dx = rect.x + (rect.w - dw) / 2 + cx * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + cy * rect.h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawCaption(ctx, state, W, H, grade) {
  const bandH = H * 0.24;
  const atTop = state.captionPos === 'top';
  const band = ctx.createLinearGradient(0, atTop ? 0 : H - bandH, 0, atTop ? bandH : H);
  if (atTop) {
    band.addColorStop(0, 'rgba(0,0,0,0.62)');
    band.addColorStop(1, 'rgba(0,0,0,0)');
  } else {
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(1, 'rgba(0,0,0,0.62)');
  }
  ctx.fillStyle = band;
  ctx.fillRect(0, atTop ? 0 : H - bandH, W, bandH);

  const title = (state.title || '').toUpperCase();
  let size = Math.round(W * 0.085 * state.titleScale);
  const family = '"Arial Black", Impact, "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.letterSpacing = `${Math.round(W * 0.004)}px`;
  } catch (_e) {
    // Older canvas: letter spacing is ignored, the layout still works.
  }
  // Shrink the title until it fits the cover width.
  for (let tries = 0; tries < 12; tries += 1) {
    ctx.font = `900 ${size}px ${family}`;
    if (ctx.measureText(title).width <= W * 0.92 || size <= 20) break;
    size = Math.round(size * 0.92);
  }
  const subSize = Math.round(size * 0.42);
  const titleY = atTop ? H * 0.13 : H * 0.93;
  const subY = atTop ? titleY + subSize * 1.5 : titleY - size * 1.25;

  ctx.save();
  ctx.shadowColor = grade.titleShadow;
  ctx.shadowBlur = Math.round(W * 0.02);
  ctx.lineWidth = Math.max(2, Math.round(size * 0.06));
  ctx.strokeStyle = 'rgba(20, 8, 4, 0.85)';
  ctx.strokeText(title, W / 2, titleY);
  ctx.fillStyle = grade.title;
  ctx.fillText(title, W / 2, titleY);
  ctx.restore();

  if (state.subtitle) {
    ctx.font = `italic ${subSize}px "Brush Script MT", "Segoe Script", cursive`;
    ctx.fillStyle = grade.subtitle;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = Math.round(W * 0.008);
    ctx.fillText(state.subtitle, W / 2, subY);
    ctx.shadowBlur = 0;
  }
  try {
    ctx.letterSpacing = '0px';
  } catch (_e) {
    // No-op on canvases without the property.
  }
}

function drawGrain(ctx, W, H) {
  const rand = mulberry32(20261119);
  const dots = Math.round((W * H) / 900);
  ctx.save();
  for (let i = 0; i < dots; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const r = Math.hypot(W, H) / 2;
  const grad = ctx.createRadialGradient(W / 2, H / 2, r * 0.45, W / 2, H / 2, r);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// Draws the whole cover for the given state onto ctx (already sized W x H).
export function drawCover(ctx, state) {
  const W = state.size.w;
  const H = state.size.h;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = panelRects(state.layout, W, H);
  const count = panelCount(state.layout);

  ctx.save();
  ctx.fillStyle = '#0d0a08';
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < count; i += 1) {
    const panel = state.panels[i] || { photo: 0, zoom: 1.2, ox: 0, oy: 0 };
    const photo = state.photos[panel.photo];
    const rect = rects[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    drawPhoto(ctx, photo, rect, panel.zoom, panel.ox, panel.oy);
    ctx.restore();
    ctx.strokeStyle = grade.frame;
    ctx.lineWidth = Math.max(2, Math.round(W * 0.004));
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (i === state.selected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, Math.round(W * 0.002));
      ctx.setLineDash([Math.round(W * 0.02), Math.round(W * 0.01)]);
      ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
      ctx.setLineDash([]);
    }
  }

  // Warm wash over the panels.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  for (const [stop, color] of grade.wash) wash.addColorStop(stop, color);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  drawCaption(ctx, state, W, H, grade);
  if (state.grain) drawGrain(ctx, W, H);
  if (state.vignette) drawVignette(ctx, W, H);
  // One thin frame around the whole cover pulls the panels together.
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = Math.max(3, Math.round(W * 0.006));
  ctx.strokeRect(0, 0, W, H);
  ctx.restore();
}

export { panelCount };
