import { GoogleGenAI } from "@google/genai";

export interface AIEnrichmentResult {
  summary: string;
  pros: string[];
  cons: string[];
}

/**
 * Enriquecimento inteligente de produto usando Google Gemini
 * Gera resumo persuasivo, pontos fortes e recomendações de compra.
 */
export async function enrichProductWithAI(
  title: string,
  rawDescription?: string
): Promise<AIEnrichmentResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback caso a chave não esteja configurada ainda
  if (!apiKey) {
    return {
      summary: rawDescription || `${title} - Oferta selecionada com preço especial no Mercado Livre.`,
      pros: ["Excelente custo-benefício", "Compra protegida pelo Mercado Livre", "Envio rápido"],
      cons: ["Estoque limitado sujeito a variação de preço"],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um especialista em marketing de afiliados e reviews de produtos de alta conversão.
Analise as informações do produto abaixo e gere:
1. Um resumo curto e altamente persuasivo (máximo 2 a 3 frases) destacando os diferenciais.
2. 3 principais pontos fortes / vantagens (bullets curtos).
3. 1 ou 2 pontos de atenção / considerações sinceras para o comprador.

Produto: ${title}
Descrição original: ${rawDescription || "Sem descrição detalhada"}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "summary": "texto do resumo persuasivo",
  "pros": ["ponto positivo 1", "ponto positivo 2", "ponto positivo 3"],
  "cons": ["ponto de atenção 1"]
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
    const parsed = JSON.parse(responseText);

    return {
      summary: parsed.summary || rawDescription || title,
      pros: Array.isArray(parsed.pros) ? parsed.pros : ["Alta qualidade", "Entrega garantida"],
      cons: Array.isArray(parsed.cons) ? parsed.cons : ["Estoque sujeito a disponibilidade"],
    };
  } catch (error) {
    console.error("Erro ao enriquecer produto com Gemini:", error);
    return {
      summary: rawDescription || `${title} com as melhores condições no Mercado Livre.`,
      pros: ["Produto bem avaliado", "Garantia de entrega"],
      cons: ["Preço promocional por tempo limitado"],
    };
  }
}
