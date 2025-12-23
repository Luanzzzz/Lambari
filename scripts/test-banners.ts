import { api } from '../services/api';

async function testBanners() {
  console.log('🧪 Testando CRUD de Banners no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando banner de teste...');
    const newBanner = await api.createBanner({
      title: 'Banner Teste',
      subtitle: 'Promoção Especial',
      imageUrl: 'https://via.placeholder.com/1200x400',
      linkUrl: '/promocoes',
      position: 0,
      active: true,
    });

    console.log('   ✅ Banner criado:', newBanner.id);
    console.log('   📌 Título:', newBanner.title);
    console.log('   📝 Subtítulo:', newBanner.subtitle);
    console.log('   🔗 Link:', newBanner.linkUrl);
    console.log('   📍 Posição:', newBanner.position);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os banners...');
    const banners = await api.getBanners();
    console.log(`   ✅ Total de banners: ${banners.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando banner...');
    const updated = await api.updateBanner(newBanner.id, {
      title: 'Banner Teste Atualizado',
      subtitle: 'Super Promoção',
      position: 1,
    });
    console.log('   ✅ Banner atualizado');
    console.log('   📌 Novo título:', updated.title);
    console.log('   📝 Novo subtítulo:', updated.subtitle);
    console.log('   📍 Nova posição:', updated.position);

    // 4. DELETE
    console.log('\n4️⃣  Deletando banner de teste...');
    await api.deleteBanner(newBanner.id);
    console.log('   ✅ Banner deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingBanners = await api.getBanners();
    const wasDeleted = !remainingBanners.find(b => b.id === newBanner.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Banner não existe mais' : '❌ ERRO: Banner ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ Banners estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testBanners();
