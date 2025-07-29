import React from 'react';
// @ts-ignore - compressorjs doesn't have TypeScript definitions
import Compressor from 'compressorjs';

interface ImageOptimizerProps {
  file: File;
  onOptimized: (optimizedFile: File) => void;
  onError: (error: Error) => void;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  file,
  onOptimized,
  onError,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080
}) => {
  const optimizeImage = () => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      success: (result: Blob) => {
        // Convert Blob to File
        const optimizedFile = new File([result], file.name, {
          type: result.type,
          lastModified: Date.now(),
        });
        onOptimized(optimizedFile);
      },
      error: (err: Error) => {
        onError(err);
      },
    });
  };

  React.useEffect(() => {
    optimizeImage();
  }, [file]);

  return null; // This component doesn't render anything
};

// Utility function to get file size in MB
export const getFileSize = (file: File): number => {
  return file.size / (1024 * 1024);
};

// Utility function to check if file needs optimization
export const needsOptimization = (file: File, maxSizeMB: number = 5): boolean => {
  return getFileSize(file) > maxSizeMB;
};

// Utility function to get optimized file name
export const getOptimizedFileName = (originalName: string): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const ext = originalName.split('.').pop();
  return `${nameWithoutExt}_optimized.${ext}`;
}; 