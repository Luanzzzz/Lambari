import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface AnyTypeResult {
  file: string;
  line: number;
  content: string;
}

function findAnyTypes(dir: string, results: AnyTypeResult[] = []): AnyTypeResult[] {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist') && file !== 'scripts') {
      findAnyTypes(filePath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Match ": any" mas não em comentários
        // Evitar falsos positivos como "company" ou "many"
        if (/:\s*any[\s,;)>]/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          results.push({
            file: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  });

  return results;
}

console.log('🔍 AUDITORIA: Buscando tipos "any" no código\n');
console.log('='.repeat(70));

const results = findAnyTypes('./src');
const resultsByFile = results.reduce((acc, item) => {
  const file = item.file;
  if (!acc[file]) acc[file] = [];
  acc[file].push(item);
  return acc;
}, {} as Record<string, AnyTypeResult[]>);

if (results.length === 0) {
  console.log('✅ Nenhum tipo "any" encontrado no código!\n');
  console.log('🎉 Código com type safety completo');
  process.exit(0);
} else {
  console.log(`📊 Encontrados ${results.length} usos de tipo "any" em ${Object.keys(resultsByFile).length} arquivo(s):\n`);

  // Ordenar arquivos por quantidade de ocorrências (do maior para o menor)
  const sortedFiles = Object.entries(resultsByFile).sort((a, b) => b[1].length - a[1].length);

  sortedFiles.forEach(([file, items]) => {
    console.log(`\n📄 ${file} (${items.length} ocorrência${items.length > 1 ? 's' : ''})`);
    items.slice(0, 5).forEach(({ line, content }) => {
      console.log(`   Linha ${line}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`);
    });
    if (items.length > 5) {
      console.log(`   ... e mais ${items.length - 5} ocorrência(s)`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('⚠️  AÇÃO NECESSÁRIA: Substitua tipos "any" por tipos específicos\n');
  console.log('💡 Dicas:');
  console.log('   - Use tipos específicos sempre que possível');
  console.log('   - Para objetos, defina interfaces ou types');
  console.log('   - Para funções genéricas, use generics (<T>)');
  console.log('   - Use "unknown" se o tipo for realmente desconhecido');
  console.log('   - Priorize arquivos com mais ocorrências (listados primeiro)');

  // Mostrar top 3 arquivos
  console.log('\n🎯 Top 3 arquivos para refatorar:');
  sortedFiles.slice(0, 3).forEach(([file, items], index) => {
    console.log(`   ${index + 1}. ${file} - ${items.length} ocorrência${items.length > 1 ? 's' : ''}`);
  });

  process.exit(1);
}
