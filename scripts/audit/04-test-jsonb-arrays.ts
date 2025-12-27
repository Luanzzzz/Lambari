import { supabase } from '../../services/supabase';

console.log('🔍 AUDITORIA: Validação de Arrays JSONB (Dados Existentes)\n');
console.log('='.repeat(60));
console.log('⚠️  Este script APENAS lê dados - não modifica nada\n');

async function validateJSONBArrays() {
  let hasIssues = false;
  const issues: string[] = [];

  try {
    // 1. Validar Produtos
    console.log('1️⃣ Validando Produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, images, colors, stock');

    if (productsError) {
      console.error(`   ❌ Erro ao buscar produtos: ${productsError.message}`);
      return false;
    }

    console.log(`   📊 Total de produtos: ${products?.length ?? 0}`);

    products?.forEach((product) => {
      const productIssues: string[] = [];

      // Validar images
      if (product.images !== null && !Array.isArray(product.images)) {
        productIssues.push(`images não é array (tipo: ${typeof product.images})`);
        hasIssues = true;
      }

      // Validar colors
      if (product.colors !== null && !Array.isArray(product.colors)) {
        productIssues.push(`colors não é array (tipo: ${typeof product.colors})`);
        hasIssues = true;
      }

      // Validar stock
      if (product.stock !== null) {
        if (typeof product.stock !== 'object') {
          productIssues.push(`stock não é objeto (tipo: ${typeof product.stock})`);
          hasIssues = true;
        } else if (Array.isArray(product.stock)) {
          productIssues.push(`stock é array (deveria ser objeto)`);
          hasIssues = true;
        }
      }

      if (productIssues.length > 0) {
        console.error(`   ❌ Produto "${product.name}" (ID: ${product.id}):`);
        productIssues.forEach(issue => console.error(`      - ${issue}`));
        issues.push(`Product ${product.id}: ${productIssues.join(', ')}`);
      }
    });

    if (products && products.length > 0 && issues.length === 0) {
      console.log('   ✅ Todos os produtos com JSONB válido');
    }

    // 2. Validar Kits
    console.log('\n2️⃣ Validando Kits...');
    const { data: kits, error: kitsError } = await supabase
      .from('kits')
      .select('id, name, images, videos, colors, sizes_available, style');

    if (kitsError) {
      console.error(`   ❌ Erro ao buscar kits: ${kitsError.message}`);
      return false;
    }

    console.log(`   📦 Total de kits: ${kits?.length ?? 0}`);

    kits?.forEach((kit) => {
      const kitIssues: string[] = [];

      // Validar todos os campos de array
      const arrayFields = ['images', 'videos', 'colors', 'sizes_available', 'style'];

      arrayFields.forEach(field => {
        const value = (kit as any)[field];
        if (value !== null && !Array.isArray(value)) {
          kitIssues.push(`${field} não é array (tipo: ${typeof value}, valor: ${JSON.stringify(value).substring(0, 50)})`);
          hasIssues = true;
        }
      });

      if (kitIssues.length > 0) {
        console.error(`   ❌ Kit "${kit.name}" (ID: ${kit.id}):`);
        kitIssues.forEach(issue => console.error(`      - ${issue}`));
        issues.push(`Kit ${kit.id}: ${kitIssues.join(', ')}`);
      }
    });

    if (kits && kits.length > 0 && issues.filter(i => i.startsWith('Kit')).length === 0) {
      console.log('   ✅ Todos os kits com JSONB válido');
    }

    // 3. Gerar SQL de Correção (se necessário)
    if (hasIssues) {
      console.log('\n' + '='.repeat(60));
      console.log('❌ PROBLEMAS ENCONTRADOS!\n');
      console.log('📋 Resumo dos problemas:');
      issues.forEach(issue => console.log(`   - ${issue}`));

      console.log('\n💡 Execute este SQL no Supabase para corrigir:\n');
      console.log('-- Correção de Produtos');
      console.log(`UPDATE products
SET
  images = CASE
    WHEN images IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(images) != 'array' THEN '[]'::jsonb
    ELSE images
  END,
  colors = CASE
    WHEN colors IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(colors) != 'array' THEN '[]'::jsonb
    ELSE colors
  END,
  stock = CASE
    WHEN stock IS NULL THEN '{}'::jsonb
    WHEN jsonb_typeof(stock) = 'array' THEN '{}'::jsonb
    ELSE stock
  END
WHERE
  jsonb_typeof(images) != 'array' OR
  jsonb_typeof(colors) != 'array' OR
  jsonb_typeof(stock) = 'array' OR
  images IS NULL OR
  colors IS NULL OR
  stock IS NULL;

-- Correção de Kits
UPDATE kits
SET
  images = CASE
    WHEN images IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(images) != 'array' THEN '[]'::jsonb
    ELSE images
  END,
  videos = CASE
    WHEN videos IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(videos) != 'array' THEN '[]'::jsonb
    ELSE videos
  END,
  colors = CASE
    WHEN colors IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(colors) != 'array' THEN '[]'::jsonb
    ELSE colors
  END,
  sizes_available = CASE
    WHEN sizes_available IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(sizes_available) != 'array' THEN '[]'::jsonb
    ELSE sizes_available
  END,
  style = CASE
    WHEN style IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(style) != 'array' THEN '[]'::jsonb
    ELSE style
  END
WHERE
  jsonb_typeof(images) != 'array' OR
  jsonb_typeof(videos) != 'array' OR
  jsonb_typeof(colors) != 'array' OR
  jsonb_typeof(sizes_available) != 'array' OR
  jsonb_typeof(style) != 'array' OR
  images IS NULL OR
  videos IS NULL OR
  colors IS NULL OR
  sizes_available IS NULL;
`);

      console.log('\n⚠️  IMPORTANTE: Faça backup antes de executar o SQL!');
      console.log('⚠️  Execute no SQL Editor do Supabase Dashboard');
    }

    return !hasIssues;

  } catch (error: any) {
    console.error(`\n❌ ERRO FATAL: ${error.message}`);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Execute a validação
validateJSONBArrays().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ AUDITORIA CONCLUÍDA: Todos os dados JSONB estão íntegros');
    console.log('🎉 Nenhum problema encontrado!');
    process.exit(0);
  } else {
    console.log('❌ AUDITORIA FALHOU: Encontrados problemas em dados JSONB');
    console.log('🔧 Corrija os dados usando o SQL acima');
    process.exit(1);
  }
});
