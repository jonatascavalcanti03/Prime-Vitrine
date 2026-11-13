"use client";

import { useState } from "react";
import { Loader2, Rocket, ExternalLink } from "lucide-react";
import { publishExistingProductAction } from "@/lib/actions/product";

interface PublishMlButtonProps {
  productId: string;
  syncStatus: string;
  mlPermalink: string | null;
}

export function PublishMlButton({
  productId,
  syncStatus,
  mlPermalink,
}: PublishMlButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(syncStatus);
  const [permalink, setPermalink] = useState<string | null>(mlPermalink);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePublish = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await publishExistingProductAction(productId);
      if (res.success) {
        setCurrentStatus("PUBLISHED");
        if (res.mlPermalink) {
          setPermalink(res.mlPermalink);
        }
      } else {
        setCurrentStatus("ERROR");
        setErrorMsg(res.error || "Falha ao publicar no ML");
      }
    } catch {
      setCurrentStatus("ERROR");
      setErrorMsg("Erro de comunicação ao publicar.");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "PUBLISHED" && permalink) {
    return (
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
        title="Abrir anúncio publicado na sua loja do Mercado Livre"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Ver no ML
      </a>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handlePublish}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all disabled:opacity-50"
        title="Publicar com 1 clique na sua conta do Mercado Livre"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <Rocket className="w-3.5 h-3.5" />
            Publicar no ML
          </>
        )}
      </button>
      {errorMsg && (
        <span
          className="text-[10px] text-red-400 max-w-[180px] truncate"
          title={errorMsg}
        >
          {errorMsg}
        </span>
      )}
    </div>
  );
}
