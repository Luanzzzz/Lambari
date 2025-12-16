
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Send, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    institucional: {
      title: 'Lambari Kids',
      links: [
        { label: 'Sobre Nós', href: '/sobre' },
        { label: 'Política de Troca', href: '/politica-troca' },
        { label: 'Envios e Prazos', href: '/envios' },
        { label: 'Fale Conosco', href: '/contato' }
      ]
    },
    compra: {
      title: 'Minha Conta',
      links: [
        { label: 'Entrar / Cadastrar', href: '/login' },
        { label: 'Meus Pedidos', href: '/minha-conta' },
        { label: 'Rastrear Pedido', href: '/rastreio' },
        { label: 'Meus Favoritos', href: '/wishlist' }
      ]
    },
    ajuda: {
      title: 'Ajuda',
      links: [
        { label: 'Perguntas Frequentes', href: '/envios' },
        { label: 'Como Comprar', href: '/sobre' },
        { label: 'Segurança', href: '/sobre' },
        { label: 'Mapa do Site', href: '/' }
      ]
    }
  };

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Send, label: 'Telegram', href: 'https://t.me/Lambari_kids_bot' },
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' }
  ];

  return (
    <footer className="bg-primary text-white mt-auto border-t border-primary-light">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">L</div>
               <span className="text-2xl font-bold tracking-tight">Lambari<span className="text-accent">Kids</span></span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              Referência no atacado de roupas infantis. Oferecemos qualidade, variedade e os melhores preços para revendedores em todo o Brasil.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <Mail size={16} className="text-accent" />
                <span>contato@lambarikids.com.br</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <Phone size={16} className="text-accent" />
                <span>(11) 94780-4855</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <MapPin size={16} className="text-accent" />
                <span>Brás, São Paulo - SP</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <h3 className="font-bold text-lg text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-blue-100 hover:text-accent transition-colors flex items-center gap-1 hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
           <div className="text-sm text-blue-200 text-center md:text-left">
             <p>© {currentYear} Lambari Kids. Todos os direitos reservados.</p>
             <p className="mt-1 text-xs opacity-60">CNPJ: 00.000.000/0001-00</p>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-xs text-blue-200 font-medium">Formas de Pagamento</p>
              <div className="flex gap-2">
                 {['Pix', 'Visa', 'Mastercard', 'Elo', 'Boleto'].map((method) => (
                    <div key={method} className="bg-white text-primary px-3 py-1 rounded text-xs font-bold shadow-sm">
                       {method}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};
