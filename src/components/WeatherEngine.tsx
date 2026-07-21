import React, { useEffect, useRef } from 'react';
import { Hub } from '../types';

// --- WEATHER SIMULATOR HELPER DATA & CONFIGS ---

export const WeatherAnimationsStyle = () => (
  <style>{`
    @keyframes rainFall {
      0% { transform: translateY(-100%) translateX(0); opacity: 0; }
      10% { opacity: 0.85; }
      90% { opacity: 0.85; }
      100% { transform: translateY(480px) translateX(-40px); opacity: 0; }
    }
    @keyframes snowFall {
      0% { transform: translateY(-10%) translateX(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.95; }
      90% { opacity: 0.95; }
      100% { transform: translateY(450px) translateX(30px) rotate(360deg); opacity: 0; }
    }
    @keyframes mistDrift {
      0% { transform: translateX(-15%) translateY(0); opacity: 0.25; }
      50% { opacity: 0.65; }
      100% { transform: translateX(15%) translateY(5px); opacity: 0.25; }
    }
    @keyframes starTwinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1.0; transform: scale(1.3); }
    }
    @keyframes lightningFlash {
      0%, 94%, 96%, 100% { opacity: 0; }
      95% { opacity: 0.45; }
    }
    @keyframes cloudDrift {
      0% { transform: translateX(-15%); }
      100% { transform: translateX(15%); }
    }
    .animate-rain-drop {
      animation: rainFall linear infinite;
    }
    .animate-snow-flake {
      animation: snowFall linear infinite;
    }
    .animate-mist-drift {
      animation: mistDrift ease-in-out infinite alternate;
    }
    .animate-star-twinkle {
      animation: starTwinkle ease-in-out infinite;
    }
    .animate-lightning-flash {
      animation: lightningFlash 7s infinite;
    }
    .animate-cloud-drift {
      animation: cloudDrift 50s linear infinite alternate;
    }
  `}</style>
);

