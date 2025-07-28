import React, { useState, useEffect } from 'react';
import { componentStyles } from '../styles/designSystem';

interface PerformanceSummary {
  total_operations: number;
  success_rate: number;
  avg_response_time: number;
  error_rate: number;
  top_operations: [string, number][];
  top_errors: [string, number][];
  time_period_hours: number;
}

interface SystemHealth {
  cpu_avg: number;
  memory_avg: number;
  disk_avg: number;
  error_rate_avg: number;
  response_time_avg: number;
  active_connections_avg: number;
}

interface Alert {
  type: string;
  severity: 'warning' | 'error' | 'info';
  message: string;
  value: number;
  threshold: number;
}

interface SystemStatus {
  resilience: any;
  alerts: Alert[];
  performance: PerformanceSummary;
  health: SystemHealth;
  timestamp: string;
}

const MonitoringPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/monitoring/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch system status');
      }
    } catch (err) {
      setError('Failed to load monitoring data');
      console.error('Monitoring fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-red-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading && !systemStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={fetchSystemStatus}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                System Monitoring 📊
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Real-time performance and health metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
              </label>
              <button
                onClick={fetchSystemStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>
            </div>
          </div>

          {systemStatus && (
            <>
              {/* Alerts Section */}
              {systemStatus.alerts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Active Alerts ({systemStatus.alerts.length})
                  </h2>
                  <div className="grid gap-4">
                    {systemStatus.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{alert.type.replace('_', ' ').toUpperCase()}</h3>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getHealthColor(alert.value, alert.threshold)}`}>
                              {alert.value.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Threshold: {alert.threshold}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
                      <p className={`text-2xl font-bold ${getHealthColor(systemStatus.health.cpu_avg, 80)}`}>
                        {systemStatus.health.cpu_avg.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-3xl">🖥️</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
                      <p className={`text-2xl font-bold ${getHealthColor(systemStatus.health.memory_avg, 85)}`}>
                        {systemStatus.health.memory_avg.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-3xl">💾</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                      <p className={`text-2xl font-bold ${getHealthColor(systemStatus.health.error_rate_avg, 5)}`}>
                        {systemStatus.health.error_rate_avg.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                      <p className={`text-2xl font-bold ${getHealthColor(systemStatus.health.response_time_avg, 5000)}`}>
                        {systemStatus.health.response_time_avg.toFixed(0)}ms
                      </p>
                    </div>
                    <div className="text-3xl">⚡</div>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Operations</span>
                      <span className="font-semibold">{systemStatus.performance.total_operations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className={`font-semibold ${getHealthColor(100 - systemStatus.performance.success_rate, 95)}`}>
                        {systemStatus.performance.success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className={`font-semibold ${getHealthColor(systemStatus.performance.avg_response_time, 5000)}`}>
                        {systemStatus.performance.avg_response_time.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
                      <span className={`font-semibold ${getHealthColor(systemStatus.performance.error_rate, 5)}`}>
                        {systemStatus.performance.error_rate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Top Operations
                  </h3>
                  <div className="space-y-2">
                    {systemStatus.performance.top_operations.slice(0, 5).map(([operation, count], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {operation}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Errors */}
              {systemStatus.performance.top_errors.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Top Errors
                  </h3>
                  <div className="space-y-2">
                    {systemStatus.performance.top_errors.slice(0, 5).map(([error_type, count], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-red-600 dark:text-red-400 truncate">
                          {error_type}
                        </span>
                        <span className="font-semibold text-red-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resilience Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Resilience Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔗</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Connection Status</div>
                    <div className={`font-semibold ${
                      systemStatus.resilience.connection_status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {systemStatus.resilience.connection_status}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Offline Queue</div>
                    <div className="font-semibold">{systemStatus.resilience.offline_queue_size} items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Health Check</div>
                    <div className="font-semibold">
                      {systemStatus.resilience.last_health_check ? 
                        new Date(systemStatus.resilience.last_health_check * 1000).toLocaleTimeString() : 
                        'Never'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                Last updated: {systemStatus.timestamp ? 
                  new Date(systemStatus.timestamp).toLocaleString() : 
                  'Never'
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage; 