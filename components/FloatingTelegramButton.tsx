
import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export const FloatingTelegramButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const TELEGRAM_LINK = 'https://t.me/Lambari_kids_bot';

  useEffect(() => {
    // Show tooltip after 3 seconds on first visit
    const hasSeenTooltip = localStorage.getItem('telegram_tooltip_seen');
    
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Auto hide after 8 seconds
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('telegram_tooltip_seen', 'true');
        }, 8000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 mb-2 w-64 animate-[slideUp_0.3s_ease-out] relative">
          <button 
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                🤖
             </div>
             <div>
                <strong className="block text-primary text-sm font-bold mb-1">Precisa de ajuda?</strong>
                <p className="text-xs text-gray-500 leading-relaxed">
                   Fale com nosso bot inteligente no Telegram para respostas imediatas!
                </p>
             </div>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-100"></div>
        </div>
      )}
      
      <a 
        href={TELEGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-16 h-16 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
        aria-label="Abrir Telegram"
      >
        <Send size={32} className="-ml-1 mt-1" />
        
        {/* Notification Badge */}
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
          1
        </span>
        
        {/* Ping Animation */}
        <span className="absolute inset-0 rounded-full bg-[#0088cc] opacity-20 animate-ping"></span>
      </a>
    </div>
  );
};
