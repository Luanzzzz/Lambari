import { testConnection } from '../services/supabase';

console.log('🧪 Testando conexão com Supabase...\n');

testConnection().then(result => {
  if (result) {
    console.log('\n🎉 SUCESSO! Supabase configurado corretamente!');
    console.log('📌 Próximo passo: Executar scripts SQL para criar tabelas');
    process.exit(0);
  } else {
    console.log('\n❌ FALHA na configuração.');
    console.log('🔍 Verifique:');
    console.log('   1. URL do projeto está correta');
    console.log('   2. Chave anon key está correta');
    console.log('   3. Projeto Supabase está ativo (não pausado)');
    process.exit(1);
  }
});
