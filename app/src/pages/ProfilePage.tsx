import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  // Mock user stats - these would come from your backend
  const userStats = {
    level: 5,
    xp: 1250,
    xpToNext: 2000,
    totalCards: 47,
    uniqueCards: 42,
    sets: 8,
    streak: 3,
    totalValue: 1250.50,
    memberSince: '2024-01-01',
    lastActive: '2024-01-15'
  };

  const achievements = [
    { id: 1, name: 'First Scan', description: 'Scanned your first card', icon: '🎴', unlocked: true, date: '2024-01-01' },
    { id: 2, name: 'Collector', description: 'Added 10 cards to your collection', icon: '📚', unlocked: true, date: '2024-01-05' },
    { id: 3, name: 'Streak Master', description: 'Maintained a 7-day scan streak', icon: '🔥', unlocked: false },
    { id: 4, name: 'Rare Hunter', description: 'Found 5 rare cards', icon: '💎', unlocked: true, date: '2024-01-10' },
    { id: 5, name: 'Set Completer', description: 'Completed your first set', icon: '🏆', unlocked: false },
    { id: 6, name: 'Value Collector', description: 'Collection worth over $1000', icon: '💰', unlocked: false }
  ];

  const recentActivity = [
    { id: 1, action: 'Scanned Charizard V', date: '2024-01-15', icon: '📱' },
    { id: 2, action: 'Added Pikachu VMAX to collection', date: '2024-01-14', icon: '📚' },
    { id: 3, action: 'Unlocked Rare Hunter achievement', date: '2024-01-10', icon: '💎' },
    { id: 4, action: 'Reached Level 5', date: '2024-01-08', icon: '⭐' },
    { id: 5, action: 'Started 3-day scan streak', date: '2024-01-05', icon: '🔥' }
  ];

  const handleSaveProfile = async () => {
    try {
      await updateProfile(displayName);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'T'}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {user?.displayName || 'Trainer'}
            </h1>
            <p className="text-blue-100 mb-2">{user?.email}</p>
            <p className="text-sm text-blue-100">
              Member since {userStats.memberSince} • Last active {userStats.lastActive}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">Level {userStats.level}</div>
            <div className="text-sm text-blue-100">Trainer</div>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>XP Progress</span>
            <span>{userStats.xp} / {userStats.xpToNext}</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${(userStats.xp / userStats.xpToNext) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trainer Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                />
              </div>
              
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user?.displayName || '');
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Collection Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalCards}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.uniqueCards}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unique Cards</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.sets}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sets</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${userStats.totalValue}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Est. Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Achievements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-colors ${
                achievement.unlocked
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    achievement.unlocked 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${
                    achievement.unlocked 
                      ? 'text-green-700 dark:text-green-200' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.date && (
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Unlocked {achievement.date}
                    </p>
                  )}
                </div>
                {achievement.unlocked && (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 