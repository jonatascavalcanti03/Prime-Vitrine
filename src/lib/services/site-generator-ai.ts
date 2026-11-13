import { GoogleGenAI } from "@google/genai";
import { type ExtractedBusinessData } from "@/lib/services/maps-extractor";

export type SiteThemePalette =
  | "emerald"
  | "amber"
  | "blue"
  | "rose"
  | "violet"
  | "slate";

export interface SiteServiceItem {
  title: string;
  description: string;
  icon: string;
  priceHint?: string;
}

export interface SiteBenefitItem {
  title: string;
  description: string;
  icon?: string;
}

export interface SiteTestimonialItem {
  author: string;
  text: string;
  rating: number;
}

export interface SiteFaqItem {
  question: string;
  answer: string;
}

export interface GeneratedSiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  services: SiteServiceItem[];
  benefits: SiteBenefitItem[];
  testimonials: SiteTestimonialItem[];
  faq: SiteFaqItem[];
  themePalette: SiteThemePalette;
  heroImageUrl: string;
  galleryUrls: string[];
}

interface NichePreset {
  palette: SiteThemePalette;
  heroImageUrl: string;
  galleryUrls: string[];
  services: SiteServiceItem[];
  faq: SiteFaqItem[];
}

const NICHE_PRESETS: Record<string, NichePreset> = {
  barbearia: {
    palette: "amber",
    heroImageUrl:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Corte Clássico & Degradê",
        description:
          "Acabamento preciso na navalha e tesoura personalizado para o formato do seu rosto.",
        icon: "Scissors",
        priceHint: "A partir de R$ 45",
      },
      {
        title: "Barba Terapia com Toalha Quente",
        description:
          "Modelagem completa de barba com óleos essenciais, vapor de ozônio e massagem facial.",
        icon: "Sparkles",
        priceHint: "A partir de R$ 40",
      },
      {
        title: "Combo Corte + Barba VIP",
        description:
          "O pacote completo de estilo masculino com bebida de cortesia e finalização premium.",
        icon: "Crown",
        priceHint: "A partir de R$ 75",
      },
      {
        title: "Sobrancelha & Acabamento",
        description:
          "Alinhamento discreto e natural para valorizar a expressão masculina.",
        icon: "Eye",
        priceHint: "A partir de R$ 20",
      },
      {
        title: "Selagem & Hidratação Capilar",
        description:
          "Tratamento profundo para controle de volume, brilho e saúde do couro cabeludo.",
        icon: "Droplets",
        priceHint: "A partir de R$ 80",
      },
      {
        title: "Dia do Noivo & Eventos",
        description:
          "Atendimento exclusivo com horário reservado para ocasiões especiais.",
        icon: "Star",
        priceHint: "Sob consulta",
      },
    ],
    faq: [
      {
        question: "Preciso agendar horário ou atendem por ordem de chegada?",
        answer:
          "Trabalhamos com agendamento rápido pelo WhatsApp para garantir zero fila de espera, mas também encaixamos clientes por ordem de chegada conforme disponibilidade.",
      },
      {
        question: "Quais formas de pagamento vocês aceitam?",
        answer:
          "Aceitamos PIX, cartões de crédito, débito e dinheiro.",
      },
      {
        question: "Vocês atendem público infantil?",
        answer:
          "Sim! Nossa equipe tem total paciência e cuidado para realizar cortes infantis com conforto.",
      },
      {
        question: "Tem estacionamento fácil no local?",
        answer:
          "Sim, contamos com fácil acesso e vagas próximas ao estabelecimento.",
      },
    ],
  },
  clinica: {
    palette: "blue",
    heroImageUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Avaliação & Check-up Digital",
        description:
          "Diagnóstico completo e detalhado com equipamentos de alta precisão.",
        icon: "Stethoscope",
        priceHint: "Agende sua avaliação",
      },
      {
        title: "Clareamento & Estética Dental",
        description:
          "Recupere o brilho e a harmonia do seu sorriso com técnicas seguras e indolores.",
        icon: "Sparkles",
        priceHint: "Condições especiais",
      },
      {
        title: "Implantes & Reabilitação Oral",
        description:
          "Recupere a segurança ao mastigar e sorrir com materiais importados de alta durabilidade.",
        icon: "ShieldCheck",
        priceHint: "Parcelamento facilitado",
      },
      {
        title: "Lentes de Contato & Facetas",
        description:
          "Transformação estética planejada digitalmente para um resultado natural.",
        icon: "Smile",
        priceHint: "Planejamento 3D",
      },
      {
        title: "Ortodontia & Alinhadores",
        description:
          "Aparelhos modernos e alinhadores transparentes para todas as idades.",
        icon: "Award",
        priceHint: "Planos mensais",
      },
      {
        title: "Prevenção & Limpeza Ultrassônica",
        description:
          "Profilaxia completa para manter gengivas e dentes sempre saudáveis.",
        icon: "HeartPulse",
        priceHint: "Atendimento rápido",
      },
    ],
    faq: [
      {
        question: "Como faço para agendar uma primeira avaliação?",
        answer:
          "Basta clicar no botão de WhatsApp nesta página. Nossa recepção responde rapidamente e encontra o melhor horário para você.",
      },
      {
        question: "Os tratamentos podem ser parcelados?",
        answer:
          "Sim, oferecemos condições facilitadas no cartão de crédito e planos personalizados conforme o seu tratamento.",
      },
      {
        question: "Vocês atendem urgências no mesmo dia?",
        answer:
          "Sim, reservamos horários diários na agenda para pronto atendimento de dor ou urgências.",
      },
      {
        question: "Quais protocolos de biossegurança são utilizados?",
        answer:
          "Seguimos rigorosamente todas as normas da ANVISA com esterilização em autoclave hospitalar.",
      },
    ],
  },
  restaurante: {
    palette: "amber",
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Pratos Principais da Casa",
        description:
          "Receitas autorais preparadas na hora com ingredientes frescos e selecionados.",
        icon: "Utensils",
        priceHint: "Menu completo",
      },
      {
        title: "Especialidades na Brasa & Forno",
        description:
          "Cortes suculentos e preparo artesanal com tempero inconfundível.",
        icon: "Flame",
        priceHint: "Sucesso de pedidos",
      },
      {
        title: "Opções Executivas & Almoço",
        description:
          "Refeições completas, saborosas e servidas com agilidade para o seu dia.",
        icon: "Clock",
        priceHint: "Ótimo custo-benefício",
      },
      {
        title: "Drinks, Sucos & Carta de Bebidas",
        description:
          "Bebidas geladas, sucos naturais e drinks preparados no capricho.",
        icon: "Wine",
        priceHint: "Happy Hour",
      },
      {
        title: "Sobremesas Artesanais",
        description:
          "Doces exclusivos feitos diariamente para fechar sua refeição com chave de ouro.",
        icon: "Cake",
        priceHint: "Feitas na casa",
      },
      {
        title: "Delivery Rápido & Retirada",
        description:
          "Peça pelo WhatsApp e receba quentinho em casa com embalagem térmica.",
        icon: "Truck",
        priceHint: "Peça pelo WhatsApp",
      },
    ],
    faq: [
      {
        question: "Vocês fazem entregas (Delivery) pelo WhatsApp?",
        answer:
          "Sim! Fazemos entregas rápidas na região e também preparamos pedidos para retirada no balcão.",
      },
      {
        question: "É necessário fazer reserva de mesa?",
        answer:
          "Para grupos maiores, aniversários ou finais de semana, recomendamos reservar mesa pelo nosso WhatsApp.",
      },
      {
        question: "Aceitam vale-refeição e PIX?",
        answer:
          "Sim, aceitamos PIX, cartões de débito/crédito e os principais cartões de benefícios.",
      },
      {
        question: "Há opções vegetarianas no cardápio?",
        answer:
          "Sim, contamos com opções leves, saladas e pratos sem carne preparados com todo cuidado.",
      },
    ],
  },
  oficina: {
    palette: "blue",
    heroImageUrl:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Revisão Preventiva Completa",
        description:
          "Check-up computadorizado de motor, freios, suspensão e fluidos para sua segurança.",
        icon: "Wrench",
        priceHint: "Orçamento transparente",
      },
      {
        title: "Injeção Eletrônica & Scanner",
        description:
          "Diagnóstico preciso de falhas eletrônicas com aparelhos de última geração.",
        icon: "Cpu",
        priceHint: "Diagnóstico rápido",
      },
      {
        title: "Sistema de Freios & Suspensão",
        description:
          "Troca de pastilhas, discos, amortecedores e alinhamento técnico.",
        icon: "Shield",
        priceHint: "Peças de 1ª linha",
      },
      {
        title: "Troca de Óleo & Filtros",
        description:
          "Lubrificantes homologados pelas montadoras para máxima vida útil do motor.",
        icon: "Droplet",
        priceHint: "Atendimento expresso",
      },
      {
        title: "Embreagem, Correias & Motor",
        description:
          "Manutenção mecânica especializada para carros nacionais e importados.",
        icon: "Settings",
        priceHint: "Garantia no serviço",
      },
      {
        title: "Higienização & Ar-Condicionado",
        description:
          "Manutenção e limpeza do sistema de climatização automotiva.",
        icon: "Wind",
        priceHint: "Conforto a bordo",
      },
    ],
    faq: [
      {
        question: "O orçamento tem algum custo?",
        answer:
          "Você pode solicitar uma prévia pelo WhatsApp e trazendo o veículo fazemos a avaliação transparente antes de executar qualquer serviço.",
      },
      {
        question: "Os serviços possuem garantia?",
        answer:
          "Sim! Todos os serviços e peças aplicadas contam com garantia total documentada.",
      },
      {
        question: "Trabalham com peças originais e homologadas?",
        answer:
          "Sim, utilizamos apenas marcas de primeira linha recomendadas pelas montadoras.",
      },
      {
        question: "Posso parcelar a manutenção no cartão?",
        answer:
          "Sim, parcelamos serviços e peças no cartão de crédito.",
      },
    ],
  },
  estetica: {
    palette: "rose",
    heroImageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Estética Facial & Limpeza de Pele",
        description:
          "Protocolos rejuvenescedores para uma pele radiante, hidratada e renovada.",
        icon: "Sparkles",
        priceHint: "Avaliação personalizada",
      },
      {
        title: "Cabelos: Corte, Mechas & Tratamentos",
        description:
          "Visagismo, coloração e cronograma capilar com produtos de linha profissional.",
        icon: "Scissors",
        priceHint: "Produtos importados",
      },
      {
        title: "Estética Corporal & Massagens",
        description:
          "Drenagem linfática, massagem relaxante e remodeladora para o seu bem-estar.",
        icon: "Heart",
        priceHint: "Pacotes especiais",
      },
      {
        title: "Design de Sobrancelhas & Cílios",
        description:
          "Realce o seu olhar com técnicas delicadas e duradouras.",
        icon: "Eye",
        priceHint: "Resultado natural",
      },
      {
        title: "Manicure & Pedicure Gel",
        description:
          "Cuidado impecável com biossegurança total e esmaltação de longa duração.",
        icon: "Star",
        priceHint: "Hora marcada",
      },
      {
        title: "Pacotes Especiais & Dia da Noiva",
        description:
          "Produção completa para eventos, formaturas e casamentos.",
        icon: "Crown",
        priceHint: "Atendimento VIP",
      },
    ],
    faq: [
      {
        question: "Como agendar meu horário?",
        answer:
          "Clique no botão de WhatsApp nesta página e escolha o melhor dia e horário com nossa equipe.",
      },
      {
        question: "Vocês oferecem pacotes com desconto?",
        answer:
          "Sim! Temos pacotes mensais e combos de procedimentos com valores diferenciados.",
      },
      {
        question: "Quais produtos são utilizados nos procedimentos?",
        answer:
          "Trabalhamos exclusivamente com dermocosméticos e linhas capilares de padrão profissional.",
      },
      {
        question: "Qual a antecedência ideal para desmarcar ou reagendar?",
        answer:
          "Pedimos apenas que nos avise pelo WhatsApp com até 24h de antecedência para reorganizarmos a agenda.",
      },
    ],
  },
  geral: {
    palette: "emerald",
    heroImageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
    ],
    services: [
      {
        title: "Atendimento Consultivo Especializado",
        description:
          "Analisamos sua necessidade com atenção aos detalhes para entregar a melhor solução.",
        icon: "CheckCircle2",
        priceHint: "Orçamento rápido",
      },
      {
        title: "Execução Premium com Garantia",
        description:
          "Processos padronizados e materiais de alta qualidade para máxima durabilidade.",
        icon: "ShieldCheck",
        priceHint: "Qualidade comprovada",
      },
      {
        title: "Agendamento Ágil via WhatsApp",
        description:
          "Sem burocracia: fale direto com nossa equipe e resolva tudo pelo celular.",
        icon: "MessageCircle",
        priceHint: "Resposta imediata",
      },
      {
        title: "Planos e Condições Sob Medida",
        description:
          "Opções flexíveis que cabem no seu orçamento com excelente custo-benefício.",
        icon: "CreditCard",
        priceHint: "Parcelamento disponível",
      },
      {
        title: "Suporte & Pós-Atendimento",
        description:
          "Acompanhamento próximo para garantir sua total satisfação com o resultado.",
        icon: "HeartHandshake",
        priceHint: "Suporte dedicado",
      },
      {
        title: "Atendimento Express / Urgências",
        description:
          "Prioridade para demandas urgentes na região com pontualidade rigorosa.",
        icon: "Zap",
        priceHint: "Consulte disponibilidade",
      },
    ],
    faq: [
      {
        question: "Como solicitar um orçamento ou agendamento?",
        answer:
          "Basta clicar no botão de WhatsApp em nossa página para falar diretamente com nosso especialista.",
      },
      {
        question: "Quais são as formas de pagamento aceitas?",
        answer:
          "Aceitamos PIX, cartões de crédito em até 12x, débito e transferência.",
      },
      {
        question: "Vocês oferecem garantia no atendimento?",
        answer:
          "Sim! Todos os nossos serviços e produtos contam com garantia e suporte pós-venda.",
      },
      {
        question: "Qual é o horário de atendimento?",
        answer:
          "Atendemos de segunda a sábado em horário comercial, com suporte ágil via WhatsApp.",
      },
    ],
  },
};

