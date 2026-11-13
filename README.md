# ⚡ Prime Vitrine — Ecossistema Dual-Engine (Automação Mercado Livre + Fábrica de Sites Express IA)

Plataforma web full-stack de alta performance construída com **Next.js 16 (App Router + Turbopack)**, **TypeScript Strict**, **Prisma ORM**, **PostgreSQL (Docker / Supabase)** e **Google Gemini (`@google/genai` - `gemini-2.5-flash`)**, operando dois motores comerciais integrados no mesmo painel administrativo:

1. **Motor 1 — Hub de Automação Mercado Livre (Dropshipping / Loja Própria & Afiliados):** Autenticação OAuth 2.0 oficial, Calculadora Reversa de Lucro e Taxas em tempo real, Otimizador SEO de 60 caracteres + Descrição em Texto Puro com IA e Publicação 1-Clique via API oficial (`POST /items`).
2. **Motor 2 — Fábrica de Sites Express (Google Maps → Landing Page com IA):** Extração automática de negócios locais a partir do Google Maps, geração completa de Landing Pages de alta conversão por nicho com Gemini, renderizador dinâmico `/s/[slug]` e automação de prospecção via WhatsApp.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) + React 19 + Server Actions |
| **Linguagem** | TypeScript (Strict Mode · Zero `any`) |
| **Estilização & UI** | Tailwind CSS v4 + Glassmorphism + Paletas Dinâmicas por Nicho |
| **Animações** | Framer Motion |
| **Banco de Dados** | PostgreSQL 16 (`prime-vitrine-db` em Docker na porta `5433` / Supabase) |
| **ORM** | Prisma ORM v6 |
| **Inteligência Artificial** | Google Gemini SDK Oficial (`@google/genai` · modelo `gemini-2.5-flash`) |
| **Integrações** | API Oficial do Mercado Livre (OAuth 2.0 + `/items` + `/domain_discovery`) & Google Maps / Places |
| **Autenticação** | NextAuth.js v5 (Auth.js) |

---

## 🔥 Arquitetura Dual-Engine

### 🛒 Motor 1: Automação Mercado Livre & Precificação Reversa
- **OAuth 2.0 Oficial (`src/lib/services/ml-auth.ts`):**
  - Fluxo completo de conexão da conta oficial do vendedor (`/api/ml/auth` e `/api/ml/callback`).
  - Renovação automática de token (`getValidMlToken`) sempre que `expiresAt` estiver a menos de 10 minutos de expirar.
- **Calculadora Financeira Reversa (`src/lib/services/pricing.ts`):**
  - Calcula o preço final de venda (`finalSalePrice`) para garantir exatamente a margem de lucro desejada sobre o custo (`costPrice`), descontando a comissão do Mercado Livre (`14%` Clássico `gold_special` ou `19%` Premium `gold_pro`) e a taxa fixa de `R$ 6,00` para itens abaixo de `R$ 79,00`.
  - Exibe em tempo real no painel: Preço Final no ML, Total de Taxas ML, Lucro Líquido Real (`R$`) e `ROI (%)`.
- **SEO para Algoritmo do ML com Gemini (`src/lib/services/ai.ts`):**
  - Gera `optimizedMlTitle` com limite estrito de **60 caracteres** no formato `[Produto] [Marca/Modelo] [Atributo Principal]`, removendo termos proibidos pelo ML.
  - Gera `plainDescription` estruturada em **texto puro** (`\n` e marcadores `•`), pronta para a API oficial do Mercado Livre.
- **Publicação Direta 1-Clique (`src/lib/services/mercadolivre.ts`):**
  - Predição automática de categoria (`GET /sites/MLB/domain_discovery/search`).
  - Criação do anúncio (`POST /items`) + envio da descrição (`POST /items/${id}/description`) diretamente pelo Dashboard (`/dashboard/inventory/new` e `/dashboard/inventory`).

---

### 🌐 Motor 2: Fábrica de Sites Express (Google Maps → Landing Page IA)
- **Extrator Inteligente do Google Maps (`src/lib/services/maps-extractor.ts`):**
  - Recebe a URL do Google Maps (ou dados básicos do estabelecimento) e extrai Nome do Negócio, Categoria/Nicho, Endereço, Cidade, Nota (`rating`), Total de Avaliações e WhatsApp.
  - Suporta enriquecimento via OpenGraph e Google Places API com fallback semântico automático.
