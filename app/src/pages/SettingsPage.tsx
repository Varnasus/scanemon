import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { soundService, SoundSettings } from '../services/soundService';
import { backgroundService, BackgroundSettings } from '../services/backgroundService';
import { skinService, Skin } from '../services/skinService';
import { seasonalService, SeasonalEvent } from '../services/seasonalService';
import { xpService, UserStats, Badge } from '../services/xpService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // State for all settings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(soundService.getSettings());
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(backgroundService.getSettings());
  const [currentSkin, setCurrentSkin] = useState<Skin>(skinService.getCurrentSkin());
  const [allSkins, setAllSkins] = useState<Skin[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(xpService.getUserStats());
  const [activeEvent, setActiveEvent] = useState<SeasonalEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<SeasonalEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState('general');

  useEffect(() => {
    setAllSkins(skinService.getAllSkins());
    setActiveEvent(seasonalService.getActiveEvent());
    setUpcomingEvents(seasonalService.getUpcomingEvents());
  }, []);

  const handleSoundSettingChange = (setting: keyof SoundSettings, value: boolean | number) => {
    const newSettings = { ...soundSettings, [setting]: value };
    setSoundSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleBackgroundSettingChange = (setting: keyof BackgroundSettings, value: boolean | string) => {
    const newSettings = { ...backgroundSettings, [setting]: value };
    setBackgroundSettings(newSettings);
    backgroundService.updateSettings(newSettings);
  };

  const handleSkinChange = (skinId: string) => {
    if (skinService.setCurrentSkin(skinId)) {
      setCurrentSkin(skinService.getCurrentSkin());
      toast.success(`Applied ${skinService.getSkin(skinId)?.name} skin!`);
    } else {
      toast.error('Unable to apply skin');
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-500';
  };

  const getRarityBg = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100',
      rare: 'bg-blue-100',
      epic: 'bg-purple-100',
      legendary: 'bg-yellow-100'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-100';
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'sound', name: 'Sound & Audio', icon: '🔊' },
    { id: 'visual', name: 'Visual & Themes', icon: '🎨' },
    { id: 'events', name: 'Seasonal Events', icon: '🎉' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'account', name: 'Account', icon: '👤' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings ⚙️
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your Scanémon experience
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* General Settings */}
          {selectedTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  App Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Language</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Select your language</p>
                    </div>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Progress
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Level</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Level {userStats.level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total XP</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{userStats.xp.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cards Scanned</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{userStats.totalScans}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{userStats.streak} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sound Settings */}
          {selectedTab === 'sound' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Sound Effects
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Master Volume</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Overall sound volume</p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={soundSettings.volume}
                      onChange={(e) => handleSoundSettingChange('volume', parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Enable Sounds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Turn all sounds on/off</p>
                    </div>
                    <button
                      onClick={() => handleSoundSettingChange('enabled', !soundSettings.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundSettings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Scan Sounds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Card scanning audio feedback</p>
                    </div>
                    <button
                      onClick={() => handleSoundSettingChange('scanSounds', !soundSettings.scanSounds)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundSettings.scanSounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.scanSounds ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">UI Sounds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interface interaction sounds</p>
                    </div>
                    <button
                      onClick={() => handleSoundSettingChange('uiSounds', !soundSettings.uiSounds)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundSettings.uiSounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.uiSounds ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Achievement Sounds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Celebration and unlock sounds</p>
                    </div>
                    <button
                      onClick={() => handleSoundSettingChange('achievementSounds', !soundSettings.achievementSounds)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundSettings.achievementSounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.achievementSounds ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Sound Test
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => soundService.playScanStart()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Test Scan Start Sound
                  </button>
                  
                  <button
                    onClick={() => soundService.playScanComplete()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Test Scan Complete Sound
                  </button>
                  
                  <button
                    onClick={() => soundService.playRarePull()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Test Rare Pull Sound
                  </button>
                  
                  <button
                    onClick={() => soundService.playAchievementUnlock()}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Test Achievement Sound
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visual Settings */}
          {selectedTab === 'visual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Dynamic Backgrounds
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Enable Backgrounds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dynamic background effects</p>
                    </div>
                    <button
                      onClick={() => handleBackgroundSettingChange('enabled', !backgroundSettings.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        backgroundSettings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          backgroundSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Time of Day</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Background changes with time</p>
                    </div>
                    <button
                      onClick={() => handleBackgroundSettingChange('timeOfDay', !backgroundSettings.timeOfDay)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        backgroundSettings.timeOfDay ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          backgroundSettings.timeOfDay ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Seasonal Effects</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Seasonal particle effects</p>
                    </div>
                    <button
                      onClick={() => handleBackgroundSettingChange('seasonal', !backgroundSettings.seasonal)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        backgroundSettings.seasonal ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          backgroundSettings.seasonal ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Particle Density</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount of background particles</p>
                    </div>
                    <select
                      value={backgroundSettings.particleDensity}
                      onChange={(e) => handleBackgroundSettingChange('particleDensity', e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  UI Skins
                </h2>
                
                <div className="space-y-4">
                  {allSkins.map((skin) => (
                    <div
                      key={skin.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        currentSkin.id === skin.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSkinChange(skin.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {skin.icons.scan}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{skin.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{skin.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {skin.unlocked ? (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">Unlocked</span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {skin.unlockCondition.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seasonal Events */}
          {selectedTab === 'events' && (
            <div className="space-y-6">
              {activeEvent && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{activeEvent.name}</h2>
                      <p className="text-purple-100 mb-4">{activeEvent.description}</p>
                      <div className="flex space-x-4 text-sm">
                        <span>🎯 {activeEvent.features.length} Features</span>
                        <span>🏆 {activeEvent.rewards.length} Rewards</span>
                        <span>🎖️ {activeEvent.badges.length} Badges</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">🎉</div>
                      <div className="text-sm text-purple-100">Active Now!</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Upcoming Events
                  </h2>
                  
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{event.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Starts: {event.startDate.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    All Events
                  </h2>
                  
                  <div className="space-y-4">
                    {seasonalService.getAllEvents().map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{event.name}</h3>
                          {event.active && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {selectedTab === 'achievements' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Achievement Progress
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {xpService.getAllAchievements().map((achievement) => {
                    const progress = xpService.getAchievementProgress(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 ${
                          achievement.unlocked
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{achievement.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                        {achievement.progress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{progress.current}/{progress.required}</span>
                              <span>{Math.round(progress.percentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {selectedTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value="January 1, 2024"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Type
                    </label>
                    <input
                      type="text"
                      value="Free Account"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Data & Storage
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Storage Used</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">45.2 MB of 100 MB</p>
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Export Data
                      </button>
                      <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
                    Danger Zone
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Sign Out</h3>
                        <p className="text-sm text-red-700 dark:text-red-200">Sign out of your account</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                        <p className="text-sm text-red-700 dark:text-red-200">Permanently delete your account and data</p>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage; 