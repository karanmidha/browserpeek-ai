import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSByPSIwLjUiIGZpbGw9IiNmNWYwZTgiLz48L3N2Zz4=',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !hasError) {
            const imageToLoad = new Image();
            imageToLoad.onload = () => setIsLoaded(true);
            imageToLoad.onerror = () => setHasError(true);
            imageToLoad.src = src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (loading === 'lazy') {
      observer.observe(img);
    } else {
      // For eager loading, load immediately
      const imageToLoad = new Image();
      imageToLoad.onload = () => setIsLoaded(true);
      imageToLoad.onerror = () => setHasError(true);
      imageToLoad.src = src;
    }

    return () => {
      if (img) observer.unobserve(img);
    };
  }, [src, isLoaded, hasError, loading]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="w-full h-full object-cover animate-pulse"
          aria-hidden="true"
        />
      )}

      {hasError && (
        <div className="w-full h-full bg-primary-200 flex items-center justify-center">
          <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <img
        ref={imgRef}
        src={isLoaded ? src : placeholder}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading={loading}
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;