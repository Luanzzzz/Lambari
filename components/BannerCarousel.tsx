import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { api } from '../services/api';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  active: boolean;
}

interface BannerCarouselProps {
  autoPlayInterval?: number; // em ms, default 5000
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  autoPlayInterval = 5000
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Carregar banners do banco
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await api.getBanners();
        // Filtra apenas ativos e ordena por position
        const activeBanners = data
          .filter((b: Banner) => b.active)
          .sort((a: Banner, b: Banner) => a.position - b.position);
        setBanners(activeBanners);
      } catch (err) {
        console.error('Erro ao carregar banners:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval, isPaused]);

  const nextSlide = () => {
    if (banners.length <= 1) return;
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length <= 1) return;
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (!banner.linkUrl) return;

    // Link interno ou externo
    if (banner.linkUrl.startsWith('http')) {
      window.open(banner.linkUrl, '_blank');
    } else {
      window.location.hash = banner.linkUrl;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">
          <Image size={48} className="mx-auto mb-2" />
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Sem banners cadastrados - exibe placeholder
  if (banners.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-r from-primary to-blue-800 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Lambari Kids</h2>
          <p className="text-lg text-white/80">Moda infantil atacado</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-900 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`w-full h-full flex-shrink-0 relative ${banner.linkUrl ? 'cursor-pointer' : ''}`}
            onClick={() => handleBannerClick(banner)}
          >
            {/* Imagem do Banner */}
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x600?text=Banner';
              }}
            />

            {/* Overlay com título/subtítulo (se existir) */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-6 md:p-10 text-white">
                  {banner.title && (
                    <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows - só mostra se tiver mais de 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Próximo banner"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Bottom Dots - só mostra se tiver mais de 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrent(index); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                current === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
