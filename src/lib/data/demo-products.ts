import { type ProductCardProps } from "@/components/product/ProductCard";

export interface DemoProductItem extends ProductCardProps {
  description: string;
  originalUrl: string;
  affiliateUrl: string;
  aiSummary: string;
  aiPros: string[];
  aiCons: string[];
}

export const DEMO_FALLBACK_PRODUCTS: DemoProductItem[] = [
  {
    id: "demo-iphone-15",
    slug: "apple-iphone-15-128gb-preto",
    title: "Apple iPhone 15 (128 GB) - Preto",
    brand: "Apple",
    categoryName: "Eletrônicos",
    description:
      "O iPhone 15 traz a Dynamic Island, câmera grande-angular de 48 MP com teleobjetiva de 2x, chip A16 Bionic ultrarrápido e conector USB-C universal.",
    price: 4799.0,
    originalPrice: 5899.0,
    discountPercent: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format",
    originalUrl:
      "https://www.mercadolivre.com.br/apple-iphone-15-128-gb-preto/p/MLB28000000",
    affiliateUrl:
      "https://www.mercadolivre.com.br/apple-iphone-15-128-gb-preto/p/MLB28000000",
    aiSummary:
      "O iPhone 15 redefine a fotografia mobile com câmera de 48 MP e Dynamic Island. Excelente autonomia de bateria e construção em alumínio aeroespacial com vidro resistente.",
    aiPros: [
      "Câmera principal de 48 MP com alta definição",
      "Conector USB-C universal",
      "Tela Super Retina XDR com Dynamic Island",
    ],
    aiCons: ["Taxa de atualização padrão de 60Hz"],
    status: "AVAILABLE",
    views: 312,
    clicksCount: 42,
    featured: true,
  },
  {
    id: "demo-ps5-slim",
    slug: "sony-playstation-5-slim-digital",
    title: "Sony PlayStation 5 Slim Edição Digital",
    brand: "Sony",
    categoryName: "Games",
    description:
      "Console PlayStation 5 Slim Edição Digital com 1TB de armazenamento SSD de altíssima velocidade, suporte a Ray Tracing e controle sem fio DualSense.",
    price: 3499.0,
    originalPrice: 3999.0,
    discountPercent: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format",
    originalUrl:
      "https://www.mercadolivre.com.br/sony-playstation-5-slim/p/MLB29000000",
    affiliateUrl:
      "https://www.mercadolivre.com.br/sony-playstation-5-slim/p/MLB29000000",
    aiSummary:
      "Performance de última geração em design mais compacto e leve. SSD ultrarrápido de 1TB e compatibilidade total com áudio 3D imersivo.",
    aiPros: [
      "Armazenamento interno SSD de 1TB",
      "Gatilhos adaptativos no controle DualSense",
      "Gráficos em até 4K 120 FPS",
    ],
    aiCons: ["Edição digital sem leitor de disco físico"],
    status: "AVAILABLE",
    views: 540,
    clicksCount: 87,
    featured: true,
  },
  {
    id: "demo-air-fryer",
    slug: "air-fryer-philips-walita-4l",
    title: "Fritadeira Sem Óleo Air Fryer Philips Walita 4.1L",
    brand: "Philips Walita",
    categoryName: "Casa e Cozinha",
    description:
      "Fritadeira elétrica sem óleo com tecnologia exclusiva Rapid Air, capacidade de 4.1L, potência de 1400W e cesto removível antiaderente.",
    price: 389.0,
    originalPrice: 549.0,
    discountPercent: 29,
    imageUrl:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format",
    originalUrl:
      "https://www.mercadolivre.com.br/air-fryer-philips-walita/p/MLB30000000",
    affiliateUrl:
      "https://www.mercadolivre.com.br/air-fryer-philips-walita/p/MLB30000000",
    aiSummary:
      "Tecnologia Rapid Air patenteada que frita com até 90% menos gordura. Cesto antiaderente fácil de lavar e aquecimento uniforme sem necessidade de virar os alimentos.",
    aiPros: [
      "Aquecimento homogêneo Rapid Air",
      "Cesto antiaderente fácil de limpar",
      "Operação silenciosa e econômica",
    ],
    aiCons: ["Cabo de energia ligeiramente curto"],
    status: "AVAILABLE",
    views: 198,
    clicksCount: 15,
    featured: true,
  },
  {
    id: "demo-samsung-tv",
    slug: "smart-tv-55-4k-samsung-crystal",
    title: "Smart TV 55 Polegadas 4K UHD Samsung Crystal",
    brand: "Samsung",
    categoryName: "Eletrônicos",
    description:
      "Smart TV 55\" 4K UHD Samsung Crystal com Processador Crystal 4K, Samsung Gaming Hub integrado, HDR e design ultrafino sem bordas aparentes.",
    price: 2499.0,
    originalPrice: 3199.0,
    discountPercent: 21,
    imageUrl:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format",
    originalUrl:
      "https://www.mercadolivre.com.br/smart-tv-55-samsung/p/MLB31000000",
    affiliateUrl:
      "https://www.mercadolivre.com.br/smart-tv-55-samsung/p/MLB31000000",
    aiSummary:
      "Processador Crystal 4K que aprimora qualquer conteúdo para resolução próxima ao 4K. Design fino sem bordas aparentes e sistema operacional Tizen ultrarrápido.",
    aiPros: [
      "Cores vivas e alto contraste HDR",
      "Hub de Games integrado (Xbox Cloud Gaming)",
      "Design AirSlim moderno",
    ],
    aiCons: ["Áudio nativo de 20W (recomendável soundbar para cinema)"],
    status: "AVAILABLE",
    views: 264,
    clicksCount: 31,
    featured: true,
  },
];
