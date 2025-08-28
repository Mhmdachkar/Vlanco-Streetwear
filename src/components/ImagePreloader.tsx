import React, { useEffect, useState } from 'react';
import { useImagePreloader } from './OptimizedImage';
import { useConnectionOptimization } from '../hooks/useImagePerformance';

interface ImagePreloaderProps {
  criticalImages: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  criticalImages,
  children,
  fallback
}) => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { preloadAll, loadedImages, loadingImages } = useImagePreloader(criticalImages);
  const { isSlowConnection, getOptimalQuality } = useConnectionOptimization();

  useEffect(() => {
    const startPreloading = async () => {
      try {
        // For slow connections, only preload the first few critical images
        const imagesToPreload = isSlowConnection 
          ? criticalImages.slice(0, 2) 
          : criticalImages;

        await preloadAll();
        setIsPreloading(false);
      } catch (error) {
        console.warn('Image preloading failed:', error);
        setIsPreloading(false);
      }
    };

    startPreloading();
  }, [criticalImages, preloadAll, isSlowConnection]);

  // Update progress
  useEffect(() => {
    const totalImages = criticalImages.length;
    const loadedCount = loadedImages.size;
    const progress = totalImages > 0 ? (loadedCount / totalImages) * 100 : 100;
    setPreloadProgress(progress);
  }, [loadedImages.size, criticalImages.length]);

  if (isPreloading && fallback) {
    return (
      <div className="relative">
        {fallback}
        {/* Progress indicator */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${preloadProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ImagePreloader;
