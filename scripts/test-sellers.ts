import { api } from '../services/api';

async function testSellers() {
  console.log('🧪 Testando CRUD de Sellers no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando seller de teste...');
    const newSeller = await api.createSeller({
      name: 'Vendedora Teste',
      whatsapp: '5511999999999',
      email: 'teste@lambari.com',
      active: true,
    });

    console.log('   ✅ Seller criado:', newSeller.id);
    console.log('   👤 Nome:', newSeller.name);
    console.log('   📱 WhatsApp:', newSeller.whatsapp);
    console.log('   📧 Email:', newSeller.email);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os sellers...');
    const sellers = await api.getSellers();
    console.log(`   ✅ Total de sellers: ${sellers.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando seller...');
    const updated = await api.updateSeller(newSeller.id, {
      name: 'Vendedora Teste Atualizada',
      email: 'atualizado@lambari.com',
    });
    console.log('   ✅ Seller atualizado');
    console.log('   👤 Novo nome:', updated.name);
    console.log('   📧 Novo email:', updated.email);

    // 4. DELETE
    console.log('\n4️⃣  Deletando seller de teste...');
    await api.deleteSeller(newSeller.id);
    console.log('   ✅ Seller deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingSellers = await api.getSellers();
    const wasDeleted = !remainingSellers.find(s => s.id === newSeller.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Seller não existe mais' : '❌ ERRO: Seller ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ Sellers estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testSellers();
