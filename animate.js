// =====================================
// 1. Animation Parameters
// =====================================

function assignAnimationParams() {
  for (let seg of bgSegments) {
    seg.rate = random(0.01, 0.03);   // rate
    seg.amp = random(0.2, 0.5);      // amplitude/how big the change is
    seg.phase = random(TWO_PI);      // where the shape starts in its cycle
  }
  for (let seg of bullSegments) {
    seg.rate = random(0.02, 0.06);  
    seg.amp = random(0.3, 0.7);      
    seg.phase = random(TWO_PI);
  }
}
// =====================================
// 2. Background Pattern
// =====================================

function drawBgPattern() {
  noStroke(); // no outline around shapes
  let size = min(width, height); // keep square aspect ratio
  let startX = (width - size) / 2; // center horizontally
  let startY = (height - size) / 2; // center vertically

  for (let seg of bgSegments) {
    let cellSize = size / gridSize;
    let x = startX + (seg.col + 0.5) * cellSize;
    let y = startY + (seg.row + 0.5) * cellSize;

    let pulse = sin(frameCount * seg.rate + seg.phase) * seg.amp;

    // base size plus the pulse
    let w = cellSize * (shapeSize + pulse);
    let h = cellSize * (shapeSize + pulse);

    fill(seg.color); // use the color from the image

    if (seg.shape === 0) {
      ellipse(x, y, w, h); // draw circle
    } else {
      rectMode(CENTER);
      rect(x, y, w, h); // draw square
    }
  }
}

// =====================================
// 3. ANIMATION
// =====================================

function drawBullPattern() {
  noStroke();

  let scale = min(width / bullImg.width, height / bullImg.height) * 0.8;
  let patternWidth = bullImg.width * scale;
  let patternHeight = bullImg.height * scale;
  let startX = (width - patternWidth) / 2;
  let startY = (height - patternHeight) / 2;

  for (let seg of bullSegments) {
    let cellW = patternWidth / gridSize;
    let cellH = patternHeight / gridSize;
    let x = startX + (seg.col + 0.5) * cellW;
    let y = startY + (seg.row + 0.5) * cellH;

    let cellSize = min(cellW, cellH);

    let pulse = sin(frameCount * seg.rate + seg.phase) * seg.amp;

    let w = cellSize * (shapeSize + pulse);
    let h = cellSize * (shapeSize + pulse);

    fill(seg.color);

    if (seg.shape === 0) {
      ellipse(x, y, w, h);
    } else {
      rectMode(CENTER);
      rect(x, y, w, h);
    }
  }
}

// =====================================
// 4. DRAW EVERYTHING TOGETHER
// =====================================

function drawAll() {
  background(backColor); // clear canvas
  drawBgPattern();       // draw animated background
  drawBullPattern();     // draw animated bull foreground
}