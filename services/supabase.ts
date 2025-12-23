import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase (Projeto Lambari Production)
// Suporta tanto import.meta.env (Vite) quanto process.env (Node.js)
const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  'https://khdfuqayelharlvoywwr.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZGZ1cWF5ZWxoYXJsdm95d3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTY4ODcsImV4cCI6MjA4MTk5Mjg4N30.SQnXTAQQcyrP86A06oj8ClsXiOp4eDT58AB6sEHMCII';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Credenciais do Supabase não configuradas!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'lambari-ecommerce',
    },
  },
});

// Helper para testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    // Tenta fazer uma query simples
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });

    // Se a tabela não existir ainda, é esperado (vamos criar na próxima fase)
    if (error && error.code === '42P01') {
      console.log('⚠️  Tabelas ainda não criadas (esperado). Conexão OK!');
      return true;
    }

    if (error) throw error;

    console.log('✅ Supabase conectado e tabelas existem!');
    return true;
  } catch (err: any) {
    console.error('❌ Erro na conexão:', err.message);
    return false;
  }
};

// Helper para verificar se está conectado
export const isConnected = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
};

// Log de inicialização
console.log('🔌 Supabase Client inicializado');
console.log('📍 URL:', SUPABASE_URL);
