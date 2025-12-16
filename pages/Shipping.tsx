
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Truck, MapPin, Search, Calendar, ChevronDown, CheckCircle, Package } from 'lucide-react';

export const Shipping: React.FC = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [frete, setFrete] = useState<{price: string; days: number; cep: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const deliveryTimes = [
    { region: 'São Paulo (Capital e Grande SP)', days: '3-5 dias úteis', price: 'R$ 35,00' },
    { region: 'Sudeste (SP interior, RJ, MG, ES)', days: '5-7 dias úteis', price: 'R$ 45,00' },
    { region: 'Sul (PR, SC, RS)', days: '7-10 dias úteis', price: 'R$ 55,00' },
    { region: 'Centro-Oeste (DF, GO, MT, MS)', days: '8-12 dias úteis', price: 'R$ 65,00' },
    { region: 'Nordeste', days: '10-15 dias úteis', price: 'R$ 75,00' },
    { region: 'Norte', days: '12-18 dias úteis', price: 'R$ 85,00' }
  ];

  const faqs = [
    {
      question: 'Como funciona o rastreamento?',
      answer: 'Após a confirmação do pagamento e separação do pedido, você receberá um código de rastreamento por email e WhatsApp. Com este código, você pode acompanhar sua entrega em tempo real através da nossa página de rastreamento ou diretamente no site da transportadora.'
    },
    {
      question: 'O prazo de entrega é corrido ou útil?',
      answer: 'Todos os prazos informados são em dias ÚTEIS, ou seja, não contam sábados, domingos e feriados.'
    },
    {
      question: 'Qual transportadora vocês utilizam?',
      answer: 'Trabalhamos com as principais transportadoras do Brasil (Correios, Jadlog, Total Express) de acordo com a melhor opção para sua região e tamanho do pedido.'
    },
    {
      question: 'Posso retirar o pedido pessoalmente?',
      answer: 'Sim! Para pedidos acima de R$ 1.000,00 oferecemos opção de retirada em nossa loja mediante agendamento prévio. Entre em contato para agendar.'
    },
    {
      question: 'Vocês entregam em todo o Brasil?',
      answer: 'Sim, realizamos entregas para todos os estados do Brasil. Os prazos e valores variam conforme a região de destino.'
    },
    {
      question: 'O que fazer se meu pedido não chegar?',
      answer: 'Caso o prazo de entrega tenha expirado, entre em contato conosco imediatamente através do WhatsApp ou Telegram. Faremos o rastreamento junto à transportadora e encontraremos uma solução o mais rápido possível.'
    }
  ];

  const calculateShipping = () => {
    if (cep.length < 8) return;
    setLoading(true);
    
    // Mock calculation
    setTimeout(() => {
      const randomPrice = (Math.random() * 50 + 30).toFixed(2);
      const randomDays = Math.floor(Math.random() * 7) + 5;
      
      setFrete({
        price: randomPrice.replace('.', ','),
        days: randomDays,
        cep: cep
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header categories={[]} onSearch={() => {}} onLoginSuccess={() => {}} />

      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Truck size={40} /> POLÍTICA DE ENVIOS
        </h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Informações completas sobre prazos, custos e rastreamento de entregas para todo o Brasil.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        
        {/* Delivery Times */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-primary" /> Prazo de Entrega por Região
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-6">Região</th>
                  <th className="p-6">Prazo Estimado</th>
                  <th className="p-6">Frete Médio (10kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveryTimes.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-6 font-medium text-gray-800">{item.region}</td>
                    <td className="p-6 text-gray-600">{item.days}</td>
                    <td className="p-6 font-bold text-primary">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 p-6 flex gap-4 items-start border-t border-yellow-100">
            <div className="text-2xl">⚠️</div>
            <div className="text-sm text-yellow-800 leading-relaxed">
              <strong>Importante:</strong> Os prazos começam a contar após 
              a confirmação do pagamento e separação do pedido (1-2 dias úteis). 
              Pedidos feitos após às 14h são processados no próximo dia útil.
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="text-primary" /> Calcular Frete e Prazo
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gray-600">
                Digite o CEP de destino para simular o valor e o prazo de entrega para um pedido médio (5kg).
              </p>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2'))}
                  maxLength={9}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                />
                <button 
                  onClick={calculateShipping}
                  disabled={loading || cep.length < 9}
                  className="bg-primary hover:bg-primary-light text-white font-bold px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Calcular'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 min-h-[160px] flex items-center justify-center border border-gray-100">
              {frete ? (
                <div className="w-full animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex items-center gap-3 mb-4 text-green-600 font-bold border-b border-gray-200 pb-3">
                    <CheckCircle /> Resultado da Simulação
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">CEP Destino:</span>
                      <span className="font-medium">{frete.cep}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valor Estimado:</span>
                      <span className="font-bold text-primary text-xl">R$ {frete.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prazo:</span>
                      <span className="font-medium">{frete.days} dias úteis</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Search size={48} className="mx-auto mb-2 opacity-20" />
                  <p>O resultado aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tracking Info */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Rastreamento de Pedidos</h2>
            <p className="text-gray-500">Acompanhe cada etapa da sua entrega</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { num: '1', title: 'Pedido Confirmado', desc: 'Pagamento aprovado e separação' },
              { num: '2', title: 'Código Enviado', desc: 'Envio por email e WhatsApp' },
              { num: '3', title: 'Acompanhe Online', desc: 'Rastreio em tempo real' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50 opacity-50 select-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/rastreio')}
              className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto"
            >
              <Package size={20} />
              Rastrear Meu Pedido Agora
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Perguntas Frequentes</h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 open:bg-white open:shadow-md border border-transparent open:border-gray-100">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-semibold text-gray-700 hover:text-primary transition-colors list-none">
                  {faq.question}
                  <ChevronDown className="group-open:rotate-180 transition-transform text-gray-400" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm animate-[fadeIn_0.3s_ease-out]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};
