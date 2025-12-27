import { supabase, testConnection} from '../../services/supabase';

console.log('🔍 AUDITORIA: Testando Conexão com Supabase\n');
console.log('='.repeat(60));

async function testSupabaseConnection() {
  let hasErrors = false;

  try {
    // Test 1: Environment Variables
    console.log('\n1️⃣ Verificando Environment Variables...');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      console.error('   ❌ VITE_SUPABASE_URL não definida');
      hasErrors = true;
    } else {
      console.log(`   ✅ URL configurada: ${supabaseUrl}`);
    }

    if (!supabaseKey) {
      console.error('   ❌ VITE_SUPABASE_ANON_KEY não definida');
      hasErrors = true;
    } else {
      console.log(`   ✅ Anon Key configurada: ${supabaseKey.substring(0, 20)}...`);
    }

    // Test 2: Basic Connection
    console.log('\n2️⃣ Testando Conexão Básica...');
    const connectionResult = await testConnection();

    if (!connectionResult) {
      console.error('   ❌ Falha na conexão com Supabase');
      console.error('   💡 Verifique se o projeto Supabase está ativo');
      hasErrors = true;
      return false;
    }
    console.log('   ✅ Conexão estabelecida com sucesso');

    // Test 3: Table Access
    console.log('\n3️⃣ Testando Acesso às Tabelas...');
    const tables = [
      'products',
      'kits',
      'brands',
      'categories',
      'sellers',
      'banners',
      'orders',
      'order_items',
      'stock_movements'
    ];

    for (const table of tables) {
      try {
        const { error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error(`   ❌ Tabela "${table}": ${error.message}`);
          hasErrors = true;
        } else {
          console.log(`   ✅ Tabela "${table}": ${count ?? 0} registros`);
        }
      } catch (err: any) {
        console.error(`   ❌ Erro ao acessar "${table}": ${err.message}`);
        hasErrors = true;
      }
    }

    // Test 4: Storage Bucket Access
    console.log('\n4️⃣ Testando Acesso ao Storage...');
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        console.error(`   ❌ Erro ao listar buckets: ${error.message}`);
        hasErrors = true;
      } else {
        const mediaBucket = buckets?.find(b => b.name === 'media');
        if (mediaBucket) {
          console.log(`   ✅ Bucket "media": Acessível`);
          console.log(`      Público: ${mediaBucket.public ? 'Sim' : 'Não'}`);
        } else {
          console.error('   ❌ Bucket "media" não encontrado');
          hasErrors = true;
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Erro ao acessar Storage: ${err.message}`);
      hasErrors = true;
    }

    // Test 5: Count Summary
    console.log('\n5️⃣ Resumo de Dados...');
    try {
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: kitsCount } = await supabase
        .from('kits')
        .select('*', { count: 'exact', head: true });

      const { count: brandsCount } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true });

      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      console.log(`   📊 Produtos: ${productsCount ?? 0}`);
      console.log(`   📦 Kits: ${kitsCount ?? 0}`);
      console.log(`   🏷️  Brands: ${brandsCount ?? 0}`);
      console.log(`   📁 Categories: ${categoriesCount ?? 0}`);
      console.log(`   🛒 Orders: ${ordersCount ?? 0}`);
    } catch (err: any) {
      console.error(`   ❌ Erro ao contar registros: ${err.message}`);
      hasErrors = true;
    }

    return !hasErrors;

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    return false;
  }
}

// Execute o teste
testSupabaseConnection().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ AUDITORIA CONCLUÍDA: Conexão Supabase OK');
    console.log('🎉 Todos os testes de conectividade passaram!');
    process.exit(0);
  } else {
    console.log('❌ AUDITORIA FALHOU: Problemas detectados');
    console.log('🔧 Corrija os erros acima antes de prosseguir');
    process.exit(1);
  }
});
