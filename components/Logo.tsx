import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { height: 48, width: 180 },   // Mobile/Compacto
  md: { height: 56, width: 210 },   // Padrão
  lg: { height: 72, width: 270 },   // Desktop
  xl: { height: 96, width: 360 },   // Hero/Banner
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
}) => {
  const dimensions = sizeMap[size];

  // Usar versões otimizadas da logo
  const logoSrc = variant === 'icon'
    ? '/images/brand/lambari-icon-256.png'
    : '/images/brand/lambari-logo-256.png';

  const logoSrcSet = variant === 'icon'
    ? '/images/brand/lambari-icon-512.png 2x'
    : '/images/brand/lambari-logo-512.png 2x';

  return (
    <div
      className={`flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="Lambari Kids - Moda Infantil"
    >
      <img
        src={logoSrc}
        srcSet={logoSrcSet}
        alt="Lambari Kids - Moda Infantil"
        className="object-contain transition-all duration-300 hover:opacity-90"
        style={{
          height: dimensions.height,
          width: variant === 'icon' ? dimensions.height : dimensions.width,
          maxWidth: '100%',
        }}
        loading="eager"
      />
    </div>
  );
};
