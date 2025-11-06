// ====================
// 1. GLOBAL VARIABLES
// ====================

// images setup
let bgImg, bullImg;

// segment setup for grid cells
let bgSegments = [];
let bullSegments = [];

let gridSize = 30; // how many grid cells across and down
let shapeSize = 3.0; // size of each shape (multiplier)
let backColor = 250; // backrgound colour (light grey)

// =====================================
// 2. PRELOAD - load images before setup
// =====================================

function preload() {
  bgImg = loadImage('bull_background.png'); // background link
  bullImg = loadImage('bull_foreground.png'); // foreground link
}

// =========================
// 3. SETUP - runs at start
// =========================

function setup() {
  createCanvas(windowWidth, windowHeight); // full screen canvas
  
  // loading pixel data of both images to grab the sample colours
  bgImg.loadPixels();
  bullImg.loadPixels();
  
  // create data structures for grid
  createBgSegments();
  createBullSegments();
  
  // draw once when starting
  drawAll();

  assignAnimationParams();
}

// ======================================================================
// 4. CREATE BACKGROUND SEGMENTS - break background image into grid cells
// ======================================================================

function createBgSegments() {
  bgSegments = []; 
  
  // each cell's width over height in pixels of the image
  let segmentWidth = bgImg.width / gridSize;
  let segmentHeight = bgImg.height / gridSize;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      
      // find the pixel roughly in the middle of each grid cell
      let x = col * segmentWidth + segmentWidth / 2;
      let y = row * segmentHeight + segmentHeight / 2;
      
      // sample pixel colour drom the image
      let segmentColor = bgImg.get(x, y);
      
      // randomly pick between circle or square
      let shapeType = floor(random(2));
      
      // stored data as one segment object
      bgSegments.push({
        row: row,
        col: col,
        color: segmentColor,
        shape: shapeType
      });
    }
  }
}

// ======================================================================
// 5. CREATE BULL SEGMENTS - break the foreground image into grid cells
// ======================================================================

function createBullSegments() {
  bullSegments = [];

  // each cell's width over height in pixels of the image
  let segmentWidth = bullImg.width / gridSize;
  let segmentHeight = bullImg.height / gridSize;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      
      // find the pixel roughly in the middle of each grid cell
      let x = col * segmentWidth + segmentWidth / 2;
      let y = row * segmentHeight + segmentHeight / 2;
      
      // sample pixel colour drom the image
      let segmentColor = bullImg.get(x, y);
      
      // randomly pick between circle or square
      let shapeType = floor(random(2));
      
      // stored data as one segment object
      bullSegments.push({
        row: row,
        col: col,
        color: segmentColor,
        shape: shapeType
      });
    }
  }
}

// ======================================================================
// 6. DRAW - p5.js main loop, background & bull foreground
// ======================================================================

function draw() {
  drawAll();
}

function drawAll() {
  background(backColor); // clear canvas each frame
  drawBgPattern(); // draw geometric background
  drawBullPattern(); // draw the bull foreground layer on top
}

// =============================
// 7. DRAW - background pattern
// =============================

function drawBgPattern() {
  noStroke(); // to make sure all shapes have no outline
  let size = min(width, height); // keep square aspect ratio = no stretching
  let startX = (width - size) / 2; // center horizontally
  let startY = (height - size) / 2; // center vertically

  // loop for each background segment
  for (let i = 0; i < bgSegments.length; i++) {
    let seg = bgSegments[i];
    
    let cellSize = size / gridSize;
    let x = startX + (seg.col + 0.5) * cellSize;
    let y = startY + (seg.row + 0.5) * cellSize;
    
    // shape size
    let w = cellSize * shapeSize;
    let h = cellSize * shapeSize;
    
    fill(seg.color); // fill colour grabbed from image palette
    
    // randomiser to pick between circle or suare
    if (seg.shape == 0) {
      ellipse(x, y, w, h);
    } else {
      rectMode(CENTER);
      rect(x, y, w, h);
    }
  }
}

// =======================
// 8. DRAW - bull pattern
// =======================

function drawBullPattern() {
  noStroke();

  // scales the bull image to fit the canvas with no stretch
  let scale = min(width / bullImg.width, height / bullImg.height) * 0.8;
  let patternWidth = bullImg.width * scale;
  let patternHeight = bullImg.height * scale;
  let startX = (width - patternWidth) / 2;
  let startY = (height - patternHeight) / 2;
  
  // loops bull segments
  for (let i = 0; i < bullSegments.length; i++) {
    let seg = bullSegments[i];
    
    // scaled pattern calculated from each cell's position
    let cellW = patternWidth / gridSize;
    let cellH = patternHeight / gridSize;
    let x = startX + (seg.col + 0.5) * cellW;
    let y = startY + (seg.row + 0.5) * cellH;
    
    // shape size
    let cellSize = min(cellW, cellH);
    let w = cellSize * shapeSize;
    let h = cellSize * shapeSize;
 
    fill(seg.color);
  
    if (seg.shape == 0) {
      ellipse(x, y, w, h);
    } else {
      rectMode(CENTER);
      rect(x, y, w, h);
    }
  }
}

// ===============================================================
// 9. RESPONSIVENESS - redraw everything when window size changes
// ===============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);  // resize the canvas itself
  
  // recreate everything based on the new canvas size
  createBgSegments();
  createBullSegments();
  
  // redraw all layers
  drawAll();
}
