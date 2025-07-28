export interface Skin {
  id: string;
  name: string;
  description: string;
  theme: SkinTheme;
  unlockCondition: UnlockCondition;
  unlocked: boolean;
  preview: string;
  colors: SkinColors;
  animations: SkinAnimations;
  icons: SkinIcons;
}

export interface SkinTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface SkinColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
}

export interface SkinAnimations {
  scanFrame: string;
  cardHover: string;
  buttonClick: string;
  levelUp: string;
  achievement: string;
}

export interface SkinIcons {
  scan: string;
  collection: string;
  analytics: string;
  settings: string;
  profile: string;
  home: string;
}

export interface UnlockCondition {
  type: 'level' | 'scans' | 'holo_cards' | 'achievements' | 'streak' | 'seasonal' | 'none';
  value: number;
  description: string;
}

class SkinService {
  private skins: Map<string, Skin> = new Map();
  private currentSkin: string = 'default';
  private unlockedSkins: Set<string> = new Set(['default']);

  constructor() {
    this.initializeSkins();
    this.loadUnlockedSkins();
  }

  private initializeSkins(): void {
    const defaultSkin: Skin = {
      id: 'default',
      name: 'Default',
      description: 'Clean, modern interface with blue-white theme',
      theme: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#8B5CF6',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB'
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: {
          primary: '#F8FAFC',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0'
        },
        text: {
          primary: '#1F2937',
          secondary: '#4B5563',
          muted: '#9CA3AF'
        },
        border: {
          primary: '#E5E7EB',
          secondary: '#D1D5DB'
        }
      },
      animations: {
        scanFrame: 'pulse',
        cardHover: 'scale-105',
        buttonClick: 'scale-95',
        levelUp: 'bounce',
        achievement: 'tada'
      },
      icons: {
        scan: '🔍',
        collection: '📚',
        analytics: '📊',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'none',
        value: 0,
        description: 'Available to everyone'
      },
      unlocked: true,
      preview: '/skins/default-preview.png'
    };

