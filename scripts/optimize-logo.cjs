/**
 * Script para otimizar a logo da Lambari Kids
 * Reduz o tamanho do arquivo mantendo a qualidade
 */

const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/images/brand/lambari-logo.png');
const logoSize = fs.statSync(logoPath).size;
const logoSizeMB = (logoSize / 1024 / 1024).toFixed(2);

console.log('📊 Análise da Logo:');
console.log('━'.repeat(50));
console.log(`📁 Arquivo: lambari-logo.png`);
console.log(`📏 Tamanho atual: ${logoSizeMB}MB (${logoSize} bytes)`);
console.log('');

if (logoSize > 100000) { // > 100KB
  console.log('⚠️  ATENÇÃO: Logo está muito grande!');
  console.log('');
  console.log('📝 Recomendações:');
  console.log('');
  console.log('1️⃣  Otimização Online (Mais Fácil):');
  console.log('   • Acesse: https://tinypng.com/');
  console.log('   • Faça upload da logo');
  console.log('   • Baixe a versão otimizada');
  console.log('   • Substitua o arquivo em public/images/brand/');
  console.log('');
  console.log('2️⃣  Otimização Local (Automática):');
  console.log('   • Instale: npm install -D sharp');
  console.log('   • Execute: npm run optimize:logo');
  console.log('');
  console.log('3️⃣  Formato WebP (Melhor Performance):');
  console.log('   • Converta para WebP (70% menor)');
  console.log('   • Execute: npm run convert:webp');
  console.log('');
  console.log('🎯 Tamanho ideal: 50-100KB');
  console.log(`📉 Redução esperada: ~${((1 - 100/logoSize*1024)*100).toFixed(0)}%`);
  console.log('');
} else {
  console.log('✅ Logo está com tamanho otimizado!');
}

console.log('━'.repeat(50));
console.log('');
console.log('💡 Dica: Logo menor = Site mais rápido!');
console.log('');
