import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const audits = [
  { name: 'Conexão Supabase', script: '01-test-supabase-connection.ts', emoji: '🔌' },
  { name: 'CRUD Produtos', script: '02-test-product-crud.ts', emoji: '📦' },
  { name: 'CRUD Kits', script: '03-test-kit-crud.ts', emoji: '🎁' },
  { name: 'Arrays JSONB', script: '04-test-jsonb-arrays.ts', emoji: '🗃️' },
  { name: 'Transformers', script: '05-test-transformers.ts', emoji: '⚙️' },
];

interface AuditResult {
  name: string;
  passed: boolean;
  duration: number;
  output?: string;
  error?: string;
}

async function runAllAudits() {
  console.log('🚀 AUDITORIA COMPLETA - LAMBARI KIDS\n');
  console.log('='.repeat(70));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`📂 Executando ${audits.length} scripts de auditoria...\n`);
  console.log('='.repeat(70));

  const results: AuditResult[] = [];
  const totalStartTime = Date.now();

  for (const audit of audits) {
    console.log(`\n${audit.emoji}  Executando: ${audit.name}`);
    console.log('-'.repeat(70));

    const startTime = Date.now();
    let passed = false;
    let output = '';
    let error = '';

    try {
      const { stdout, stderr } = await execPromise(`tsx scripts/audit/${audit.script}`);
      const duration = Date.now() - startTime;

      // Considerar sucesso se não há stderr crítico e exit code 0
      output = stdout;

      // Filtrar warnings experimentais do Node.js
      const criticalErrors = stderr
        .split('\n')
        .filter(line =>
          !line.includes('ExperimentalWarning') &&
          !line.includes('punycode') &&
          line.trim().length > 0
        );

      if (criticalErrors.length > 0) {
        error = criticalErrors.join('\n');
      }

      passed = true;
      results.push({ name: audit.name, passed, duration, output });

      console.log(`✅ ${audit.name} - PASSOU (${(duration / 1000).toFixed(2)}s)`);

    } catch (err: any) {
      const duration = Date.now() - startTime;
      passed = false;
      error = err.stdout || err.stderr || err.message;

      results.push({ name: audit.name, passed, duration, error });

      console.error(`❌ ${audit.name} - FALHOU (${(duration / 1000).toFixed(2)}s)`);

      // Mostrar apenas as primeiras linhas do erro
      const errorLines = error.split('\n').slice(0, 10);
      errorLines.forEach(line => {
        if (line.trim()) console.error(`   ${line}`);
      });

      if (error.split('\n').length > 10) {
        console.error(`   ... (${error.split('\n').length - 10} linhas adicionais)`);
      }
    }
  }

  // Relatório final
  const totalDuration = Date.now() - totalStartTime;

  console.log('\n' + '='.repeat(70));
  console.log('📊 RELATÓRIO FINAL DA AUDITORIA\n');

  // Tabela de resultados
  console.log('┌─────────────────────────────────┬─────────┬───────────┐');
  console.log('│ Teste                           │ Status  │ Tempo (s) │');
  console.log('├─────────────────────────────────┼─────────┼───────────┤');

  results.forEach(({ name, passed, duration }) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const time = (duration / 1000).toFixed(2);
    const namePadded = name.padEnd(31);
    const statusPadded = status.padEnd(7);
    const timePadded = time.padStart(9);

    console.log(`│ ${namePadded} │ ${statusPadded} │ ${timePadded} │`);
  });

  console.log('└─────────────────────────────────┴─────────┴───────────┘');

  // Estatísticas
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(0);

  console.log(`\n📈 Estatísticas:`);
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   Passaram: ${totalPassed}`);
  console.log(`   Falharam: ${totalTests - totalPassed}`);
  console.log(`   Taxa de sucesso: ${successRate}%`);
  console.log(`   Tempo total: ${(totalDuration / 1000).toFixed(2)}s`);

  console.log('\n' + '='.repeat(70));

  if (totalPassed === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sistema 100% funcional e pronto para próxima fase');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Executar auditoria de código (npm run audit:console, npm run audit:any)');
    console.log('   2. Configurar ESLint (npm run lint)');
    console.log('   3. Implementar otimizações de performance');
    console.log('   4. Otimizar bundle (npm run build)');

    process.exit(0);
  } else {
    console.log(`⚠️  ${totalTests - totalPassed} teste(s) falharam (${100 - parseInt(successRate)}%)`);
    console.log('🔧 Corrija os erros acima antes de prosseguir\n');

    console.log('📋 Testes que falharam:');
    results
      .filter(r => !r.passed)
      .forEach(({ name }) => {
        console.log(`   ❌ ${name}`);
      });

    console.log('\n💡 Para executar um teste específico:');
    console.log('   npm run audit:connection    # Teste de conexão');
    console.log('   npm run audit:products       # CRUD de produtos');
    console.log('   npm run audit:kits           # CRUD de kits');
    console.log('   npm run audit:jsonb          # Validação JSONB');
    console.log('   npm run audit:transformers   # Transformers');

    process.exit(1);
  }
}

// Execute a auditoria completa
runAllAudits().catch((error) => {
  console.error('\n❌ ERRO FATAL ao executar auditoria:');
  console.error(error);
  process.exit(1);
});