function selectNichePreset(category: string): NichePreset {
  const lower = category.toLowerCase();
  if (lower.includes("barbearia") || lower.includes("barber")) {
    return NICHE_PRESETS.barbearia;
  }
  if (
    lower.includes("odonto") ||
    lower.includes("clínica") ||
    lower.includes("clinica") ||
    lower.includes("dentista") ||
    lower.includes("médic")
  ) {
    return NICHE_PRESETS.clinica;
  }
  if (
    lower.includes("restaurante") ||
    lower.includes("gastronomia") ||
    lower.includes("pizzaria") ||
    lower.includes("hamburgueria") ||
    lower.includes("lanchonete") ||
    lower.includes("café")
  ) {
    return NICHE_PRESETS.restaurante;
  }
  if (
    lower.includes("oficina") ||
    lower.includes("mecânica") ||
    lower.includes("mecanica") ||
    lower.includes("auto")
  ) {
    return NICHE_PRESETS.oficina;
  }
  if (
    lower.includes("estética") ||
    lower.includes("estetica") ||
    lower.includes("beleza") ||
    lower.includes("salão") ||
    lower.includes("salao")
  ) {
    return NICHE_PRESETS.estetica;
  }
  if (lower.includes("advocacia") || lower.includes("consultoria")) {
    return {
      ...NICHE_PRESETS.geral,
      palette: "slate",
    };
  }
  if (lower.includes("academia") || lower.includes("fitness")) {
    return {
      ...NICHE_PRESETS.geral,
      palette: "violet",
      heroImageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    };
  }
  return NICHE_PRESETS.geral;
}

