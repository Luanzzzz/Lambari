
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User, Box, List, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const TELEGRAM_BOT = 'https://t.me/Lambari_kids_bot';

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('chat_tooltip_seen');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('chat_tooltip_seen', 'true');
        }, 8000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 w-64 animate-[slideUp_0.3s_ease-out] z-[999]">
          <div className="mb-1">
            <strong className="block text-primary text-base mb-1">Precisa de ajuda?</strong>
            <p className="text-gray-500 text-sm m-0">Fale com nosso bot!</p>
          </div>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={16} />
          </button>
          {/* Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-100"></div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        className={`fixed bottom-6 right-6 w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-primary/40 transition-all duration-300 z-[1000] hover:scale-110 active:scale-95 group
            ${isOpen ? 'rotate-90 bg-gray-200' : 'bg-primary'}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar Chat" : "Abrir Chat"}
      >
        {isOpen ? (
          <X size={28} className="text-gray-600" />
        ) : (
          <div className="relative">
             <MessageCircle size={28} className="text-white" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          </div>
        )}
      </button>

      {/* Modal Menu */}
      {isOpen && (
        <div className="fixed bottom-[100px] right-6 w-[350px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl flex flex-col z-[999] animate-[slideUp_0.3s_ease-out] overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">
                 <span className="text-2xl">🐠</span>
              </div>
              <div>
                <strong className="block text-base font-bold">Lambari Kids</strong>
                <span className="flex items-center gap-1.5 text-xs text-green-300 font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="bg-gray-50 p-5 overflow-y-auto max-h-[400px]">
            {/* Welcome Bubble */}
            <div className="flex gap-3 mb-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                🤖
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[240px]">
                <p className="text-gray-800 text-sm mb-1">Olá! 👋 Como posso ajudar você hoje?</p>
                <span className="text-[10px] text-gray-400">Agora</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Escolha uma opção:</h4>
              
              <button 
                className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all group text-left"
                onClick={() => window.open(TELEGRAM_BOT, '_blank')}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    🤖
                </div>
                <div className="flex-1">
                  <strong className="block text-gray-800 text-sm group-hover:text-primary transition-colors">Chat com Bot</strong>
                  <span className="text-xs text-gray-500">Respostas automáticas 24/7</span>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
              </button>

              <button 
                className="w-full bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all group text-left"
                onClick={() => window.open(TELEGRAM_BOT, '_blank')}
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <User size={20} />
                </div>
                <div className="flex-1">
                  <strong className="block text-primary text-sm">Falar com Atendente</strong>
                  <span className="text-xs text-gray-600">Atendimento humano personalizado</span>
                </div>
                <ArrowRight size={18} className="text-primary transition-colors" />
              </button>

              <button 
                className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all group text-left"
                onClick={() => { setIsOpen(false); navigate('/rastreio'); }}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Box size={20} />
                </div>
                <div className="flex-1">
                  <strong className="block text-gray-800 text-sm group-hover:text-primary transition-colors">Rastrear Pedido</strong>
                  <span className="text-xs text-gray-500">Acompanhe sua entrega</span>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
              </button>

              <button 
                className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all group text-left"
                onClick={() => { setIsOpen(false); navigate('/'); }}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <List size={20} />
                </div>
                <div className="flex-1">
                  <strong className="block text-gray-800 text-sm group-hover:text-primary transition-colors">Ver Catálogo</strong>
                  <span className="text-xs text-gray-500">Confira nossos produtos</span>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-medium">Powered by Telegram Bot</span>
          </div>
        </div>
      )}
    </>
  );
};
