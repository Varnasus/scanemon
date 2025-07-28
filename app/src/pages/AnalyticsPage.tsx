import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ScanStats {
  total_scans: number;
  successful_scans: number;
  failed_scans: number;
  success_rate: number;
  acceptance_rate: number;
  confidence: {
    average: number;
    minimum: number;
    maximum: number;
    standard_deviation: number;
  };
  processing_time: {
    average_ms: number;
    minimum_ms: number;
    maximum_ms: number;
  };
  most_scanned_cards: Array<{
    card_name: string;
    count: number;
  }>;
  most_common_sets: Array<{
    set_name: string;
    count: number;
  }>;
  daily_trends: Array<{
    date: string;
    count: number;
  }>;
  period_days: number;
}

interface ConfidenceDistribution {
  distribution: Record<string, number>;
  total_scans: number;
}

interface ModelPerformance {
  total_scans: number;
  successful_scans: number;
  success_rate: number;
  model_versions: Array<{
    version: string;
    total_scans: number;
    average_confidence: number;
    average_processing_time_ms: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [confidenceDistribution, setConfidenceDistribution] = useState<ConfidenceDistribution | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch scan statistics
      const statsResponse = await fetch(`http://localhost:8000/api/v1/analytics/stats?days=${timeRange}`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setScanStats(stats);
      }

      // Fetch confidence distribution
      const confidenceResponse = await fetch('http://localhost:8000/api/v1/analytics/confidence-distribution');
      if (confidenceResponse.ok) {
        const confidence = await confidenceResponse.json();
        setConfidenceDistribution(confidence);
      }

      // Fetch model performance
      const modelResponse = await fetch('http://localhost:8000/api/v1/analytics/model-performance');
      if (modelResponse.ok) {
        const model = await modelResponse.json();
        setModelPerformance(model);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Scan Analytics Dashboard 📊
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Performance metrics and insights from your card scanning activity
          </p>
          
          {/* Time Range Selector */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Range:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {scanStats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scans</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{scanStats.total_scans}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className={`text-2xl font-bold ${getSuccessRateColor(scanStats.success_rate)}`}>
                      {scanStats.success_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-yellow-600 dark:text-yellow-400 text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Confidence</p>
                    <p className={`text-2xl font-bold ${getConfidenceColor(scanStats.confidence.average)}`}>
                      {(scanStats.confidence.average * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-purple-600 dark:text-purple-400 text-2xl">⚡</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Processing</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {scanStats.processing_time.average_ms.toFixed(0)}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Most Scanned Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Scanned Cards 🃏
                </h3>
                <div className="space-y-3">
                  {scanStats.most_scanned_cards.slice(0, 5).map((card, index) => (
                    <div key={card.card_name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          #{index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white">{card.card_name}</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {card.count} scans
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Common Sets */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Common Sets 📦
                </h3>
                <div className="space-y-3">
                  {scanStats.most_common_sets.slice(0, 5).map((set, index) => (
                    <div key={set.set_name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          #{index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white">{set.set_name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {set.count} scans
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confidence Distribution */}
            {confidenceDistribution && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Confidence Distribution 📈
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(confidenceDistribution.distribution).map(([range, count]) => (
                    <div key={range} className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{range}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Performance */}
            {modelPerformance && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Model Performance 🤖
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Version</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Scans</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg Confidence</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelPerformance.model_versions.map((model) => (
                        <tr key={model.version} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{model.version}</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{model.total_scans}</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            {(model.average_confidence * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            {model.average_processing_time_ms.toFixed(0)}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage; 