function buildDefaultBenefits(business: ExtractedBusinessData): SiteBenefitItem[] {
  return [
    {
      title: "Atendimento Ágil e Sem Filas",
      description: `Agendamento rápido pelo WhatsApp para você ser atendido com pontualidade em ${business.city}.`,
      icon: "Zap",
    },
    {
      title: "Profissionais Altamente Qualificados",
      description: `Equipe experiente em ${business.category.toLowerCase()} focada em entregar um resultado impecável.`,
      icon: "Award",
    },
    {
      title: "Localização de Fácil Acesso",
      description: `Ambiente confortável e bem localizado (${business.address}) pensando na sua comodidade.`,
      icon: "MapPin",
    },
    {
      title: "Satisfação Comprovada pelos Clientes",
      description: `Avaliação média de ${business.rating.toFixed(1)} estrelas com clientes reais satisfeitos na região.`,
      icon: "ShieldCheck",
    },
  ];
}

function buildDefaultTestimonials(
  business: ExtractedBusinessData
): SiteTestimonialItem[] {
  return [
    {
      author: "Carlos Eduardo M.",
      text: `Melhor experiência com ${business.category.toLowerCase()} em ${business.city}! Atendimento extremamente profissional no ${business.businessName}, recomendo de olhos fechados.`,
      rating: 5,
    },
    {
      author: "Fernanda Oliveira",
      text: `Ambiente impecável, equipe super atenciosa e preço justo. Agendei pelo WhatsApp e fui atendida no horário exato.`,
      rating: 5,
    },
    {
      author: "Rafael Nogueira",
      text: `Qualidade diferenciada! Já indiquei o ${business.businessName} para toda a minha família e amigos da região.`,
      rating: 5,
    },
  ];
}

