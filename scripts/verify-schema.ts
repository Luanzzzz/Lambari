import { supabase } from '../services/supabase';

async function verifySchema() {
  console.log('🔍 Verificando schema do banco de dados...\n');

  const tables = [
    'brands',
    'categories',
    'products',
    'kits',
    'kit_items',
    'sellers',
    'orders',
    'order_items',
    'banners',
    'stock_movements'
  ];

  let allTablesOk = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(20)} - ERRO: ${error.message}`);
        allTablesOk = false;
      } else {
        console.log(`✅ ${table.padEnd(20)} - OK (${count || 0} registros)`);
      }
    } catch (err: any) {
      console.log(`❌ ${table.padEnd(20)} - ERRO: ${err.message}`);
      allTablesOk = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allTablesOk) {
    console.log('🎉 Verificação concluída com sucesso!');
    console.log('✅ Todas as tabelas foram criadas corretamente.');
    process.exit(0);
  } else {
    console.log('⚠️  Algumas tabelas apresentaram erros.');
    console.log('📋 Verifique se o SQL foi executado corretamente no Supabase Dashboard.');
    process.exit(1);
  }
}

verifySchema();
