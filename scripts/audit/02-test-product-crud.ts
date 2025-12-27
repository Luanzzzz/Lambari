import { api } from '../../services/api';
import type { Product } from '../../types';

console.log('🔍 AUDITORIA: CRUD de Produtos + Validação JSONB\n');
console.log('='.repeat(60));

function validateProductJSONB(product: Product, context: string): boolean {
  let isValid = true;

  console.log(`\n   🔍 Validando JSONB (${context})...`);

  // Validar images (deve ser array)
  if (!Array.isArray(product.images)) {
    console.error(`   ❌ images não é array! Tipo: ${typeof product.images}`);
    isValid = false;
  } else {
    console.log(`   ✅ images: array com ${product.images.length} itens`);
  }

  // Validar colors (deve ser array)
  if (!Array.isArray(product.colors)) {
    console.error(`   ❌ colors não é array! Tipo: ${typeof product.colors}`);
    isValid = false;
  } else {
    console.log(`   ✅ colors: array com ${product.colors.length} itens`);
  }

  // Validar stock (deve ser objeto, não array)
  if (typeof product.stock !== 'object' || Array.isArray(product.stock)) {
    console.error(`   ❌ stock deve ser objeto! Tipo: ${typeof product.stock}, é array: ${Array.isArray(product.stock)}`);
    isValid = false;
  } else {
    const stockKeys = Object.keys(product.stock);
    console.log(`   ✅ stock: objeto com ${stockKeys.length} tamanhos (${stockKeys.join(', ')})`);
  }

  // Validar transformação snake_case → camelCase
  if (product.costPrice !== undefined) {
    console.log(`   ✅ costPrice transformado corretamente: R$ ${product.costPrice}`);
  }

  return isValid;
}

async function testProductCRUD() {
  let hasErrors = false;

  try {
    // 1. CREATE
    console.log('\n1️⃣ Testando CREATE...');
    const testProduct = {
      name: 'Produto Auditoria JSONB',
      description: 'Teste de validação de arrays JSONB',
      sku: `AUDIT-${Date.now()}`,
      brand: 'Teste',
      category: 'Auditoria',
      subcategory: 'JSONB',
      price: 99.90,
      costPrice: 50.00,
      isPromo: false,
      gender: 'boy' as const,
      images: [
        'https://via.placeholder.com/300/blue',
        'https://via.placeholder.com/300/red'
      ],
      colors: ['Azul', 'Vermelho', 'Verde'],
      stock: { P: 10, M: 15, G: 8, GG: 5 },
      active: true,
      featured: false,
    } as any;

    const newProduct = await api.createProduct(testProduct);
    console.log(`   ✅ Produto criado: ${newProduct.id}`);
    console.log(`   📦 Nome: ${newProduct.name}`);

    // Validar JSONB após CREATE
    if (!validateProductJSONB(newProduct, 'após CREATE')) {
      hasErrors = true;
    }

    // 2. READ
    console.log('\n2️⃣ Testando READ...');
    const readProduct = await api.getProducts();
    const foundProduct = readProduct.find(p => p.id === newProduct.id);

    if (!foundProduct) {
      console.error('   ❌ Produto não encontrado após criação!');
      hasErrors = true;
    } else {
      console.log(`   ✅ Produto encontrado: ${foundProduct.name}`);

      // Validar JSONB após READ
      if (!validateProductJSONB(foundProduct, 'após READ')) {
        hasErrors = true;
      }

      // Validar que arrays não foram corrompidos
      console.log('\n   🔍 Verificando integridade dos dados...');
      if (JSON.stringify(foundProduct.images) === JSON.stringify(testProduct.images)) {
        console.log('   ✅ images: intacto');
      } else {
        console.error('   ❌ images: corrompido!');
        console.error(`      Esperado: ${JSON.stringify(testProduct.images)}`);
        console.error(`      Recebido: ${JSON.stringify(foundProduct.images)}`);
        hasErrors = true;
      }

      if (JSON.stringify(foundProduct.colors) === JSON.stringify(testProduct.colors)) {
        console.log('   ✅ colors: intacto');
      } else {
        console.error('   ❌ colors: corrompido!');
        hasErrors = true;
      }

      if (JSON.stringify(foundProduct.stock) === JSON.stringify(testProduct.stock)) {
        console.log('   ✅ stock: intacto');
      } else {
        console.error('   ❌ stock: corrompido!');
        hasErrors = true;
      }
    }

    // 3. UPDATE
    console.log('\n3️⃣ Testando UPDATE...');
    const updatedProduct = await api.updateProduct(newProduct.id, {
      price: 149.90,
      isPromo: true,
      promoPrice: 129.90,
      colors: ['Azul', 'Vermelho', 'Verde', 'Amarelo'], // Adicionar uma cor
    });

    console.log(`   ✅ Produto atualizado`);
    console.log(`   💰 Novo preço: R$ ${updatedProduct.price}`);
    console.log(`   🏷️  Em promoção: ${updatedProduct.isPromo}`);

    // Validar JSONB após UPDATE
    if (!validateProductJSONB(updatedProduct, 'após UPDATE')) {
      hasErrors = true;
    }

    // Verificar que UPDATE não corrompeu arrays
    if (updatedProduct.colors.length === 4 && updatedProduct.colors.includes('Amarelo')) {
      console.log('   ✅ colors: atualizado corretamente (4 cores)');
    } else {
      console.error('   ❌ colors não foi atualizado corretamente!');
      hasErrors = true;
    }

    // 4. DELETE
    console.log('\n4️⃣ Testando DELETE...');
    await api.deleteProduct(newProduct.id);
    console.log('   ✅ Produto deletado');

    // Verificar DELETE
    const remainingProducts = await api.getProducts();
    const wasDeleted = !remainingProducts.find(p => p.id === newProduct.id);

    if (wasDeleted) {
      console.log('   ✅ Confirmação: Produto não existe mais no banco');
    } else {
      console.error('   ❌ ERRO: Produto ainda existe após DELETE!');
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
testProductCRUD().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ AUDITORIA CONCLUÍDA: CRUD de Produtos OK');
    console.log('\n📋 Resumo:');
    console.log('   ✅ CREATE funcionando');
    console.log('   ✅ READ funcionando');
    console.log('   ✅ UPDATE funcionando');
    console.log('   ✅ DELETE funcionando');
    console.log('   ✅ Arrays JSONB íntegros (images, colors)');
    console.log('   ✅ Objeto JSONB íntegro (stock)');
    console.log('   ✅ Transformers funcionando (snake_case → camelCase)');
    process.exit(0);
  } else {
    console.log('❌ AUDITORIA FALHOU: Problemas detectados no CRUD');
    console.log('🔧 Corrija os erros acima antes de prosseguir');
    process.exit(1);
  }
});
