import React, { useState, useEffect } from 'react';

interface Report {
  id: number;
  scan_id: number;
  reason: string;
  description?: string;
  status: string;
  reporter_id?: number;
  moderator_id?: number;
  moderator_notes?: string;
  created_at: string;
  reviewed_at?: string;
  resolved_at?: string;
}

interface ModerationStats {
  total_reports: number;
  status_distribution: Record<string, number>;
  reason_distribution: Record<string, number>;
  average_resolution_time_hours: number;
  period_days: number;
}

const ModerationPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/moderation/reports');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/moderation/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/moderation/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          moderator_notes: moderatorNotes
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh reports
      await fetchReports();
      setSelectedReport(null);
      setModeratorNotes('');
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'incorrect_identification': return 'Incorrect Identification';
      case 'inappropriate_content': return 'Inappropriate Content';
      case 'technical_issue': return 'Technical Issue';
      case 'spam': return 'Spam';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading moderation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Moderation Dashboard 🛡️
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage user reports and maintain quality
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Statistics */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Statistics 📊
                </h2>
                
                {stats && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.total_reports}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Reports ({stats.period_days} days)
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status Distribution</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.status_distribution).map(([status, count]) => (
                          <div key={status} className="flex justify-between text-sm">
                            <span className="capitalize">{status}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Reason Distribution</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.reason_distribution).map(([reason, count]) => (
                          <div key={reason} className="flex justify-between text-sm">
                            <span>{getReasonLabel(reason)}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {stats.average_resolution_time_hours}h
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Resolution Time
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reports List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Reports ({reports.length})
                </h2>
                
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending reports! All caught up.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Report #{report.id} - Scan #{report.scan_id}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(report.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason:
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            {getReasonLabel(report.reason)}
                          </span>
                        </div>
                        
                        {report.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {report.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report #{selectedReport.id} Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scan ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedReport.scan_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getReasonLabel(selectedReport.reason)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Created
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedReport.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedReport.description}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moderator Notes
                </label>
                <textarea
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPage; 