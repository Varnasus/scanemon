export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  theme: EventTheme;
  features: EventFeature[];
  rewards: EventReward[];
  badges: EventBadge[];
}

export interface EventTheme {
  background: string;
  cardBorders: string;
  scanSounds: string;
  confettiColors: string[];
  particleType: string;
  specialEffects: string[];
}

export interface EventFeature {
  type: 'double_xp' | 'bonus_holo' | 'special_cards' | 'unique_animations' | 'themed_background' | 'special_sounds';
  description: string;
  multiplier?: number;
  duration?: number;
}

export interface EventReward {
  type: 'xp' | 'badge' | 'skin' | 'title' | 'special_card';
  value: string | number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface EventBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: string;
}

class SeasonalService {
  private events: Map<string, SeasonalEvent> = new Map();
  private activeEvent: SeasonalEvent | null = null;
  private userProgress: Map<string, EventProgress> = new Map();

  constructor() {
    this.initializeEvents();
    this.loadUserProgress();
    this.checkActiveEvent();
  }

  private initializeEvents(): void {
    // Winter Wonderland (December - January)
    const winterWonderland: SeasonalEvent = {
      id: 'winter_wonderland',
      name: 'Winter Wonderland',
      description: 'Embrace the magic of winter with snowy themes and ice-type bonuses',
      startDate: new Date(new Date().getFullYear(), 11, 1), // December 1st
      endDate: new Date(new Date().getFullYear() + 1, 0, 31), // January 31st
      active: false,
      theme: {
        background: 'winter_snow',
        cardBorders: 'ice_crystal',
        scanSounds: 'snow_crunch',
        confettiColors: ['#FFFFFF', '#87CEEB', '#B0E0E6', '#E0F6FF'],
        particleType: 'snowflake',
        specialEffects: ['snow_fall', 'ice_sparkle', 'frost_glow']
      },
      features: [
        {
          type: 'themed_background',
          description: 'Snowy winter backgrounds with falling snowflakes'
        },
        {
          type: 'special_cards',
          description: 'Ice-type Pokémon cards get bonus XP'
        },
        {
          type: 'unique_animations',
          description: 'Frost and ice-themed scan animations'
        },
        {
          type: 'special_sounds',
          description: 'Winter-themed sound effects'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'winter_wonder_badge',
          description: 'Winter Wonder Badge',
          rarity: 'rare'
        },
        {
          type: 'skin',
          value: 'team_aqua',
          description: 'Team Aqua Skin',
          rarity: 'epic'
        },
        {
          type: 'title',
          value: 'Snow Scout',
          description: 'Exclusive winter title',
          rarity: 'common'
        }
      ],
      badges: [
        {
          id: 'winter_wonder_badge',
          name: 'Winter Wonder',
          description: 'Participated in Winter Wonderland event',
          icon: '❄️',
          rarity: 'rare',
          unlockCondition: 'Complete 10 scans during Winter Wonderland'
        }
      ]
    };

    // Haunted Pulls (October)
    const hauntedPulls: SeasonalEvent = {
      id: 'haunted_pulls',
      name: 'Haunted Pulls',
      description: 'Dark themes and ghost-type bonuses for Halloween',
      startDate: new Date(new Date().getFullYear(), 9, 15), // October 15th
      endDate: new Date(new Date().getFullYear(), 9, 31), // October 31st
      active: false,
      theme: {
        background: 'haunted_mansion',
        cardBorders: 'ghostly_glow',
        scanSounds: 'spooky_whisper',
        confettiColors: ['#800080', '#4B0082', '#8A2BE2', '#FF1493'],
        particleType: 'ghost',
        specialEffects: ['ghost_trail', 'spooky_mist', 'dark_pulse']
      },
      features: [
        {
          type: 'themed_background',
          description: 'Haunted mansion backgrounds with spooky effects'
        },
        {
          type: 'special_cards',
          description: 'Ghost-type Pokémon cards get double XP'
        },
        {
          type: 'unique_animations',
          description: 'Spooky scan animations with ghost effects'
        },
        {
          type: 'special_sounds',
          description: 'Haunted sound effects and whispers'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'ghost_hunter_badge',
          description: 'Ghost Hunter Badge',
          rarity: 'epic'
        },
        {
          type: 'skin',
          value: 'shadow_scanemon',
          description: 'Shadow Scanémon Skin',
          rarity: 'legendary'
        },
        {
          type: 'title',
          value: 'Ghost Whisperer',
          description: 'Exclusive Halloween title',
          rarity: 'rare'
        }
      ],
      badges: [
        {
          id: 'ghost_hunter_badge',
          name: 'Ghost Hunter',
          description: 'Mastered the art of ghost-type scanning',
          icon: '👻',
          rarity: 'epic',
          unlockCondition: 'Scan 25 ghost-type cards during Haunted Pulls'
        }
      ]
    };

    // Summer Heatwave (July)
    const summerHeatwave: SeasonalEvent = {
      id: 'summer_heatwave',
      name: 'Summer Heatwave',
      description: 'Fire-themed events with blazing hot bonuses',
      startDate: new Date(new Date().getFullYear(), 6, 1), // July 1st
      endDate: new Date(new Date().getFullYear(), 6, 31), // July 31st
      active: false,
      theme: {
        background: 'sunny_beach',
        cardBorders: 'flame_border',
        scanSounds: 'fire_crackle',
        confettiColors: ['#FF4500', '#FF6347', '#FF8C00', '#FFD700'],
        particleType: 'spark',
        specialEffects: ['fire_trail', 'heat_wave', 'sun_rays']
      },
      features: [
        {
          type: 'double_xp',
          description: 'Double XP weekends during Summer Heatwave',
          multiplier: 2,
          duration: 48 // hours
        },
        {
          type: 'themed_background',
          description: 'Sunny beach backgrounds with heat wave effects'
        },
        {
          type: 'special_cards',
          description: 'Fire-type Pokémon cards get bonus XP'
        },
        {
          type: 'unique_animations',
          description: 'Fire-themed scan animations'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'fire_master_badge',
          description: 'Fire Master Badge',
          rarity: 'epic'
        },
        {
          type: 'skin',
          value: 'team_magma',
          description: 'Team Magma Skin',
          rarity: 'legendary'
        },
        {
          type: 'title',
          value: 'Flame Keeper',
          description: 'Exclusive summer title',
          rarity: 'rare'
        }
      ],
      badges: [
        {
          id: 'fire_master_badge',
          name: 'Fire Master',
          description: 'Mastered fire-type scanning during heatwave',
          icon: '🔥',
          rarity: 'epic',
          unlockCondition: 'Scan 30 fire-type cards during Summer Heatwave'
        }
      ]
    };

    // Anniversary Week (Launch date)
    const anniversaryWeek: SeasonalEvent = {
      id: 'anniversary_week',
      name: 'Scanémon Anniversary',
      description: 'Celebrate Scanémon\'s birthday with special rewards and bonuses',
      startDate: new Date(new Date().getFullYear(), 0, 15), // January 15th (example launch date)
      endDate: new Date(new Date().getFullYear(), 0, 22), // January 22nd
      active: false,
      theme: {
        background: 'celebration',
        cardBorders: 'golden_sparkle',
        scanSounds: 'party_horn',
        confettiColors: ['#FFD700', '#FF69B4', '#00CED1', '#32CD32'],
        particleType: 'confetti',
        specialEffects: ['golden_sparkle', 'celebration_rays', 'party_lights']
      },
      features: [
        {
          type: 'double_xp',
          description: 'Double XP for the entire anniversary week',
          multiplier: 2,
          duration: 168 // hours (1 week)
        },
        {
          type: 'bonus_holo',
          description: 'Increased chance of holographic cards'
        },
        {
          type: 'themed_background',
          description: 'Celebration-themed backgrounds'
        },
        {
          type: 'unique_animations',
          description: 'Special anniversary scan animations'
        }
      ],
      rewards: [
        {
          type: 'badge',
          value: 'anniversary_badge',
          description: 'Anniversary Badge',
          rarity: 'legendary'
        },
        {
          type: 'skin',
          value: 'holo_hunter',
          description: 'Holo Hunter Skin',
          rarity: 'epic'
        },
        {
          type: 'title',
          value: 'Founding Trainer',
          description: 'Exclusive anniversary title',
          rarity: 'legendary'
        }
      ],
      badges: [
        {
          id: 'anniversary_badge',
          name: 'Anniversary Champion',
          description: 'Celebrated Scanémon\'s anniversary',
          icon: '🎉',
          rarity: 'legendary',
          unlockCondition: 'Participate in anniversary week activities'
        }
      ]
    };

    // Add all events to the map
    this.events.set('winter_wonderland', winterWonderland);
    this.events.set('haunted_pulls', hauntedPulls);
    this.events.set('summer_heatwave', summerHeatwave);
    this.events.set('anniversary_week', anniversaryWeek);
  }

