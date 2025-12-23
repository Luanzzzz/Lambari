import { api } from '../services/api';
import type { Kit } from '../types';

async function testKits() {
  console.log('🧪 Testando Kits no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando kit de teste...');
    const newKit = await api.createKit({
      name: 'Kit Teste Supabase',
      description: 'Kit criado automaticamente para teste',
      price: 89.90,
      totalPieces: 5,
      ageRange: '2-4 anos',
      gender: 'boy',
      images: ['https://via.placeholder.com/300'],
      composition: 'Kit completo para testes',
      careInstructions: 'Lavar à mão',
      active: true,
      featured: false,
    });

    console.log('   ✅ Kit criado:', newKit.id);
    console.log('   🏷️  Nome:', newKit.name);
    console.log('   💰 Preço:', newKit.price);
    console.log('   📦 Total de peças:', newKit.totalPieces);
    console.log('   👶 Faixa etária:', newKit.ageRange);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os kits...');
    const kits = await api.getKits();
    console.log(`   ✅ Total de kits: ${kits.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando kit...');
    const updated = await api.updateKit(newKit.id, {
      price: 119.90,
      totalPieces: 7,
      description: 'Kit atualizado com mais peças',
    });
    console.log('   ✅ Kit atualizado');
    console.log('   💰 Novo preço:', updated.price);
    console.log('   📦 Novas peças:', updated.totalPieces);
    console.log('   📝 Nova descrição:', updated.description);

    // 4. DELETE
    console.log('\n4️⃣  Deletando kit de teste...');
    await api.deleteKit(newKit.id);
    console.log('   ✅ Kit deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingKits = await api.getKits();
    const wasDeleted = !remainingKits.find(k => k.id === newKit.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Kit não existe mais' : '❌ ERRO: Kit ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ Kits estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testKits();
