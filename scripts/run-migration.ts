import { supabase } from '../services/supabase';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('📦 Executando migração do banco de dados...\n');

  try {
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Arquivo SQL carregado:', sqlPath);
    console.log('📊 Tamanho:', sql.length, 'caracteres\n');

    console.log('⚠️  ATENÇÃO: Execute este SQL manualmente no Supabase Dashboard:');
    console.log('    1. Acesse: https://khdfuqayelharlvoywwr.supabase.co');
    console.log('    2. Vá em: SQL Editor');
    console.log('    3. Cole o conteúdo de: supabase/migrations/001_initial_schema.sql');
    console.log('    4. Clique em "Run"\n');

    console.log('💡 Ou use o Supabase CLI:');
    console.log('    supabase db push\n');

  } catch (error: any) {
    console.error('❌ Erro ao ler arquivo SQL:', error.message);
    process.exit(1);
  }
}

runMigration();
