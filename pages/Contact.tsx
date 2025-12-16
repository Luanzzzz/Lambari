
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Send, Phone, Mail, Clock, MapPin, MessageSquare, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const TELEGRAM_LINK = 'https://t.me/Lambari_kids_bot';
  const WHATSAPP_LINK = 'https://wa.me/5511947804855';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Mock submission
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSent(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header categories={[]} onSearch={() => {}} onLoginSuccess={() => {}} />

      <div className="bg-primary py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          Estamos prontos para atender você da melhor forma. Escolha o canal de sua preferência.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        
        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 -mt-24 relative z-10">
           {/* Telegram Card - Primary */}
           <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-[#0088cc] flex flex-col items-center text-center transform transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#0088cc] mb-4">
                 <Send size={32} />
              </div>
              <span className="bg-[#0088cc] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">RECOMENDADO</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Telegram Bot</h3>
              <p className="text-gray-500 mb-6">Atendimento imediato 24h por dia para consultar catálogo, preços e pedidos.</p>
              
              <div className="w-full space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                    <CheckCircle size={16} className="text-green-500" /> Resposta imediata
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                    <CheckCircle size={16} className="text-green-500" /> Catálogo completo
                 </div>
              </div>

              <a 
                href={TELEGRAM_LINK} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-[#0088cc] text-white rounded-xl font-bold hover:bg-[#0077b5] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                 <Send size={20} /> Acessar Bot Telegram
              </a>
           </div>

           {/* WhatsApp Card */}
           <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-green-500 flex flex-col items-center text-center transform transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                 <Phone size={32} />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">HUMANIZADO</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp</h3>
              <p className="text-gray-500 mb-6">Fale diretamente com um de nossos consultores comerciais.</p>
              
              <div className="w-full space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                    <Clock size={16} className="text-gray-400" /> Seg à Sex: 09h às 18h
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                    <MessageSquare size={16} className="text-gray-400" /> Suporte personalizado
                 </div>
              </div>

              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                 <Phone size={20} /> Chamar no WhatsApp
              </a>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Info Section */}
           <div className="space-y-8">
              <div>
                 <h2 className="text-2xl font-bold text-primary mb-6">Outros Contatos</h2>
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-primary">
                          <Mail size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-800">Email</h4>
                          <p className="text-gray-600">contato@lambarikids.com.br</p>
                          <span className="text-xs text-gray-400">Resposta em até 24h</span>
                       </div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-primary">
                          <Phone size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-800">Telefone Fixo</h4>
                          <p className="text-gray-600">(11) 1234-5678</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-primary">
                          <MapPin size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-800">Endereço</h4>
                          <p className="text-gray-600">
                             Rua Miller, 123 - Brás<br />
                             São Paulo - SP<br />
                             CEP: 03011-011
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                 <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <AlertCircle size={20} /> Dica Importante
                 </h4>
                 <p className="text-sm text-blue-800">
                    Para agilizar seu atendimento, tenha sempre em mãos o número do seu pedido ou CNPJ do cadastro.
                 </p>
              </div>
           </div>

           {/* Form Section */}
           <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6">Envie uma Mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                       label="Nome Completo *" 
                       placeholder="Seu nome"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       required
                    />
                    <Input 
                       label="Email *" 
                       type="email"
                       placeholder="seu@email.com"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       required
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                       label="Telefone / WhatsApp" 
                       placeholder="(11) 99999-9999"
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">Assunto *</label>
                       <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white"
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          required
                       >
                          <option value="">Selecione um assunto</option>
                          <option value="pedido">Dúvidas sobre Pedido</option>
                          <option value="produtos">Informações de Produtos</option>
                          <option value="troca">Troca/Devolução</option>
                          <option value="revenda">Quero Revender</option>
                          <option value="outro">Outro Assunto</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Mensagem *</label>
                    <textarea 
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 h-32 resize-none"
                       placeholder="Como podemos ajudar?"
                       value={formData.message}
                       onChange={e => setFormData({...formData, message: e.target.value})}
                       required
                    />
                 </div>

                 {sent && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 font-medium animate-[fadeIn_0.3s_ease-out]">
                       <CheckCircle size={20} /> Mensagem enviada com sucesso! Responderemos em breve.
                    </div>
                 )}

                 <Button 
                    type="submit" 
                    fullWidth 
                    size="lg" 
                    disabled={sending}
                    className="mt-2"
                 >
                    {sending ? 'Enviando...' : 'Enviar Mensagem'}
                 </Button>
              </form>
           </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-20">
           <h2 className="text-2xl font-bold text-center text-primary mb-8">Dúvidas Frequentes</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                 { icon: '📦', title: 'Prazos de Entrega', desc: 'Consulte prazos por região', href: '/envios' },
                 { icon: '🔍', title: 'Rastrear Pedido', desc: 'Acompanhe sua entrega', href: '/rastreio' },
                 { icon: '🔄', title: 'Trocas e Devoluções', desc: 'Como solicitar troca', href: '/politica-troca' },
                 { icon: 'ℹ️', title: 'Sobre a Empresa', desc: 'Conheça nossa história', href: '/sobre' },
              ].map((item, idx) => (
                 <a 
                    key={idx} 
                    href={item.href}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                 >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center justify-between">
                       {item.desc} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                 </a>
              ))}
           </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};
