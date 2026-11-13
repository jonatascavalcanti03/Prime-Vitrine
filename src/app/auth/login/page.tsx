"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciais inválidas. Tente novamente.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro ao entrar. Tente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald/20 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-white block">
              Prime <span className="text-gradient-gold">Vitrine</span>
            </span>
          </Link>
          <h1 className="text-2xl font-serif text-white mb-2">Acesso Administrativo</h1>
          <p className="text-sm text-white/40">Entre para gerenciar seu catálogo e links de afiliados.</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border border-white/10 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luxe.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-4 flex items-center justify-center gap-3 shadow-lg shadow-emerald/20 hover:shadow-emerald/40 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-white/20">
          Problemas com o acesso? <Link href="/" className="text-white/40 hover:text-emerald-400 transition-colors">Voltar ao site público.</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40 text-sm">Carregando painel...</div>}>
      <LoginForm />
    </Suspense>
  );
}
