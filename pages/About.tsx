
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Package, Calendar, Users, BarChart3, CheckCircle, Store, Award, Truck, ShoppingBag, MessageCircle } from 'lucide-react';

export const About: React.FC = () => {
  const navigate = useNavigate();

  const statistics = [
    {
      icon: Package,
      value: '500+',
      label: 'Produtos',
      description: 'Em catálogo'
    },
    {
      icon: Calendar,
      value: '2020',
      label: 'Desde 2020',
      description: 'No atacado'
    },
    {
      icon: Users,
      value: '1.000+',
      label: 'Clientes',
      description: 'Fidelizados'
    },
    {
      icon: BarChart3,
      value: '15k+',
      label: 'Peças/Mês',
      description: 'Enviadas'
    }
  ];

  const brands = [
    'LUPO', 'TRIFIL', 'DULOREN', 'HOPE', 'PLIÉ', 
    'DOM MARCO', 'MASH', 'TORP', 'ESBELT', 'NAYANE',
    'THIUMPH', 'HERING', 'ZORBA', 'PUKET', 'YOU',
    'SELENE', 'BRUVI', 'LUT', 'KELLYNHA', 'ROSASTYL',
    'DISFARCE', 'DELRIO', 'DILADY', 'VI LINGERIE',
    'UNITEX', 'HOAHI'
  ];

  const differentials = [
    {
      icon: Award,
      title: 'Qualidade Premium',
      description: 'Produtos selecionados de marcas renomadas com garantia de qualidade.'
    },
    {
      icon: Package,
      title: 'Grande Variedade',
      description: 'Mais de 500 produtos em catálogo para todas as idades e ocasiões.'
    },
    {
      icon: MessageCircle,
      title: 'Atendimento Personalizado',
      description: 'Equipe especializada via WhatsApp e Telegram para melhor atendê-lo.'
    },
    {
      icon: ShoppingBag,
      title: 'Preços Competitivos',
      description: 'Melhores condições de atacado para maximizar sua margem de lucro.'
    },
    {
      icon: Truck,
      title: 'Entrega Ágil',
      description: 'Logística eficiente com rastreamento completo de todos os pedidos.'
    },
    {
      icon: Store,
      title: 'Facilidade de Pedido',
      description: 'Plataforma intuitiva com sistema de compra simplificado.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header categories={[]} onSearch={() => {}} onLoginSuccess={() => {}} />

      {/* Statistics Banner */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center p-4">
                  <div className="bg-white/10 p-4 rounded-full mb-4 backdrop-blur-sm">
                    <Icon size={32} className="text-accent" />
                  </div>
                  <div className="text-4xl font-bold mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-lg font-semibold text-blue-100 mb-1">{stat.label}</div>
                  <div className="text-sm text-blue-200/80">{stat.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Image Section */}
            <div className="lg:col-span-2 sticky top-24">
              <div className="bg-white p-4 rounded-2xl shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1556740758-90de27424783?q=80&w=1000&auto=format&fit=crop" 
                  alt="Loja Lambari Kids"
                  className="w-full h-[500px] object-cover rounded-xl"
                />
                <p className="text-center text-gray-500 text-sm mt-4 font-medium italic">
                  Nossa sede em São Paulo
                </p>
              </div>
            </div>

            {/* Text Section */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-6">SOBRE NÓS</h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-6 font-light">
                  A Lambari Kids está presente no mercado atacadista de 
                  malharia infantil e roupas íntimas, oferecendo produtos 
                  de alta qualidade para revenda.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Nosso catálogo conta com camisetas, blusas, lingeries, 
                  meias e meias calças, pijamas, roupas esportivas e muito mais, 
                  sempre focando na satisfação dos nossos clientes B2B.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  Trabalhamos com as melhores marcas:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-white border border-gray-200 text-primary font-semibold text-sm rounded-lg hover:border-primary/30 hover:bg-blue-50 transition-colors cursor-default"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="text-gray-700 italic">
                  "Hoje, a Lambari Kids se mantém como um dos principais 
                  nomes no comércio atacado, oferecendo atendimento 
                  personalizado via WhatsApp para facilitar as compras 
                  de clientes que buscam qualidade e variedade."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} /> Ver Catálogo
                </button>
                <button 
                  onClick={() => window.open('https://wa.me/5511947804855', '_blank')}
                  className="px-8 py-4 bg-white text-primary border-2 border-primary font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> Falar com Consultor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">NOSSOS DIFERENCIAIS</h2>
            <p className="text-gray-500">Por que escolher a Lambari Kids para o seu negócio</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differentials.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-background-secondary p-8 rounded-2xl hover:bg-blue-50 transition-colors group">
                  <div className="w-14 h-14 bg-white text-primary rounded-xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
