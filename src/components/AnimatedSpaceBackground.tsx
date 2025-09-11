import React, { useEffect, useRef } from 'react';

type AnimatedSpaceBackgroundProps = {
  className?: string;
  starCount?: number;
  maxSpeed?: number;
  shootingStarIntervalMs?: number;
  pauseWhenOffscreen?: boolean;
};

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  twinkleOffset: number;
  color: string;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const AnimatedSpaceBackground: React.FC<AnimatedSpaceBackgroundProps> = ({
  className,
  starCount = 200,
  maxSpeed = 0.35,
  shootingStarIntervalMs = 3000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const inViewRef = useRef<boolean>(true);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initStars = (width: number, height: number) => {
    const cores = (navigator as any)?.hardwareConcurrency || 4;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const perfFactor = clamp(cores / 8, 0.35, 1);
    const dprFactor = dpr > 1.3 ? 0.85 : 1;
    const density = Math.floor(clamp(starCount * perfFactor * dprFactor, 60, 700));
    const stars: Star[] = [];

    for (let i = 0; i < density; i++) {
      const layer = Math.random();
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + layer * 0.7,
        size: 0.6 + layer * 1.4,
        speed: 0.05 + layer * (maxSpeed * perfFactor),
        twinkleOffset: Math.random() * Math.PI * 2,
        color: layer > 0.7 ? 'rgba(147,197,253,1)' : layer > 0.4 ? 'rgba(103,232,249,1)' : 'rgba(203,213,225,1)'
      });
    }

    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Intersection observer to pause when offscreen
    let io: IntersectionObserver | null = null;
    if (hostRef.current) {
      io = new IntersectionObserver((entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
        if (inViewRef.current && !rafRef.current) {
          last = performance.now();
          rafRef.current = requestAnimationFrame(loop);
        }
      }, { threshold: 0.01 });
      io.observe(hostRef.current);
    }

    // Pause when tab not visible
    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else if (!rafRef.current && inViewRef.current) {
        last = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(canvas.clientWidth, canvas.clientHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    const bgColor = '#000000';

    const loop = (now: number) => {
      if (!inViewRef.current || prefersReducedMotion) {
        // Draw static frame and pause
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      const dt = now - last;
      last = now;

      // Background fill (pure black)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      // Stars
      const stars = starsRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const speed = prefersReducedMotion ? 0.05 : s.speed;
        s.x -= speed * (dt * 0.06);
        if (s.x < -2) {
          s.x = width + 2;
          s.y = Math.random() * height;
        }

        const twinkle = prefersReducedMotion ? 1 : 0.75 + 0.25 * Math.sin(now * 0.002 + s.twinkleOffset);
        ctx.globalAlpha = 0.7 * twinkle;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Shooting star
      if (!prefersReducedMotion) {
        const sinceLast = now - lastSpawnRef.current;
        if (!shootingRef.current && sinceLast > shootingStarIntervalMs) {
          lastSpawnRef.current = now;
          shootingRef.current = {
            x: Math.random() * width,
            y: Math.random() * (height * 0.4),
            vx: -(2 + Math.random() * 2),
            vy: 1 + Math.random() * 1.5,
            life: 0,
            maxLife: 900 + Math.random() * 600
          };
        }

        const sh = shootingRef.current;
        if (sh) {
          sh.life += dt;
          sh.x += sh.vx * (dt * 0.06);
          sh.y += sh.vy * (dt * 0.06);

          const lifeRatio = 1 - clamp(sh.life / sh.maxLife, 0, 1);
          const len = 80 * lifeRatio;

          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * len, sh.y - sh.vy * len);
          grad.addColorStop(0, 'rgba(255,255,255,0.85)');
          grad.addColorStop(1, 'rgba(59,130,246,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * len, sh.y - sh.vy * len);
          ctx.stroke();

          if (sh.life >= sh.maxLife || sh.x < -100 || sh.y > height + 100) {
            shootingRef.current = null;
            lastSpawnRef.current = now;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (io && hostRef.current) io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [starCount, maxSpeed, prefersReducedMotion, shootingStarIntervalMs]);

  return (
    <div ref={hostRef} className={className} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default AnimatedSpaceBackground;


