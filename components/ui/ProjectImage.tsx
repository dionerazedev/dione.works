import React, { useState } from 'react';

const FALLBACK_IMAGE = '/images/projects/project-placeholder.svg';

interface ProjectImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      {...props}
      src={hasError ? FALLBACK_IMAGE : src}
      alt={hasError ? `${alt}. Image preview unavailable.` : alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={(event) => {
        setIsLoaded(true);
        props.onLoad?.(event);
      }}
      onError={() => { setHasError(true); setIsLoaded(false); }}
      className={`${className} ${isLoaded ? 'is-loaded' : 'is-loading'}`.trim()}
    />
  );
};
