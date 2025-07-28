export interface SoundSettings {
  enabled: boolean;
  volume: number;
  scanSounds: boolean;
  uiSounds: boolean;
  achievementSounds: boolean;
  seasonalSounds: boolean;
}

export type SoundEffect = 
  | 'scan_start'
  | 'scan_complete'
  | 'rare_pull'
  | 'xp_gain'
  | 'achievement_unlock'
  | 'ui_hover'
  | 'level_up'
  | 'set_complete'
  | 'streak_milestone'
  | 'seasonal_event';

export type SoundTheme = 'default' | 'retro' | 'holographic' | 'seasonal';

class SoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.7,
    scanSounds: true,
    uiSounds: true,
    achievementSounds: true,
    seasonalSounds: true
  };
  private currentTheme: SoundTheme = 'default';

  constructor() {
    this.loadSettings();
    this.initializeAudioContext();
    this.preloadSounds();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('soundSettings', JSON.stringify(this.settings));
  }

  private initializeAudioContext(): void {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  private preloadSounds(): void {
    // Preload all sound effects
    const soundUrls = {
      scan_start: '/sounds/scan_start.mp3',
      scan_complete: '/sounds/scan_complete.mp3',
      rare_pull: '/sounds/rare_pull.mp3',
      xp_gain: '/sounds/xp_gain.mp3',
      achievement_unlock: '/sounds/achievement_unlock.mp3',
      ui_hover: '/sounds/ui_hover.mp3',
      level_up: '/sounds/level_up.mp3',
      set_complete: '/sounds/set_complete.mp3',
      streak_milestone: '/sounds/streak_milestone.mp3',
      seasonal_event: '/sounds/seasonal_event.mp3'
    };

    Object.entries(soundUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
  }

  public playSound(effect: SoundEffect): void {
    if (!this.settings.enabled) return;

    // Check if specific sound type is enabled
    if (effect.includes('scan') && !this.settings.scanSounds) return;
    if (effect.includes('ui') && !this.settings.uiSounds) return;
    if (effect.includes('achievement') && !this.settings.achievementSounds) return;
    if (effect.includes('seasonal') && !this.settings.seasonalSounds) return;

    const audio = this.sounds.get(effect);
    if (audio) {
      audio.volume = this.settings.volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently fail if audio can't play (e.g., user hasn't interacted)
      });
    }
  }

  public playThemedSound(effect: SoundEffect, theme?: SoundTheme): void {
    const activeTheme = theme || this.currentTheme;
    
    // Apply theme-specific modifications
    if (activeTheme === 'retro') {
      this.playRetroSound(effect);
    } else if (activeTheme === 'holographic') {
      this.playHolographicSound(effect);
    } else {
      this.playSound(effect);
    }
  }

  private playRetroSound(effect: SoundEffect): void {
    // Retro sounds are more chiptune-like
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Retro sound frequencies
      const frequencies = {
        scan_start: [440, 880],
        scan_complete: [660, 880, 1100],
        rare_pull: [880, 1100, 1320],
        xp_gain: [660, 880],
        achievement_unlock: [440, 660, 880, 1100],
        ui_hover: [440],
        level_up: [660, 880, 1100, 1320],
        set_complete: [880, 1100, 1320, 1760],
        streak_milestone: [660, 880, 1100],
        seasonal_event: [440, 660, 880]
      };

      const freq = frequencies[effect] || [440];
      oscillator.frequency.setValueAtTime(freq[0], this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    }
  }

  private playHolographicSound(effect: SoundEffect): void {
    // Holographic sounds have shimmer effects
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Add shimmer effect
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.2);
      filter.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.4);
      
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.4, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    }
  }

  public updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public setTheme(theme: SoundTheme): void {
    this.currentTheme = theme;
  }

  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public toggleSound(): void {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
  }

  // Convenience methods for common sounds
  public playScanStart(): void {
    this.playThemedSound('scan_start');
  }

  public playScanComplete(): void {
    this.playThemedSound('scan_complete');
  }

  public playRarePull(): void {
    this.playThemedSound('rare_pull');
  }

  public playXPGain(): void {
    this.playThemedSound('xp_gain');
  }

  public playAchievementUnlock(): void {
    this.playThemedSound('achievement_unlock');
  }

  public playUIHover(): void {
    this.playThemedSound('ui_hover');
  }

  public playLevelUp(): void {
    this.playThemedSound('level_up');
  }

  public playSetComplete(): void {
    this.playThemedSound('set_complete');
  }

  public playStreakMilestone(): void {
    this.playThemedSound('streak_milestone');
  }

  public playSeasonalEvent(): void {
    this.playThemedSound('seasonal_event');
  }
}

// Export singleton instance
export const soundService = new SoundService(); 