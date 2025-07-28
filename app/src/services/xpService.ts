export interface UserStats {
  level: number;
  xp: number;
  totalScans: number;
  holoCards: number;
  rareCards: number;
  ultraRareCards: number;
  setsCompleted: number;
  achievements: number;
  streak: number;
  lastScanDate: string;
  titles: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedDate?: string;
  progress?: { current: number; required: number };
}

export type AchievementCategory = 
  | 'scanning'
  | 'rarity'
  | 'streaks'
  | 'seasonal'
  | 'social'
  | 'completion'
  | 'special';

export interface XPAction {
  type: string;
  baseXP: number;
  description: string;
  multiplier?: number;
}

export interface LevelReward {
  level: number;
  rewards: {
    type: 'title' | 'badge' | 'skin' | 'special';
    value: string;
    description: string;
  }[];
}

class XPService {
  private userStats: UserStats = {
    level: 1,
    xp: 0,
    totalScans: 0,
    holoCards: 0,
    rareCards: 0,
    ultraRareCards: 0,
    setsCompleted: 0,
    achievements: 0,
    streak: 0,
    lastScanDate: '',
    titles: [],
    badges: []
  };

  private xpActions: Map<string, XPAction> = new Map();
  private levelRewards: LevelReward[] = [];
  private achievements: Map<string, Badge> = new Map();

  constructor() {
    this.initializeXPActions();
    this.initializeLevelRewards();
    this.initializeAchievements();
    this.loadUserStats();
  }

  private initializeXPActions(): void {
    const actions: XPAction[] = [
      { type: 'scan_card', baseXP: 10, description: 'Scan a card' },
      { type: 'scan_holo', baseXP: 25, description: 'Scan a holographic card' },
      { type: 'scan_rare', baseXP: 50, description: 'Scan a rare card' },
      { type: 'scan_ultra_rare', baseXP: 100, description: 'Scan an ultra rare card' },
      { type: 'complete_set', baseXP: 200, description: 'Complete a card set' },
      { type: 'daily_login', baseXP: 5, description: 'Daily login bonus' },
      { type: 'streak_bonus', baseXP: 20, description: 'Streak milestone bonus' },
      { type: 'rate_scan', baseXP: 5, description: 'Rate a scan or add notes' },
      { type: 'invite_friend', baseXP: 100, description: 'Invite a friend who joins' },
      { type: 'first_scan', baseXP: 50, description: 'First scan bonus' },
      { type: 'scan_duplicate', baseXP: 2, description: 'Find a duplicate card' },
      { type: 'perfect_scan', baseXP: 15, description: 'Perfect scan accuracy' }
    ];

    actions.forEach(action => {
      this.xpActions.set(action.type, action);
    });
  }

  private initializeLevelRewards(): void {
    this.levelRewards = [
      {
        level: 5,
        rewards: [
          { type: 'title', value: 'Novice Scanner', description: 'Reached Level 5' }
        ]
      },
      {
        level: 10,
        rewards: [
          { type: 'title', value: 'Apprentice Collector', description: 'Reached Level 10' },
          { type: 'badge', value: 'level_10_badge', description: 'Level 10 Achievement' }
        ]
      },
      {
        level: 25,
        rewards: [
          { type: 'title', value: 'Experienced Trainer', description: 'Reached Level 25' },
          { type: 'skin', value: 'shadow_scanemon', description: 'Shadow Scanémon Skin' }
        ]
      },
      {
        level: 50,
        rewards: [
          { type: 'title', value: 'Master Collector', description: 'Reached Level 50' },
          { type: 'badge', value: 'level_50_badge', description: 'Level 50 Achievement' },
          { type: 'skin', value: 'retro_pixel', description: 'Retro Pixel Skin' }
        ]
      },
      {
        level: 100,
        rewards: [
          { type: 'title', value: 'Legendary Scanner', description: 'Reached Level 100' },
          { type: 'badge', value: 'level_100_badge', description: 'Level 100 Achievement' },
          { type: 'special', value: 'golden_frame', description: 'Golden Card Frames' }
        ]
      }
    ];
  }

