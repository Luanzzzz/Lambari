import { supabase } from '../services/supabase';
import { api } from '../services/api';

async function testDelete() {
  console.log('🧪 Testando DELETE de Produtos e Kits\n');

  try {
    // === TEST 1: DELETE PRODUCT ===
    console.log('1️⃣  Testando DELETE de Produto...');

    // Criar produto de teste
    const testProduct = await api.createProduct({
      name: 'Produto Delete Test',
      sku: `DEL-TEST-${Date.now()}`,
      brand: 'Test',
      category: 'Test',
      price: 10,
      costPrice: 5,
      gender: 'boy',
      images: [],
      colors: [],
      stock: {},
      inStock: true,
      active: true,
      featured: false,
    } as any);

    console.log('   ✅ Produto criado:', testProduct.id);

    // Tentar deletar via API
    await api.deleteProduct(testProduct.id);
    console.log('   ✅ Produto deletado via API');

    // Verificar se foi deletado
    const products = await api.getProducts();
    const exists = products.find(p => p.id === testProduct.id);

    if (exists) {
      console.log('   ❌ ERRO: Produto ainda existe após delete!');
      process.exit(1);
    }

    console.log('   ✅ Confirmado: Produto não existe mais\n');

    // === TEST 2: DELETE KIT ===
    console.log('2️⃣  Testando DELETE de Kit...');

    // Criar produto para o kit
    const productForKit = await api.createProduct({
      name: 'Produto para Kit Test',
      sku: `KIT-PROD-${Date.now()}`,
      brand: 'Test',
      category: 'Test',
      price: 20,
      costPrice: 10,
      gender: 'girl',
      images: [],
      colors: [],
      stock: { P: 10 },
      inStock: true,
      active: true,
      featured: false,
    } as any);

    console.log('   ✅ Produto para kit criado:', productForKit.id);

    // Criar kit de teste
    const testKit = await api.createKit({
      name: 'Kit Delete Test',
      price: 50,
      brand: 'Test',
      gender: 'girl',
      items: [
        {
          productId: productForKit.id,
          productName: productForKit.name,
          quantity: 2,
          priceAtTime: productForKit.price,
        }
      ],
      totalPieces: 2,
      images: [],
      videos: [],
      sizesAvailable: ['P'],
      colors: [],
      material: 'Test',
      active: true,
    } as any);

    console.log('   ✅ Kit criado:', testKit.id);

    // Verificar se kit_items foram criados
    const { data: kitItems } = await supabase
      .from('kit_items')
      .select('*')
      .eq('kit_id', testKit.id);

    console.log('   ✅ Kit items criados:', kitItems?.length || 0);

    // Tentar deletar kit
    await api.deleteKit(testKit.id);
    console.log('   ✅ Kit deletado via API');

    // Verificar se kit foi deletado
    const kits = await api.getKits();
    const kitExists = kits.find(k => k.id === testKit.id);

    if (kitExists) {
      console.log('   ❌ ERRO: Kit ainda existe após delete!');
      process.exit(1);
    }

    // Verificar se kit_items foram deletados (CASCADE)
    const { data: remainingItems } = await supabase
      .from('kit_items')
      .select('*')
      .eq('kit_id', testKit.id);

    if (remainingItems && remainingItems.length > 0) {
      console.log('   ❌ ERRO: Kit items não foram deletados (CASCADE falhou)!');
      process.exit(1);
    }

    console.log('   ✅ Confirmado: Kit e kit_items deletados (CASCADE)\n');

    // Limpar produto restante
    await api.deleteProduct(productForKit.id);
    console.log('   ✅ Produto de teste limpo\n');

    console.log('🎉 TODOS OS TESTES DE DELETE PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ DELETE de produtos funcionando');
    console.log('   ✅ DELETE de kits funcionando');
    console.log('   ✅ CASCADE delete de kit_items funcionando');
    console.log('\n✨ Sistema de exclusão está 100% funcional!');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes do erro:');
    console.error(error);

    if (error.message.includes('policy')) {
      console.log('\n💡 SOLUÇÃO: Problema de RLS!');
      console.log('   Execute o SQL: supabase/migrations/006_fix_delete_policies.sql');
    }

    process.exit(1);
  }
}

testDelete();
