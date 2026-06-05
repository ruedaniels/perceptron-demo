const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;
let points = [];
let weights = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
let eta = 0.05;
let numPoints = 15;
let epoch = 0;
let errors = 0;
let training = false;
let trainInterval = null;

function resize() {
  const rect = canvas.getBoundingClientRect();
  W = canvas.width = rect.width * window.devicePixelRatio;
  H = canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function rw() { return canvas.getBoundingClientRect().width; }
function rh() { return canvas.getBoundingClientRect().height; }

function generatePoints() {
  points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: 0.1 + Math.random() * 0.35,
      y: 0.1 + Math.random() * 0.8,
      label: -1
    });
  }
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: 0.55 + Math.random() * 0.35,
      y: 0.1 + Math.random() * 0.8,
      label: 1
    });
  }
}

function activate(x) { return x >= 0 ? 1 : -1; }

function predict(px, py) {
  return activate(weights[0] * px + weights[1] * py + weights[2]);
}

function stepEpoch() {
  errors = 0;
  for (const p of points) {
    const pred = predict(p.x, p.y);
    const err = p.label - pred;
    if (err !== 0) {
      errors++;
      weights[0] += eta * err * p.x;
      weights[1] += eta * err * p.y;
      weights[2] += eta * err * 1;
    }
  }
  epoch++;
  updateStats();
  draw();
  if (errors === 0 && training) stopTraining();
}

function updateStats() {
  document.getElementById('s-epoch').textContent = epoch;
  document.getElementById('s-errors').textContent = errors;
  const correct = points.filter(p => predict(p.x, p.y) === p.label).length;
  const acc = Math.round((correct / points.length) * 100);
  document.getElementById('s-accuracy').textContent = acc + '%';
}

function draw() {
  const w = rw(), h = rh();
  ctx.clearRect(0, 0, w, h);

  // draw background shading
  if (weights[1] !== 0) {
    for (let px = 0; px < w; px += 4) {
      const nx = px / w;
      const boundY = -(weights[0] * nx + weights[2]) / weights[1];
      const boundPx = boundY * h;
      ctx.fillStyle = 'rgba(232, 144, 154, 0.06)';
      ctx.fillRect(px, 0, 4, boundPx);
      ctx.fillStyle = 'rgba(180, 220, 200, 0.06)';
      ctx.fillRect(px, boundPx, 4, h - boundPx);
    }
  }

  // draw decision boundary
  if (weights[1] !== 0) {
    const x0 = 0, y0 = -(weights[0] * 0 + weights[2]) / weights[1];
    const x1 = 1, y1 = -(weights[0] * 1 + weights[2]) / weights[1];
    ctx.beginPath();
    ctx.moveTo(x0 * w, y0 * h);
    ctx.lineTo(x1 * w, y1 * h);
    ctx.strokeStyle = '#c0607a';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // draw points
  for (const p of points) {
    const px = p.x * w;
    const py = p.y * h;
    const correct = predict(p.x, p.y) === p.label;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    if (p.label === 1) {
      ctx.fillStyle = correct ? 'rgba(248, 190, 205, 0.85)' : 'rgba(248, 190, 205, 0.25)';
      ctx.strokeStyle = '#c0607a';
    } else {
      ctx.fillStyle = correct ? 'rgba(180, 170, 200, 0.85)' : 'rgba(180, 170, 200, 0.25)';
      ctx.strokeStyle = '#9080b0';
    }
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  }
}

function stopTraining() {
  training = false;
  clearInterval(trainInterval);
}

function reset() {
  stopTraining();
  weights = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
  epoch = 0;
  errors = 0;
  generatePoints();
  updateStats();
  draw();
}

document.getElementById('btn-reset').addEventListener('click', reset);

document.getElementById('btn-step').addEventListener('click', () => {
  stopTraining();
  stepEpoch();
});

document.getElementById('btn-train').addEventListener('click', () => {
  if (training) return;
  training = true;
  trainInterval = setInterval(stepEpoch, 120);
});

document.getElementById('btn-stop').addEventListener('click', stopTraining);

document.getElementById('r-eta').addEventListener('input', e => {
  eta = +e.target.value / 100;
  document.getElementById('o-eta').textContent = eta.toFixed(2);
});

document.getElementById('r-points').addEventListener('input', e => {
  numPoints = +e.target.value;
  document.getElementById('o-points').textContent = numPoints;
  reset();
});

window.addEventListener('resize', () => { resize(); draw(); });
resize();
reset();