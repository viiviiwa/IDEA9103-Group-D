let bgImg, fgImg;
let segmentsBG = [], segmentsFG = [];

const Geometry = Object.freeze({ RECT:0, DIAMOND:1, TRI:2, STRIPE:3, HEX:4, CIRCLE:5 });

const CFG = {
  bgURL: '..//assets/Bull_background.png',
  fgURL: '..//assets/Bull_foreground.png',

  segBG: 80,
  segFG: 40,

  BG: {
    geometry: Geometry.RECT,
    scale: [0.85, 1.20],
    alpha: [255, 255],
    rotate: true,
    paletteClamp: false
  },
  FG: {
    geometry: Geometry.CIRCLE,
    scale: [0.95, 1.45],
    alpha: [160, 230],
    rotate: true,
    paletteClamp: false
  },

  palette: ["#111014","#3ac3e9ff","#f6a21f","#f36ea1","#bba9ef","#8aa0e6"],

  fgWhiteLumCutoff: 240,
  fgWhiteDeltaCutoff: 18,

  rotateRange: Math.PI/3,
  paper: 250
};

let layout = { aspect: 0, w: 0, h: 0, x: 0, y: 0 };
let showBG = true, showFG = true;

function preload() {
  bgImg = loadImage(CFG.bgURL);
  fgImg = loadImage(CFG.fgURL);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noLoop();

  layout.aspect = bgImg.width / bgImg.height;
  rebuildAll();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  rebuildAll();
}

function rebuildAll() {
  computeLayout();
  bgImg.loadPixels();
  fgImg.loadPixels();

  segmentsBG = buildSegments(bgImg, CFG.segBG);
  segmentsFG = buildSegments(fgImg, CFG.segFG, true);

  renderOnce();
}

function renderOnce() {
  background(CFG.paper);
  if (showBG) renderLayer(segmentsBG, bgImg, CFG.BG);
  if (showFG) renderLayer(segmentsFG, fgImg, CFG.FG);
}

class Segment {
  constructor(r, c, cols, rows) {
    this.r = r;
    this.c = c;
    this.cols = cols;
    this.rows = rows;
    this.x = 0; this.y = 0;
    this.w = 0; this.h = 0;
    this.cx = 0; this.cy = 0;
    this.col = color(0);
    this.isFG = false;
  }

  mapToCanvas() {
    this.w = layout.w / this.cols;
    this.h = layout.h / this.rows;
    this.x = layout.x + this.c * this.w;
    this.y = layout.y + this.r * this.h;
    this.cx = this.x + this.w * 0.5;
    this.cy = this.y + this.h * 0.5;
  }
}

function buildSegments(srcImage, gridCount, asForeground=false) {
  const segs = [];
  const cols = gridCount;
  const rows = gridCount * (srcImage.height/srcImage.width);

  const cellW = srcImage.width / cols;
  const cellH = srcImage.height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seg = new Segment(r, c, cols, rows);
      seg.mapToCanvas();

      const sx = floor((c + 0.5) * cellW);
      const sy = floor((r + 0.5) * cellH);
      const colArr = srcImage.get(constrain(sx,0,srcImage.width-1), constrain(sy,0,srcImage.height-1));
      seg.col = color(colArr);

      if (asForeground) {
        seg.isFG = isForegroundPixel(colArr);
        if (!seg.isFG) continue;
      }
      segs.push(seg);
    }
  }
  return segs;
}

function renderLayer(list, src, style) {
  noStroke();
  for (const s of list) {
    let col = color(s.col);
    if (style.paletteClamp) col = clampToPalette(col);
    col.setAlpha(random(style.alpha[0], style.alpha[1]));

    const sx = s.w * random(style.scale[0], style.scale[1]);
    const sy = s.h * random(style.scale[0], style.scale[1]);

    drawMark(style.geometry, s.cx, s.cy, sx, sy, col, style.rotate);
  }
}

function drawMark(type, cx, cy, w, h, col, allowRotate) {
  push();
  translate(cx, cy);
  if (allowRotate) rotate(random(-CFG.rotateRange, CFG.rotateRange));
  fill(col);

  switch (type) {
    case Geometry.RECT:
      rectMode(CENTER);
      rect(0, 0, w, h);
      break;
    case Geometry.DIAMOND:
      rectMode(CENTER);
      rotate(Math.PI/4);
      rect(0, 0, w, h);
      break;
    case Geometry.TRI:
      const hw = w*0.5, hh = h*0.5;
      triangle(-hw, hh, 0, -hh, hw, hh);
      break;
    case Geometry.STRIPE:
      rectMode(CENTER);
      rect(0, 0, w, h*0.35);
      erase(); triangle(-w*0.3, 0, 0, -h*0.25, w*0.3, 0); noErase();
      break;
    case Geometry.HEX:
      polygon(0, 0, min(w,h)*0.5, 6);
      break;
    case Geometry.CIRCLE:
      ellipseMode(CENTER);
      ellipse(0, 0, w, h);
      break;
  }
  pop();
}

function polygon(x, y, r, n) {
  beginShape();
  for (let i = 0; i < n; i++) {
    const a = TWO_PI * i / n;
    vertex(x + r*cos(a), y + r*sin(a));
  }
  endShape(CLOSE);
}

function isForegroundPixel(rgb) {
  const [r,g,b] = rgb;
  const lum = 0.2126*r + 0.7152*g + 0.0722*b;
  const spread = Math.max(r,g,b) - Math.min(r,g,b);
  const nearWhite = (lum >= CFG.fgWhiteLumCutoff) && (spread <= CFG.fgWhiteDeltaCutoff);
  return !nearWhite;
}

function clampToPalette(c) {
  let best = null, bd = 1e9;
  for (const h of CFG.palette) {
    const pc = color(h);
    const d = dist(red(c), green(c), blue(c), red(pc), green(pc), blue(pc));
    if (d < bd) { bd = d; best = pc; }
  }
  return best || c;
}

function computeLayout() {
  const canvasAR = width / height;
  if (layout.aspect > canvasAR) {
    layout.w = width;
    layout.h = width / layout.aspect;
    layout.x = 0;
    layout.y = (height - layout.h)/2;
  } else {
    layout.h = height;
    layout.w = height * layout.aspect;
    layout.y = 0;
    layout.x = (width - layout.w)/2;
  }
}