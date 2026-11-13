import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SiteGeneratorClient } from "./SiteGeneratorClient";

export default function NewSitePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/sites"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para Sites Gerados
          </Link>
          <h1 className="text-2xl font-serif text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Criar Site Profissional pelo Google Maps
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Transforme qualquer ficha do Google Maps em uma Landing Page de alta conversão pronta para vender.
          </p>
        </div>
      </div>

      <SiteGeneratorClient />
    </div>
  );
}
