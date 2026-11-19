// Sunset Cover Studio — editor wiring. Owns the state, the controls, photo
// loading, panel dragging, Shuffle and PNG export. The drawing itself lives
// in render.js; the palettes in grades.js.

import { GRADES, GRADE_NAMES } from './grades.js';
import { drawCover, panelRects, panelCount } from './render.js';

const SIZES = {
  square: { w: 1080, h: 1080, file: '1080x1080' },
  portrait: { w: 1080, h: 1350, file: '1080x1350' },
  wide: { w: 1920, h: 1080, file: '1920x1080' },
};

const LAYOUTS = ['duo', 'trio', 'quad'];

// Caption ideas for Shuffle. Original lines, written for this app.
const CAPTIONS = [
  { title: 'VICE CITY NIGHTS', subtitle: 'a Leonida story' },
  { title: 'LEONIDA HEAT', subtitle: 'two outlaws, one city' },
  { title: 'SUNSET BOULEVARD', subtitle: 'golden hour, every hour' },
  { title: 'NEON PIER', subtitle: 'the lights never sleep' },
  { title: 'OCEAN DRIVE', subtitle: 'top down, radio up' },
  { title: 'MIDNIGHT VICE', subtitle: 'what happens after dark' },
  { title: 'GOLDEN HOUR', subtitle: 'chase the last light' },
  { title: 'PALETO SUNSET', subtitle: 'a slow drive home' },
];

const state = {
  sizeKey: 'square',
  layout: 'duo',
  grade: 'sunset',
  grain: true,
  vignette: true,
  title: 'VICE CITY NIGHTS',
  subtitle: 'a Leonida story',
  titleScale: 1,
  captionPos: 'bottom',
  selected: 0,
  panels: [
    { photo: 0, zoom: 1.05, ox: 0, oy: 0 },
    { photo: 1, zoom: 1.05, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.1, ox: 0, oy: 0 },
    { photo: 1, zoom: 1.1, ox: 0, oy: 0 },
  ],
  photos: [],
};

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function setStatus(msg) {
  statusEl.textContent = msg;
}

function viewState() {
  const size = SIZES[state.sizeKey];
  return { ...state, size: { w: size.w, h: size.h } };
}

function render() {
  const size = SIZES[state.sizeKey];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(ctx, viewState());
}

function markActive(rowId, value) {
  const row = document.getElementById(rowId);
  if (!row) return;
  for (const btn of row.querySelectorAll('button')) {
    btn.classList.toggle('active', btn.dataset.layout === value || btn.dataset.grade === value || btn.dataset.size === value);
  }
}

function rebuildPanelButtons() {
  const row = document.getElementById('panelRow');
  row.textContent = '';
  const n = panelCount(state.layout);
  for (let i = 0; i < n; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `Panel ${i + 1}`;
    btn.classList.toggle('active', i === state.selected);
    btn.addEventListener('click', () => {
      state.selected = i;
      syncZoomSlider();
      rebuildPanelButtons();
      render();
    });
    row.appendChild(btn);
  }
}

function syncZoomSlider() {
  const panel = state.panels[state.selected];
  document.getElementById('zoomRange').value = Math.round(panel.zoom * 100);
}

function rebuildThumbs() {
  const list = document.getElementById('photoList');
  list.textContent = '';
  state.photos.forEach((photo, i) => {
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    thumb.classList.toggle('active', state.panels[state.selected].photo === i);
    thumb.addEventListener('click', () => {
      state.panels[state.selected].photo = i;
      rebuildThumbs();
      render();
      setStatus(`Panel ${state.selected + 1} now shows ${photo.name}.`);
    });
    list.appendChild(thumb);
  });
}

function loadSample(src, name) {
  const img = new Image();
  const photo = { img, name };
  img.onload = () => render();
  img.onerror = () => setStatus(`Could not load ${name}; upload a photo instead.`);
  img.src = src;
  state.photos.push(photo);
}

