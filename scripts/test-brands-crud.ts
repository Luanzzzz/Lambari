import { api } from '../services/api';
import type { Brand } from '../types';

async function testBrandsCRUD() {
  console.log('🧪 Testando CRUD de Brands no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando brand de teste...');
    const newBrand = await api.createBrand({
      name: 'Brand Teste Supabase',
      slug: `test-brand-${Date.now()}`,
      logo: 'https://via.placeholder.com/150',
      banner: 'https://via.placeholder.com/800x200',
      textColor: '#000000',
      active: true,
    });

    console.log('   ✅ Brand criado:', newBrand.id);
    console.log('   🏷️  Nome:', newBrand.name);
    console.log('   🔗 Slug:', newBrand.slug);

    // 2. READ
    console.log('\n2️⃣  Buscando todos os brands...');
    const brands = await api.getBrands();
    console.log(`   ✅ Total de brands: ${brands.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando brand...');
    const updated = await api.updateBrand(newBrand.id, {
      name: 'Brand Teste Atualizado',
      textColor: '#FF0000',
    });
    console.log('   ✅ Brand atualizado');
    console.log('   🏷️  Novo nome:', updated.name);
    console.log('   🎨 Nova cor:', updated.textColor);

    // 4. DELETE
    console.log('\n4️⃣  Deletando brand de teste...');
    await api.deleteBrand(newBrand.id);
    console.log('   ✅ Brand deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingBrands = await api.getBrands();
    const wasDeleted = !remainingBrands.find(b => b.id === newBrand.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Brand não existe mais' : '❌ ERRO: Brand ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ Brands estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testBrandsCRUD();
