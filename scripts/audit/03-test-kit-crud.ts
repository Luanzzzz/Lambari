import { api } from '../../services/api';
import type { Kit } from '../../types';

console.log('🔍 AUDITORIA: CRUD de Kits + Integridade de Arrays JSONB\n');
console.log('='.repeat(60));

function validateKitArrays(kit: Kit, context: string): boolean {
  let isValid = true;

  console.log(`\n   🔍 Validando Arrays JSONB (${context})...`);

  // Validar images (deve ser array)
  if (!Array.isArray(kit.images)) {
    console.error(`   ❌ images não é array! Tipo: ${typeof kit.images}`);
    isValid = false;
  } else {
    console.log(`   ✅ images: array com ${kit.images.length} item(ns)`);
  }

  // Validar videos (deve ser array, pode estar vazio)
  if (!Array.isArray(kit.videos)) {
    console.error(`   ❌ videos não é array! Tipo: ${typeof kit.videos}`);
    isValid = false;
  } else {
    console.log(`   ✅ videos: array com ${kit.videos.length} item(ns)`);
  }

  // Validar colors (deve ser array)
  if (!Array.isArray(kit.colors)) {
    console.error(`   ❌ colors não é array! Tipo: ${typeof kit.colors}`);
    isValid = false;
  } else {
    console.log(`   ✅ colors: array com ${kit.colors.length} cor(es)`);
  }

  // Validar sizesAvailable (deve ser array)
  if (!Array.isArray(kit.sizesAvailable)) {
    console.error(`   ❌ sizesAvailable não é array! Tipo: ${typeof kit.sizesAvailable}`);
    isValid = false;
  } else {
    console.log(`   ✅ sizesAvailable: array com ${kit.sizesAvailable.length} tamanho(s)`);
  }

  // Validar style (deve ser array, pode estar vazio)
  if (kit.style !== undefined && !Array.isArray(kit.style)) {
    console.error(`   ❌ style não é array! Tipo: ${typeof kit.style}`);
    isValid = false;
  } else if (kit.style) {
    console.log(`   ✅ style: array com ${kit.style.length} estilo(s)`);
  }

  return isValid;
}

