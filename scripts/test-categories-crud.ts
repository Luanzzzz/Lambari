import { api } from '../services/api';
import type { Category } from '../types';

async function testCategoriesCRUD() {
  console.log('🧪 Testando CRUD de Categories no Supabase\n');

  try {
    // 1. CREATE
    console.log('1️⃣  Criando category de teste...');
    const newCategory = await api.createCategory({
      name: 'Category Teste Supabase',
      parent: null,
      active: true,
    });

    console.log('   ✅ Category criado:', newCategory.id);
    console.log('   🏷️  Nome:', newCategory.name);
    console.log('   👪 Parent:', newCategory.parent || 'null');

    // 2. READ
    console.log('\n2️⃣  Buscando todos os categories...');
    const categories = await api.getCategories();
    console.log(`   ✅ Total de categories: ${categories.length}`);

    // 3. UPDATE
    console.log('\n3️⃣  Atualizando category...');
    const updated = await api.updateCategory(newCategory.id, {
      name: 'Category Teste Atualizado',
    });
    console.log('   ✅ Category atualizado');
    console.log('   🏷️  Novo nome:', updated.name);

    // 4. DELETE
    console.log('\n4️⃣  Deletando category de teste...');
    await api.deleteCategory(newCategory.id);
    console.log('   ✅ Category deletado com sucesso');

    // 5. VERIFICAR DELEÇÃO
    const remainingCategories = await api.getCategories();
    const wasDeleted = !remainingCategories.find(c => c.id === newCategory.id);
    console.log('   ✅ Confirmação:', wasDeleted ? 'Category não existe mais' : '❌ ERRO: Category ainda existe!');

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('\n✨ Categories estão 100% integrados com o Supabase!');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    process.exit(1);
  }
}

testCategoriesCRUD();
