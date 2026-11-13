export interface MapsExtractorInput {
  mapsUrl?: string;
  businessName?: string;
  category?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
}

export interface ExtractedBusinessData {
  businessName: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewsCount: number;
  mapsUrl: string;
}

interface GooglePlacesResultItem {
  name?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
}

interface GooglePlacesApiResponse {
  results?: GooglePlacesResultItem[];
  status?: string;
}

const CATEGORY_KEYWORDS: Array<{ category: string; regex: RegExp }> = [
  {
    category: "Barbearia",
    regex: /\b(barbearia|barber|barbeiro|corte\s+masculino)\b/i,
  },
  {
    category: "Clínica Odontológica",
    regex: /\b(odonto|odontologia|dentista|dental|sorriso|implante|ortodontia)\b/i,
  },
  {
    category: "Oficina Mecânica",
    regex: /\b(oficina|mec[aâ]nica|auto\s*center|automotivo|pneus|funilaria|carros)\b/i,
  },
  {
    category: "Restaurante & Gastronomia",
    regex: /\b(restaurante|pizzaria|hamburgueria|burger|sushi|bistr[oô]|lanchonete|churrascaria|padaria|caf[eé])\b/i,
  },
  {
    category: "Estética & Beleza",
    regex: /\b(est[eé]tica|sal[aã]o|beleza|manicure|spa|depila[cç][aã]o|sobrancelha|cabelo|hair)\b/i,
  },
  {
    category: "Academia & Fitness",
    regex: /\b(academia|fitness|crossfit|pilates|treino|personal|muscula[cç][aã]o)\b/i,
  },
  {
    category: "Pet Shop & Veterinária",
    regex: /\b(pet\s*shop|veterin[aá]ri[oa]|banho\s+e\s+tosa|cl[ií]nica\s+vet|pet)\b/i,
  },
  {
    category: "Advocacia & Consultoria",
    regex: /\b(advocacia|advogad[oa]s?|jur[ií]dic[oa]|contabilidade|consultoria)\b/i,
  },
];

function inferCategoryFromText(text: string): string {
  for (const item of CATEGORY_KEYWORDS) {
    if (item.regex.test(text)) {
      return item.category;
    }
  }
  return "Serviços & Comércio Local";
}

function sanitizeWhatsappDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

function parseGoogleMapsUrl(rawUrl: string): {
  parsedName: string;
  parsedAddress: string;
  parsedCity: string;
} {
  let parsedName = "";
  let parsedAddress = "";
  let parsedCity = "";

  try {
    const decodedUrl = decodeURIComponent(rawUrl.replace(/\+/g, " "));

    // Padrão 1: /maps/place/Nome+do+Negocio/...
    const placeMatch = decodedUrl.match(/\/maps\/place\/([^/@?]+)/i);
    if (placeMatch && placeMatch[1]) {
      const placeSegment = placeMatch[1].trim();
      const parts = placeSegment.split(/\s+-\s+|,\s*/).map((s) => s.trim()).filter(Boolean);

      if (parts.length > 0) {
        parsedName = parts[0];
      }
      if (parts.length > 1) {
        parsedAddress = parts.slice(1).join(", ");
      }
      if (parts.length >= 3) {
        parsedCity = parts[parts.length - 1];
      }
    }

    // Padrão 2: ?q=Nome+do+Negocio
    if (!parsedName) {
      const urlObj = new URL(rawUrl);
      const qParam =
        urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
      if (qParam) {
        const cleanQ = decodeURIComponent(qParam.replace(/\+/g, " ")).trim();
        const parts = cleanQ.split(",").map((s) => s.trim()).filter(Boolean);
        parsedName = parts[0] || "";
        if (parts.length > 1) {
          parsedAddress = parts.slice(1).join(", ");
          parsedCity = parts[parts.length - 1] || "";
        }
      }
    }
  } catch {
    // URL inválida ou malformada: ignora silenciosamente
  }

  return { parsedName, parsedAddress, parsedCity };
}

async function fetchOpenGraphFromMapsUrl(rawUrl: string): Promise<{
  ogTitle: string;
  ogDescription: string;
  finalUrl: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(rawUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    const html = await response.text();
    const finalUrl = response.url || rawUrl;

    const titleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const descMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    );

    const ogTitle = titleMatch?.[1]
      ? titleMatch[1].replace(/\s*-\s*Google\s+Maps.*$/i, "").trim()
      : "";
    const ogDescription = descMatch?.[1]?.trim() || "";

    return { ogTitle, ogDescription, finalUrl };
  } catch {
    return { ogTitle: "", ogDescription: "", finalUrl: rawUrl };
  } finally {
    clearTimeout(timeout);
  }
}

