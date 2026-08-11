let canvas, ctx, animationFrameId;
let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 150 };
let currentTheme = 'dark';

export function initCyberCanvas(theme = 'dark') {
  currentTheme = theme;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cyberCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.7';
    document.body.prepend(canvas);

    ctx = canvas.getContext('2d');

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);
  }
  resize();
  if (!animationFrameId) animate();
}

export function setCanvasTheme(theme) {
  currentTheme = theme;
  initParticles();
}

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  const count = Math.floor((width * height) / 16000);
  const isLight = currentTheme === 'light';

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.2 + 1,
      color: isLight
        ? (Math.random() > 0.4 ? 'rgba(99, 102, 241, ' : 'rgba(14, 165, 233, ')
        : (Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, ')
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  const isLight = currentTheme === 'light';
  const lineColor = isLight ? 'rgba(99, 102, 241, ' : 'rgba(0, 240, 255, ';

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    // Mouse interactive attraction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.x += (dx / dist) * force * 1.8;
        p.y += (dy / dist) * force * 1.8;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color + (isLight ? '0.5)' : '0.7)');
    ctx.fill();

    // Connect close particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        const alpha = (1 - dist / 110) * (isLight ? 0.2 : 0.25);
        ctx.strokeStyle = `${lineColor}${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}