async function testKitCRUD() {
  let hasErrors = false;

  try {
    // 1. CREATE - Teste com arrays normais
    console.log('\n1️⃣ Testando CREATE (arrays normais)...');
    const testKit = {
      name: 'Kit Auditoria JSONB',
      description: 'Teste de validação de arrays JSONB em kits',
      price: 199.90,
      totalPieces: 6,
      ageRange: '4-6 anos',
      gender: 'boy' as const,
      brand: 'teste-brand',
      images: [
        'https://via.placeholder.com/300/blue',
        'https://via.placeholder.com/300/red',
        'https://via.placeholder.com/300/green'
      ],
      videos: [
        'https://www.youtube.com/watch?v=test1',
        'https://www.youtube.com/watch?v=test2'
      ],
      colors: ['Azul', 'Vermelho', 'Verde'],
      sizesAvailable: ['4', '6', '8', '10'],
      style: ['casual', 'escola', 'festa'],
      composition: 'Kit completo para testes',
      careInstructions: 'Lavar à mão',
      active: true,
      featured: false,
    };

    const newKit = await api.createKit(testKit);
    console.log(`   ✅ Kit criado: ${newKit.id}`);
    console.log(`   📦 Nome: ${newKit.name}`);

    // Validar arrays após CREATE
    if (!validateKitArrays(newKit, 'após CREATE')) {
      hasErrors = true;
    }

    // 2. READ
    console.log('\n2️⃣ Testando READ...');
    const kits = await api.getKits();
    const foundKit = kits.find(k => k.id === newKit.id);

    if (!foundKit) {
      console.error('   ❌ Kit não encontrado após criação!');
      hasErrors = true;
    } else {
      console.log(`   ✅ Kit encontrado: ${foundKit.name}`);

      // Validar arrays após READ
      if (!validateKitArrays(foundKit, 'após READ')) {
        hasErrors = true;
      }

      // Validar integridade dos dados
      console.log('\n   🔍 Verificando integridade dos arrays...');

      if (JSON.stringify(foundKit.images) === JSON.stringify(testKit.images)) {
        console.log('   ✅ images: intacto (3 imagens)');
      } else {
        console.error('   ❌ images: corrompido!');
        hasErrors = true;
      }

      if (JSON.stringify(foundKit.videos) === JSON.stringify(testKit.videos)) {
        console.log('   ✅ videos: intacto (2 vídeos)');
      } else {
        console.error('   ❌ videos: corrompido!');
        hasErrors = true;
      }

      if (JSON.stringify(foundKit.colors) === JSON.stringify(testKit.colors)) {
        console.log('   ✅ colors: intacto (3 cores)');
      } else {
        console.error('   ❌ colors: corrompido!');
        hasErrors = true;
      }

      if (JSON.stringify(foundKit.sizesAvailable) === JSON.stringify(testKit.sizesAvailable)) {
        console.log('   ✅ sizesAvailable: intacto (4 tamanhos)');
      } else {
        console.error('   ❌ sizesAvailable: corrompido!');
        hasErrors = true;
      }

      if (JSON.stringify(foundKit.style) === JSON.stringify(testKit.style)) {
        console.log('   ✅ style: intacto (3 estilos)');
      } else {
        console.error('   ❌ style: corrompido!');
        hasErrors = true;
      }
    }

    // 3. UPDATE
    console.log('\n3️⃣ Testando UPDATE...');
    const updatedKit = await api.updateKit(newKit.id, {
      price: 249.90,
      colors: ['Azul', 'Vermelho', 'Verde', 'Amarelo'],
      videos: [], // Testar array vazio
    });

    console.log(`   ✅ Kit atualizado`);
    console.log(`   💰 Novo preço: R$ ${updatedKit.price}`);

    // Validar arrays após UPDATE
    if (!validateKitArrays(updatedKit, 'após UPDATE')) {
      hasErrors = true;
    }

    // Verificar que UPDATE não corrompeu arrays
    if (updatedKit.colors.length === 4 && updatedKit.colors.includes('Amarelo')) {
      console.log('   ✅ colors: atualizado corretamente (4 cores)');
    } else {
      console.error('   ❌ colors não foi atualizado corretamente!');
      hasErrors = true;
    }

    if (Array.isArray(updatedKit.videos) && updatedKit.videos.length === 0) {
      console.log('   ✅ videos: array vazio OK');
    } else {
      console.error('   ❌ videos deveria ser array vazio!');
      hasErrors = true;
    }

    // 4. Teste de Edge Cases do ensureArray()
    console.log('\n4️⃣ Testando Edge Cases (ensureArray)...');
    console.log('   💡 Criando kit com valores null/undefined...');

    const edgeCaseKit = await api.createKit({
      name: 'Kit Edge Cases',
      description: 'Teste de null/undefined',
      price: 99.90,
      totalPieces: 3,
      ageRange: '2-4 anos',
      gender: 'unisex' as const,
      brand: 'teste-brand',
      images: ['https://via.placeholder.com/300'],
      videos: null as any, // Testar null
      colors: [] as any, // Testar array vazio
      sizesAvailable: ['Único'],
      active: true,
      featured: false,
    });

    console.log(`   ✅ Kit edge case criado: ${edgeCaseKit.id}`);

    // Verificar que null foi convertido para array vazio
    if (Array.isArray(edgeCaseKit.videos) && edgeCaseKit.videos.length === 0) {
      console.log('   ✅ null convertido para array vazio (videos)');
    } else {
      console.error(`   ❌ null não foi convertido! videos = ${JSON.stringify(edgeCaseKit.videos)}`);
      hasErrors = true;
    }

    // Limpar kit de edge case
    await api.deleteKit(edgeCaseKit.id);
    console.log('   ✅ Kit edge case deletado');

    // 5. DELETE
    console.log('\n5️⃣ Testando DELETE...');
    await api.deleteKit(newKit.id);
    console.log('   ✅ Kit deletado');

    // Verificar DELETE
    const remainingKits = await api.getKits();
    const wasDeleted = !remainingKits.find(k => k.id === newKit.id);

    if (wasDeleted) {
      console.log('   ✅ Confirmação: Kit não existe mais no banco');
    } else {
      console.error('   ❌ ERRO: Kit ainda existe após DELETE!');
      hasErrors = true;
    }

    return !hasErrors;

  } catch (error: any) {
    console.error(`\n❌ ERRO NO TESTE: ${error.message}`);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Execute o teste
testKitCRUD().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ AUDITORIA CONCLUÍDA: CRUD de Kits OK');
    console.log('\n📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('   ✅ Arrays JSONB íntegros (images, videos, colors, sizesAvailable, style)');
    console.log('   ✅ ensureArray() funcionando (null → [])');
    console.log('   ✅ Arrays vazios preservados');
    process.exit(0);
  } else {
    console.log('❌ AUDITORIA FALHOU: Problemas detectados no CRUD de Kits');
    console.log('🔧 Corrija os erros acima antes de prosseguir');
    process.exit(1);
  }
});