async function queryGooglePlacesApi(
  query: string,
  apiKey: string
): Promise<GooglePlacesResultItem | null> {
  if (!query.trim()) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&language=pt-BR&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as GooglePlacesApiResponse;
    if (Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extrai e enriquece informações comerciais a partir de uma URL do Google Maps
 * ou de dados básicos informados pelo usuário.
 */
export async function extractBusinessFromMapsInput(
  input: MapsExtractorInput
): Promise<ExtractedBusinessData> {
  const rawMapsUrl = (input.mapsUrl || "").trim();

  let parsedName = "";
  let parsedAddress = "";
  let parsedCity = "";
  let ogDescription = "";
  let rating = 4.9;
  let reviewsCount = 64;

  if (rawMapsUrl) {
    const initialParse = parseGoogleMapsUrl(rawMapsUrl);
    parsedName = initialParse.parsedName;
    parsedAddress = initialParse.parsedAddress;
    parsedCity = initialParse.parsedCity;

    // Tenta enriquecer via fetch OpenGraph (resolve inclusive links curtos maps.app.goo.gl)
    const ogData = await fetchOpenGraphFromMapsUrl(rawMapsUrl);
    if (ogData.finalUrl && ogData.finalUrl !== rawMapsUrl) {
      const redirectedParse = parseGoogleMapsUrl(ogData.finalUrl);
      if (!parsedName && redirectedParse.parsedName) {
        parsedName = redirectedParse.parsedName;
      }
      if (!parsedAddress && redirectedParse.parsedAddress) {
        parsedAddress = redirectedParse.parsedAddress;
      }
      if (!parsedCity && redirectedParse.parsedCity) {
        parsedCity = redirectedParse.parsedCity;
      }
    }

    if (!parsedName && ogData.ogTitle && !/Google Maps/i.test(ogData.ogTitle)) {
      const titleParts = ogData.ogTitle.split("·").map((s) => s.trim());
      parsedName = titleParts[0] || ogData.ogTitle;
      if (!parsedAddress && titleParts[1]) {
        parsedAddress = titleParts[1];
      }
    }

    ogDescription = ogData.ogDescription;

    // Extrai avaliação se estiver presente na descrição OpenGraph (ex: "★★★★☆ · 4,9 (120)")
    const ratingMatch = ogDescription.match(/([45][.,]\d)/);
    if (ratingMatch?.[1]) {
      const num = parseFloat(ratingMatch[1].replace(",", "."));
      if (!Number.isNaN(num) && num > 0 && num <= 5) {
        rating = num;
      }
    }
  }

  let businessName = (input.businessName || parsedName || "").trim();
  let address = (input.address || parsedAddress || "").trim();
  let city = (input.city || parsedCity || "").trim();

  // Caso possua GOOGLE_PLACES_API_KEY configurada, consulta Places API oficial
  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (placesApiKey && (businessName || rawMapsUrl)) {
    const searchQuery = [businessName, city, address].filter(Boolean).join(" ") || rawMapsUrl;
    const placeItem = await queryGooglePlacesApi(searchQuery, placesApiKey);

    if (placeItem) {
      if (!input.businessName && placeItem.name) {
        businessName = placeItem.name;
      }
      if (!input.address && placeItem.formatted_address) {
        address = placeItem.formatted_address;
      }
      if (typeof placeItem.rating === "number") {
        rating = placeItem.rating;
      }
      if (typeof placeItem.user_ratings_total === "number") {
        reviewsCount = placeItem.user_ratings_total;
      }
    }
  }

  if (!businessName) {
    businessName = "Estabelecimento Premium";
  }

  if (!city && address) {
    const addressSegments = address.split(/[,-]/).map((s) => s.trim()).filter(Boolean);
    if (addressSegments.length >= 2) {
      city = addressSegments[addressSegments.length - 2] || "Sua Cidade";
    }
  }

  if (!city) {
    city = "São Paulo";
  }

  if (!address) {
    address = `Região Central, ${city}`;
  }

  const combinedTextForCategory = `${businessName} ${input.category || ""} ${ogDescription}`;
  const category = (input.category || "").trim() || inferCategoryFromText(combinedTextForCategory);

  const phone = (input.phone || input.whatsapp || "(11) 99999-9999").trim();
  const whatsapp = sanitizeWhatsappDigits(input.whatsapp || phone) || "5511999999999";

  return {
    businessName,
    category,
    address,
    city,
    phone,
    whatsapp,
    rating,
    reviewsCount,
    mapsUrl:
      rawMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${businessName} ${address}`
      )}`,
  };
}
