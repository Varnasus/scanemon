import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PullToRefresh } from '../components/UI/PullToRefresh';
import { MobileXPWidget } from '../components/UI/MobileXPWidget';
import { HoloEffect } from '../components/UI/HoloEffect';
import { SwipeableCard } from '../components/UI/SwipeableCard';

interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  type: string;
  hp: string;
  image: string;
  estimatedValue: number;
  condition: string;
  notes: string;
  dateAdded: string;
}

interface CollectionStats {
  total_cards: number;
  unique_cards: number;
  sets: number;
  total_value: number;
}

export default function CollectionPage() {
  const [selectedView, setSelectedView] = useState("All Cards");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false to allow navigation without data
  const [error, setError] = useState<string | null>(null);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [isSetProgressCollapsed, setIsSetProgressCollapsed] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/collection/');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to load collection');
      // Don't set loading to false on error to allow navigation
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/collection/stats/');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchStats();
  }, []);

  // Calculate derived stats
  const totalCards = stats?.total_cards || cards.length;
  const avgValue = stats?.total_value && stats?.total_cards ? (stats.total_value / stats.total_cards).toFixed(2) : "0.00";
  const completion = stats?.unique_cards ? Math.round((stats.unique_cards / 151) * 100) : 0; // Assuming 151 base set
  const resultsCount = cards.length;

  // Filter cards based on selected view
  const getFilteredCards = () => {
    let filtered = [...cards];
    
    switch (selectedView) {
      case "Holos":
        filtered = filtered.filter(card => card.rarity.toLowerCase().includes('holo'));
        break;
      case "Base Set":
        filtered = filtered.filter(card => card.set.toLowerCase().includes('base'));
        break;
      case "Missing Only":
        filtered = filtered.filter(card => !card.id); // This would need proper logic for missing cards
        break;
      default:
        // All Cards - no filter
        break;
    }

    if (showMissingOnly) {
      // This would need proper logic to determine missing cards
      // For now, just show a subset
      filtered = filtered.slice(0, Math.floor(filtered.length / 2));
    }

    return filtered;
  };

  const filteredCards = getFilteredCards();

  // Handle card selection for bulk actions
  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    console.log(`${action} for cards:`, selectedCards);
    // Implement bulk actions here
    setSelectedCards([]); // Clear selection after action
  };

  const handleRefresh = async () => {
    await fetchCards();
    await fetchStats();
  };

  // Mock data for demonstration when no cards are loaded
  const mockCards = [
    {
      id: 'mock-1',
      name: 'Charizard',
      set: 'Base Set',
      number: '4/102',
      rarity: 'Holo Rare',
      type: 'Fire',
      hp: '120',
      image: '',
      estimatedValue: 350.00,
      condition: 'Near Mint',
      notes: 'First edition',
      dateAdded: '2024-01-15'
    },
    {
      id: 'mock-2',
      name: 'Blastoise',
      set: 'Base Set',
      number: '2/102',
      rarity: 'Holo Rare',
      type: 'Water',
      hp: '100',
      image: '',
      estimatedValue: 120.00,
      condition: 'Excellent',
      notes: '',
      dateAdded: '2024-01-10'
    },
    {
      id: 'mock-3',
      name: 'Venusaur',
      set: 'Base Set',
      number: '15/102',
      rarity: 'Holo Rare',
      type: 'Grass',
      hp: '100',
      image: '',
      estimatedValue: 85.00,
      condition: 'Good',
      notes: '',
      dateAdded: '2024-01-05'
    }
  ];

  // Use mock data if no real data is available
  const displayCards = cards.length > 0 ? filteredCards : mockCards;
  const displayTotalCards = cards.length > 0 ? totalCards : mockCards.length;

  return (
    <PullToRefresh onRefresh={handleRefresh} testId="collection-pull-refresh">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-blue-900 text-white px-4 md:px-12 py-6 font-sans relative">
        {/* Mobile XP Widget */}
        <MobileXPWidget 
          currentXP={1250}
          level={3}
          recentScans={5}
          streak={3}
          testId="collection-xp-widget"
        />

        {/* Total Cards + Filters + Saved Views */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          🧾 Total Cards: <span className="text-blue-400">{displayTotalCards}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Saved Views */}
          {["All Cards", "Holos", "Base Set", "Missing Only"].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-1 rounded-full font-semibold transition ${
                selectedView === view
                  ? "bg-pink-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {view}
            </button>
          ))}

          {/* Filter Overlay Trigger */}
          <button className="px-4 py-1 rounded-full bg-cyan-600 hover:bg-cyan-700 font-semibold">
            🔍 Filters
          </button>

          {/* "Don't Own" Smart Filter */}
          <button 
            onClick={() => setShowMissingOnly(!showMissingOnly)}
            className={`px-4 py-1 rounded-full font-semibold ${
              showMissingOnly 
                ? "bg-purple-800 text-white" 
                : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            🎯 Show Missing Cards
          </button>
        </div>
      </div>

      {/* Inline Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-sm flex flex-wrap gap-6 justify-between">
        <span>📊 Avg Value: ${avgValue}</span>
        <span>📦 Most Common: Rare (46%)</span>
        <span>🏁 Completion: {completion}% of Base Set</span>
        <span>🔍 Results: {displayCards.length} cards</span>
      </div>

      {/* Card Grid - 45% width for each card with 10% margins */}
      <div className="flex flex-wrap gap-6 justify-center">
        {displayCards.length === 0 ? (
          <div className="w-full text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No cards found</h3>
            <p className="text-gray-300 mb-6">
              {cards.length === 0 
                ? "Start scanning cards to build your collection!" 
                : "Try adjusting your filters to see more cards."
              }
            </p>
            {cards.length === 0 && (
              <Link
                to="/scan"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 hover:scale-105 inline-flex items-center gap-2"
              >
                🎴 Start Scanning
              </Link>
            )}
          </div>
        ) : (
          displayCards.map((card, i) => (
            <SwipeableCard
              key={card.id}
              className={`${
                selectedCards.includes(card.id) ? 'ring-2 ring-blue-400' : ''
              }`}
              onFavorite={() => console.log('Favorite:', card.name)}
              onTrade={() => console.log('Trade:', card.name)}
              onReport={() => console.log('Report:', card.name)}
              onDelete={() => console.log('Delete:', card.name)}
              testId={`swipeable-card-${card.id}`}
            >
              <div
                className="relative bg-white/5 border border-white/10 rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition group cursor-pointer holo-effect"
                onClick={() => toggleCardSelection(card.id)}
              >
                {/* Card Metadata */}
                <div className="flex items-start justify-between mb-2">
                  <div className="text-lg font-semibold">{card.name}</div>
                  <span className="text-green-400 animate-pulse">⬆ Trending</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{card.type} · {card.rarity}</span>
                  <span>Condition: {card.condition}</span>
                </div>

                {/* XP / Tags / etc */}
                <div className="mt-4 text-sm flex items-center gap-2 flex-wrap">
                  <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full">XP +120</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">{card.set}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">{card.number}</span>
                </div>

                {/* Card Image (Placeholder) */}
                <div className="mt-4 h-32 bg-black/40 rounded-lg animate-pulse flex items-center justify-center text-gray-400">
                  {card.image ? (
                    <img 
                      src={card.image} 
                      alt={card.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    "Card Image"
                  )}
                </div>

                {/* Selection indicator */}
                {selectedCards.includes(card.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </SwipeableCard>
          ))
        )}
      </div>

      {/* Completion Tracker - Collapsible */}
      <div className="mt-12">
        <button
          onClick={() => setIsSetProgressCollapsed(!isSetProgressCollapsed)}
          className="flex items-center justify-between w-full text-xl font-bold mb-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200"
        >
          <span>📦 Set Progress</span>
          <span className={`transform transition-transform duration-200 ${isSetProgressCollapsed ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {!isSetProgressCollapsed && (
          <div className="space-y-4">
            {[
              { name: "Base Set", collected: 121, total: 151 },
              { name: "Jungle", collected: 64, total: 64 },
              { name: "Fossil", collected: 62, total: 62 },
              { name: "Team Rocket", collected: 83, total: 83 },
              { name: "Gym Heroes", collected: 132, total: 132 },
              { name: "Gym Challenge", collected: 132, total: 132 },
              { name: "Neo Genesis", collected: 111, total: 111 },
              { name: "Neo Discovery", collected: 75, total: 75 },
              { name: "Neo Revelation", collected: 66, total: 66 },
              { name: "Neo Destiny", collected: 113, total: 113 }
            ].map((set, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{set.name}</div>
                  <div className="text-sm text-gray-300">{set.collected} / {set.total} cards collected</div>
                </div>
                <div className="w-1/2 bg-white/20 rounded-full h-3">
                  <div
                    className="bg-green-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(set.collected / set.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar (if cards are selected) */}
      {selectedCards.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-lg px-6 py-3 rounded-full flex gap-4 text-sm shadow-xl z-50">
          <span className="text-white">{selectedCards.length} selected</span>
          <button 
            onClick={() => handleBulkAction('add-tag')}
            className="text-white hover:text-green-400"
          >
            ➕ Add Tag
          </button>
          <button 
            onClick={() => handleBulkAction('move-trade')}
            className="text-white hover:text-yellow-300"
          >
            ↔ Move to Trade Box
          </button>
          <button 
            onClick={() => handleBulkAction('delete')}
            className="text-red-400 hover:text-red-500"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
} 