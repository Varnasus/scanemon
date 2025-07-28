import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentStyles } from '../styles/designSystem';

interface ScanResult {
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
  analytics_id?: number;
  image_url?: string;
  error_type?: string;
  error_message?: string;
  retry_count?: number;
  suggest_retry?: boolean;
  retry_delay_seconds?: number;
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
  const navigate = useNavigate();

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

  const handleScan = async (retryAttempt: number = 0) => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);
    setRetryCount(retryAttempt);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`http://localhost:8000/api/v1/scan/?retry_count=${retryAttempt}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      console.error('Scan error:', error);
      setError('Failed to scan card. Please try again.');
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

      const response = await fetch(`http://localhost:8000/api/v1/scan/?retry_count=${newRetryCount}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      console.error('Retry scan error:', error);
      setError('Retry failed. Please try a different image.');
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
        alert('Thank you for your feedback! We\'ll review this scan.');
        setShowReportModal(false);
        setReportReason('incorrect_identification');
        setReportDescription('');
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('Failed to submit report. Please try again.');
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
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
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
        alert('Card added to collection successfully!');
        navigate('/collection');
      } else {
        throw new Error('Failed to add card to collection');
      }
    } catch (error) {
      console.error('Add to collection error:', error);
      alert('Failed to add card to collection. Please try again.');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent';
    if (confidence >= 0.8) return 'Very Good';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.5) return 'Fair';
    return 'Poor';
  };

  const isLowConfidence = (confidence: number) => confidence < 0.7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans" data-testid="scan-page">
      <div className="container mx-auto px-6 py-8" data-testid="scan-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8" data-testid="scan-header">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" data-testid="scan-title">
              Scan Your Card 🎴
            </h1>
            <p className="text-lg text-gray-300" data-testid="scan-subtitle">
              Upload a photo of your Pokémon card and let AI identify it instantly
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4" data-testid="scan-error">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">❌</span>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8" data-testid="scan-content">
            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6" data-testid="upload-section">
              <h2 className="text-2xl font-semibold text-white mb-4" data-testid="upload-title">
                Upload Image
              </h2>
              
              <div className="space-y-4" data-testid="upload-content">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-150" data-testid="upload-area">
                  <input
                    type="file"
                    accept="image/*,.webp,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-input"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                    data-testid="file-upload-label"
                  >
                    <div className="text-4xl mb-4" data-testid="upload-icon">📷</div>
                    <p className="text-gray-300 mb-2" data-testid="upload-text">
                      Click to select an image
                    </p>
                    <p className="text-sm text-gray-400" data-testid="upload-formats">
                      Supports JPG, PNG, WebP, GIF
                    </p>
                  </label>
                </div>

                {previewUrl && (
                  <div className="mt-4" data-testid="image-preview">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl"
                      data-testid="preview-image"
                    />
                  </div>
                )}

                <div className="flex space-x-2" data-testid="upload-actions">
                  <button
                    onClick={() => handleScan()}
                    disabled={!selectedFile || isScanning}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-150 hover:scale-105 flex items-center justify-center"
                    data-testid="scan-button"
                  >
                    {isScanning ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" data-testid="scan-spinner"></div>
                        Scanning...
                      </>
                    ) : (
                      '🔍 Scan Card'
                    )}
                  </button>
                  
                  {scanResult && (
                    <button
                      onClick={handleRetry}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 hover:scale-105"
                      title="Try a different image"
                      data-testid="retry-button"
                    >
                      🔄
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6" data-testid="results-section">
              <h2 className="text-2xl font-semibold text-white mb-4" data-testid="results-title">
                Scan Results
              </h2>
              
              {scanResult ? (
                <div className="space-y-4" data-testid="scan-results">
                  {/* AI Message */}
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4" data-testid="ai-message">
                    <p className="text-blue-200 text-sm">
                      {getRandomMessage(scanResult.confidence)}
                    </p>
                  </div>

                  {/* Card Details */}
                  <div className="bg-white/5 rounded-xl p-4" data-testid="card-details">
                    <div className="grid grid-cols-2 gap-4" data-testid="card-details-grid">
                      <div data-testid="card-name">
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-semibold text-white">{scanResult.name}</p>
                      </div>
                      <div data-testid="card-set">
                        <p className="text-sm text-gray-400">Set</p>
                        <p className="font-semibold text-white">{scanResult.set || 'Unknown'}</p>
                      </div>
                      <div data-testid="card-type">
                        <p className="text-sm text-gray-400">Type</p>
                        <p className="font-semibold text-white">{scanResult.type || 'Unknown'}</p>
                      </div>
                      <div data-testid="card-hp">
                        <p className="text-sm text-gray-400">HP</p>
                        <p className="font-semibold text-white">{scanResult.hp || 'Unknown'}</p>
                      </div>
                      <div data-testid="card-rarity">
                        <p className="text-sm text-gray-400">Rarity</p>
                        <p className="font-semibold text-white">{scanResult.rarity || 'Unknown'}</p>
                      </div>
                      <div data-testid="card-confidence">
                        <p className="text-sm text-gray-400">Confidence</p>
                        <p className={`font-semibold ${getConfidenceColor(scanResult.confidence)}`}>
                          {Math.round(scanResult.confidence * 100)}% ({getConfidenceText(scanResult.confidence)})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3" data-testid="action-buttons">
                    {/* Primary Actions */}
                    <div className="flex space-x-2" data-testid="primary-actions">
                      <button
                        onClick={handleAddToCollection}
                        disabled={isAddingToCollection}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-150 hover:scale-105 flex items-center justify-center"
                        data-testid="add-to-collection-button"
                      >
                        {isAddingToCollection ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" data-testid="add-spinner"></div>
                            Adding...
                          </>
                        ) : (
                          '📚 Add to Collection'
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 hover:scale-105"
                        title="Report an issue with this scan"
                        data-testid="report-button"
                      >
                        ⚠️
                      </button>
                    </div>

                    {/* Feedback Buttons */}
                    <div className="flex space-x-2" data-testid="feedback-buttons">
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
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4" data-testid="low-confidence-warning">
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
                </div>
              ) : (
                <div className="text-center py-8" data-testid="no-results">
                  <div className="text-4xl mb-4">🎴</div>
                  <p className="text-gray-400">
                    Upload an image to see scan results here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="report-modal-overlay">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md w-full mx-4" data-testid="report-modal">
            <h3 className="text-xl font-semibold text-white mb-4" data-testid="report-modal-title">Report Issue</h3>
            
            <div className="space-y-4" data-testid="report-form">
              <div data-testid="report-reason-field">
                <label className="block text-sm font-medium text-gray-300 mb-2" data-testid="report-reason-label">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="report-reason-select"
                >
                  <option value="incorrect_identification">Incorrect Identification</option>
                  <option value="poor_quality">Poor Quality Scan</option>
                  <option value="missing_info">Missing Information</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div data-testid="report-description-field">
                <label className="block text-sm font-medium text-gray-300 mb-2" data-testid="report-description-label">
                  Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe the issue..."
                  data-testid="report-description-textarea"
                />
              </div>
              
              <div className="flex space-x-2" data-testid="report-actions">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                  data-testid="report-cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportIssue}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 hover:scale-105"
                  data-testid="report-submit-button"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage; 