    const shadowSkin: Skin = {
      id: 'shadow_scanemon',
      name: 'Shadow Scanémon',
      description: 'Dark theme with violet highlights for mysterious vibes',
      theme: {
        primary: '#8B5CF6',
        secondary: '#A855F7',
        accent: '#C084FC',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        border: '#334155'
      },
      colors: {
        primary: '#8B5CF6',
        secondary: '#A855F7',
        accent: '#C084FC',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155'
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          muted: '#64748B'
        },
        border: {
          primary: '#334155',
          secondary: '#475569'
        }
      },
      animations: {
        scanFrame: 'shadow-pulse',
        cardHover: 'shadow-lg scale-105',
        buttonClick: 'scale-95',
        levelUp: 'shadow-bounce',
        achievement: 'shadow-tada'
      },
      icons: {
        scan: '🌙',
        collection: '📖',
        analytics: '📈',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'level',
        value: 10,
        description: 'Reach Level 10'
      },
      unlocked: false,
      preview: '/skins/shadow-preview.png'
    };

    const holoSkin: Skin = {
      id: 'holo_hunter',
      name: 'Holo Hunter',
      description: 'Sparkling card frames with holographic glints',
      theme: {
        primary: '#F59E0B',
        secondary: '#FCD34D',
        accent: '#FEF3C7',
        background: '#FEFCE8',
        surface: '#FFFFFF',
        text: '#92400E',
        border: '#FDE68A'
      },
      colors: {
        primary: '#F59E0B',
        secondary: '#FCD34D',
        accent: '#FEF3C7',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: {
          primary: '#FEFCE8',
          secondary: '#FEF3C7',
          tertiary: '#FDE68A'
        },
        text: {
          primary: '#92400E',
          secondary: '#B45309',
          muted: '#D97706'
        },
        border: {
          primary: '#FDE68A',
          secondary: '#FCD34D'
        }
      },
      animations: {
        scanFrame: 'sparkle',
        cardHover: 'sparkle-hover',
        buttonClick: 'sparkle-click',
        levelUp: 'sparkle-bounce',
        achievement: 'sparkle-tada'
      },
      icons: {
        scan: '✨',
        collection: '💎',
        analytics: '📊',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'holo_cards',
        value: 100,
        description: 'Scan 100 holo cards'
      },
      unlocked: false,
      preview: '/skins/holo-preview.png'
    };

    const retroSkin: Skin = {
      id: 'retro_pixel',
      name: 'Retro Pixel Mode',
      description: '8-bit UI with retro sounds and pixel art style',
      theme: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#45B7D1',
        background: '#2C3E50',
        surface: '#34495E',
        text: '#ECF0F1',
        border: '#7F8C8D'
      },
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#45B7D1',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB',
        background: {
          primary: '#2C3E50',
          secondary: '#34495E',
          tertiary: '#7F8C8D'
        },
        text: {
          primary: '#ECF0F1',
          secondary: '#BDC3C7',
          muted: '#95A5A6'
        },
        border: {
          primary: '#7F8C8D',
          secondary: '#95A5A6'
        }
      },
      animations: {
        scanFrame: 'pixel-pulse',
        cardHover: 'pixel-scale',
        buttonClick: 'pixel-click',
        levelUp: 'pixel-bounce',
        achievement: 'pixel-tada'
      },
      icons: {
        scan: '🎮',
        collection: '🎯',
        analytics: '📊',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'level',
        value: 50,
        description: 'Reach Level 50 or April Fool\'s event'
      },
      unlocked: false,
      preview: '/skins/retro-preview.png'
    };

    const teamMagmaSkin: Skin = {
      id: 'team_magma',
      name: 'Team Magma',
      description: 'Fiery red theme inspired by Team Magma',
      theme: {
        primary: '#DC2626',
        secondary: '#EF4444',
        accent: '#F87171',
        background: '#FEF2F2',
        surface: '#FFFFFF',
        text: '#991B1B',
        border: '#FECACA'
      },
      colors: {
        primary: '#DC2626',
        secondary: '#EF4444',
        accent: '#F87171',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: {
          primary: '#FEF2F2',
          secondary: '#FEE2E2',
          tertiary: '#FECACA'
        },
        text: {
          primary: '#991B1B',
          secondary: '#B91C1C',
          muted: '#DC2626'
        },
        border: {
          primary: '#FECACA',
          secondary: '#FCA5A5'
        }
      },
      animations: {
        scanFrame: 'fire-pulse',
        cardHover: 'fire-hover',
        buttonClick: 'fire-click',
        levelUp: 'fire-bounce',
        achievement: 'fire-tada'
      },
      icons: {
        scan: '🔥',
        collection: '🌋',
        analytics: '📊',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'seasonal',
        value: 0,
        description: 'Seasonal unlock (Summer)'
      },
      unlocked: false,
      preview: '/skins/magma-preview.png'
    };

    const teamAquaSkin: Skin = {
      id: 'team_aqua',
      name: 'Team Aqua',
      description: 'Ocean blue theme inspired by Team Aqua',
      theme: {
        primary: '#0EA5E9',
        secondary: '#38BDF8',
        accent: '#7DD3FC',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#0C4A6E',
        border: '#BAE6FD'
      },
      colors: {
        primary: '#0EA5E9',
        secondary: '#38BDF8',
        accent: '#7DD3FC',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: {
          primary: '#F0F9FF',
          secondary: '#E0F2FE',
          tertiary: '#BAE6FD'
        },
        text: {
          primary: '#0C4A6E',
          secondary: '#075985',
          muted: '#0369A1'
        },
        border: {
          primary: '#BAE6FD',
          secondary: '#7DD3FC'
        }
      },
      animations: {
        scanFrame: 'wave-pulse',
        cardHover: 'wave-hover',
        buttonClick: 'wave-click',
        levelUp: 'wave-bounce',
        achievement: 'wave-tada'
      },
      icons: {
        scan: '🌊',
        collection: '🐠',
        analytics: '📊',
        settings: '⚙️',
        profile: '👤',
        home: '🏠'
      },
      unlockCondition: {
        type: 'seasonal',
        value: 0,
        description: 'Seasonal unlock (Winter)'
      },
      unlocked: false,
      preview: '/skins/aqua-preview.png'
    };

    // Add all skins to the map
    this.skins.set('default', defaultSkin);
    this.skins.set('shadow_scanemon', shadowSkin);
    this.skins.set('holo_hunter', holoSkin);
    this.skins.set('retro_pixel', retroSkin);
    this.skins.set('team_magma', teamMagmaSkin);
    this.skins.set('team_aqua', teamAquaSkin);
  }

  private loadUnlockedSkins(): void {
    const saved = localStorage.getItem('unlockedSkins');
    if (saved) {
      this.unlockedSkins = new Set(JSON.parse(saved));
    }

    const currentSkin = localStorage.getItem('currentSkin');
    if (currentSkin && this.skins.has(currentSkin)) {
      this.currentSkin = currentSkin;
    }
  }

  private saveUnlockedSkins(): void {
    localStorage.setItem('unlockedSkins', JSON.stringify(Array.from(this.unlockedSkins)));
    localStorage.setItem('currentSkin', this.currentSkin);
  }

  public getAllSkins(): Skin[] {
    return Array.from(this.skins.values()).map(skin => ({
      ...skin,
      unlocked: this.unlockedSkins.has(skin.id)
    }));
  }

  public getSkin(id: string): Skin | null {
    const skin = this.skins.get(id);
    if (!skin) return null;

    return {
      ...skin,
      unlocked: this.unlockedSkins.has(skin.id)
    };
  }

  public getCurrentSkin(): Skin {
    return this.getSkin(this.currentSkin) || this.getSkin('default')!;
  }

  public setCurrentSkin(id: string): boolean {
    if (!this.skins.has(id) || !this.unlockedSkins.has(id)) {
      return false;
    }

    this.currentSkin = id;
    this.saveUnlockedSkins();
    this.applySkin();
    return true;
  }

  public unlockSkin(id: string): boolean {
    if (!this.skins.has(id)) return false;

    this.unlockedSkins.add(id);
    this.saveUnlockedSkins();
    return true;
  }

  public checkUnlockConditions(userStats: {
    level: number;
    totalScans: number;
    holoCards: number;
    achievements: number;
    streak: number;
  }): string[] {
    const newlyUnlocked: string[] = [];

    this.skins.forEach(skin => {
      if (this.unlockedSkins.has(skin.id)) return;

      const condition = skin.unlockCondition;
      let shouldUnlock = false;

      switch (condition.type) {
        case 'level':
          shouldUnlock = userStats.level >= condition.value;
          break;
        case 'scans':
          shouldUnlock = userStats.totalScans >= condition.value;
          break;
        case 'holo_cards':
          shouldUnlock = userStats.holoCards >= condition.value;
          break;
        case 'achievements':
          shouldUnlock = userStats.achievements >= condition.value;
          break;
        case 'streak':
          shouldUnlock = userStats.streak >= condition.value;
          break;
        case 'seasonal':
          shouldUnlock = this.checkSeasonalUnlock(skin.id);
          break;
        case 'none':
          shouldUnlock = true;
          break;
      }

      if (shouldUnlock) {
        this.unlockSkin(skin.id);
        newlyUnlocked.push(skin.id);
      }
    });

    return newlyUnlocked;
  }

  private checkSeasonalUnlock(skinId: string): boolean {
    const month = new Date().getMonth();
    
    if (skinId === 'team_magma') {
      // Summer months (June, July, August)
      return month >= 5 && month <= 7;
    }
    
    if (skinId === 'team_aqua') {
      // Winter months (December, January, February)
      return month >= 11 || month <= 1;
    }

    return false;
  }

  private applySkin(): void {
    const skin = this.getCurrentSkin();
    if (!skin) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(skin.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, String(subValue));
        });
      } else {
        root.style.setProperty(`--color-${key}`, String(value));
      }
    });

    // Apply theme classes
    root.classList.remove('skin-default', 'skin-shadow', 'skin-holo', 'skin-retro', 'skin-magma', 'skin-aqua');
    root.classList.add(`skin-${skin.id.replace('_', '-')}`);
  }

  public getSkinPreview(id: string): string | null {
    const skin = this.skins.get(id);
    return skin?.preview || null;
  }

  public isSkinUnlocked(id: string): boolean {
    return this.unlockedSkins.has(id);
  }

  public getUnlockProgress(skinId: string, userStats: {
    level: number;
    totalScans: number;
    holoCards: number;
    achievements: number;
    streak: number;
  }): { current: number; required: number; percentage: number } {
    const skin = this.skins.get(skinId);
    if (!skin || skin.unlockCondition.type === 'none' || skin.unlockCondition.type === 'seasonal') {
      return { current: 0, required: 0, percentage: 0 };
    }

    let current = 0;
    const required = skin.unlockCondition.value;

    switch (skin.unlockCondition.type) {
      case 'level':
        current = userStats.level;
        break;
      case 'scans':
        current = userStats.totalScans;
        break;
      case 'holo_cards':
        current = userStats.holoCards;
        break;
      case 'achievements':
        current = userStats.achievements;
        break;
      case 'streak':
        current = userStats.streak;
        break;
    }

    const percentage = Math.min((current / required) * 100, 100);
    return { current, required, percentage };
  }
}

// Export singleton instance
export const skinService = new SkinService(); 