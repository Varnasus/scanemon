import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CardDetailPage: React.FC = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock card data - this would come from your backend
  const card = {
    id: 1,
    name: 'Charizard V',
    set: 'Champion\'s Path',
    number: '074/073',
    rarity: 'Ultra Rare',
    type: 'Fire',
    hp: '220',
    image: 'https://via.placeholder.com/300x420/ff6b6b/ffffff?text=Charizard+V',
    estimatedValue: 45.99,
    dateAdded: '2024-01-15',
    condition: 'Near Mint',
    notes: 'Pulled from a booster pack! Amazing card.',
    attacks: [
      {
        name: 'Claw Slash',
        damage: '30',
        description: 'This attack does 30 damage to one of your opponent\'s Pokémon.'
      },
      {
        name: 'Fire Spin',
        damage: '220',
        description: 'Discard 3 Energy from this Pokémon. This attack does 220 damage to one of your opponent\'s Pokémon.'
      }
    ],
    weaknesses: ['Water'],
    resistances: ['Grass'],
    retreatCost: 2
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove this card from your collection?')) {
      // Here you would delete from your backend
      toast.success('Card removed from collection');
      navigate('/collection');
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you would save changes to your backend
    toast.success('Card updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/collection')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Collection</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {card.name}
          </h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Image */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <img
              src={card.image}
              alt={card.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
                <p className="text-xl font-bold text-green-600">${card.estimatedValue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date Added</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.dateAdded}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Card Number</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Card Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={card.name}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Set
                  </label>
                  <input
                    type="text"
                    value={card.set}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rarity
                  </label>
                  <input
                    type="text"
                    value={card.rarity}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={card.type}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    HP
                  </label>
                  <input
                    type="text"
                    value={card.hp}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attacks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Attacks
            </h3>
            <div className="space-y-3">
              {card.attacks.map((attack, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{attack.name}</h4>
                    <span className="text-sm font-semibold text-red-600">{attack.damage}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{attack.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses & Resistances */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Battle Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weaknesses</p>
                <div className="flex flex-wrap gap-1">
                  {card.weaknesses.map((weakness, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resistances</p>
                <div className="flex flex-wrap gap-1">
                  {card.resistances.map((resistance, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      {resistance}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Retreat Cost</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.retreatCost}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes
            </h3>
            <textarea
              value={card.notes}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 resize-none"
              placeholder="Add notes about this card..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage; 