import { supabase } from '../services/supabase';
import { api } from '../services/api';

async function debugDeleteSimple() {
  console.log('🔍 DEBUG SIMPLES - DELETE\n');

  try {
    // 1. Criar produto de teste via API
    console.log('1️⃣  Criando produto de teste via API...');
    const testProduct = await api.createProduct({
      name: 'DEBUG DELETE TEST',
      sku: `DEBUG-${Date.now()}`,
      brand: 'Test',
      category: 'Test',
      price: 10.00,
      costPrice: 5.00,
      gender: 'boy',
      images: [],
      colors: [],
      stock: {},
      inStock: true,
      active: true,
      featured: false,
    } as any);

    console.log('   ✅ Produto criado via API:', testProduct.id);

    // 2. Tentar deletar via API (mesma função usada no componente)
    console.log('\n2️⃣  Tentando deletar via api.deleteProduct()...');

    try {
      await api.deleteProduct(testProduct.id);
      console.log('   ✅ api.deleteProduct() executou sem erro');
    } catch (deleteError: any) {
      console.error('\n❌ ERRO em api.deleteProduct():');
      console.error('   Mensagem:', deleteError.message);
      console.error('   Stack:', deleteError.stack);

      if (deleteError.message.includes('policy')) {
        console.log('\n💡 PROBLEMA: RLS (Row Level Security) está bloqueando!');
        console.log('\n   Solução: Execute este SQL no Supabase Dashboard:\n');
        console.log('   ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
        console.log('   ALTER TABLE kits DISABLE ROW LEVEL SECURITY;');
        console.log('   ALTER TABLE kit_items DISABLE ROW LEVEL SECURITY;\n');
      }

      process.exit(1);
    }

    // 3. Verificar se realmente foi deletado
    console.log('\n3️⃣  Verificando se produto foi deletado...');

    const products = await api.getProducts();
    const stillExists = products.find(p => p.id === testProduct.id);

    if (stillExists) {
      console.error('\n❌ PROBLEMA ENCONTRADO:');
      console.error('   O produto AINDA EXISTE após delete!');
      console.error('   Isso significa que:');
      console.error('   1. A função deleteProduct() não está fazendo nada, OU');
      console.error('   2. RLS está bloqueando silenciosamente');

      // Tentar deletar direto no Supabase
      console.log('\n4️⃣  Tentando deletar direto via Supabase client...');
      const { error: directError } = await supabase
        .from('products')
        .delete()
        .eq('id', testProduct.id);

      if (directError) {
        console.error('   ❌ Erro ao deletar direto:', directError.message);
        console.log('\n   💡 SOLUÇÃO: Desabilite RLS temporariamente!');
      } else {
        console.log('   ✅ Delete direto funcionou!');
        console.log('   ⚠️ Isso significa que a função api.deleteProduct() tem um BUG!');
      }

      process.exit(1);
    }

    console.log('   ✅ Produto não existe mais (DELETE OK!)');

    console.log('\n🎉 DELETE ESTÁ FUNCIONANDO 100%!\n');
    console.log('Se funciona no script mas não no painel:');
    console.log('1. Abra DevTools (F12) → Console');
    console.log('2. Tente deletar um produto');
    console.log('3. Procure por mensagens de erro');
    console.log('4. Me envie print do console\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ ERRO GERAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugDeleteSimple();
