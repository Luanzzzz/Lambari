import React, { useState, useEffect, useRef, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  fallback?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

/**
 * OptimizedImage component with:
 * - Lazy loading with Intersection Observer
 * - Skeleton loading animation
 * - Error fallback handling
 * - Native lazy loading support
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  className = '',
  width,
  height,
  lazy = true,
  fallback = 'https://placehold.co/600x800?text=Sem+Imagem',
  objectFit = 'cover',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Update src when prop changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
      setIsLoaded(true);
    }
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
    >
      {/* Skeleton loader - shows while image is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Actual image - only renders when in view */}
      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