interface GeminiSiteRawResponse {
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
  services?: SiteServiceItem[];
  benefits?: SiteBenefitItem[];
  testimonials?: SiteTestimonialItem[];
  faq?: SiteFaqItem[];
  themePalette?: string;
}

function normalizePalette(
  raw: string | undefined,
  fallback: SiteThemePalette
): SiteThemePalette {
  const valid: SiteThemePalette[] = [
    "emerald",
    "amber",
    "blue",
    "rose",
    "violet",
    "slate",
  ];
  if (raw && valid.includes(raw as SiteThemePalette)) {
    return raw as SiteThemePalette;
  }
  return fallback;
}

/**
 * Gera todo o conteúdo persuasivo de uma Landing Page local usando Google Gemini
 * com fallback rico por nicho caso a chave de API não esteja configurada.
 */
export async function generateLandingPageWithAI(
  business: ExtractedBusinessData
): Promise<GeneratedSiteContent> {
  const preset = selectNichePreset(business.category);
  const defaultBenefits = buildDefaultBenefits(business);
  const defaultTestimonials = buildDefaultTestimonials(business);

  const fallbackContent: GeneratedSiteContent = {
    heroTitle: `${business.businessName}: Referência em ${business.category} em ${business.city}`,
    heroSubtitle: `Experimente um atendimento de alto padrão com profissionais especialistas, ambiente moderno e agendamento imediato pelo WhatsApp.`,
    aboutText: [
      `O ${business.businessName} nasceu com a missão de elevar o padrão de ${business.category.toLowerCase()} em ${business.city}, unindo excelência técnica, atendimento humanizado e foco total na satisfação de cada cliente.`,
      `Localizado em ${business.address}, nosso espaço foi planejado nos mínimos detalhes para proporcionar conforto, segurança e resultados superiores desde o primeiro contato.`,
      `Com nota ${business.rating.toFixed(1)} e dezenas de avaliações positivas, somos a escolha de confiança para quem valoriza qualidade real e compromisso com horários.`,
    ].join("\n\n"),
    services: preset.services,
    benefits: defaultBenefits,
    testimonials: defaultTestimonials,
    faq: preset.faq,
    themePalette: preset.palette,
    heroImageUrl: preset.heroImageUrl,
    galleryUrls: preset.galleryUrls,
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackContent;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um Copywriter Sênior e Especialista em Landing Pages de Alta Conversão para Negócios Locais no Brasil.
Crie toda a estrutura persuasiva de uma Landing Page para o seguinte estabelecimento:
- Nome do Negócio: ${business.businessName}
- Categoria / Nicho: ${business.category}
- Cidade: ${business.city}
- Endereço: ${business.address}
- Nota no Google: ${business.rating} (${business.reviewsCount} avaliações)

Retorne ESTRITAMENTE um JSON válido com o seguinte formato:
{
  "heroTitle": "Headline magnética focada no negócio e na cidade local",
  "heroSubtitle": "Subtítulo persuasivo gerando desejo e confiança imediata",
  "aboutText": "História e posicionamento de autoridade local com 2 a 3 parágrafos separados por \\n\\n",
  "services": [
    {
      "title": "Nome do Serviço (total de 6 serviços específicos do nicho)",
      "description": "Descrição persuasiva do serviço",
      "icon": "Nome de ícone Lucide (ex: Scissors, Sparkles, ShieldCheck, Wrench, Utensils, Star, Heart, Zap, Award, Clock)",
      "priceHint": "Ex: A partir de R$ XX ou Sob consulta"
    }
  ],
  "benefits": [
    {
      "title": "Título do Diferencial (total de 4 diferenciais)",
      "description": "Explicação curta do benefício",
      "icon": "Zap | Award | MapPin | ShieldCheck"
    }
  ],
  "testimonials": [
    {
      "author": "Nome realista de cliente local (total de 3 depoimentos)",
      "text": "Depoimento convincente elogiando o atendimento no ${business.businessName}",
      "rating": 5
    }
  ],
  "faq": [
    {
      "question": "Pergunta frequente do nicho (total de 4 perguntas)",
      "answer": "Resposta clara que quebra objeções e incentiva chamar no WhatsApp"
    }
  ],
  "themePalette": "Escolha entre: amber | blue | rose | emerald | violet | slate"
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
    const parsed = JSON.parse(responseText) as GeminiSiteRawResponse;

    return {
      heroTitle: parsed.heroTitle || fallbackContent.heroTitle,
      heroSubtitle: parsed.heroSubtitle || fallbackContent.heroSubtitle,
      aboutText: parsed.aboutText || fallbackContent.aboutText,
      services:
        Array.isArray(parsed.services) && parsed.services.length >= 3
          ? parsed.services.slice(0, 6)
          : fallbackContent.services,
      benefits:
        Array.isArray(parsed.benefits) && parsed.benefits.length >= 3
          ? parsed.benefits.slice(0, 4)
          : fallbackContent.benefits,
      testimonials:
        Array.isArray(parsed.testimonials) && parsed.testimonials.length >= 2
          ? parsed.testimonials.slice(0, 3)
          : fallbackContent.testimonials,
      faq:
        Array.isArray(parsed.faq) && parsed.faq.length >= 2
          ? parsed.faq.slice(0, 4)
          : fallbackContent.faq,
      themePalette: normalizePalette(parsed.themePalette, preset.palette),
      heroImageUrl: preset.heroImageUrl,
      galleryUrls: preset.galleryUrls,
    };
  } catch (error) {
    console.error("Erro ao gerar Landing Page com Gemini (usando fallback por nicho):", error);
    return fallbackContent;
  }
}
