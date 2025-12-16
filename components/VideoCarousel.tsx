import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';

const VIDEOS = [
  {
    id: 1,
    title: "Coleção Verão 2025",
    color: "bg-blue-100", // Placeholder background
    src: "#" // Replace with actual video URL
  },
  {
    id: 2,
    title: "Linha Bebê Conforto",
    color: "bg-pink-100",
    src: "#"
  },
  {
    id: 3,
    title: "Novidades Kaine Premium",
    color: "bg-gray-100",
    src: "#"
  }
];

export const VideoCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % VIDEOS.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % VIDEOS.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + VIDEOS.length) % VIDEOS.length);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {VIDEOS.map((video, index) => (
          <div 
            key={video.id} 
            className={`w-full h-full flex-shrink-0 flex items-center justify-center relative ${video.color}`}
          >
            {/* Placeholder for Video - Replace with <video> tag in production */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                <Play size={40} className="text-white ml-2" fill="white" />
              </div>
              <h2 className="text-3xl font-bold text-primary/50 uppercase tracking-widest">Video {index + 1}</h2>
              <p className="text-primary/40 font-medium mt-2">{video.title}</p>
            </div>
            
            {/* Simulated Video Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
        {VIDEOS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Mute Toggle (UI demo) */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-6 right-6 text-white/70 hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
};