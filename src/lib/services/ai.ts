import { GoogleGenAI } from "@google/genai";

export interface AIEnrichmentResult {
  summary: string;
  pros: string[];
  cons: string[];
  aiSummary: string;
  aiPros: string[];
  aiCons: string[];
  optimizedMlTitle: string;
  plainDescription: string;
}

interface GeminiProductResponse {
  summary?: string;
  pros?: string[];
  cons?: string[];
  optimizedMlTitle?: string;
  plainDescription?: string;
}

const FORBIDDEN_ML_WORDS = [
  /\bpromo[cç][aã]o\b/gi,
  /\boferta\b/gi,
  /\bfrete\s+gr[aá]tis\b/gi,
  /\boriginal\b/gi,
];

/**
 * Sanitiza e limita o título estritamente a 60 caracteres para o Mercado Livre.
 */
export function sanitizeMlTitle(rawTitle: string): string {
  let cleaned = rawTitle;
  for (const regex of FORBIDDEN_ML_WORDS) {
    cleaned = cleaned.replace(regex, "");
  }

  cleaned = cleaned
    .replace(/[!@#$%^&*()+=[\]{};:"\\|<>/?~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 60) {
    return cleaned;
  }

  const sliced = cleaned.slice(0, 60);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > 40) {
    return sliced.slice(0, lastSpace).trim();
  }
  return sliced.trim();
}

/**
 * Gera uma descrição em texto puro estruturada (fallback ou sanitização de HTML/Markdown).
 */
function buildFallbackPlainDescription(
  title: string,
  rawDescription?: string
): string {
  const cleanOverview = (rawDescription || title)
    .replace(/<[^>]*>/g, "")
    .replace(/[*_#`~]/g, "")
    .trim();

  return [
    `APRESENTAÇÃO DO PRODUTO`,
    `${title}`,
    cleanOverview,
    ``,
    `PRINCIPAIS BENEFÍCIOS`,
    `• Produto selecionado com alto padrão de qualidade e durabilidade`,
    `• Excelente desempenho e praticidade para o uso no dia a dia`,
    `• Ótima relação custo-benefício com garantia de satisfação`,
    ``,
    `ESPECIFICAÇÕES TÉCNICAS`,
    `• Produto: ${title}`,
    `• Condição: Novo, lacrado e pronto para uso`,
    ``,
    `CONTEÚDO DA EMBALAGEM`,
    `• 01x ${title}`,
    `• Manual / Acessórios padrão do fabricante`,
    ``,
    `GARANTIA E ENVIO RÁPIDO`,
    `• Envio imediato com rastreamento completo pelo Mercado Livre`,
    `• Compra 100% protegida com garantia contra defeitos de fabricação`,
  ].join("\n");
}

function stripHtmlAndMarkdown(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`/g, "")
    .trim();
}

/**
 * Enriquecimento inteligente de produto usando Google Gemini
 * Gera resumo persuasivo, pontos fortes, pontos de atenção,
 * título SEO para Mercado Livre (máx. 60 chars) e descrição em texto puro.
 */
export async function enrichProductWithAI(
  title: string,
  rawDescription?: string
): Promise<AIEnrichmentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackTitle = sanitizeMlTitle(title);
  const fallbackPlain = buildFallbackPlainDescription(title, rawDescription);

  // Fallback caso a chave não esteja configurada ainda
  if (!apiKey) {
    const summary =
      rawDescription ||
      `${title} - Produto selecionado com excelente custo-benefício e envio rápido.`;
    const pros = [
      "Excelente custo-benefício",
      "Compra protegida pelo Mercado Livre",
      "Envio rápido e seguro",
    ];
    const cons = ["Estoque limitado sujeito a variação de preço"];

    return {
      summary,
      pros,
      cons,
      aiSummary: summary,
      aiPros: pros,
      aiCons: cons,
      optimizedMlTitle: fallbackTitle,
      plainDescription: fallbackPlain,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um especialista em SEO de e-commerce para o Mercado Livre e copywriting de alta conversão.
Analise as informações do produto abaixo e gere:
1. "summary": Um resumo curto e altamente persuasivo (máximo 2 a 3 frases) destacando os diferenciais.
2. "pros": 3 principais pontos fortes / vantagens (bullets curtos).
3. "cons": 1 ou 2 pontos de atenção / considerações sinceras para o comprador.
4. "optimizedMlTitle": Título otimizado para o algoritmo de busca do Mercado Livre com NO MÁXIMO 60 CARACTERES ESTRITOS, seguindo a estrutura "[Produto] [Marca/Modelo] [Atributo Principal]". NÃO use palavras proibidas como "promoção", "oferta", "frete grátis" ou "original".
5. "plainDescription": Copy de vendas completa, persuasiva e estruturada ESTRITAMENTE EM TEXTO PURO (sem tags HTML, sem negrito Markdown **, sem #, usando apenas quebras de linha \\n e marcadores simples como • ou -), contendo as seções:
   - APRESENTAÇÃO DE IMPACTO
   - PRINCIPAIS BENEFÍCIOS
   - ESPECIFICAÇÕES TÉCNICAS
   - CONTEÚDO DA EMBALAGEM
   - GARANTIA E ENVIO RÁPIDO

Produto: ${title}
Descrição original: ${rawDescription || "Sem descrição detalhada"}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "summary": "texto do resumo persuasivo",
  "pros": ["ponto positivo 1", "ponto positivo 2", "ponto positivo 3"],
  "cons": ["ponto de atenção 1"],
  "optimizedMlTitle": "Título SEO até 60 chars",
  "plainDescription": "Texto puro separado por quebras de linha"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim() || "";
    const parsed = JSON.parse(responseText) as GeminiProductResponse;

    const summary = parsed.summary || rawDescription || title;
    const pros =
      Array.isArray(parsed.pros) && parsed.pros.length > 0
        ? parsed.pros
        : ["Alta qualidade", "Entrega garantida"];
    const cons =
      Array.isArray(parsed.cons) && parsed.cons.length > 0
        ? parsed.cons
        : ["Estoque sujeito a disponibilidade"];
    const optimizedMlTitle = sanitizeMlTitle(
      parsed.optimizedMlTitle || title
    );
    const plainDescription = parsed.plainDescription
      ? stripHtmlAndMarkdown(parsed.plainDescription)
      : fallbackPlain;

    return {
      summary,
      pros,
      cons,
      aiSummary: summary,
      aiPros: pros,
      aiCons: cons,
      optimizedMlTitle,
      plainDescription,
    };
  } catch (error) {
    console.error("Erro ao enriquecer produto com Gemini:", error);
    const summary =
      rawDescription || `${title} com as melhores condições no Mercado Livre.`;
    const pros = ["Produto bem avaliado", "Garantia de entrega"];
    const cons = ["Preço promocional por tempo limitado"];

    return {
      summary,
      pros,
      cons,
      aiSummary: summary,
      aiPros: pros,
      aiCons: cons,
      optimizedMlTitle: fallbackTitle,
      plainDescription: fallbackPlain,
    };
  }
}
