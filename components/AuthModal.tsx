import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'teste' && password === 'teste') {
      toast.success('Bem-vindo, Admin!');
      onLogin();
      onClose();
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative animate-[fadeIn_0.2s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-primary">Acesso Restrito</h2>
          <p className="text-sm text-text-secondary mt-1">Área administrativa Lambari Kids</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Usuário" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
            autoFocus
          />
          <Input 
            label="Senha" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
          <div className="pt-2">
            <Button type="submit" fullWidth>Entrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};