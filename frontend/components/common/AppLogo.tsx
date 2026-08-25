import React from 'react';

interface AppLogoProps {
  className?: string;
  alt?: string;
  priority?: boolean;
}

/** AgroVision brand logo (emblem + wordmark) from /public/logo.png */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'h-10 w-auto max-w-[200px] object-contain',
  alt = 'AgroVision',
  priority = false,
}) => (
  <img
    src="/logo.png"
    alt={alt}
    className={className}
    draggable={false}
    fetchPriority={priority ? 'high' : undefined}
    decoding="async"
  />
);