function wireControls() {
  document.getElementById('layoutRow').addEventListener('click', (ev) => {
    const layout = ev.target.dataset && ev.target.dataset.layout;
    if (!layout || !LAYOUTS.includes(layout)) return;
    state.layout = layout;
    state.selected = 0;
    markActive('layoutRow', layout);
    rebuildPanelButtons();
    syncZoomSlider();
    render();
  });

  document.getElementById('gradeRow').addEventListener('click', (ev) => {
    const grade = ev.target.dataset && ev.target.dataset.grade;
    if (!grade || !GRADES[grade]) return;
    state.grade = grade;
    markActive('gradeRow', grade);
    render();
  });

  document.getElementById('sizeRow').addEventListener('click', (ev) => {
    const sizeKey = ev.target.dataset && ev.target.dataset.size;
    if (!sizeKey || !SIZES[sizeKey]) return;
    state.sizeKey = sizeKey;
    markActive('sizeRow', sizeKey);
    render();
    setStatus(`Preview at ${SIZES[sizeKey].file}. Export writes a PNG at that size.`);
  });

  document.getElementById('zoomRange').addEventListener('input', (ev) => {
    state.panels[state.selected].zoom = Number(ev.target.value) / 100;
    render();
  });

  document.getElementById('titleInput').addEventListener('input', (ev) => {
    state.title = ev.target.value;
    render();
  });
  document.getElementById('subtitleInput').addEventListener('input', (ev) => {
    state.subtitle = ev.target.value;
    render();
  });
  document.getElementById('titleSizeRange').addEventListener('input', (ev) => {
    state.titleScale = Number(ev.target.value) / 100;
    render();
  });
  document.getElementById('captionPos').addEventListener('change', (ev) => {
    state.captionPos = ev.target.value;
    render();
  });
  document.getElementById('grainCheck').addEventListener('change', (ev) => {
    state.grain = ev.target.checked;
    render();
  });
  document.getElementById('vignetteCheck').addEventListener('change', (ev) => {
    state.vignette = ev.target.checked;
    render();
  });

  document.getElementById('uploadInput').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.photos.push({ img, name: file.name });
        state.panels[state.selected].photo = state.photos.length - 1;
        rebuildThumbs();
        render();
        setStatus(`Loaded ${file.name} into panel ${state.selected + 1}.`);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('shuffleBtn').addEventListener('click', shuffle);
  document.getElementById('exportBtn').addEventListener('click', exportPng);
}

function pickPanelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const size = SIZES[state.sizeKey];
  const rects = panelRects(state.layout, size.w, size.h);
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return { index: i, x, y, rect: r };
  }
  return null;
}

function wireCanvas() {
  let drag = null;
  canvas.addEventListener('pointerdown', (ev) => {
    const hit = pickPanelAt(ev.clientX, ev.clientY);
    if (!hit) return;
    state.selected = hit.index;
    rebuildPanelButtons();
    syncZoomSlider();
    render();
    drag = { x: hit.x, y: hit.y, rect: hit.rect, ox: state.panels[hit.index].ox, oy: state.panels[hit.index].oy };
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const hit = pickPanelAt(ev.clientX, ev.clientY);
    if (!hit) return;
    const panel = state.panels[state.selected];
    panel.ox = drag.ox + (hit.x - drag.x) / drag.rect.w;
    panel.oy = drag.oy + (hit.y - drag.y) / drag.rect.h;
    render();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

function shuffle() {
  const rand = (n) => Math.floor(Math.random() * n);
  state.layout = LAYOUTS[rand(LAYOUTS.length)];
  state.grade = GRADE_NAMES[rand(GRADE_NAMES.length)];
  const caption = CAPTIONS[rand(CAPTIONS.length)];
  state.title = caption.title;
  state.subtitle = caption.subtitle;
  state.titleScale = 0.85 + Math.random() * 0.35;
  const n = panelCount(state.layout);
  // Deal the photos so neighbouring panels show different shots when the
  // library holds more than one, and vary the crop of each panel so the
  // cover reads as a poster, not one photo repeated.
  let lastPhoto = -1;
  for (let i = 0; i < n; i += 1) {
    let photo = rand(Math.max(1, state.photos.length));
    if (state.photos.length > 1) {
      while (photo === lastPhoto) photo = rand(state.photos.length);
    }
    lastPhoto = photo;
    state.panels[i] = {
      photo,
      zoom: 1.0 + Math.random() * 0.6,
      ox: (Math.random() - 0.5) * 0.56,
      oy: (Math.random() - 0.5) * 0.56,
    };
  }
  state.selected = 0;
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('titleSizeRange').value = Math.round(state.titleScale * 100);
  markActive('layoutRow', state.layout);
  markActive('gradeRow', state.grade);
  rebuildPanelButtons();
  syncZoomSlider();
  render();
  setStatus(`Shuffled: ${state.layout} panels, ${GRADES[state.grade].label} grade, “${state.title}”.`);
}

function exportPng() {
  const size = SIZES[state.sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  const offCtx = off.getContext('2d');
  const keepSelected = state.selected;
  state.selected = -1;
  drawCover(offCtx, viewState());
  state.selected = keepSelected;
  render();
  off.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed: the browser could not make the PNG.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sunset-cover-${size.file}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported sunset-cover-${size.file}.png (${size.w} × ${size.h}).`);
  }, 'image/png');
}

loadSample('samples/boulevard.jpg', 'Boulevard');
loadSample('samples/pier.jpg', 'Pier');
wireControls();
wireCanvas();
markActive('layoutRow', state.layout);
markActive('gradeRow', state.grade);
markActive('sizeRow', state.sizeKey);
rebuildPanelButtons();
rebuildThumbs();
syncZoomSlider();
render();
