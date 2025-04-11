const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// SVG output elements
const svgOutput = document.getElementById('svgOutput');
const svgCode = document.getElementById('svgCode');
const showSvgBtn = document.getElementById('showSvgBtn');
const hideSvgBtn = document.getElementById('hideSvgBtn');
const copyBtn = document.getElementById('copyBtn');

// Make sure canvas is properly sized
function resizeCanvas() {
  const container = document.querySelector('.container');
  const containerWidth = container.clientWidth - 60; // Adjust for padding
  const aspectRatio = canvas.height / canvas.width;
  
  // Set canvas display dimensions
  if (containerWidth < canvas.width) {
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = (containerWidth * aspectRatio) + 'px';
  } else {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  }
}

// Call resize on load and window resize
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

const colorPicker = document.getElementById('colorPicker');
const complexitySlider = document.getElementById('complexitySlider');
const smoothnessSlider = document.getElementById('smoothnessSlider');
const randomnessSlider = document.getElementById('randomnessSlider');
const colorValue = document.getElementById('colorValue');
const complexityValue = document.getElementById('complexityValue');
const smoothnessValue = document.getElementById('smoothnessValue');
const randomnessValue = document.getElementById('randomnessValue');
const randomizeBtn = document.getElementById('randomizeBtn');
const svgBtn = document.getElementById('svgBtn');
const pngBtn = document.getElementById('pngBtn');

let blobColor = '#ff1b69';
let complexity = 6;
let smoothness = 70;
let randomness = 50;
let points = [];
let controlPoints1 = [];
let controlPoints2 = [];
let currentSvgCode = '';

function updateUI() {
  colorValue.textContent = blobColor.toUpperCase();
  complexityValue.textContent = complexity;
  smoothnessValue.textContent = smoothness;
  randomnessValue.textContent = randomness;
}

function generatePoints(n) {
  points = [];
  // Scale radius to fit canvas
  const minDimension = Math.min(canvas.width, canvas.height);
  const radius = minDimension * 0.35; // Reduced radius to make sure it fits
  
  const angleStep = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const angle = angleStep * i;
    // Scale randomness based on radius
    const randomFactor = (randomness / 100) * radius * 0.5;
    const randomRadius = radius + (Math.random() * randomFactor * 2) - randomFactor;
    const x = canvas.width / 2 + Math.cos(angle) * randomRadius;
    const y = canvas.height / 2 + Math.sin(angle) * randomRadius;
    points.push({ x, y });
  }
}

function calculateControlPoints() {
  controlPoints1 = [];
  controlPoints2 = [];
  const smoothFactor = smoothness / 100;
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const dx = p2.x - p0.x;
    const dy = p2.y - p0.y;

    const cp1 = {
      x: p1.x - dx * smoothFactor * 0.3,
      y: p1.y - dy * smoothFactor * 0.3
    };

    const cp2 = {
      x: p1.x + dx * smoothFactor * 0.3,
      y: p1.y + dy * smoothFactor * 0.3
    };

    controlPoints1.push(cp1);
    controlPoints2.push(cp2);
  }
}

function drawBlob() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length; i++) {
    const p1 = points[(i + 1) % points.length];
    const cp1 = controlPoints2[i];
    const cp2 = controlPoints1[(i + 1) % points.length];
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
  }

  ctx.closePath();
  ctx.fillStyle = blobColor;
  ctx.fill();
}

function generateBlob() {
  generatePoints(complexity);
  calculateControlPoints();
  drawBlob();
  generateSvgCode(); // Update SVG code whenever blob changes
}

function generateSvgCode() {
  let pathData = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cp1 = controlPoints2[i];
    const cp2 = controlPoints1[(i + 1) % points.length];
    const next = points[(i + 1) % points.length];

    if (i === 0) {
      pathData += `M${p.x.toFixed(1)},${p.y.toFixed(1)} `;
    }
    pathData += `C${cp1.x.toFixed(1)},${cp1.y.toFixed(1)} ${cp2.x.toFixed(1)},${cp2.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)} `;
  }
  pathData += 'Z';
  
  currentSvgCode = `<svg viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
<path d="${pathData}" fill="${blobColor}"/>
</svg>`;
  
  // Update the code display if it's visible
  if (svgOutput.style.display !== 'none') {
    svgCode.textContent = currentSvgCode;
  }
  
  return currentSvgCode;
}

// Event listeners
colorPicker.addEventListener('input', (e) => {
  blobColor = e.target.value;
  updateUI();
  drawBlob();
  generateSvgCode();
});

complexitySlider.addEventListener('input', (e) => {
  complexity = parseInt(e.target.value);
  updateUI();
  generateBlob();
});

smoothnessSlider.addEventListener('input', (e) => {
  smoothness = parseInt(e.target.value);
  updateUI();
  calculateControlPoints();
  drawBlob();
  generateSvgCode();
});

randomnessSlider.addEventListener('input', (e) => {
  randomness = parseInt(e.target.value);
  updateUI();
  generateBlob();
});

randomizeBtn.addEventListener('click', generateBlob);

svgBtn.addEventListener('click', () => {
  const svg = generateSvgCode();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blob-shape.svg';
  link.click();
});

pngBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'blob-shape.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Show SVG code button
showSvgBtn.addEventListener('click', () => {
  generateSvgCode(); // Make sure code is up to date
  svgCode.textContent = currentSvgCode;
  svgOutput.style.display = 'block';
  hideSvgBtn.style.display = 'block';
  showSvgBtn.style.display = 'none';
});

// Hide SVG code button
hideSvgBtn.addEventListener('click', () => {
  svgOutput.style.display = 'none';
  hideSvgBtn.style.display = 'none';
  showSvgBtn.style.display = 'block';
});

// Copy SVG code button
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(currentSvgCode).then(() => {
    // Change button text temporarily to show feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1500);
  });
});

// Initial render
updateUI();
// Run generateBlob after a small delay to ensure canvas is ready
setTimeout(generateBlob, 100);