- **Gerador de Landing Page por Nicho com Gemini (`src/lib/services/site-generator-ai.ts`):**
  - Cria `heroTitle`, `heroSubtitle`, `aboutText` (2 a 3 parágrafos de autoridade local), 6 `services` com ícones e faixas de preço, 4 `benefits`, 3 `testimonials` estilo Google Reviews e 4 `faq`.
  - Define automaticamente a paleta ideal (`amber`, `blue`, `rose`, `emerald`, `violet`, `slate`) e fotos em alta resolução curadas por nicho (Barbearia, Clínica, Restaurante, Oficina, Estética, Fitness, Advocacia e Comércio Geral).
- **Gestão e Prospecção via WhatsApp (`/dashboard/sites` e `/dashboard/sites/new`):**
  - Geração em segundos a partir do link do Maps, contador de visualizações (`viewsCount`) e botão `"📲 Enviar Proposta no WhatsApp"` com pitch comercial pronto contendo o link da demonstração.
- **Renderizador Público de Alta Conversão (`/s/[slug]`):**
  - Landing Page responsiva completa com SEO dinâmico (`generateMetadata`), Header fixo Glassmorphism, Hero com imagem do nicho, Barra de Diferenciais, Grid de 6 Serviços, Sobre Nós + Galeria, Avaliações 5 Estrelas, FAQ, Rodapé com rota para o Maps e botão flutuante de WhatsApp.

---

## 🗂️ Estrutura Principal do Projeto

```text
├── docker-compose.yml                  # Container PostgreSQL 16 dedicado (porta 5433)
├── prisma/
│   ├── schema.prisma                   # Modelos: User, Product, MercadoLivreAccount, GeneratedSite, etc.
│   ├── seed.ts                         # Seed de produtos iniciais
│   └── seed-admin.ts                   # Seed do usuário Admin (admin@luxe.com / admin123)
└── src/
    ├── app/
    │   ├── api/ml/auth/route.ts        # Início do fluxo OAuth 2.0 Mercado Livre
    │   ├── api/ml/callback/route.ts    # Callback OAuth 2.0 Mercado Livre
    │   ├── dashboard/
    │   │   ├── page.tsx                # Hub Geral + Status da Loja ML + Métricas Financeiras
    │   │   ├── inventory/
    │   │   │   ├── page.tsx            # Inventário ML + Finanças + Publicação 1-Clique
    │   │   │   └── new/                # Estação de Importação + Calculadora Reversa + Publicador ML
    │   │   └── sites/
    │   │       ├── page.tsx            # Catálogo de Sites Gerados + Disparo de Proposta WhatsApp
    │   │       └── new/                # Gerador Google Maps -> Landing Page IA
    │   ├── p/[slug]/page.tsx           # Página de Produto na Vitrine
    │   ├── r/[slug]/route.ts           # Redirecionador com Rastreamento de Cliques
    │   └── s/[slug]/page.tsx           # Renderizador Público das Landing Pages Geradas
    └── lib/
        ├── actions/
        │   ├── product.ts              # Server Actions de Produtos e Publicação ML
        │   └── sites.ts                # Server Actions da Fábrica de Sites IA
        └── services/
            ├── ml-auth.ts              # Serviço OAuth 2.0 e Auto-Refresh de Token ML
            ├── pricing.ts              # Calculadora Reversa de Preço, Taxas e ROI no ML
            ├── ai.ts                   # Gemini AI para Produtos e SEO Mercado Livre
            ├── mercadolivre.ts         # Predição de Categoria e Publicação Oficial no ML
            ├── maps-extractor.ts       # Extrator de Dados do Google Maps
            └── site-generator-ai.ts    # Motor Gemini Gerador de Landing Pages Locais
```

---

## 🛠️ Como Executar Localmente

### 1. Subir o Banco de Dados PostgreSQL no Docker
```bash
docker compose up -d
```

### 2. Configurar Variáveis de Ambiente (`.env` e `.env.local`)
Os arquivos `.env` e `.env.local` são protegidos pelo `.gitignore`. Configure as chaves conforme o modelo:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/prime_vitrine"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/prime_vitrine"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-segura-32-chars"

# Google Gemini API Key (Ativa nos 2 Motores de IA)
GEMINI_API_KEY="sua-chave-do-google-ai-studio"

# Credenciais OAuth 2.0 Mercado Livre
ML_CLIENT_ID=""
ML_CLIENT_SECRET=""
ML_REDIRECT_URI="http://localhost:3000/api/ml/callback"
```

### 3. Sincronizar Schema, Popular Dados e Iniciar
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
npx tsx prisma/seed-admin.ts
npm run dev
```

- **Vitrine Pública:** `http://localhost:3000`
- **Painel Admin Dual-Engine:** `http://localhost:3000/dashboard` (`admin@luxe.com` / `admin123`)
- **Fábrica de Sites IA:** `http://localhost:3000/dashboard/sites/new`
