import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { componentStyles } from '../styles/designSystem';
import { PullToRefresh } from '../components/UI/PullToRefresh';
import { MobileXPWidget } from '../components/UI/MobileXPWidget';
import { MobileScanInterface } from '../components/UI/MobileScanInterface';
import toast from 'react-hot-toast';
import { ScanResult } from '../../../shared/types';

interface PageState {
  loading: boolean;
  partial: boolean;
  complete: boolean;
  error: boolean;
}

const ScanPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('incorrect_identification');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [pageState, setPageState] = useState<PageState>({
    loading: false,
    partial: false,
    complete: false,
    error: false
  });
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  const navigate = useNavigate();
  const { getAuthStatus } = useAuth();

  // Check system status on component mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/scan/system-status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const handleRefresh = async () => {
    await checkSystemStatus();
    toast.success('System status refreshed! 🔄');
  };

  // Funny messages for different confidence levels
  const confidenceMessages = {
    high: [
      "🎉 WOW! I'm 420% sure this is the card! That's like... mathematically impossible but totally awesome! 🤯",
      "✨ Excellent! I'm very confident about this one! This card is definitely what I think it is! 🎯",
      "🚀 This scan is so good, even Pikachu would be impressed! ⚡"
    ],
    medium: [
      "👍 Pretty sure about this one! Looks good to me! I'd bet my Pikachu plushie on it! 🧸",
      "🤔 Hmm, I'm somewhat confident but not 100% sure... Maybe double-check this one? 🤷‍♂️",
      "📊 This looks promising, but I'd recommend a second look! 🔍"
    ],
    low: [
      "😅 Well, I tried my best! This is giving me major Ditto vibes - I'm not very confident here! 🎭",
      "🤷‍♂️ My AI brain is having a moment... This could be anything! 🤪",
      "🎪 Even Ditto is confused by this one! Maybe try a clearer photo? 📸"
    ]
  };

  const getRandomMessage = (confidence: number) => {
    if (confidence >= 0.9) {
      return confidenceMessages.high[Math.floor(Math.random() * confidenceMessages.high.length)];
    } else if (confidence >= 0.5) {
      return confidenceMessages.medium[Math.floor(Math.random() * confidenceMessages.medium.length)];
    } else {
      return confidenceMessages.low[Math.floor(Math.random() * confidenceMessages.low.length)];
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null); // Clear previous results
      setError(null); // Clear previous errors
    }
  };

  const retryWithBackoff = async (operation: () => Promise<any>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        toast(`Retrying... (${attempt}/${maxRetries})`);
      }
    }
  };

  const handleScan = async (retryAttempt: number = 0) => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);
    setRetryCount(retryAttempt);
    setPageState({ loading: true, partial: false, complete: false, error: false });
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await retryWithBackoff(async () => {
        const response = await fetch(`http://localhost:8000/api/v1/scan/?retry_count=${retryAttempt}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      });

      setScanResult(result);
      setPageState({ loading: false, partial: false, complete: true, error: false });
      
      // Show appropriate message based on result
      if (result.user_guidance) {
        const { message, priority } = result.user_guidance;
        if (priority === 'success') {
          toast.success(message);
        } else if (priority === 'warning') {
          toast(message, { icon: '⚠️' });
        } else {
          toast(message, { icon: 'ℹ️' });
        }
      }
      
    } catch (error: any) {
      console.error('Scan error:', error);
      const errorMessage = error.message || 'Failed to scan card. Please try again.';
      setError(errorMessage);
      setPageState({ loading: false, partial: false, complete: false, error: true });
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
    setRetryCount(0);
    setPageState({ loading: false, partial: false, complete: false, error: false });
  };

  const handleRetryScan = async () => {
    if (!selectedFile) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await retryWithBackoff(async () => {
        const response = await fetch(`http://localhost:8000/api/v1/scan/?retry_count=${newRetryCount}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      });

      setScanResult(result);
      toast.success('Retry completed!');
    } catch (error: any) {
      console.error('Retry scan error:', error);
      const errorMessage = 'Retry failed. Please try a different image.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReportIssue = async () => {
    if (!scanResult) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/report/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log_id: scanResult.log_id,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback! We\'ll review this scan.');
        setShowReportModal(false);
        setReportReason('incorrect_identification');
        setReportDescription('');
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleFeedback = async (feedbackType: string) => {
    if (!scanResult) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log_id: scanResult.log_id,
          feedback_type: feedbackType,
        }),
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        toast.success('Feedback submitted!');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to submit feedback.');
    }
  };

  const handleAddToCollection = async () => {
    if (!scanResult) return;

    setIsAddingToCollection(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/collection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scanResult.name,
          set: scanResult.set,
          number: scanResult.filename.split('.')[0], // Use filename as number for now
          rarity: scanResult.rarity,
          type: scanResult.type,
          hp: scanResult.hp,
          image: scanResult.image_url || '',
          estimatedValue: 0, // You might want to add value estimation
          condition: 'Near Mint', // Default condition
          notes: `Scanned with ${Math.round(scanResult.confidence * 100)}% confidence`,
          dateAdded: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Card added to collection successfully!');
        navigate('/collection');
      } else {
        throw new Error('Failed to add card to collection');
      }
    } catch (error) {
      console.error('Add to collection error:', error);
      toast.error('Failed to add card to collection. Please try again.');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const isLowConfidence = (confidence: number) => confidence < 0.7;

  const getErrorMessage = (error: any) => {
    if (error?.code === 'NETWORK_ERROR') {
      return 'Connection lost. Your data is saved locally and will sync when you\'re back online.';
    } else if (error?.code === 'AUTH_FAILED') {
      return 'Sign-in issue. You can continue using the app offline.';
    } else if (error?.code === 'SCAN_FAILED') {
      return 'Scan failed. Try adjusting lighting or taking a clearer photo.';
    } else {
      return 'Something went wrong. Your progress is saved.';
    }
  };

  // Connection status indicator
  const ConnectionStatusIndicator = () => {
    const authStatus = getAuthStatus();
    const isOnline = authStatus.status === 'online';
    
    return (
      <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ConnectionStatusIndicator />
      
      <PullToRefresh onRefresh={handleRefresh} testId="scan-page-pull-refresh">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Mobile XP Widget */}
            <MobileXPWidget 
              currentXP={1250}
              level={3}
              recentScans={5}
              streak={3}
              testId="scan-page-xp-widget"
            />

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Scan Pokémon Cards 📸
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Upload a photo of your Pokémon card to identify it
              </p>
            </div>

          {/* System Status */}
          {systemStatus && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">System Status</h3>
                  <p className="text-white/70 text-sm">
                    Connection: {systemStatus.connection_status} | 
                    Queue: {systemStatus.offline_queue_size} items
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus.connection_status === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
          )}

          {/* File Upload Section - Mobile Optimized */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            {/* Mobile Interface */}
            <div className="md:hidden">
              <MobileScanInterface
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  setScanResult(null);
                  setError(null);
                }}
                onScan={() => handleScan()}
                onRetry={handleRetry}
                onReport={() => setShowReportModal(true)}
                isScanning={isScanning}
                hasSelectedFile={!!selectedFile}
                testId="mobile-scan-interface"
              />
            </div>

            {/* Desktop Interface */}
            <div className="hidden md:block text-center">
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <div className="text-gray-600 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-lg font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {selectedFile.name}
                  </p>
                  <button
                    onClick={() => handleScan()}
                    disabled={isScanning}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-150 hover:scale-105"
                  >
                    {isScanning ? 'Scanning...' : 'Scan Card'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Card preview"
                  className="max-w-md max-h-64 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {pageState.loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Processing your card...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {pageState.error && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">Scan Failed</p>
                  <p className="text-red-600 dark:text-red-300 text-sm">{getErrorMessage(error)}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setError(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {scanResult && !pageState.loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Results</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scanResult.mode === 'online' ? 'bg-green-100 text-green-800' : 
                  scanResult.mode === 'offline' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {scanResult.mode === 'online' ? 'Online' : 
                   scanResult.mode === 'offline' ? 'Offline' : 'Error'}
                </div>
              </div>

              {/* User Guidance */}
              {scanResult.user_guidance && (
                <div className={`mb-4 p-4 rounded-lg ${
                  scanResult.user_guidance.priority === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                  scanResult.user_guidance.priority === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <p className={`text-sm ${
                    scanResult.user_guidance.priority === 'success' ? 'text-green-800 dark:text-green-200' :
                    scanResult.user_guidance.priority === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    {scanResult.user_guidance.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Card Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{scanResult.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Set:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.set}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rarity:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.rarity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">HP:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.hp}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scan Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className={`font-medium ${getConfidenceColor(scanResult.confidence)}`}>
                        {Math.round(scanResult.confidence * 100)}% ({getConfidenceText(scanResult.confidence)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Model Version:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.model_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                      <span className="text-gray-900 dark:text-white">{scanResult.processing_time_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(scanResult.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Message */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  {getRandomMessage(scanResult.confidence)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleAddToCollection}
                  disabled={isAddingToCollection}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                >
                  {isAddingToCollection ? 'Adding...' : 'Add to Collection'}
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                >
                  Report Issue
                </button>

                <button
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                >
                  Scan Another Card
                </button>
              </div>

              {/* Feedback Buttons */}
              <div className="mt-4 flex space-x-2" data-testid="feedback-buttons">
                <button
                  onClick={() => handleFeedback('correct')}
                  className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 font-medium py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                  data-testid="feedback-correct-button"
                >
                  👍 Correct
                </button>
                <button
                  onClick={() => handleFeedback('incorrect')}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-medium py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                  data-testid="feedback-incorrect-button"
                >
                  👎 Incorrect
                </button>
              </div>

              {/* Retry for Low Confidence */}
              {isLowConfidence(scanResult.confidence) && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mt-4" data-testid="low-confidence-warning">
                  <p className="text-yellow-200 text-sm mb-3">
                    ⚠️ Low confidence scan. Consider trying again with a clearer image.
                  </p>
                  <button
                    onClick={handleRetryScan}
                    disabled={isRetrying}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                    data-testid="retry-scan-button"
                  >
                    {isRetrying ? 'Retrying...' : '🔄 Try Again'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Issue</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="incorrect_identification">Incorrect Identification</option>
                      <option value="technical_issue">Technical Issue</option>
                      <option value="inappropriate_content">Inappropriate Content</option>
                      <option value="spam">Spam</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Please describe the issue..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleReportIssue}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </PullToRefresh>
    </div>
  );
};

export default ScanPage; 