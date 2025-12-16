
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RefreshCw, Package, FileText, Calendar, Tag, AlertTriangle, ArrowRight, DollarSign, Truck, Phone } from 'lucide-react';

export const ReturnPolicy: React.FC = () => {
  const navigate = useNavigate();

  const conditions = [
    {
      icon: Package,
      title: 'Produto Sem Uso',
      description: 'O produto deve estar sem sinais de uso, com todas as etiquetas e embalagens originais intactas.'
    },
    {
      icon: Tag,
      title: 'Embalagem Original',
      description: 'Mantenha a embalagem original em perfeito estado para garantir o processo de troca.'
    },
    {
      icon: FileText,
      title: 'Nota Fiscal',
      description: 'É obrigatório apresentar a nota fiscal ou comprovante de compra do produto.'
    },
    {
      icon: Calendar,
      title: 'Prazo de 7 Dias',
      description: 'A solicitação deve ser feita em até 7 dias corridos após o recebimento.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Entre em Contato',
      description: 'Envie mensagem pelo WhatsApp informando o problema e número do pedido.'
    },
    {
      number: '2',
      title: 'Envie Fotos',
      description: 'Tire fotos claras do produto, etiqueta, embalagem e nota fiscal.'
    },
    {
      number: '3',
      title: 'Aguarde Análise',
      description: 'Nossa equipe analisará seu caso em até 24 horas úteis.'
    },
    {
      number: '4',
      title: 'Aprovação',
      description: 'Se aprovado, você receberá instruções e etiqueta para devolução.'
    },
    {
      number: '5',
      title: 'Envio de Volta',
      description: 'Envie o produto conforme instruções. O frete é por nossa conta.'
    },
    {
      number: '6',
      title: 'Processamento',
      description: 'Após conferência, processamos a troca ou reembolso em até 5 dias úteis.'
    }
  ];

  const nonReturnable = [
    'Produtos personalizados ou sob medida',
    'Produtos em promoção com desconto acima de 50%',
    'Produtos com etiquetas removidas ou danificadas',
    'Produtos que apresentem sinais de uso ou lavagem',
    'Produtos cuja embalagem foi violada ou danificada',
    'Produtos de higiene pessoal (lingerie, meias) provados'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header categories={[]} onSearch={() => {}} onLoginSuccess={() => {}} />

      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
           <RefreshCw size={32} />
        </div>
        <h1 className="text-4xl font-bold mb-4">POLÍTICA DE TROCA E DEVOLUÇÃO</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Conheça nossos termos para garantir uma experiência de compra tranquila e transparente.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        
        {/* Main Highlight */}
        <section className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-2xl w-full border-t-8 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Calendar size={120} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-500 mb-2">Prazo para Solicitação</h2>
            <div className="text-6xl font-black text-primary mb-4 tracking-tight">7 DIAS</div>
            <p className="text-xl text-gray-600 font-medium">Corridos após o recebimento</p>
            <div className="mt-6 inline-block bg-blue-50 text-primary px-4 py-2 rounded-lg text-sm font-bold">
               Conforme Art. 49 do Código de Defesa do Consumidor
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Condições Obrigatórias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {conditions.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center group">
                  <div className="w-14 h-14 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to Request - Timeline */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">Como Solicitar uma Troca</h2>
          
          <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:left-[19px] md:before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-6 md:gap-8">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0 shadow-lg ring-4 ring-white z-10">
                  {step.number}
                </div>
                <div className="flex-1 bg-gray-50 p-6 rounded-xl border border-gray-100 relative top-[-8px]">
                  <h3 className="text-lg font-bold text-primary mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Non-Returnable */}
            <section className="bg-red-50 rounded-2xl p-8 border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-red-500" size={28} />
                    <h2 className="text-xl font-bold text-red-800">Não Trocamos</h2>
                </div>
                <ul className="space-y-3">
                    {nonReturnable.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-red-700/80 text-sm">
                            <span className="font-bold text-red-400 mt-0.5">✕</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start">
                    <div className="bg-green-100 text-green-600 p-3 rounded-lg"><DollarSign size={24}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Reembolso</h3>
                        <p className="text-sm text-gray-500">Na mesma forma de pagamento, em até 5 dias úteis após aprovação.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Truck size={24}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Frete Grátis</h3>
                        <p className="text-sm text-gray-500">Em caso de defeito ou erro nosso, o frete de devolução é por nossa conta.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start">
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-lg"><Phone size={24}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Suporte Humanizado</h3>
                        <p className="text-sm text-gray-500">Atendimento via WhatsApp de Seg. a Sex. das 9h às 18h.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* CTA */}
        <section className="bg-primary rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Precisa solicitar uma troca?</h3>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Nossa equipe está pronta para resolver seu problema o mais rápido possível.
            </p>
            <button 
              onClick={() => window.open('https://wa.me/5511947804855', '_blank')}
              className="bg-white text-primary font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
            >
              Falar com Suporte no WhatsApp <ArrowRight size={20} />
            </button>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};
