"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSiteAction } from "@/lib/actions/sites";

export function DeleteSiteButton({ siteId }: { siteId: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSiteAction(siteId);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all disabled:opacity-50"
      title="Excluir site gerado"
    >
      {deleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      🗑️ Excluir
    </button>
  );
}