  private loadUserProgress(): void {
    const saved = localStorage.getItem('seasonalProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.userProgress = new Map(Object.entries(progress));
    }
  }

  private saveUserProgress(): void {
    const progress = Object.fromEntries(this.userProgress);
    localStorage.setItem('seasonalProgress', JSON.stringify(progress));
  }

  private checkActiveEvent(): void {
    const now = new Date();
    
    this.events.forEach(event => {
      event.active = now >= event.startDate && now <= event.endDate;
      
      if (event.active) {
        this.activeEvent = event;
      }
    });
  }

  public getActiveEvent(): SeasonalEvent | null {
    return this.activeEvent;
  }

  public getAllEvents(): SeasonalEvent[] {
    return Array.from(this.events.values());
  }

  public getEvent(id: string): SeasonalEvent | null {
    return this.events.get(id) || null;
  }

  public getUpcomingEvents(): SeasonalEvent[] {
    const now = new Date();
    return Array.from(this.events.values()).filter(event => 
      event.startDate > now && event.startDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    );
  }

  public getEventProgress(eventId: string): EventProgress {
    return this.userProgress.get(eventId) || {
      scansCompleted: 0,
      specialCardsFound: 0,
      badgesEarned: [],
      rewardsClaimed: [],
      xpEarned: 0
    };
  }

