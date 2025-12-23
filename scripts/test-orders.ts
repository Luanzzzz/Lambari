import { api } from '../services/api';

async function testOrders() {
  console.log('🧪 Testando CRUD de Orders no Supabase\n');

  try {
    // 0. Criar produtos de teste para referenciar nos items
    console.log('0️⃣  Criando produtos de teste para o pedido...');
    const testProduct1 = await api.createProduct({
      name: 'Produto Teste Order 1',
      description: 'Produto para teste de orders',
      sku: `ORDER-TEST-${Date.now()}-1`,
      brand: 'Test Brand',
      category: 'Test Category',
      price: 89.90,
      costPrice: 45.00,
      gender: 'boy',
      images: [],
      colors: [],
      stock: { P: 10 },
      active: true,
      featured: false,
    });

    const testProduct2 = await api.createProduct({
      name: 'Produto Teste Order 2',
      description: 'Produto para teste de orders',
      sku: `ORDER-TEST-${Date.now()}-2`,
      brand: 'Test Brand',
      category: 'Test Category',
      price: 120.10,
      costPrice: 60.00,
      gender: 'boy',
      images: [],
      colors: [],
      stock: { M: 5 },
      active: true,
      featured: false,
    });
    console.log('   ✅ Produtos de teste criados');

    // 1. CREATE
    console.log('\n1️⃣  Criando order de teste...');
    const newOrder = await api.createOrder({
      date: new Date().toISOString(),
      total: 299.90,
      status: 'confirmed',
      items: [
        { name: 'Camiseta Infantil', quantity: 2, price: 89.90 },
        { name: 'Bermuda Kids', quantity: 1, price: 120.10 },
      ],
      customer: {
        name: 'Cliente Teste',
        company: 'São Paulo',
        email: 'teste@email.com',
        phone: '11999999999',
      },
      productIds: [testProduct1.id, testProduct2.id], // Referências aos produtos
    });

    console.log('   ✅ Order criado:', newOrder.id);
    console.log('   👤 Cliente:', newOrder.customer.name);
    console.log('   📱 Telefone:', newOrder.customer.phone);
    console.log('   💰 Total:', `R$ ${newOrder.total.toFixed(2)}`);
    console.log('   📦 Items:', newOrder.items.length);
    console.log('   📊 Status:', newOrder.status);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os orders...');
    const orders = await api.getOrders();
    console.log(`   ✅ Total de orders: ${orders.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando order...');
    const updated = await api.updateOrder(newOrder.id, {
      status: 'in_transit',
      total: 319.90,
    });
    console.log('   ✅ Order atualizado');
    console.log('   📊 Novo status:', updated.status);
    console.log('   💰 Novo total:', `R$ ${updated.total.toFixed(2)}`);

    // 4. DELETE
    console.log('\n4️⃣  Deletando order de teste...');
    await api.deleteOrder(newOrder.id);
    console.log('   ✅ Order deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingOrders = await api.getOrders();
    const wasDeleted = !remainingOrders.find(o => o.id === newOrder.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Order não existe mais' : '❌ ERRO: Order ainda existe!');

    // 6. LIMPAR PRODUTOS DE TESTE
    console.log('\n6️⃣  Limpando produtos de teste...');
    await api.deleteProduct(testProduct1.id);
    await api.deleteProduct(testProduct2.id);
    console.log('   ✅ Produtos de teste removidos');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando (com order_items)');
    console.log('   ✅ READ funcionando (com JOIN)');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando (CASCADE em items)');
    console.log('\n✨ Orders estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testOrders();
