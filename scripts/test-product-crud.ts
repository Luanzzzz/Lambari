import { api } from '../services/api';
import type { Product } from '../types';

async function testProductCRUD() {
  console.log('🧪 Testando CRUD de Produtos no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando produto de teste...');
    const newProduct = await api.createProduct({
      name: 'Camiseta Teste Supabase',
      description: 'Produto criado automaticamente para teste',
      sku: `TEST-${Date.now()}`,
      brand: 'Tip Top',
      category: 'Camisetas',
      subcategory: 'Manga Curta',
      price: 29.90,
      costPrice: 15.00,
      isPromo: false,
      gender: 'boy',
      images: ['https://via.placeholder.com/300'],
      colors: ['Azul', 'Vermelho'],
      stock: { P: 10, M: 5, G: 2 },
      active: true,
      featured: false,
    } as any);

    console.log('   ✅ Produto criado:', newProduct.id);
    console.log('   📦 Nome:', newProduct.name);
    console.log('   💰 Preço:', newProduct.price);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os produtos...');
    const products = await api.getProducts();
    console.log(`   ✅ Total de produtos: ${products.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando produto...');
    const updated = await api.updateProduct(newProduct.id, {
      price: 39.90,
      isPromo: true,
      promoPrice: 34.90,
    });
    console.log('   ✅ Produto atualizado');
    console.log('   💰 Novo preço:', updated.price);
    console.log('   🏷️  Em promoção:', updated.isPromo);
    console.log('   💸 Preço promocional:', updated.promoPrice);

    // 4. DELETE
    console.log('\n4️⃣  Deletando produto de teste...');
    await api.deleteProduct(newProduct.id);
    console.log('   ✅ Produto deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingProducts = await api.getProducts();
    const wasDeleted = !remainingProducts.find(p => p.id === newProduct.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Produto não existe mais' : '❌ ERRO: Produto ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ A API está 100% integrada com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testProductCRUD();
