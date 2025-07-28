// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  trainer_level: number;
  experience_points: number;
  total_cards_scanned: number;
  scan_streak: number;
  is_public_profile: boolean;
  notifications_enabled: boolean;
  theme_preference: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserProfile extends User {
  level_progress: number;
  next_level_xp: number;
  achievements: Achievement[];
  stats: UserStats;
}

export interface UserStats {
  total_cards: number;
  total_value: number;
  unique_cards: number;
  sets_completed: number;
  rarest_card?: Card;
  most_valuable_card?: Card;
  favorite_type?: string;
  scan_accuracy: number;
}

// Card Types
export interface Card {
  id: number;
  pokemon_tcg_id?: string;
  name: string;
  set_name?: string;
  set_code?: string;
  number?: string;
  rarity?: string;
  card_type?: string;
  hp?: number;
  types?: string[];
  attacks?: CardAttack[];
  abilities?: CardAbility[];
  weaknesses?: CardWeakness[];
  resistances?: CardResistance[];
  retreat_cost?: number;
  image_url?: string;
  image_url_hi_res?: string;
  quantity: number;
  condition: CardCondition;
  is_foil: boolean;
  is_reverse_holo: boolean;
  is_first_edition: boolean;
  scan_confidence?: number;
  scan_method?: 'image' | 'video' | 'manual';
  scan_date: string;
  notes?: string;
  is_wishlist: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  display_name: string;
  rarity_color: string;
  condition_color: string;
}

export interface CardAttack {
  name: string;
  cost: string[];
  converted_energy_cost: number;
  damage: string;
  text: string;
}

export interface CardAbility {
  name: string;
  text: string;
  type: string;
}

export interface CardWeakness {
  type: string;
  value: string;
}

export interface CardResistance {
  type: string;
  value: string;
}

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';

export interface CardScanResult {
  card: Card;
  confidence: number;
  scan_time: number;
  xp_gained: number;
  level_up?: boolean;
  new_achievements?: Achievement[];
}

// New Scan Result Interface for MVP
export interface ScanResult {
  name: string;
  set: string;
  rarity: string;
  type: string;
  hp: string;
  confidence: number;
  timestamp: string;
  model_version: string;
  filename: string;
  log_id: string;
  image_url?: string;
}

// Collection Types
export interface Collection {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  is_public: boolean;
  is_default: boolean;
  color_theme: string;
  total_cards: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface CollectionCard {
  id: number;
  collection_id: number;
  card_id: number;
  quantity: number;
  added_at: string;
  card?: Card;
}

// Achievement Types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  progress: number;
  completed: boolean;
  completed_at?: string;
  xp_reward: number;
}

export type AchievementCategory = 
  | 'scanning'
  | 'collection'
  | 'streaks'
  | 'social'
  | 'special';

// Scan Types
export interface ScanSession {
  id: string;
  user_id: number;
  method: 'image' | 'video' | 'manual';
  status: 'scanning' | 'completed' | 'failed';
  results: CardScanResult[];
  total_xp_gained: number;
  created_at: string;
  completed_at?: string;
}

export interface ScanSettings {
  auto_save: boolean;
  high_quality: boolean;
  enable_sound: boolean;
  vibration_feedback: boolean;
  show_confidence: boolean;
  default_quantity: number;
  default_condition: CardCondition;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Filter and Sort Types
export interface CardFilters {
  name?: string;
  set_name?: string;
  rarity?: string;
  card_type?: string;
  condition?: CardCondition;
  is_foil?: boolean;
  is_reverse_holo?: boolean;
  is_first_edition?: boolean;
  is_wishlist?: boolean;
  is_favorite?: boolean;
  min_hp?: number;
  max_hp?: number;
  types?: string[];
  date_from?: string;
  date_to?: string;
}

export interface SortOption {
  field: keyof Card;
  direction: 'asc' | 'desc';
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

// Theme Types
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    scan_complete: boolean;
    level_up: boolean;
    achievement: boolean;
    collection_updates: boolean;
  };
  privacy: {
    public_profile: boolean;
    show_collection: boolean;
    allow_trades: boolean;
  };
  scan: ScanSettings;
}

// Export all types
export type {
  User,
  UserProfile,
  UserStats,
  Card,
  CardAttack,
  CardAbility,
  CardWeakness,
  CardResistance,
  CardCondition,
  CardScanResult,
  ScanResult,
  Collection,
  CollectionCard,
  Achievement,
  AchievementCategory,
  ScanSession,
  ScanSettings,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  CardFilters,
  SortOption,
  Toast,
  Modal,
  LoadingState,
  Theme,
  Notification,
  UserSettings,
}; 