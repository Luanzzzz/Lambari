
import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, Download, ArrowRight, ArrowLeft, RefreshCw, FileText, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { api } from '../services/api';
import { ImportValidationResult, BulkImportReport } from '../types';
import toast from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'DOWNLOAD' | 'UPLOAD' | 'PREVIEW' | 'IMPORTING' | 'RESULTS';

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('DOWNLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validations, setValidations] = useState<ImportValidationResult[]>([]);
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Reset on Close ---
  const handleClose = () => {
    setStep('DOWNLOAD');
    setFile(null);
    setValidations([]);
    setReport(null);
    onClose();
  };

  // --- Step 1: Download Logic ---
  const handleDownload = (format: 'xlsx' | 'csv') => {
    api.downloadTemplate(format);
    toast.success('Template baixado!');
  };

  // --- Step 2: Upload Logic ---
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const results = await api.parseAndValidateImport(selectedFile);
      setValidations(results);
      // Wait a moment for UX
      setTimeout(() => {
        setIsLoading(false);
        setStep('PREVIEW');
      }, 500);
    } catch (e) {
      toast.error('Erro ao ler arquivo. Verifique o formato.');
      setIsLoading(false);
      setFile(null);
    }
  };

  // --- Step 3: Preview Logic ---
  const handleImport = async () => {
    setStep('IMPORTING');
    try {
      const result = await api.executeImport(validations);
      setReport(result);
      setStep('RESULTS');
      toast.success('Importação concluída!');
      onSuccess(); // Trigger refresh on parent
    } catch (e) {
      toast.error('Erro fatal na importação.');
      setStep('PREVIEW');
    }
  };

  // --- RENDERERS ---

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8 relative">
       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
       {['DOWNLOAD', 'UPLOAD', 'PREVIEW', 'RESULTS'].map((s, idx) => {
          const stepIdx = ['DOWNLOAD', 'UPLOAD', 'PREVIEW', 'IMPORTING', 'RESULTS'].indexOf(step);
          const currentIdx = ['DOWNLOAD', 'UPLOAD', 'PREVIEW', 'RESULTS'].indexOf(s);
          const isActive = stepIdx >= currentIdx;
          
          return (
             <div key={s} className={`flex flex-col items-center gap-1 bg-white px-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                   ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
                `}>
                   {currentIdx + 1}
                </div>
                <span className={`text-[10px] font-medium uppercase ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                   {s === 'DOWNLOAD' ? 'Modelo' : s === 'UPLOAD' ? 'Arquivo' : s === 'PREVIEW' ? 'Revisão' : 'Fim'}
                </span>
             </div>
          );
       })}
    </div>
  );

  const renderDownloadStep = () => (
     <div className="text-center space-y-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto">
           <FileSpreadsheet size={32} />
        </div>
        <div>
           <h3 className="text-xl font-bold text-primary mb-2">1. Baixe o Modelo</h3>
           <p className="text-gray-500 max-w-sm mx-auto">
             Utilize nosso template Excel inteligente com instruções detalhadas para evitar erros.
           </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
           <button 
             onClick={() => handleDownload('xlsx')}
             className="flex flex-col items-center justify-center p-6 border-2 border-primary bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors group"
           >
              <FileSpreadsheet className="mb-3 text-primary group-hover:scale-110 transition-transform" size={32} />
              <span className="font-bold text-primary">Excel (.xlsx)</span>
              <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded mt-2">Recomendado</span>
           </button>

           <button 
             onClick={() => handleDownload('csv')}
             className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
           >
              <FileText className="mb-3 text-gray-400" size={32} />
              <span className="font-bold text-gray-600">CSV Básico</span>
              <span className="text-xs text-gray-400 mt-2">Legado</span>
           </button>
        </div>

        <div className="pt-4">
           <Button onClick={() => setStep('UPLOAD')} variant="secondary" className="gap-2">
              Já tenho o arquivo <ArrowRight size={16} />
           </Button>
        </div>
     </div>
  );

  const renderUploadStep = () => (
     <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
         <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-2">2. Envie seu Arquivo</h3>
            <p className="text-gray-500">
               Arraste seu arquivo preenchido ou clique para selecionar.
            </p>
         </div>

         <div 
            className={`border-3 border-dashed rounded-xl p-10 text-center transition-all h-64 flex flex-col items-center justify-center relative
               ${isDragging ? 'border-primary bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
               ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
         >
            {isLoading ? (
               <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-primary" size={40} />
                  <span className="font-bold text-primary">Processando e Validando...</span>
               </div>
            ) : (
               <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Upload size={32} className="text-primary" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">Solte o arquivo aqui</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Suporta .xlsx e .csv</p>
                  
                  <input 
                     type="file" 
                     accept=".csv,.xlsx,.xls" 
                     className="hidden" 
                     id="file-upload"
                     onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
                  />
                  <label htmlFor="file-upload">
                     <Button className="pointer-events-none">Selecionar do Computador</Button>
                  </label>
               </>
            )}
         </div>

         <div className="flex justify-center">
             <button onClick={() => setStep('DOWNLOAD')} className="text-sm text-gray-400 hover:text-primary underline">
                Voltar para download
             </button>
         </div>
     </div>
  );

  const renderPreviewStep = () => {
    const validCount = validations.filter(v => v.status === 'valid').length;
    const warningCount = validations.filter(v => v.status === 'warning').length;
    const errorCount = validations.filter(v => v.status === 'error').length;

    return (
       <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
           <div className="flex justify-between items-end mb-4">
              <div>
                 <h3 className="text-xl font-bold text-primary">3. Revisão de Dados</h3>
                 <p className="text-sm text-gray-500">Verifique os dados antes de importar.</p>
              </div>
              <div className="flex gap-3 text-sm font-medium">
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14}/> {validCount} Válidos</span>
                  <span className="text-yellow-600 flex items-center gap-1"><AlertTriangle size={14}/> {warningCount} Avisos</span>
                  <span className="text-red-600 flex items-center gap-1"><X size={14}/> {errorCount} Erros</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 max-h-[400px]">
              <table className="w-full text-left text-sm">
                 <thead className="bg-white border-b border-gray-200 sticky top-0 shadow-sm z-10">
                    <tr>
                       <th className="p-3 font-semibold text-gray-600">Linha</th>
                       <th className="p-3 font-semibold text-gray-600">Status</th>
                       <th className="p-3 font-semibold text-gray-600">Produto</th>
                       <th className="p-3 font-semibold text-gray-600">Preço/Custo</th>
                       <th className="p-3 font-semibold text-gray-600">Estoque</th>
                       <th className="p-3 font-semibold text-gray-600">Detalhes</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                    {validations.map((val, idx) => (
                       <tr key={idx} className={`bg-white hover:bg-gray-50 ${val.status === 'error' ? 'bg-red-50' : ''}`}>
                          <td className="p-3 text-gray-500">#{val.row}</td>
                          <td className="p-3">
                             {val.status === 'valid' && <CheckCircle size={18} className="text-green-500" />}
                             {val.status === 'warning' && <AlertTriangle size={18} className="text-yellow-500" />}
                             {val.status === 'error' && <X size={18} className="text-red-500" />}
                          </td>
                          <td className="p-3">
                             <div className="font-medium">{val.data.name || <span className="text-red-400 italic">Sem Nome</span>}</div>
                             <div className="text-xs text-gray-400">{val.data.brand} • {val.data.gender}</div>
                          </td>
                          <td className="p-3">
                             <div>R$ {val.data.price?.toFixed(2)}</div>
                             <div className="text-xs text-gray-400">Custo: {val.data.costPrice?.toFixed(2)}</div>
                          </td>
                          <td className="p-3">
                             {Object.values(val.data.stock || {}).reduce((a:number,b:number)=>a+b,0)} un
                          </td>
                          <td className="p-3">
                             {val.messages.length > 0 ? (
                                <ul className="text-xs space-y-1">
                                   {val.messages.map((m, i) => (
                                      <li key={i} className={`${val.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>• {m}</li>
                                   ))}
                                </ul>
                             ) : (
                                <span className="text-xs text-green-600">OK</span>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="mt-4 flex justify-between items-center">
               <button onClick={() => setStep('UPLOAD')} className="text-gray-500 hover:text-primary flex items-center gap-1">
                  <ArrowLeft size={16} /> Voltar
               </button>
               
               <div className="flex gap-2">
                  <span className="text-xs text-gray-400 self-center mr-2">
                     {errorCount > 0 ? `${errorCount} itens serão ignorados.` : 'Todos os itens serão importados.'}
                  </span>
                  <Button onClick={handleImport} disabled={validCount + warningCount === 0}>
                     Importar {validCount + warningCount} Produtos <ArrowRight size={16} className="ml-2" />
                  </Button>
               </div>
           </div>
       </div>
    );
  };

  const renderResultsStep = () => (
      <div className="text-center space-y-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s]">
             <Check size={40} strokeWidth={4} />
          </div>
          
          <div>
             <h3 className="text-2xl font-bold text-gray-900">Importação Concluída!</h3>
             <p className="text-gray-500">Seus produtos foram adicionados ao catálogo com sucesso.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
             <div>
                <span className="block text-3xl font-bold text-primary">{report?.createdProducts}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Produtos</span>
             </div>
             <div>
                <span className="block text-3xl font-bold text-blue-600">{report?.createdCategories}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Categorias</span>
             </div>
             <div>
                <span className="block text-3xl font-bold text-purple-600">{report?.createdBrands}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Marcas</span>
             </div>
          </div>

          <div className="pt-4">
             <Button onClick={handleClose} size="lg" className="min-w-[200px]">
                Fechar e Ver Produtos
             </Button>
          </div>
      </div>
  );

  const renderImportingStep = () => (
     <div className="flex flex-col items-center justify-center h-64 animate-[fadeIn_0.3s]">
        <RefreshCw className="animate-spin text-primary mb-4" size={48} />
        <h3 className="text-xl font-bold text-primary">Importando Produtos...</h3>
        <p className="text-gray-500 mt-2">Isso pode levar alguns segundos.</p>
        
        <div className="w-64 h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
           <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite] w-1/2"></div>
        </div>
     </div>
  );

  if (!isOpen) return null;

  // Wait for hooks to execute then return check logic
  const content = (() => {
      switch (step) {
          case 'DOWNLOAD': return renderDownloadStep();
          case 'UPLOAD': return renderUploadStep();
          case 'PREVIEW': return renderPreviewStep();
          case 'IMPORTING': return renderImportingStep();
          case 'RESULTS': return renderResultsStep();
          default: return null;
      }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] min-h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
             <FileSpreadsheet /> Importação em Massa
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Wizard Progress */}
        <div className="px-8 pt-6">
           {renderStepIndicator()}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
           {content}
        </div>
      </div>
    </div>
  );
};
