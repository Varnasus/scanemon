export interface BackgroundSettings {
  enabled: boolean;
  timeOfDay: boolean;
  seasonal: boolean;
  rarityPulse: boolean;
  xpLevelTheme: boolean;
  particleDensity: 'low' | 'medium' | 'high';
}

export type BackgroundTheme = 
  | 'default'
  | 'sunrise'
  | 'noon'
  | 'sunset'
  | 'night'
  | 'winter'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'rookie_woods'
  | 'trainer_city'
  | 'champion_hall'
  | 'rare_pulse';

export interface ParticleConfig {
  type: 'snowflake' | 'leaf' | 'petal' | 'sparkle' | 'dust';
  color: string;
  size: number;
  speed: number;
  opacity: number;
}

class BackgroundService {
  private settings: BackgroundSettings = {
    enabled: true,
    timeOfDay: true,
    seasonal: true,
    rarityPulse: true,
    xpLevelTheme: true,
    particleDensity: 'medium'
  };
  private currentTheme: BackgroundTheme = 'default';
  private particleCanvas: HTMLCanvasElement | null = null;
  private animationId: number | null = null;
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    type: string;
  }> = [];

  constructor() {
    this.loadSettings();
    this.initializeTimeOfDay();
    this.initializeSeasonal();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('backgroundSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('backgroundSettings', JSON.stringify(this.settings));
  }

  private initializeTimeOfDay(): void {
    if (!this.settings.timeOfDay) return;

    const hour = new Date().getHours();
    let timeTheme: BackgroundTheme = 'default';

    if (hour >= 5 && hour < 8) timeTheme = 'sunrise';
    else if (hour >= 8 && hour < 17) timeTheme = 'noon';
    else if (hour >= 17 && hour < 20) timeTheme = 'sunset';
    else timeTheme = 'night';

    this.setTheme(timeTheme);
  }

  private initializeSeasonal(): void {
    if (!this.settings.seasonal) return;

    const month = new Date().getMonth();
    let seasonalTheme: BackgroundTheme = 'default';

    if (month >= 11 || month <= 1) seasonalTheme = 'winter';
    else if (month >= 2 && month <= 4) seasonalTheme = 'spring';
    else if (month >= 5 && month <= 7) seasonalTheme = 'summer';
    else seasonalTheme = 'autumn';

    this.setTheme(seasonalTheme);
  }

  public setTheme(theme: BackgroundTheme): void {
    this.currentTheme = theme;
    this.applyBackground();
    this.updateParticles();
  }

  public setXPLevelTheme(level: number): void {
    if (!this.settings.xpLevelTheme) return;

    let theme: BackgroundTheme = 'default';
    if (level < 10) theme = 'rookie_woods';
    else if (level < 50) theme = 'trainer_city';
    else theme = 'champion_hall';

    this.setTheme(theme);
  }

  public triggerRarityPulse(): void {
    if (!this.settings.rarityPulse) return;

    this.setTheme('rare_pulse');
    setTimeout(() => {
      this.initializeTimeOfDay();
    }, 3000);
  }

  private applyBackground(): void {
    const root = document.documentElement;
    
    // Remove existing background classes
    root.classList.remove(
      'bg-sunrise', 'bg-noon', 'bg-sunset', 'bg-night',
      'bg-winter', 'bg-spring', 'bg-summer', 'bg-autumn',
      'bg-rookie-woods', 'bg-trainer-city', 'bg-champion-hall',
      'bg-rare-pulse'
    );

    // Apply new background classes
    const bgClasses = this.getBackgroundClasses(this.currentTheme);
    if (bgClasses.length > 0) {
      bgClasses.forEach(className => {
        if (className.trim()) {
          root.classList.add(className.trim());
        }
      });
    }
  }

  private getBackgroundClasses(theme: BackgroundTheme): string[] {
    const classMap: Record<BackgroundTheme, string[]> = {
      default: [],
      sunrise: ['bg-gradient-to-br', 'from-orange-200', 'via-yellow-100', 'to-blue-200'],
      noon: ['bg-gradient-to-b', 'from-blue-100', 'to-blue-200'],
      sunset: ['bg-gradient-to-br', 'from-orange-400', 'via-pink-300', 'to-purple-400'],
      night: ['bg-gradient-to-b', 'from-gray-900', 'via-blue-900', 'to-purple-900'],
      winter: ['bg-gradient-to-b', 'from-blue-50', 'to-blue-100'],
      spring: ['bg-gradient-to-b', 'from-green-50', 'to-pink-100'],
      summer: ['bg-gradient-to-b', 'from-yellow-50', 'to-orange-100'],
      autumn: ['bg-gradient-to-b', 'from-orange-50', 'to-red-100'],
      rookie_woods: ['bg-gradient-to-b', 'from-green-100', 'to-green-200'],
      trainer_city: ['bg-gradient-to-b', 'from-blue-100', 'to-purple-100'],
      champion_hall: ['bg-gradient-to-b', 'from-yellow-100', 'to-orange-200'],
      rare_pulse: ['bg-gradient-to-br', 'from-purple-400', 'via-pink-400', 'to-yellow-400', 'animate-pulse']
    };

    return classMap[theme] || [];
  }

  public initializeParticles(container: HTMLElement): void {
    if (!this.settings.enabled) return;

    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.style.position = 'fixed';
    this.particleCanvas.style.top = '0';
    this.particleCanvas.style.left = '0';
    this.particleCanvas.style.width = '100%';
    this.particleCanvas.style.height = '100%';
    this.particleCanvas.style.pointerEvents = 'none';
    this.particleCanvas.style.zIndex = '0';

    container.appendChild(this.particleCanvas);
    this.resizeCanvas();
    this.createParticles();
    this.animateParticles();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.particleCanvas) return;

    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
  }

  private createParticles(): void {
    this.particles = [];
    const config = this.getParticleConfig();
    const density = this.getDensityMultiplier();

    for (let i = 0; i < config.count * density; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * config.speed,
        vy: Math.random() * config.speed + 0.5,
        size: Math.random() * config.size + 1,
        opacity: Math.random() * config.opacity + 0.3,
        type: config.type
      });
    }
  }

  private getParticleConfig(): {
    type: string;
    count: number;
    speed: number;
    size: number;
    opacity: number;
  } {
    const configs: Record<BackgroundTheme, { type: string; count: number; speed: number; size: number; opacity: number }> = {
      default: { type: 'dust', count: 20, speed: 0.5, size: 2, opacity: 0.3 },
      sunrise: { type: 'dust', count: 15, speed: 0.4, size: 2, opacity: 0.3 },
      noon: { type: 'dust', count: 10, speed: 0.3, size: 1, opacity: 0.2 },
      sunset: { type: 'dust', count: 20, speed: 0.5, size: 2, opacity: 0.4 },
      night: { type: 'sparkle', count: 30, speed: 0.8, size: 2, opacity: 0.6 },
      winter: { type: 'snowflake', count: 50, speed: 1, size: 3, opacity: 0.6 },
      spring: { type: 'petal', count: 30, speed: 0.8, size: 4, opacity: 0.5 },
      summer: { type: 'dust', count: 25, speed: 0.6, size: 2, opacity: 0.4 },
      autumn: { type: 'leaf', count: 40, speed: 0.7, size: 5, opacity: 0.5 },
      rookie_woods: { type: 'leaf', count: 25, speed: 0.6, size: 3, opacity: 0.4 },
      trainer_city: { type: 'dust', count: 30, speed: 0.7, size: 2, opacity: 0.5 },
      champion_hall: { type: 'sparkle', count: 40, speed: 1, size: 3, opacity: 0.7 },
      rare_pulse: { type: 'sparkle', count: 100, speed: 2, size: 3, opacity: 0.8 }
    };

    return configs[this.currentTheme] || configs.default;
  }

  private getDensityMultiplier(): number {
    const densityMap = { low: 0.5, medium: 1, high: 2 };
    return densityMap[this.settings.particleDensity] || 1;
  }

  private animateParticles(): void {
    if (!this.particleCanvas) return;

    const ctx = this.particleCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around screen
      if (particle.x < 0) particle.x = this.particleCanvas!.width;
      if (particle.x > this.particleCanvas!.width) particle.x = 0;
      if (particle.y > this.particleCanvas!.height) {
        particle.y = -particle.size;
        particle.x = Math.random() * this.particleCanvas!.width;
      }

      // Draw particle
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = this.getParticleColor(particle.type);
      
      if (particle.type === 'snowflake') {
        this.drawSnowflake(ctx, particle.x, particle.y, particle.size);
      } else if (particle.type === 'leaf') {
        this.drawLeaf(ctx, particle.x, particle.y, particle.size);
      } else if (particle.type === 'petal') {
        this.drawPetal(ctx, particle.x, particle.y, particle.size);
      } else if (particle.type === 'sparkle') {
        this.drawSparkle(ctx, particle.x, particle.y, particle.size);
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });

    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }

  private getParticleColor(type: string): string {
    const colors = {
      snowflake: '#ffffff',
      leaf: '#8B4513',
      petal: '#FFB6C1',
      sparkle: '#FFD700',
      dust: '#D3D3D3'
    };
    return colors[type as keyof typeof colors] || '#ffffff';
  }

  private drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  private updateParticles(): void {
    if (this.particleCanvas) {
      this.createParticles();
    }
  }

  public updateSettings(newSettings: Partial<BackgroundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.settings.enabled) {
      this.updateParticles();
    } else {
      this.stopParticles();
    }
  }

  public getSettings(): BackgroundSettings {
    return { ...this.settings };
  }

  public stopParticles(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.particleCanvas && this.particleCanvas.parentNode) {
      this.particleCanvas.parentNode.removeChild(this.particleCanvas);
      this.particleCanvas = null;
    }
  }

  public getCurrentTheme(): BackgroundTheme {
    return this.currentTheme;
  }
}

// Export singleton instance
export const backgroundService = new BackgroundService(); 