import React, { useState } from 'react';
import { ImportModal } from '../../components/ImportModal';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet } from 'lucide-react';

export const BulkImport: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Importação em Massa</h2>
       </div>
       
       <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center">
           <div className="max-w-3xl w-full text-center space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-2">Importação Inteligente de Kits</h3>
                  <p className="text-gray-500 max-w-lg mx-auto">
                      Faça upload de uma planilha com seus kits e o sistema criará automaticamente 
                      os produtos que ainda não existem em seu catálogo, vinculando-os ao kit.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg text-left text-sm space-y-3 border border-blue-100 inline-block max-w-2xl">
                    <h4 className="font-bold text-primary text-base">Como funciona o processo:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>O sistema lê o nome do Kit, preço e marca do arquivo CSV/Excel.</li>
                        <li>Analisa cada item individual (ex: 3x Camiseta, 2x Bermuda).</li>
                        <li>Se o produto já existir no banco (pelo nome), ele apenas vincula ao kit.</li>
                        <li>Se não existir, <strong>cria um novo produto automaticamente</strong> com os dados fornecidos.</li>
                        <li>Ao final, você recebe um relatório completo do que foi criado.</li>
                    </ul>
                </div>

                <div className="pt-4 flex justify-center">
                     <Button size="lg" onClick={() => setIsModalOpen(true)} className="px-8 py-4 text-lg shadow-lg shadow-primary/20">
                        <FileSpreadsheet className="mr-2" size={24} />
                        Iniciar Nova Importação
                     </Button>
                </div>
           </div>
       </div>

       <ImportModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => setIsModalOpen(false)}
       /> 
    </div>
  );
};