export const CanvasWeatherParticles = ({ weatherTheme }: { weatherTheme: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = container.clientWidth;
    let height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;

    interface Particle {
      x: number;
      y: number;
      vy: number;
      vx: number;
      size: number;
      opacity: number;
      color: string;
      swaySpeed?: number;
      swayOffset?: number;
      growth?: number;
      maxSize?: number;
    }

    let particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles = [];
      let count = 0;
      if (weatherTheme === 'rain') count = 75;
      else if (weatherTheme === 'snow') count = 55;
      else if (weatherTheme === 'fog') count = 15;
      else if (weatherTheme === 'thunderstorm') count = 80;
      else if (weatherTheme === 'windy' || weatherTheme === 'cloudy' || weatherTheme === 'partly_cloudy') count = 25;
      else if (weatherTheme === 'sunny') count = 24;
      else if (weatherTheme === 'night') count = 45;

      for (let i = 0; i < count; i++) {
        if (weatherTheme === 'rain' || weatherTheme === 'thunderstorm') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h - h,
            vy: 5 + Math.random() * 5 + (weatherTheme === 'thunderstorm' ? 3 : 0),
            vx: -1 - Math.random() * 1.2,
            size: 1.5 + Math.random() * 2.0,
            opacity: 0.35 + Math.random() * 0.45,
            color: 'rgba(186, 230, 253, ',
          });
        } else if (weatherTheme === 'snow') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h - h,
            vy: 0.6 + Math.random() * 1.0,
            vx: -0.4 + Math.random() * 0.8,
            size: 2.5 + Math.random() * 4.0,
            opacity: 0.4 + Math.random() * 0.5,
            color: 'rgba(255, 255, 255, ',
            swaySpeed: 0.01 + Math.random() * 0.02,
            swayOffset: Math.random() * Math.PI * 2,
          });
        } else if (weatherTheme === 'fog') {
          const maxSize = 100 + Math.random() * 150;
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vy: -0.05 + Math.random() * 0.1,
            vx: 0.08 + Math.random() * 0.2,
            size: 40 + Math.random() * 60,
            opacity: 0.05 + Math.random() * 0.08,
            color: 'rgba(228, 228, 231, ',
            growth: 0.02 + Math.random() * 0.04,
            maxSize,
          });
        } else if (weatherTheme === 'windy' || weatherTheme === 'cloudy' || weatherTheme === 'partly_cloudy') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vy: -0.05 + Math.random() * 0.1,
            vx: weatherTheme === 'windy' ? 2.0 + Math.random() * 2.5 : 0.3 + Math.random() * 0.6,
            size: 40 + Math.random() * 80,
            opacity: 0.08 + Math.random() * 0.12,
            color: 'rgba(255, 255, 255, ',
          });
        } else if (weatherTheme === 'sunny') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vy: -0.15 - Math.random() * 0.25,
            vx: -0.15 + Math.random() * 0.3,
            size: 2 + Math.random() * 3.5,
            opacity: 0.3 + Math.random() * 0.5,
            color: 'rgba(251, 191, 36, ',
            swaySpeed: 0.02 + Math.random() * 0.02,
            swayOffset: Math.random() * Math.PI * 2,
          });
        } else if (weatherTheme === 'night') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.8,
            vy: 0,
            vx: 0,
            size: Math.random() > 0.85 ? 2.5 : 1.5,
            opacity: 0.4 + Math.random() * 0.6,
            color: 'rgba(255, 255, 255, ',
            swaySpeed: 0.01 + Math.random() * 0.03,
            swayOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initParticles(width, height);

    let resizeTimeout: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const newW = entry.contentRect.width;
          const newH = entry.contentRect.height;
          if (newW > 0 && newH > 0) {
            width = newW;
            height = newH;
            canvas.width = newW;
            canvas.height = newH;
            initParticles(newW, newH);
          }
        }, 100);
      }
    });

    resizeObserver.observe(container);

    const getParticleBaseColor = (theme: string, isDark: boolean): string => {
      if (isDark) {
        if (theme === 'rain' || theme === 'thunderstorm') return 'rgba(186, 230, 253, '; // light sky blue
        if (theme === 'snow') return 'rgba(255, 255, 255, '; // white
        if (theme === 'fog') return 'rgba(228, 228, 231, '; // zinc-200
        if (theme === 'windy' || theme === 'cloudy' || theme === 'partly_cloudy') return 'rgba(255, 255, 255, '; // white
        if (theme === 'sunny') return 'rgba(251, 191, 36, '; // amber-400
        if (theme === 'night') return 'rgba(255, 255, 255, '; // white
        return 'rgba(255, 255, 255, ';
      } else {
        // Light mode - use higher contrast, beautifully visible colors!
        if (theme === 'rain' || theme === 'thunderstorm') return 'rgba(2, 132, 199, '; // sky-600 (vibrant blue)
        if (theme === 'snow') return 'rgba(100, 116, 139, '; // slate-500 (clearly visible soft snowflakes)
        if (theme === 'fog') return 'rgba(113, 113, 122, '; // zinc-500 (visible fog clouds)
        if (theme === 'windy' || theme === 'cloudy' || theme === 'partly_cloudy') return 'rgba(100, 116, 139, '; // slate-500 (slate cloud lines)
        if (theme === 'sunny') return 'rgba(245, 158, 11, '; // amber-500 (vibrant warm golden amber)
        if (theme === 'night') return 'rgba(30, 41, 59, '; // slate-800 (slate stars)
        return 'rgba(71, 85, 105, ';
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const currentColor = getParticleBaseColor(weatherTheme, isDark);

      if (weatherTheme === 'thunderstorm' && Math.random() > 0.985) {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(2, 132, 199, 0.15)';
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        if (weatherTheme === 'rain' || weatherTheme === 'thunderstorm') {
          ctx.beginPath();
          ctx.strokeStyle = `${currentColor}${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.2, p.y + p.vy * 1.2);
          ctx.stroke();

          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else if (weatherTheme === 'snow') {
          p.swayOffset! += p.swaySpeed!;
          const curVx = p.vx + Math.sin(p.swayOffset!) * 0.2;

          ctx.beginPath();
          ctx.fillStyle = `${currentColor}${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += curVx;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        } else if (weatherTheme === 'fog') {
          p.size += p.growth!;
          if (p.size > p.maxSize!) {
            p.size = 30 + Math.random() * 40;
          }

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `${currentColor}${p.opacity})`);
          grad.addColorStop(0.5, `${currentColor}${p.opacity * 0.4})`);
          grad.addColorStop(1, `${currentColor}0)`);

          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x - p.size > width) {
            p.x = -p.size;
            p.y = Math.random() * height;
          }
        } else if (weatherTheme === 'windy' || weatherTheme === 'cloudy' || weatherTheme === 'partly_cloudy') {
          ctx.beginPath();
          const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.size, p.y);
          grad.addColorStop(0, `${currentColor}0)`);
          grad.addColorStop(0.5, `${currentColor}${p.opacity})`);
          grad.addColorStop(1, `${currentColor}0)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1 + Math.random() * 1.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.size, p.y + p.vy * 4);
          ctx.stroke();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x > width) {
            p.x = -p.size - 20;
            p.y = Math.random() * height;
          }
        } else if (weatherTheme === 'sunny') {
          p.swayOffset! += p.swaySpeed!;
          const curVx = p.vx + Math.sin(p.swayOffset!) * 0.15;

          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, `${currentColor}${p.opacity})`);
          grad.addColorStop(1, `${currentColor}0)`);

          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += curVx;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else if (weatherTheme === 'night') {
          p.swayOffset! += p.swaySpeed!;
          const currentOpacity = Math.max(0.1, p.opacity * (0.6 + Math.sin(p.swayOffset!) * 0.4));

          ctx.beginPath();
          ctx.fillStyle = `${currentColor}${currentOpacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [weatherTheme]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export const SunraysAnimation = () => <CanvasWeatherParticles weatherTheme="sunny" />;
export const RainAnimation = () => <CanvasWeatherParticles weatherTheme="rain" />;
export const SnowAnimation = () => <CanvasWeatherParticles weatherTheme="snow" />;
export const FogAnimation = () => <CanvasWeatherParticles weatherTheme="fog" />;
export const NightAnimation = () => <CanvasWeatherParticles weatherTheme="night" />;
export const ThunderstormAnimation = () => <CanvasWeatherParticles weatherTheme="thunderstorm" />;
export const CloudsAnimation = ({ fast = false }: { fast?: boolean }) => <CanvasWeatherParticles weatherTheme={fast ? "windy" : "cloudy"} />;

export const getHubCoords = (hubId: string, hubObj?: Hub) => {
  if (hubObj?.latitude && hubObj?.longitude) {
    return { lat: hubObj.latitude, lon: hubObj.longitude };
  }
  const id = hubId.toLowerCase();
  if (id.includes('gangtok')) return { lat: 27.33, lon: 88.61 };
  if (id.includes('lachen')) return { lat: 27.72, lon: 88.55 };
  if (id.includes('lachung')) return { lat: 27.69, lon: 88.64 };
  if (id.includes('pelling')) return { lat: 27.30, lon: 88.24 };
  if (id.includes('namchi')) return { lat: 27.17, lon: 88.35 };
  if (id.includes('siliguri')) return { lat: 26.72, lon: 88.42 };
  if (id.includes('darjeeling')) return { lat: 27.04, lon: 88.26 };
  if (id.includes('ravangla')) return { lat: 27.21, lon: 88.36 };
  if (id.includes('mangan')) return { lat: 27.50, lon: 88.53 };
  if (id.includes('changu') || id.includes('tsomgo')) return { lat: 27.37, lon: 88.76 };
  if (id.includes('zulu') || id.includes('zuluk')) return { lat: 27.25, lon: 88.78 };
  return { lat: 27.33, lon: 88.61 };
};

export const mapWMOCodeToTheme = (code: number, windSpeed: number, hour?: number): string => {
  if (windSpeed > 25) return 'windy';

  if (code === 0) return 'sunny';
  if (code === 1 || code === 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'rain';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm';

  return 'sunny';
};

export interface WeatherThemeConfig {
  id: string;
  badge: string;
  bgUrl: string;
  overlayGradient: string;
  accentColor: string;
  bgAccentColor: string;
  borderAccent: string;
  defaultTemp: number;
  defaultVisibility: string;
  defaultHumidity: string;
  defaultWind: string;
  roadStatusDesc: string;
  safetyMsg: string;
  ctaText: string;
  animationType: 'sunray' | 'clouds' | 'rain' | 'lightning' | 'fog' | 'snow' | 'wind' | 'starry' | 'none';
  atmosphereDesc: string;
  imageFilter: string;
  overlayBlendMode: string;
  overlayColor: string;
}

export const weatherConfigs: Record<string, WeatherThemeConfig> = {
  sunny: {
    id: 'sunny',
    badge: '☀ Sunny',
    bgUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-amber-500/5 via-transparent to-[#030d07]/25',
    accentColor: 'text-amber-400',
    bgAccentColor: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    borderAccent: 'border-amber-500/20',
    defaultTemp: 18,
    defaultVisibility: '10 km',
    defaultHumidity: '45%',
    defaultWind: '8 km/h',
    roadStatusDesc: 'Perfect driving conditions.',
    safetyMsg: 'Excellent Driving Conditions',
    ctaText: 'Start Journey',
    animationType: 'sunray',
    atmosphereDesc: 'Perfect crystal clear sky offering panoramic mountain horizons.',
    imageFilter: 'brightness(1.04) contrast(1.02) saturate(1.1) sepia(0.04)',
    overlayBlendMode: 'overlay',
    overlayColor: 'rgba(245, 158, 11, 0.08)',
  },
  partly_cloudy: {
    id: 'partly_cloudy',
    badge: '🌤 Partly Cloudy',
    bgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-sky-500/5 via-transparent to-[#030d07]/30',
    accentColor: 'text-sky-400',
    bgAccentColor: 'bg-sky-400/10 border-sky-400/20 text-sky-400',
    borderAccent: 'border-sky-500/20',
    defaultTemp: 16,
    defaultVisibility: '8 km',
    defaultHumidity: '55%',
    defaultWind: '12 km/h',
    roadStatusDesc: 'Good visibility with soft rolling cloud covers.',
    safetyMsg: 'Stable dry asphalt across all valleys.',
    ctaText: 'Start Journey',
    animationType: 'clouds',
    atmosphereDesc: 'Soft clouds sweeping past majestic valley tops, casting dynamic shadows.',
    imageFilter: 'brightness(1.0) contrast(1.0) saturate(1.05)',
    overlayBlendMode: 'overlay',
    overlayColor: 'rgba(14, 165, 233, 0.05)',
  },
  cloudy: {
    id: 'cloudy',
    badge: '☁ Cloudy',
    bgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-slate-500/5 via-transparent to-[#030d07]/30',
    accentColor: 'text-slate-300',
    bgAccentColor: 'bg-slate-300/10 border-slate-300/20 text-slate-300',
    borderAccent: 'border-slate-500/20',
    defaultTemp: 14,
    defaultVisibility: '5 km',
    defaultHumidity: '70%',
    defaultWind: '15 km/h',
    roadStatusDesc: 'Cloudy summits. Overcast but safe.',
    safetyMsg: 'Overcast Skies',
    ctaText: 'Start Journey',
    animationType: 'clouds',
    atmosphereDesc: 'Heavy overcast cloud deck lending a dramatic, moody posture to the peaks.',
    imageFilter: 'brightness(0.88) contrast(0.96) saturate(0.8) grayscale(0.12)',
    overlayBlendMode: 'multiply',
    overlayColor: 'rgba(100, 116, 139, 0.12)',
  },
  rain: {
    id: 'rain',
    badge: '🌧 Rain',
    bgUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-teal-900/5 via-transparent to-[#030d07]/35',
    accentColor: 'text-teal-400',
    bgAccentColor: 'bg-teal-400/10 border-teal-400/20 text-teal-400',
    borderAccent: 'border-teal-500/20',
    defaultTemp: 12,
    defaultVisibility: '3 km',
    defaultHumidity: '95%',
    defaultWind: '18 km/h',
    roadStatusDesc: 'Slick mountain roads. Drive with vigilance.',
    safetyMsg: 'Wet Roads',
    ctaText: 'Drive Carefully',
    animationType: 'rain',
    atmosphereDesc: 'Drizzling rain wash. Glistening wet forests and roaring waterfalls.',
    imageFilter: 'brightness(0.78) contrast(1.05) saturate(0.7) hue-rotate(8deg)',
    overlayBlendMode: 'multiply',
    overlayColor: 'rgba(13, 148, 136, 0.18)',
  },
  thunderstorm: {
    id: 'thunderstorm',
    badge: '⛈ Thunderstorm',
    bgUrl: 'https://images.unsplash.com/photo-1472120480752-227096c6aa7d?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-violet-950/10 via-transparent to-[#030d07]/40',
    accentColor: 'text-orange-400',
    bgAccentColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    borderAccent: 'border-orange-500/20',
    defaultTemp: 11,
    defaultVisibility: '1.5 km',
    defaultHumidity: '98%',
    defaultWind: '32 km/h',
    roadStatusDesc: 'Heavy downpours. High risk of localized mudflows.',
    safetyMsg: 'Avoid Night Driving',
    ctaText: 'Road Alerts',
    animationType: 'lightning',
    atmosphereDesc: 'Fierce mountain storm. Roaring gorges with active weather warnings.',
    imageFilter: 'brightness(0.62) contrast(1.18) saturate(0.65) hue-rotate(15deg)',
    overlayBlendMode: 'color-burn',
    overlayColor: 'rgba(76, 29, 149, 0.22)',
  },
  fog: {
    id: 'fog',
    badge: '🌫 Fog',
    bgUrl: 'https://images.unsplash.com/photo-1494005612480-90f50dc941d7?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-zinc-500/5 via-transparent to-[#030d07]/30',
    accentColor: 'text-zinc-300',
    bgAccentColor: 'bg-zinc-400/10 border-zinc-400/20 text-zinc-300',
    borderAccent: 'border-zinc-500/20',
    defaultTemp: 9,
    defaultVisibility: '300 m',
    defaultHumidity: '100%',
    defaultWind: '6 km/h',
    roadStatusDesc: 'Low Visibility. Use yellow fog lamps.',
    safetyMsg: 'Low Visibility',
    ctaText: 'Check Visibility',
    animationType: 'fog',
    atmosphereDesc: 'Dense white pea-soup fog creeping up through pine forests, masking curves.',
    imageFilter: 'brightness(0.86) contrast(0.82) saturate(0.65) blur(0.5px)',
    overlayBlendMode: 'overlay',
    overlayColor: 'rgba(228, 228, 231, 0.22)',
  },
  snow: {
    id: 'snow',
    badge: '❄ Snow',
    bgUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-sky-300/5 via-transparent to-[#030d07]/25',
    accentColor: 'text-sky-200',
    bgAccentColor: 'bg-sky-200/10 border-sky-200/20 text-sky-200',
    borderAccent: 'border-sky-300/20',
    defaultTemp: -2,
    defaultVisibility: '2 km',
    defaultHumidity: '90%',
    defaultWind: '10 km/h',
    roadStatusDesc: 'Snow accumulation on high passes.',
    safetyMsg: 'Chains Recommended',
    ctaText: 'Snow Route Tips',
    animationType: 'snow',
    atmosphereDesc: 'Frozen, snow-cloaked pine passes radiating pristine silence.',
    imageFilter: 'brightness(1.08) contrast(0.96) saturate(0.85) sepia(0.03) hue-rotate(-8deg)',
    overlayBlendMode: 'overlay',
    overlayColor: 'rgba(186, 230, 253, 0.12)',
  },
  windy: {
    id: 'windy',
    badge: '🌬 Windy',
    bgUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
    overlayGradient: 'from-teal-500/5 via-transparent to-[#030d07]/30',
    accentColor: 'text-emerald-400',
    bgAccentColor: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
    borderAccent: 'border-emerald-500/20',
    defaultTemp: 13,
    defaultVisibility: '9 km',
    defaultHumidity: '40%',
    defaultWind: '28 km/h',
    roadStatusDesc: 'High gust wind sweeps across high ridges.',
    safetyMsg: 'High Wind Gales',
    ctaText: 'Start Journey',
    animationType: 'wind',
    atmosphereDesc: 'Biting mountain gales whipping through alpine passes, rustling dry foliage.',
    imageFilter: 'brightness(0.92) contrast(1.04) saturate(0.9) hue-rotate(4deg)',
    overlayBlendMode: 'multiply',
    overlayColor: 'rgba(52, 211, 153, 0.06)',
  }
};

export const seasonConfigs: Record<string, { name: string; emoji: string; desc: string; storyAdd: string }> = {
  spring: {
    name: "Spring",
    emoji: "🌸",
    desc: "Rhododendrons in full red/pink bloom paint the valleys.",
    storyAdd: "Fresh alpine greenery and vibrant crimson Rhododendrons line the roadsides in magnificent spring bloom."
  },
  summer: {
    name: "Summer",
    emoji: "☀️",
    desc: "Crystal clear mornings with outstanding visibility.",
    storyAdd: "Outstanding, crisp mountain air under pristine summer skies allows for panoramic vistas of the high-altitude ranges."
  },
  monsoon: {
    name: "Monsoon",
    emoji: "🌧️",
    desc: "Roaring waterfalls and lush mossy forests.",
    storyAdd: "Lush evergreen pine forests glisten as swollen mountain streams and waterfalls roar with majestic power under monsoon clouds."
  },
  autumn: {
    name: "Autumn",
    emoji: "🍁",
    desc: "Golden-tinted alpine trees and clear sky.",
    storyAdd: "Golden-hued pine canopies and copper foliage frame the horizon, offering some of the year's clearest sky runs."
  },
  winter: {
    name: "Winter",
    emoji: "❄️",
    desc: "Frozen peaks and snow-flanked valleys.",
    storyAdd: "Pristine white peaks and frozen ridges frame a dramatic high-altitude run, calling for cozy thermals and warm tea stops."
  }
};