  public updateEventProgress(eventId: string, updates: Partial<EventProgress>): void {
    const currentProgress = this.getEventProgress(eventId);
    const newProgress = { ...currentProgress, ...updates };
    this.userProgress.set(eventId, newProgress);
    this.saveUserProgress();
  }

  public recordScan(eventId: string, cardType?: string): void {
    const event = this.getEvent(eventId);
    if (!event || !event.active) return;

    const progress = this.getEventProgress(eventId);
    progress.scansCompleted++;

    // Check for special card bonuses
    if (cardType) {
      const specialTypes = this.getSpecialCardTypes(eventId);
      if (specialTypes.includes(cardType)) {
        progress.specialCardsFound++;
      }
    }

    this.updateEventProgress(eventId, progress);
  }

  public getSpecialCardTypes(eventId: string): string[] {
    const event = this.getEvent(eventId);
    if (!event) return [];

    const typeMap: Record<string, string[]> = {
      'winter_wonderland': ['ice', 'water'],
      'haunted_pulls': ['ghost', 'dark'],
      'summer_heatwave': ['fire', 'ground'],
      'anniversary_week': ['all']
    };

    return typeMap[eventId] || [];
  }

  public getEventMultipliers(eventId: string): { xp: number; holo: number } {
    const event = this.getEvent(eventId);
    if (!event || !event.active) return { xp: 1, holo: 1 };

    let xpMultiplier = 1;
    let holoMultiplier = 1;

    event.features.forEach(feature => {
      if (feature.type === 'double_xp') {
        xpMultiplier = feature.multiplier || 2;
      }
      if (feature.type === 'bonus_holo') {
        holoMultiplier = 1.5; // 50% increased chance
      }
    });

    return { xp: xpMultiplier, holo: holoMultiplier };
  }

  public getEventTheme(eventId: string): EventTheme | null {
    const event = this.getEvent(eventId);
    return event?.theme || null;
  }

  public isEventActive(eventId: string): boolean {
    const event = this.getEvent(eventId);
    return event?.active || false;
  }

  public getEventRewards(eventId: string): EventReward[] {
    const event = this.getEvent(eventId);
    return event?.rewards || [];
  }

  public getEventBadges(eventId: string): EventBadge[] {
    const event = this.getEvent(eventId);
    return event?.badges || [];
  }

  public checkBadgeUnlocks(eventId: string): string[] {
    const event = this.getEvent(eventId);
    if (!event) return [];

    const progress = this.getEventProgress(eventId);
    const newlyUnlocked: string[] = [];

    event.badges.forEach(badge => {
      if (progress.badgesEarned.includes(badge.id)) return;

      let shouldUnlock = false;
      switch (badge.id) {
        case 'winter_wonder_badge':
          shouldUnlock = progress.scansCompleted >= 10;
          break;
        case 'ghost_hunter_badge':
          shouldUnlock = progress.specialCardsFound >= 25;
          break;
        case 'fire_master_badge':
          shouldUnlock = progress.specialCardsFound >= 30;
          break;
        case 'anniversary_badge':
          shouldUnlock = progress.scansCompleted >= 5;
          break;
      }

      if (shouldUnlock) {
        progress.badgesEarned.push(badge.id);
        newlyUnlocked.push(badge.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.updateEventProgress(eventId, progress);
    }

    return newlyUnlocked;
  }

  public getEventTimeRemaining(eventId: string): { days: number; hours: number; minutes: number } {
    const event = this.getEvent(eventId);
    if (!event || !event.active) return { days: 0, hours: 0, minutes: 0 };

    const now = new Date();
    const timeRemaining = event.endDate.getTime() - now.getTime();

    if (timeRemaining <= 0) return { days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  public getEventProgressPercentage(eventId: string): number {
    const event = this.getEvent(eventId);
    if (!event) return 0;

    const progress = this.getEventProgress(eventId);
    const totalScans = event.badges.reduce((total, badge) => {
      if (badge.unlockCondition.includes('scan')) {
        const match = badge.unlockCondition.match(/(\d+)/);
        return Math.max(total, match ? parseInt(match[1]) : 0);
      }
      return total;
    }, 0);

    return totalScans > 0 ? Math.min((progress.scansCompleted / totalScans) * 100, 100) : 0;
  }
}

export interface EventProgress {
  scansCompleted: number;
  specialCardsFound: number;
  badgesEarned: string[];
  rewardsClaimed: string[];
  xpEarned: number;
}

// Export singleton instance
export const seasonalService = new SeasonalService(); 