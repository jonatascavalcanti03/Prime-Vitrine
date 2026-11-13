import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Database com Ofertas de Afiliados...");

  // Limpar dados existentes de produtos
  await prisma.clickAnalytics.deleteMany();
  await prisma.product.deleteMany();

  const sampleOffers = [
    {
      title: "Apple iPhone 15 (128 GB) - Preto",
      slug: "apple-iphone-15-128gb-preto",
      brand: "Apple",
      categoryName: "Eletrônicos",
      price: 4799.00,
      originalPrice: 5899.00,
      discountPercent: 18,
      originalUrl: "https://www.mercadolivre.com.br/apple-iphone-15-128-gb-preto/p/MLB28000000",
      affiliateUrl: "https://www.mercadolivre.com.br/apple-iphone-15-128-gb-preto/p/MLB28000000",
      mediaUrls: [
        { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format", type: "image" }
      ],
      aiSummary: "O iPhone 15 redefine a fotografia mobile com câmera de 48 MP e Dynamic Island. Excelente autonomia de bateria e construção em alumínio aeroespacial com vidro resistente.",
      aiPros: ["Câmera de 48 MP com alta definição", "Entrada USB-C universal", "Tela Super Retina XDR com Dynamic Island"],
      aiCons: ["Taxa de atualização de 60Hz"],
      status: "AVAILABLE" as const,
      featured: true,
      clicksCount: 42,
    },
    {
      title: "Sony PlayStation 5 Slim Edição Digital",
      slug: "sony-playstation-5-slim-digital",
      brand: "Sony",
      categoryName: "Games",
      price: 3499.00,
      originalPrice: 3999.00,
      discountPercent: 12,
      originalUrl: "https://www.mercadolivre.com.br/sony-playstation-5-slim/p/MLB29000000",
      affiliateUrl: "https://www.mercadolivre.com.br/sony-playstation-5-slim/p/MLB29000000",
      mediaUrls: [
        { url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format", type: "image" }
      ],
      aiSummary: "Performance de última geração em design mais compacto e leve. SSD ultrarrápido de 1TB e compatibilidade total com áudio 3D imersivo.",
      aiPros: ["Armazenamento interno de 1TB", "Gatilhos adaptativos no DualSense", "Gráficos em até 4K 120 FPS"],
      aiCons: ["Edição digital sem leitor de disco físico"],
      status: "AVAILABLE" as const,
      featured: true,
      clicksCount: 87,
    },
    {
      title: "Fritadeira Sem Óleo Air Fryer Philips Walita 4.1L",
      slug: "air-fryer-philips-walita-4l",
      brand: "Philips Walita",
      categoryName: "Casa e Cozinha",
      price: 389.00,
      originalPrice: 549.00,
      discountPercent: 29,
      originalUrl: "https://www.mercadolivre.com.br/air-fryer-philips-walita/p/MLB30000000",
      affiliateUrl: "https://www.mercadolivre.com.br/air-fryer-philips-walita/p/MLB30000000",
      mediaUrls: [
        { url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format", type: "image" }
      ],
      aiSummary: "Tecnologia Rapid Air patenteada que frita com até 90% menos gordura. Cesto antiaderente fácil de lavar e aquecimento uniforme sem necessidade de virar os alimentos.",
      aiPros: ["Aquecimento homogêneo", "Fácil de limpar", "Baixo ruído"],
      aiCons: ["Cabo de energia ligeiramente curto"],
      status: "AVAILABLE" as const,
      featured: true,
      clicksCount: 15,
    },
    {
      title: "Smart TV 55 Polegadas 4K UHD Samsung Crystal",
      slug: "smart-tv-55-4k-samsung-crystal",
      brand: "Samsung",
      categoryName: "Eletrônicos",
      price: 2499.00,
      originalPrice: 3199.00,
      discountPercent: 21,
      originalUrl: "https://www.mercadolivre.com.br/smart-tv-55-samsung/p/MLB31000000",
      affiliateUrl: "https://www.mercadolivre.com.br/smart-tv-55-samsung/p/MLB31000000",
      mediaUrls: [
        { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format", type: "image" }
      ],
      aiSummary: "Processador Crystal 4K que aprimora qualquer conteúdo para resolução próxima ao 4K. Design fino sem bordas aparentes e sistema operacional Tizen ultrarrápido.",
      aiPros: ["Cores vivas e alto contraste", "Hub de Games integrado (Xbox Cloud Gaming)", "Design slim moderno"],
      aiCons: ["Áudio nativo básico (recomendável soundbar)"],
      status: "AVAILABLE" as const,
      featured: true,
      clicksCount: 31,
    },
  ];

  for (const offer of sampleOffers) {
    await prisma.product.create({
      data: offer,
    });
  }

  console.log(`Sucesso: ${sampleOffers.length} ofertas de afiliados inseridas! ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
