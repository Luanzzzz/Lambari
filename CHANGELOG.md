# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2025-12-23

### Migração Completa para Supabase (PostgreSQL)

Esta é a primeira versão de produção do sistema, marcando a **migração completa de LocalStorage para Supabase**.

### Added (Adicionado)

#### Banco de Dados
- Migração SQL `001_initial_schema.sql`: Schema inicial com todas as tabelas
- Migração SQL `002_allow_crud_products_brands_categories.sql`: RLS para produtos, marcas e categorias
- Migração SQL `003_allow_crud_kits.sql`: RLS para kits
- Migração SQL `004_allow_crud_stock_sellers_orders_banners.sql`: RLS para stock, sellers, orders e banners
- Tabelas: `products`, `brands`, `categories`, `kits`, `sellers`, `banners`, `orders`, `order_items`, `stock_movements`
- Row Level Security (RLS) em todas as tabelas
- Relacionamentos com Foreign Keys e CASCADE deletes
- CHECK constraints para integridade de dados (ex: order_items deve ter product_id OU kit_id)

#### API Layer (services/api.ts)
- Transformers para conversão snake_case ↔ camelCase para todas as entidades
- CRUD completo para Products (getProducts, createProduct, updateProduct, deleteProduct)
- CRUD completo para Brands (getBrands, createBrand, updateBrand, deleteBrand)
- CRUD completo para Categories (getCategories, createCategory, updateCategory, deleteCategory)
- CRUD completo para Kits (getKits, createKit, **updateKit**, **deleteKit**)
- CRUD completo para Sellers (getSellers, createSeller, updateSeller, deleteSeller)
- CRUD completo para Banners (getBanners, createBanner, updateBanner, deleteBanner)
- CRUD completo para Orders (getOrders, createOrder, updateOrder, deleteOrder)
- Stock History (getStockHistory, createStockMovement)
- Atualização automática de stock com log de movimentações (updateProductStock)
- Mapeamento de status para Orders (pending_whatsapp ↔ confirmed, shipped ↔ in_transit, etc.)
- Geração automática de order_number (formato: LMB-YYYY-XXXXX)
- Suporte a relacionamentos complexos (orders com order_items via JOIN)

#### Testes
- Script de teste `scripts/test-products.ts`
- Script de teste `scripts/test-brands.ts`
- Script de teste `scripts/test-categories.ts`
- Script de teste `scripts/test-kits.ts` (incluindo UPDATE e DELETE)
- Script de teste `scripts/test-sellers.ts`
- Script de teste `scripts/test-banners.ts`
- Script de teste `scripts/test-orders.ts` (com criação de produtos para satisfazer FK constraints)
- Comando `npm run test:all` para executar todos os testes sequencialmente

#### Documentação
- Atualização do ARCHITECTURE.md com seção detalhada sobre Supabase
- Criação do CHANGELOG.md com histórico completo de versões
- Atualização do README.md com instruções de setup do Supabase
- Documentação de todas as migrações SQL
- Documentação de transformers e padrões de API

### Changed (Modificado)

#### Persistência de Dados
- **ANTES**: LocalStorage (dados locais no navegador, ~5MB limite)
- **DEPOIS**: Supabase PostgreSQL (dados centralizados, escalável, multi-dispositivo)

#### services/api.ts
- Removida toda lógica de LocalStorage
- Removidas funções de inicialização de dados mock em LocalStorage
- Substituídas todas as operações síncronas por operações assíncronas com Supabase
- Adicionado tratamento de erros para operações de banco de dados
- Implementado delay artificial (300ms) para melhor UX

#### package.json
- Adicionados scripts de teste para todas as entidades
- Adicionado script `test:all` para validação completa

### Fixed (Corrigido)

#### Kits
- Adicionadas funções `updateKit()` e `deleteKit()` que estavam faltando
- Agora Kits possuem CRUD completo como todas as outras entidades

#### Orders
- Corrigido erro de constraint violation em order_items
- Adicionado suporte a productIds para satisfazer CHECK constraint (product_id OR kit_id)
- Implementado mapeamento correto de status entre DB e TypeScript
- Corrigido JOIN query para buscar orders com seus order_items

#### Stock Movements
- Migrado log de movimentações de LocalStorage para tabela stock_movements
- Integrado com updateProductStock para logging automático

### Removed (Removido)

