// Cache for storing loaded images
const imageCache = new Map();
const totalFrames = 10;
let imagesLoaded = false;

// Preload images
function preloadImages() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          imagesLoaded = true;
          resolve();
        }
      };
      img.src = `star/frame_${i}.png`; // Replace with your image paths
      imageCache.set(i, img);
    }
  });
}

class Particle {
  constructor(canvas, x, y) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = this.getRandomColor();
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.02;
  }

  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= this.decay;
    this.size -= 0.1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initializeCanvas(canvasElement, frameRate, color, isRandom) {
  const ctx = canvasElement.getContext('2d');
  let currentFrame = 0;
  let lastFrameTime = 0;
  let fps = frameRate;
  let overlayColor = color;

  const originalWidth = 500;
  const originalHeight = 500;
  const newWidth = Math.floor(originalWidth * 1.75);
  const newHeight = Math.floor(originalHeight * 1.75);

  let particles = [];
  let lastBurstTime = 0;
  let nextBurstDelay = getRandomDelay();
  let burstActive = false;

  function getRandomDelay() {
    return Math.random() * 10000 + 10000; // Random delay between 10-20 seconds
  }

  function createBurst() {
    const burstX = Math.random() * canvasElement.width;
    const burstY = Math.random() * canvasElement.height;
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(canvasElement, burstX, burstY));
    }
    lastBurstTime = performance.now();
    nextBurstDelay = getRandomDelay();
    burstActive = true;
  }

  function animate(currentTime) {
    requestAnimationFrame(animate);

    if (currentTime - lastFrameTime < 1000 / fps) return;

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (imagesLoaded) {
      ctx.drawImage(
        imageCache.get(currentFrame),
        0,
        0,
        originalWidth,
        originalHeight,
        0,
        0,
        newWidth,
        newHeight
      );

      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = overlayColor;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      currentFrame = (currentFrame + 1) % totalFrames;
    }

    // Update and draw particles
    particles = particles.filter(
      (particle) => particle.alpha > 0 && particle.size > 0
    );
    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    // Check if all particles have disappeared
    if (burstActive && particles.length === 0) {
      burstActive = false;
      lastBurstTime = currentTime;
    }

    // Check if it's time for a new burst
    if (!burstActive && currentTime - lastBurstTime > nextBurstDelay) {
      createBurst();
    }

    lastFrameTime = currentTime;

    if (isRandom) {
      updateRandomSettings();
    }
  }

  function updateRandomSettings() {
    fps = Math.floor(Math.random() * 22) + 1;
    overlayColor = getRandomColor();
  }

  function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)}, ${Math.random().toFixed(2)})`;
  }

  if (isRandom) {
    updateRandomSettings();
  }

  requestAnimationFrame(animate);
}

// Preload images before initializing canvases
preloadImages().then(() => {
  console.log('Images loaded and cached');
  // Here you should call initializeCanvas for each canvas you want to create
  // For example:
  // const canvas1 = document.getElementById('canvas1');
  // initializeCanvas(canvas1, 30, 'rgba(255, 0, 0, 0.5)', false);
});
