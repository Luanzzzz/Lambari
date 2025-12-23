# Lambari Kids - Sistema B2B de Moda Infantil

Sistema de gestão e vendas B2B para moda infantil, com catálogo de produtos, gestão de kits, controle de estoque e pedidos.

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL)
- **Roteamento**: React Router v6 (HashRouter)
- **Estado**: React Context API

## Funcionalidades

### Área Pública
- Catálogo de produtos com filtros (categoria, marca, preço)
- Visualização de kits promocionais
- Carrinho de compras
- Checkout simplificado

### Área Administrativa
- Gestão completa de Produtos (CRUD)
- Gestão de Marcas (CRUD)
- Gestão de Categorias (CRUD)
- Gestão de Kits (CRUD)
- Gestão de Vendedores (CRUD)
- Gestão de Banners (CRUD)
- Gestão de Pedidos (CRUD)
- Histórico de movimentações de estoque
- Dashboard com métricas

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git

### Passo 1: Clone o Repositório

```bash
git clone <url-do-repositorio>
cd Lambari
```

### Passo 2: Instale as Dependências

```bash
npm install
```

### Passo 3: Configure o Supabase

#### 3.1. Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha os dados:
   - **Name**: Lambari Kids (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Selecione a região mais próxima (ex: South America)
   - **Pricing Plan**: Free (gratuito)
5. Aguarde a criação do projeto (~2 minutos)

#### 3.2. Obtenha as Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie os valores:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

#### 3.3. Configure as Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o arquivo `.env.local` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://sua-url.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

   **IMPORTANTE**:
   - Nunca compartilhe essas credenciais
   - Nunca faça commit do arquivo `.env.local`
   - O arquivo já está listado no `.gitignore`

#### 3.4. Execute as Migrações do Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute os scripts **EM ORDEM**, um de cada vez:

   **Migração 1 - Schema Inicial**:
   - Abra o arquivo `supabase/migrations/001_initial_schema.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor e clique em **RUN**
   - Aguarde a confirmação "Success. No rows returned"

   **Migração 2 - RLS para Produtos, Marcas e Categorias**:
   - Abra o arquivo `supabase/migrations/002_allow_crud_products_brands_categories.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor e clique em **RUN**
   - Aguarde a confirmação

   **Migração 3 - RLS para Kits**:
   - Abra o arquivo `supabase/migrations/003_allow_crud_kits.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor e clique em **RUN**
   - Aguarde a confirmação

   **Migração 4 - RLS para Stock, Sellers, Orders e Banners**:
   - Abra o arquivo `supabase/migrations/004_allow_crud_stock_sellers_orders_banners.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor e clique em **RUN**
   - Aguarde a confirmação

3. **Verificação**: Vá em **Table Editor** no menu lateral. Você deve ver as tabelas:
   - products
   - brands
   - categories
   - kits
   - sellers
   - banners
   - orders
   - order_items
   - stock_movements

### Passo 4: Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Passo 5: Validação (Opcional)

Execute os testes para garantir que tudo está funcionando:

```bash
# Testar todos os módulos
npm run test:all

# Ou testar individualmente
npm run test:products
npm run test:brands
npm run test:categories
npm run test:kits
npm run test:sellers
npm run test:banners
npm run test:orders
```

Todos os testes devem passar ✅

## Estrutura do Projeto

```
Lambari/
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   │   ├── ui/           # Componentes de UI (Button, Modal, etc.)
│   │   ├── admin/        # Componentes da área administrativa
│   │   └── shop/         # Componentes da área pública
│   ├── contexts/         # React Context (ShopContext)
│   ├── pages/            # Páginas/rotas da aplicação
│   │   ├── admin/        # Páginas administrativas
│   │   └── shop/         # Páginas públicas
│   ├── services/         # Camada de API
│   │   ├── api.ts        # API principal (Supabase CRUD)
│   │   └── supabase.ts   # Cliente Supabase configurado
│   └── types/            # TypeScript type definitions
├── supabase/
│   └── migrations/       # Migrações SQL versionadas
├── scripts/              # Scripts de teste e utilidades
└── public/               # Arquivos estáticos

```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Build de produção
npm run preview         # Preview do build de produção

# Testes
npm run test:all        # Executa todos os testes
npm run test:products   # Testa CRUD de produtos
npm run test:brands     # Testa CRUD de marcas
npm run test:categories # Testa CRUD de categorias
npm run test:kits       # Testa CRUD de kits
npm run test:sellers    # Testa CRUD de vendedores
npm run test:banners    # Testa CRUD de banners
npm run test:orders     # Testa CRUD de pedidos

# Qualidade
npm run lint            # Verifica código com ESLint
```

## Acesso ao Sistema

### Área Pública (Catálogo)
- URL: `http://localhost:5173/`
- Livre acesso para visualizar produtos e fazer pedidos

### Área Administrativa
- URL: `http://localhost:5173/#/admin`
- **Acesso**: Atualmente sem autenticação (desenvolvimento)
- **IMPORTANTE**: Implementar autenticação antes de produção

## Deploy

### Vercel (Recomendado)

1. Faça commit do seu código no GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy automático!

### Build Manual

```bash
# Gerar build de produção
npm run build

# Os arquivos estarão em ./dist
# Faça upload para seu servidor de hospedagem
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas:

- **SELECT**: Apenas registros com `active = true` são públicos
- **INSERT/UPDATE/DELETE**: Temporariamente abertas para desenvolvimento

⚠️ **IMPORTANTE**: Antes de ir para produção:
1. Implemente autenticação de usuários (Supabase Auth)
2. Substitua as políticas temporárias (`WITH CHECK (true)`) por políticas baseadas em `auth.uid()`
3. Configure roles (admin, vendedor, etc.)

### Variáveis de Ambiente

- Nunca faça commit de `.env.local`
- Use `.env.example` como template
- Mantenha as chaves do Supabase em segredo

## Arquitetura

Para entender a arquitetura do projeto em detalhes, consulte:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Decisões arquiteturais e padrões
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças

## Banco de Dados

### Schema Principal

```sql
products         → Produtos do catálogo
brands           → Marcas dos produtos
categories       → Categorias de produtos
kits             → Kits promocionais
sellers          → Vendedores/representantes
banners          → Banners promocionais
orders           → Pedidos de clientes
order_items      → Itens dos pedidos (FK para orders)
stock_movements  → Histórico de movimentações de estoque
```

### Relacionamentos

- `products.brand_id` → `brands.id`
- `products.category_id` → `categories.id`
- `order_items.order_id` → `orders.id` (CASCADE delete)
- `order_items.product_id` → `products.id`
- `order_items.kit_id` → `kits.id`

## Roadmap

### Versão 1.1 (Próxima)
- [ ] Autenticação de usuários
- [ ] Permissões baseadas em roles
- [ ] Dashboard com métricas
- [ ] Exportação de relatórios

### Versão 1.2
- [ ] Integração WhatsApp Business API
- [ ] Geração de catálogos PDF
- [ ] Sistema de comissões
- [ ] Controle de pagamentos

### Versão 2.0
- [ ] App mobile (React Native)
- [ ] Integração com ERPs
- [ ] Sistema de fidelidade

## Suporte

Para dúvidas ou problemas:
1. Verifique a [documentação técnica](ARCHITECTURE.md)
2. Consulte o [changelog](CHANGELOG.md)
3. Abra uma issue no GitHub

## Licença

Proprietary - Todos os direitos reservados
