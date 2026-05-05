// 星空海粒子系统 (航行者版)
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  phase: number;
  twinkleSpeed: number;
}

const PARTICLE_COUNT = 120; // 增加星点密度
const GOLD = '#fbbf24'; // 暖金
const STARDUST = '#fff7ed'; // 奶白星尘
const FPS_INTERVAL = 1000 / 30;

function alphaHex(a: number): string {
  const v = Math.max(0, Math.min(255, Math.round(a * 255)));
  return v.toString(16).padStart(2, '0');
}

function createParticle(w: number, h: number): Particle {
  const isGold = Math.random() < 0.4;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    // 增加一个统一的向左微弱漂移 (vx)，模拟船只向右前行
    vx: -0.05 - Math.random() * 0.15,
    vy: (Math.random() - 0.5) * 0.05,
    size: 0.5 + Math.random() * 1.5, // 更细碎的星尘
    alpha: 0.1 + Math.random() * 0.5,
    color: isGold ? GOLD : STARDUST,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.01 + Math.random() * 0.03,
  };
}

export function initParticles() {
  const canvas = document.getElementById('ambient-particles') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let particles: Particle[] = [];
  let animId = 0;
  let lastFrame = 0;
  let running = true;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function spawn() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(w, h));
  }

  function draw(p: Particle) {
    // 增加闪烁效果
    const twinkle = p.alpha * (0.6 + Math.sin(p.phase) * 0.4);
    
    ctx!.beginPath();
    ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx!.fillStyle = p.color + alphaHex(twinkle);
    
    // 只给明亮的星星加一点点发光
    if (p.size > 1.2) {
      ctx!.shadowBlur = p.size * 5;
      ctx!.shadowColor = p.color;
    }
    
    ctx!.fill();
    ctx!.shadowBlur = 0;
  }

  function loop(now: number) {
    if (!running) return;
    animId = requestAnimationFrame(loop);

    const delta = now - lastFrame;
    if (delta < FPS_INTERVAL) return;
    lastFrame = now - (delta % FPS_INTERVAL);

    ctx!.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.twinkleSpeed;

      // 循环边界：从左侧消失后从右侧出现，保持航行感
      if (p.x < 0) {
        p.x = w;
        p.y = Math.random() * h;
      }
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      draw(p);
    }
  }

  function start() {
    running = true;
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animId);
    ctx!.clearRect(0, 0, w, h);
  }

  resize();
  spawn();
  start();

  window.addEventListener('resize', () => {
    resize();
    spawn();
  });

  // 监听 Astro 的 View Transitions，确保切页后重新初始化
  document.addEventListener('astro:after-swap', () => {
    stop();
    resize();
    spawn();
    start();
  });

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    stop();
  }
}

// 统一执行
if (typeof document !== 'undefined') {
  initParticles();
}