#### LocalStorage
- Removida toda dependência de LocalStorage
- Removidas constantes STORAGE_KEYS
- Removidas funções de inicialização de dados mock
- Removidos comentários sobre "migração futura para Supabase" (migração concluída!)

### Security (Segurança)

#### Row Level Security (RLS)
- Políticas SELECT: Apenas registros ativos (`active = true`) são públicos
- Políticas INSERT/UPDATE/DELETE: Temporariamente abertas (`WITH CHECK (true)`) para desenvolvimento
- **IMPORTANTE**: RLS temporário deve ser substituído por autenticação real em produção

#### Variáveis de Ambiente
- VITE_SUPABASE_URL protegida em .env.local
- VITE_SUPABASE_ANON_KEY protegida em .env.local
- .env.local adicionado ao .gitignore

### Testing (Testes)

Todos os testes executados com sucesso:
```
✅ npm run test:products  - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:brands    - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:categories - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:kits      - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:sellers   - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:banners   - PASSOU (GET, CREATE, UPDATE, DELETE)
✅ npm run test:orders    - PASSOU (GET, CREATE, UPDATE, DELETE com order_items)
✅ npm run test:all       - PASSOU (todos os testes acima)
```

### Technical Debt (Débito Técnico)

Para versões futuras:
- [ ] Implementar autenticação real com Supabase Auth
- [ ] Substituir políticas RLS temporárias por autenticação de verdade
- [ ] Adicionar rate limiting nas APIs
- [ ] Configurar backups automáticos
- [ ] Adicionar monitoramento e logging
- [ ] Implementar cache para reduzir chamadas ao banco
- [ ] Adicionar validação de dados mais robusta
- [ ] Implementar paginação para listagens grandes
- [ ] Adicionar testes de integração automatizados
- [ ] Configurar CI/CD para testes automáticos

### Breaking Changes (Mudanças Incompatíveis)

⚠️ **ATENÇÃO**: Esta versão é **INCOMPATÍVEL** com dados salvos em LocalStorage.

Se você estava usando uma versão anterior com LocalStorage:
1. Exporte seus dados antes de atualizar
2. Execute as migrações SQL do Supabase
3. Importe os dados manualmente ou use os scripts de teste para popular o banco

### Migration Guide (Guia de Migração)

#### De LocalStorage para Supabase:

1. **Configure o Supabase**:
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env.local

   # Adicione suas credenciais
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

2. **Execute as Migrações**:
   - Acesse o Supabase Dashboard → SQL Editor
   - Execute em ordem:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_allow_crud_products_brands_categories.sql`
     - `supabase/migrations/003_allow_crud_kits.sql`
     - `supabase/migrations/004_allow_crud_stock_sellers_orders_banners.sql`

3. **Valide a Instalação**:
   ```bash
   npm install
   npm run test:all
   ```

4. **Pronto!** Todos os dados agora estão no Supabase.

---

## [0.9.0] - 2025-12-22

### Versão Anterior (LocalStorage)

Esta versão utilizava LocalStorage para persistência de dados.

### Features
- Gestão de Produtos (CRUD completo)
- Gestão de Marcas (CRUD completo)
- Gestão de Categorias (CRUD completo)
- Gestão de Kits (GET e CREATE apenas)
- Histórico de Stock (somente leitura)
- Interface administrativa completa
- Catálogo de produtos responsivo

### Limitações
- Dados locais ao navegador (sem sincronização)
- Limite de ~5-10MB
- Sem autenticação real
- Sem backup automático
- Kits sem UPDATE/DELETE

---

## Roadmap

### [1.1.0] - Planejado
- [ ] Autenticação de usuários (login/logout)
- [ ] Permissões baseadas em roles (admin, vendedor, etc.)
- [ ] Dashboard com métricas e gráficos
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Notificações em tempo real

### [1.2.0] - Planejado
- [ ] Integração com WhatsApp Business API
- [ ] Geração automática de catálogos PDF
- [ ] Sistema de comissões para vendedores
- [ ] Controle de pagamentos

### [2.0.0] - Futuro
- [ ] App mobile (React Native)
- [ ] Integração com ERPs
- [ ] Sistema de fidelidade
- [ ] Marketplace multi-loja

---

**Legenda**:
- `Added` - Novos recursos
- `Changed` - Alterações em funcionalidades existentes
- `Deprecated` - Recursos que serão removidos em breve
- `Removed` - Recursos removidos
- `Fixed` - Correções de bugs
- `Security` - Correções de vulnerabilidades
