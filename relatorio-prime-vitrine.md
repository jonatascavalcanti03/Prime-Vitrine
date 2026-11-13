# 📊 Relatório Executivo & Arquitetural — Prime Vitrine (Dual-Engine)

> **Repositório Oficial:** [github.com/jonatascavalcanti03/Prime-Vitrine](https://github.com/jonatascavalcanti03/Prime-Vitrine)
> **Stack:** Next.js 16 (App Router + Turbopack) · TypeScript Strict · Prisma ORM · PostgreSQL 16 (Docker `5433`) · Google Gemini (`@google/genai`) · Tailwind CSS
> **Status:** 100% Concluído e Validado (`npx tsc --noEmit` → 0 erros)

---

## 🎯 Visão Geral da Evolução

O projeto **Prime Vitrine** evoluiu de uma vitrine de afiliados para uma plataforma **Dual-Engine de Automação e Monetização com IA**:

1. **Motor 1 — Automação Mercado Livre (Dropshipping / Loja Própria):**
   Importa produtos de fornecedores, calcula automaticamente o preço de venda ideal descontando taxas do Mercado Livre para garantir a margem de lucro líquida desejada, otimiza o título SEO (máx. 60 caracteres) e a descrição em texto puro com Google Gemini (`gemini-2.5-flash`), e publica o anúncio com 1 clique via API oficial (`POST /items`).
2. **Motor 2 — Fábrica de Sites Express (Google Maps → Landing Page com IA):**
   Transforma qualquer link ou negócio do Google Maps em uma Landing Page profissional de alta conversão em segundos, adaptada ao nicho do cliente (Barbearia, Clínica, Oficina, Restaurante, Estética, etc.), com link público `/s/[slug]` e botão de disparo de proposta comercial pronta para o WhatsApp.

---

## ✅ Entregas Concluídas por Passo

### Passo 1 — Banco Dedicado, Schema e OAuth 2.0 Mercado Livre
- **Docker Compose Dedicado (`docker-compose.yml`):** Container `prime-vitrine-db` (`postgres:16-alpine`) isolado na porta `5433`.
- **Modelo `MercadoLivreAccount` (`prisma/schema.prisma`):** Armazena `mlUserId`, `nickname`, `accessToken`, `refreshToken` e `expiresAt`.
- **Expansão do Modelo `Product`:** Adicionados `costPrice`, `profitMargin`, `mlFeePercent`, `mlItemId`, `mlPermalink`, `plainDescription`, `listingType`, `mlCategoryId`, `syncStatus` e `stock`.
- **Serviço OAuth 2.0 (`src/lib/services/ml-auth.ts`):** Geração de URL de autorização, troca de `code` por tokens e auto-refresh transparente (`getValidMlToken`) quando faltam menos de 10 minutos para expirar.
- **Rotas OAuth (`/api/ml/auth` e `/api/ml/callback`):** Redirecionamento autenticado com retorno para `/dashboard?ml=connected`.

### Passo 2 — Calculadora Reversa, IA para Mercado Livre e Publicador Oficial
- **Calculadora Financeira (`src/lib/services/pricing.ts`):**
  - Calcula `finalSalePrice`, `mlFeePercent` (`14%` Clássico / `19%` Premium), `mlFeeAmount`, `fixedFeeAmount` (`R$ 6,00` abaixo de `R$ 79,00`), `netProfit` e `roiPercent`.
- **Expansão do Serviço de IA (`src/lib/services/ai.ts`):**
  - Conectado ao `@google/genai` (`gemini-2.5-flash`) com `GEMINI_API_KEY` configurada.
  - Gera `optimizedMlTitle` (estritamente `<= 60` caracteres e sem termos banidos pelo algoritmo do ML) e `plainDescription` em texto puro estruturado.
- **Publicador de Anúncios (`src/lib/services/mercadolivre.ts`):**
  - `predictMlCategory(title)` via `GET /sites/MLB/domain_discovery/search`.
  - `publishProductToMl(productId, userId)` via `POST /items` e `POST /items/${id}/description`.

### Passo 3 — Dashboard ML, Calculadora Ao Vivo e Publicação 1-Clique
- **Painel Principal (`/dashboard`):** Banner de conexão da conta oficial do Mercado Livre + métricas de produtos, anúncios publicados no ML, lucro líquido médio por venda e cliques.
- **Estação de Cadastro (`/dashboard/inventory/new`):** Importação automática do fornecedor preenchendo custo, título SEO com contador `XX/60` e calculadora interativa em tempo real + botões `"💾 Salvar apenas como Rascunho"` e `"🚀 Salvar e Publicar na Minha Loja ML"`.
- **Inventário (`/dashboard/inventory`):** Badges `PUBLISHED`, `DRAFT` e `ERROR`, resumo financeiro (Custo / Venda / Lucro Líquido) e botão rápido `"Publicar no ML"`.

### Passo 4 — Schema `GeneratedSite`, Extrator do Google Maps e Motor IA de Sites
- **Modelo `GeneratedSite` (`prisma/schema.prisma`):** Armazena dados comerciais, avaliações do Google, textos persuasivos, seções em JSON (`servicesJson`, `benefitsJson`, `testimonialsJson`, `faqJson`, `galleryJson`), `themePalette` e `viewsCount`.
- **Extrator do Google Maps (`src/lib/services/maps-extractor.ts`):** Faz parse inteligente de URLs do Google Maps, OpenGraph e Google Places API opcional, inferindo categoria e formatando WhatsApp.
- **Gerador de Landing Page com Gemini (`src/lib/services/site-generator-ai.ts`):** Usa `@google/genai` (`gemini-2.5-flash`) para gerar headline local, subtítulo, história da empresa, 6 serviços com ícones e preços, 4 benefícios, 3 depoimentos, 4 FAQs, paleta temática e fotos curadas por nicho.

### Passo 5 — UI da Fábrica de Sites no Dashboard + Renderizador Público `/s/[slug]`
- **Menu Lateral Dual-Engine (`src/app/dashboard/layout.tsx`):** Divisão clara entre **Módulo Mercado Livre** e **Módulo Fábrica de Sites IA**.
- **Catálogo de Sites Gerados (`/dashboard/sites`):** Cards com visualizações, paleta, status e botões `"🌐 Abrir Site Público"`, `"📲 Enviar Proposta no WhatsApp"` e `"🗑️ Excluir"`.
- **Criador de Sites pelo Maps (`/dashboard/sites/new`):** Geração em 1 clique com preview imediato.
- **Landing Page Pública (`/s/[slug]`):** Renderizador dinâmico completo com SEO (`generateMetadata`), paletas adaptativas (`amber`, `blue`, `rose`, `emerald`, `violet`, `slate`), todas as 8 seções de conversão e botão flutuante de WhatsApp.

---

## 🔐 Segurança e Variáveis de Ambiente

- A chave `GEMINI_API_KEY` está configurada em `.env` e `.env.local` para uso imediato pelos dois motores (`src/lib/services/ai.ts` e `src/lib/services/site-generator-ai.ts`).
- Os arquivos `.env*` estão protegidos no `.gitignore` para garantir que nenhuma chave sensível seja exposta no repositório público.