  private initializeAchievements(): void {
    const achievements: Badge[] = [
      // Scanning Achievements
      {
        id: 'first_scan',
        name: 'First Scan',
        description: 'Complete your first card scan',
        icon: '🎯',
        category: 'scanning',
        rarity: 'common',
        unlocked: false,
        progress: { current: 0, required: 1 }
      },
      {
        id: 'collector_100',
        name: 'Collector',
        description: 'Scan 100 cards',
        icon: '📚',
        category: 'scanning',
        rarity: 'rare',
        unlocked: false,
        progress: { current: 0, required: 100 }
      },
      {
        id: 'collector_500',
        name: 'Dedicated Collector',
        description: 'Scan 500 cards',
        icon: '📖',
        category: 'scanning',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 500 }
      },
      {
        id: 'collector_1000',
        name: 'Master Collector',
        description: 'Scan 1000 cards',
        icon: '🏆',
        category: 'scanning',
        rarity: 'legendary',
        unlocked: false,
        progress: { current: 0, required: 1000 }
      },
      {
        id: 'dupe_hunter',
        name: 'Dupe Hunter',
        description: 'Find 10+ duplicate cards',
        icon: '🔍',
        category: 'scanning',
        rarity: 'rare',
        unlocked: false,
        progress: { current: 0, required: 10 }
      },

      // Rarity Achievements
      {
        id: 'holo_hero_25',
        name: 'Holo Hero',
        description: 'Scan 25 holographic cards',
        icon: '✨',
        category: 'rarity',
        rarity: 'rare',
        unlocked: false,
        progress: { current: 0, required: 25 }
      },
      {
        id: 'holo_hero_100',
        name: 'Holo Master',
        description: 'Scan 100 holographic cards',
        icon: '💎',
        category: 'rarity',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 100 }
      },
      {
        id: 'ultra_instinct',
        name: 'Ultra Instinct',
        description: 'Scan 1 ultra rare card',
        icon: '🌟',
        category: 'rarity',
        rarity: 'legendary',
        unlocked: false,
        progress: { current: 0, required: 1 }
      },
      {
        id: 'rare_collector',
        name: 'Rare Collector',
        description: 'Scan 50 rare cards',
        icon: '⭐',
        category: 'rarity',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 50 }
      },

      // Streak Achievements
      {
        id: 'habit_builder',
        name: 'Habit Builder',
        description: 'Maintain a 7-day scan streak',
        icon: '🔥',
        category: 'streaks',
        rarity: 'rare',
        unlocked: false,
        progress: { current: 0, required: 7 }
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 30-day scan streak',
        icon: '🔥🔥',
        category: 'streaks',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 30 }
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Maintain a 100-day scan streak',
        icon: '🔥🔥🔥',
        category: 'streaks',
        rarity: 'legendary',
        unlocked: false,
        progress: { current: 0, required: 100 }
      },

      // Completion Achievements
      {
        id: 'set_master',
        name: 'Set Master',
        description: 'Complete 1 full card set',
        icon: '🎯',
        category: 'completion',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 1 }
      },
      {
        id: 'set_master_5',
        name: 'Set Master Pro',
        description: 'Complete 5 full card sets',
        icon: '🎯🎯',
        category: 'completion',
        rarity: 'legendary',
        unlocked: false,
        progress: { current: 0, required: 5 }
      },

      // Social Achievements
      {
        id: 'recruiter',
        name: 'Recruiter',
        description: 'Refer 3 users who join',
        icon: '👥',
        category: 'social',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 3 }
      },
      {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Refer 10 users who join',
        icon: '👑',
        category: 'social',
        rarity: 'legendary',
        unlocked: false,
        progress: { current: 0, required: 10 }
      },

      // Special Achievements
      {
        id: 'speed_scanner',
        name: 'Speed Scanner',
        description: 'Scan 10 cards in under 5 minutes',
        icon: '⚡',
        category: 'special',
        rarity: 'rare',
        unlocked: false,
        progress: { current: 0, required: 10 }
      },
      {
        id: 'accuracy_master',
        name: 'Accuracy Master',
        description: 'Achieve 95%+ scan accuracy',
        icon: '🎯',
        category: 'special',
        rarity: 'epic',
        unlocked: false,
        progress: { current: 0, required: 95 }
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private loadUserStats(): void {
    const saved = localStorage.getItem('userStats');
    if (saved) {
      this.userStats = { ...this.userStats, ...JSON.parse(saved) };
    }

    // Update achievement progress
    this.updateAchievementProgress();
  }

  private saveUserStats(): void {
    localStorage.setItem('userStats', JSON.stringify(this.userStats));
  }

  public awardXP(actionType: string, multiplier: number = 1): { xpGained: number; levelUp: boolean; newLevel: number } {
    const action = this.xpActions.get(actionType);
    if (!action) return { xpGained: 0, levelUp: false, newLevel: this.userStats.level };

    const baseXP = action.baseXP;
    const finalXP = Math.floor(baseXP * multiplier);
    
    this.userStats.xp += finalXP;
    
    const oldLevel = this.userStats.level;
    const newLevel = this.calculateLevel(this.userStats.xp);
    const levelUp = newLevel > oldLevel;
    
    if (levelUp) {
      this.userStats.level = newLevel;
      this.checkLevelRewards(newLevel);
    }

    this.saveUserStats();
    this.updateAchievementProgress();

    return { xpGained: finalXP, levelUp, newLevel };
  }

  public calculateLevel(xp: number): number {
    // Level formula: level = 1 + sqrt(xp / 100)
    return Math.floor(1 + Math.sqrt(xp / 100));
  }

  public getXPForNextLevel(): { current: number; required: number; percentage: number } {
    const currentLevel = this.userStats.level;
    const currentXP = this.userStats.xp;
    
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpRequired = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min((xpProgress / xpRequired) * 100, 100);

    return {
      current: xpProgress,
      required: xpRequired,
      percentage
    };
  }

  private checkLevelRewards(level: number): void {
    const rewards = this.levelRewards.find(r => r.level === level);
    if (!rewards) return;

    rewards.rewards.forEach(reward => {
      switch (reward.type) {
        case 'title':
          if (!this.userStats.titles.includes(reward.value)) {
            this.userStats.titles.push(reward.value);
          }
          break;
        case 'badge':
          this.unlockAchievement(reward.value);
          break;
        case 'skin':
          // This would integrate with the skin service
          break;
        case 'special':
          // Handle special rewards
          break;
      }
    });
  }

  public recordScan(cardRarity?: 'common' | 'holo' | 'rare' | 'ultra_rare'): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Update scan count
    this.userStats.totalScans++;
    
    // Update rarity counts
    if (cardRarity) {
      switch (cardRarity) {
        case 'holo':
          this.userStats.holoCards++;
          break;
        case 'rare':
          this.userStats.rareCards++;
          break;
        case 'ultra_rare':
          this.userStats.ultraRareCards++;
          break;
      }
    }

    // Update streak
    if (this.userStats.lastScanDate === today) {
      // Already scanned today, no streak update
    } else if (this.userStats.lastScanDate === this.getYesterday()) {
      // Consecutive day
      this.userStats.streak++;
    } else {
      // Streak broken
      this.userStats.streak = 1;
    }
    
    this.userStats.lastScanDate = today;
    this.saveUserStats();
    this.updateAchievementProgress();
  }

  private getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  public completeSet(): void {
    this.userStats.setsCompleted++;
    this.saveUserStats();
    this.updateAchievementProgress();
  }

  public unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return false;

    achievement.unlocked = true;
    achievement.unlockedDate = new Date().toISOString();
    this.userStats.achievements++;
    this.userStats.badges.push(achievement);

    this.saveUserStats();
    return true;
  }

  private updateAchievementProgress(): void {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let current = 0;
      let required = achievement.progress?.required || 0;

      switch (achievement.id) {
        case 'first_scan':
          current = this.userStats.totalScans > 0 ? 1 : 0;
          break;
        case 'collector_100':
          current = this.userStats.totalScans;
          break;
        case 'collector_500':
          current = this.userStats.totalScans;
          break;
        case 'collector_1000':
          current = this.userStats.totalScans;
          break;
        case 'holo_hero_25':
          current = this.userStats.holoCards;
          break;
        case 'holo_hero_100':
          current = this.userStats.holoCards;
          break;
        case 'ultra_instinct':
          current = this.userStats.ultraRareCards;
          break;
        case 'rare_collector':
          current = this.userStats.rareCards;
          break;
        case 'habit_builder':
          current = this.userStats.streak;
          break;
        case 'streak_master':
          current = this.userStats.streak;
          break;
        case 'streak_legend':
          current = this.userStats.streak;
          break;
        case 'set_master':
          current = this.userStats.setsCompleted;
          break;
        case 'set_master_5':
          current = this.userStats.setsCompleted;
          break;
      }

      if (achievement.progress) {
        achievement.progress.current = current;
      }

      // Check if achievement should be unlocked
      if (current >= required) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  public getUserStats(): UserStats {
    return { ...this.userStats };
  }

  public getAllAchievements(): Badge[] {
    return Array.from(this.achievements.values());
  }

  public getAchievementsByCategory(category: AchievementCategory): Badge[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }

  public getUnlockedAchievements(): Badge[] {
    return this.userStats.badges;
  }

  public getAchievementProgress(achievementId: string): { current: number; required: number; percentage: number } {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || !achievement.progress) {
      return { current: 0, required: 0, percentage: 0 };
    }

    const { current, required } = achievement.progress;
    const percentage = Math.min((current / required) * 100, 100);

    return { current, required, percentage };
  }

  public getRecentUnlocks(): Badge[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.userStats.badges.filter(badge => 
      badge.unlockedDate && new Date(badge.unlockedDate) > oneWeekAgo
    );
  }

  public getLevelRewards(level: number): LevelReward | null {
    return this.levelRewards.find(r => r.level === level) || null;
  }

  public getAvailableTitles(): string[] {
    return this.userStats.titles;
  }

  public setActiveTitle(title: string): boolean {
    if (!this.userStats.titles.includes(title)) return false;
    
    // This would integrate with a user profile service
    return true;
  }
}

// Export singleton instance
export const xpService = new XPService(); 