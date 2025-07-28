import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - these would come from your backend
  const userStats = {
    level: 5,
    xp: 1250,
    xpToNext: 2000,
    totalCards: 47,
    uniqueCards: 42,
    sets: 8,
    streak: 3,
    totalValue: 1250.50
  };

  const recentCards = [
    {
      id: 1,
      name: 'Charizard V',
      set: 'Champion\'s Path',
      rarity: 'Ultra Rare',
      image: 'https://via.placeholder.com/150x210/ff6b6b/ffffff?text=Charizard',
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Pikachu VMAX',
      set: 'Vivid Voltage',
      rarity: 'Ultra Rare',
      image: 'https://via.placeholder.com/150x210/ffd93d/000000?text=Pikachu',
      date: '2024-01-14'
    },
    {
      id: 3,
      name: 'Zacian V',
      set: 'Sword & Shield',
      rarity: 'Ultra Rare',
      image: 'https://via.placeholder.com/150x210/4ecdc4/ffffff?text=Zacian',
      date: '2024-01-13'
    }
  ];

  const achievements = [
    { id: 1, name: 'First Scan', description: 'Scanned your first card', icon: '🎴', unlocked: true },
    { id: 2, name: 'Collector', description: 'Added 10 cards to your collection', icon: '📚', unlocked: true },
    { id: 3, name: 'Streak Master', description: 'Maintained a 7-day scan streak', icon: '🔥', unlocked: false },
    { id: 4, name: 'Rare Hunter', description: 'Found 5 rare cards', icon: '💎', unlocked: false }
  ];

  const quickActions = [
    {
      title: 'Scan New Card',
      description: 'Add a card to your collection',
      icon: '📱',
      color: 'from-blue-500 to-blue-600',
      link: '/scan'
    },
    {
      title: 'View Collection',
      description: 'Browse your card binder',
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      link: '/collection'
    },
    {
      title: 'Set Progress',
      description: 'Track your set completion',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      link: '/collection'
    },
    {
      title: 'Profile',
      description: 'View your trainer profile',
      icon: '👤',
      color: 'from-orange-500 to-orange-600',
      link: '/profile'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName || 'Trainer'}! 🎴
            </h1>
            <p className="text-blue-100">
              Ready to continue your collection adventure?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Level {userStats.level}</div>
            <div className="text-sm text-blue-100">Trainer</div>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-4">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.uniqueCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.streak}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Est. Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${userStats.totalValue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Cards</h2>
            <Link
              to="/collection"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentCards.map((card) => (
              <div key={card.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-12 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{card.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.set}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{card.rarity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500">{card.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>
          
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  achievement.unlocked
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
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
                </div>
                {achievement.unlocked && (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips & Motivation */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Pro Tip
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200">
              Scan cards in good lighting for the best AI recognition results. 
              Try to capture the entire card in frame for optimal accuracy!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 