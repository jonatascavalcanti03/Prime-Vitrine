# ⚡ Prime Vitrine — Plataforma de Afiliados Automatizada (Mercado Livre)

Plataforma web full-stack de alta performance focada em social commerce e marketing de afiliados, especializada em curar, enriquecer com IA e divulgar ofertas do **Mercado Livre** com rastreamento próprio de conversão.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) + React 19 |
| **Linguagem** | TypeScript (Strict Mode) |
| **Estilização** | Tailwind CSS v4 + Glassmorphism |
| **Animações** | Framer Motion (Efeito 3D Tilt nos cards) |
| **Banco de Dados** | PostgreSQL (Supabase / Docker) |
| **ORM** | Prisma ORM v6 |
| **Inteligência Artificial** | Google Gemini API (`@google/genai`) |
| **Autenticação** | NextAuth.js v5 (Painel Administrativo) |

---

## 💎 Funcionalidades Principais

### 1. Motor de Redirecionamento de Afiliados (`/r/[slug]`)
- Links limpos e amigáveis para SEO.
- Contagem automática de cliques por produto e histórico no `ClickAnalytics`.
- Redirecionamento seguro (HTTP 302) com a sua tag oficial de afiliado do Mercado Livre.

### 2. Importador Inteligente com IA
- Cole qualquer link do Mercado Livre em `/dashboard/inventory/new`.
- Extração automática de título, fotos em alta resolução e preço.
- O Google Gemini gera instantaneamente:
  - Resumo persuasivo de alta conversão.
  - Bullets com os principais pontos fortes do produto.
  - Recomendações e pontos de atenção sinceros para o comprador.

### 3. Painel Administrativo de Desempenho
- Métricas em tempo real de cliques em links de afiliados.
- Ranking das 5 ofertas mais populares.
- Gestão completa de catálogo (ativar, pausar ou destacar ofertas na vitrine).

---

## 🛠️ Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/jonatascavalcanti03/Brech-de-Luxo.git
cd "Trabalho novo"
npm install
```

### 2. Configurar Variáveis de Ambiente (.env.local)
Copie o arquivo `.env.example` para `.env.local` e configure sua conexão:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/brecho_afiliados"
DIRECT_URL="postgresql://postgres:postgres@localhost:54322/brecho_afiliados"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-de-32-caracteres"

# Opcional (para geração automática com IA)
GEMINI_API_KEY="sua-chave-do-google-ai-studio"

# Sua tag de afiliado do Mercado Livre
MERCADO_LIVRE_AFFILIATE_TAG="sua-tag"
```

### 3. Sincronizar o Banco e Iniciar
```bash
npx prisma db push
npx tsx prisma/seed.ts
npx tsx prisma/seed-admin.ts
npm run dev
```

Acesse:
- **Site:** `http://localhost:3000`
- **Painel Admin:** `http://localhost:3000/dashboard` (admin@luxe.com / admin123)
