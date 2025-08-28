import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  intersectionRootMargin?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  blurDataURL,
  sizes = '100vw',
  quality = 75,
  onLoad,
  onError,
  lazy = true,
  intersectionRootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !lazy) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: intersectionRootMargin,
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, lazy, intersectionRootMargin]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };

      // Add loading timeout
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          setHasError(true);
          onError?.();
        }
      }, 10000); // 10 second timeout

      img.src = src;

      return () => clearTimeout(timeout);
    }
  }, [isInView, src, isLoaded, hasError, onLoad, onError]);

  // Generate optimized src with quality and size parameters
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // If it's a placeholder or already optimized, return as is
    if (originalSrc === placeholder || originalSrc.includes('data:') || originalSrc.includes('api/placeholder')) {
      return originalSrc;
    }

    // For external images, you might want to use an image optimization service
    // For now, return the original src
    return originalSrc;
  }, [placeholder]);

  const optimizedSrc = getOptimizedSrc(currentSrc);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        ...style
      }}
    >
      <AnimatePresence mode="wait">
        {!isLoaded && !hasError && (
          <motion.div
            key="placeholder"
            className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Skeleton loader */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
            </div>
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs">Failed to load</p>
            </div>
          </motion.div>
        )}

        {isLoaded && (
          <motion.img
            key="image"
            src={optimizedSrc}
            alt={alt}
            className="w-full h-full object-cover"
            style={{
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            sizes={sizes}
          />
        )}
      </AnimatePresence>

      {/* Blur placeholder overlay */}
      {blurDataURL && !isLoaded && (
        <motion.img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          style={{ willChange: 'opacity' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

// Hook for preloading critical images
export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string) => {
    if (loadedImages.has(url) || loadingImages.has(url)) {
      return Promise.resolve();
    }

    setLoadingImages(prev => new Set(prev).add(url));

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(url));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }, [loadedImages, loadingImages]);

  const preloadAll = useCallback(async () => {
    const promises = imageUrls.map(url => preloadImage(url));
    await Promise.allSettled(promises);
  }, [imageUrls, preloadImage]);

  return {
    preloadImage,
    preloadAll,
    loadedImages,
    loadingImages,
    isLoaded: (url: string) => loadedImages.has(url),
    isLoading: (url: string) => loadingImages.has(url)
  };
};

export default OptimizedImage;
