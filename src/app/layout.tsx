import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/layout/Providers";
import { CustomCursor } from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: {
    default: "Prime Vitrine | Melhores Ofertas do Mercado Livre",
    template: "%s | Prime Vitrine",
  },
  description:
    "Curadoria inteligente das melhores ofertas, eletrônicos, tecnologia e produtos em alta do Mercado Livre com análise por IA e compra 100% segura.",
  keywords: [
    "prime vitrine",
    "ofertas mercado livre",
    "promoções",
    "curadoria de ofertas",
    "melhores descontos",
    "afiliados mercado livre",
    "tecnologia",
    "eletrônicos",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Prime Vitrine | Melhores Ofertas do Mercado Livre",
    description:
      "Curadoria inteligente das melhores ofertas, eletrônicos e tecnologia com análise por IA.",
    siteName: "Prime Vitrine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Vitrine | Melhores Ofertas do Mercado Livre",
    description: "Curadoria inteligente das melhores ofertas do Mercado Livre.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="bg-obsidian text-white antialiased">
        <Providers>
          {/* Custom cursor – rendered client-side */}
          <CustomCursor />

          {/* Navbar glassmorphism fixa */}
          <Navbar />

          {/* Conteúdo principal com animações de transição */}
          <main className="min-h-screen">{children}</main>

          {/* Background ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          >
            {/* Top-left emerald orb */}
            <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald/5 blur-[120px]" />
            {/* Bottom-right gold orb */}
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-rose-gold/5 blur-[120px]" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
