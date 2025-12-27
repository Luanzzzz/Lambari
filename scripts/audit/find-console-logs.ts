import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface LogResult {
  file: string;
  line: number;
  content: string;
}

function findConsoleLogs(dir: string, results: LogResult[] = []): LogResult[] {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist') && file !== 'scripts') {
      findConsoleLogs(filePath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Encontrar console.log, console.debug (mas não console.error, console.warn)
        if ((line.includes('console.log') || line.includes('console.debug')) &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('*')) {
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

console.log('🔍 AUDITORIA: Buscando console.log/debug no código\n');
console.log('='.repeat(70));

const results = findConsoleLogs('./src');
const resultsByFile = results.reduce((acc, item) => {
  const file = item.file;
  if (!acc[file]) acc[file] = [];
  acc[file].push(item);
  return acc;
}, {} as Record<string, LogResult[]>);

if (results.length === 0) {
  console.log('✅ Nenhum console.log/debug encontrado no código!\n');
  console.log('🎉 Código limpo e pronto para produção');
  process.exit(0);
} else {
  console.log(`📊 Encontrados ${results.length} console.log/debug em ${Object.keys(resultsByFile).length} arquivo(s):\n`);

  Object.entries(resultsByFile).forEach(([file, items]) => {
    console.log(`\n📄 ${file} (${items.length} ocorrência${items.length > 1 ? 's' : ''})`);
    items.forEach(({ line, content }) => {
      console.log(`   Linha ${line}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`);
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log('⚠️  AÇÃO NECESSÁRIA: Remova console.logs desnecessários\n');
  console.log('💡 Dicas:');
  console.log('   - Remova logs de desenvolvimento/debug');
  console.log('   - Mantenha apenas console.error() e console.warn() para erros críticos');
  console.log('   - Use ferramentas de logging apropriadas em produção');

  process.exit(1);
}
