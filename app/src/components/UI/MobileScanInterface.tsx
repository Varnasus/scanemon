import React, { useState, useRef } from 'react';

interface MobileScanInterfaceProps {
  onFileSelect: (file: File) => void;
  onScan: () => void;
  onRetry: () => void;
  onReport: () => void;
  isScanning: boolean;
  hasSelectedFile: boolean;
  className?: string;
  testId?: string;
}

export const MobileScanInterface: React.FC<MobileScanInterfaceProps> = ({
  onFileSelect,
  onScan,
  onRetry,
  onReport,
  isScanning,
  hasSelectedFile,
  className = '',
  testId
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleCameraClick = () => {
    // In a real app, this would open the camera
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`space-y-4 ${className}`}
      data-testid={testId || 'mobile-scan-interface'}
    >
      {/* Camera Button - Large touch target */}
      <button
        onClick={handleCameraClick}
        disabled={isScanning}
        className="w-full h-20 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-lg rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg"
        data-testid="mobile-camera-button"
      >
        <span className="text-2xl">📷</span>
        <span>Take Photo</span>
      </button>

      {/* Upload Area */}
      <div
        className={`
          w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="mobile-upload-area"
      >
        <span className="text-3xl mb-2">📁</span>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Drop image here or tap to select
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          PNG, JPG, WEBP up to 10MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="mobile-file-input"
      />

      {/* Action Buttons - Only show when file is selected */}
      {hasSelectedFile && (
        <div className="space-y-3">
          {/* Scan Button */}
          <button
            onClick={onScan}
            disabled={isScanning}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-lg rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg"
            data-testid="mobile-scan-button"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🪙</span>
                <span>Scan Card</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              disabled={isScanning}
              className="h-12 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 disabled:scale-100"
              data-testid="mobile-retry-button"
            >
              <span>🔄</span>
              <span>Retry</span>
            </button>

            <button
              onClick={onReport}
              disabled={isScanning}
              className="h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 disabled:scale-100"
              data-testid="mobile-report-button"
            >
              <span>⚠️</span>
              <span>Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📱 Mobile Tips</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Hold phone steady for best results</li>
          <li>• Ensure good lighting</li>
          <li>• Capture the entire card</li>
          <li>• Avoid shadows and glare</li>
        </ul>
      </div>
    </div>
  );
}; 