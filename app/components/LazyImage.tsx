'use client';

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string; // 实际要显示的图片
  thumbSrc?: string; // 缩略图（用于占位）
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export default function LazyImage({ src, thumbSrc, alt = '', className = '', onClick }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(thumbSrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      console.error('Failed to load image:', src);
      setIsLoading(false);
    };
  }, [isInView, src]);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden bg-stone-900 ${className}`}
      onClick={onClick}
    >
      {/* 占位背景 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-700 border-t-stone-400 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 图片 */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
