import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  LogOut,
  PlusCircle,
  Search,
  Bell,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteção de Rota: Apenas Admin pode acessar
  const isAdmin =
    session?.user &&
    (session.user.role === "ADMIN" ||
      (session.user.role as string) === "SUPER_ADMIN");
  if (!session || !isAdmin) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const mlLinks = [
    { label: "Dashboard Geral", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inventário ML", icon: Package, href: "/dashboard/inventory" },
    {
      label: "Novo Anúncio ML",
      icon: PlusCircle,
      href: "/dashboard/inventory/new",
    },
  ];

  const siteFactoryLinks = [
    { label: "Sites Gerados", icon: Globe, href: "/dashboard/sites" },
    {
      label: "Criar Site pelo Maps",
      icon: MapPin,
      href: "/dashboard/sites/new",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-rose-gold flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-white">
              Prime <span className="text-emerald-400 font-sans">Vitrine</span>{" "}
              <span className="text-[10px] text-white/40 block -mt-1 font-sans font-normal tracking-widest uppercase">
                Hub & IA
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
          {/* Módulo 1: Mercado Livre */}
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
              Módulo Mercado Livre
            </p>
            {mlLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
              >
                <link.icon className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Módulo 2: Fábrica de Sites IA */}
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/80 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Módulo Fábrica de Sites IA
            </p>
            {siteFactoryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
              >
                <link.icon className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald to-rose-gold flex items-center justify-center text-[10px] font-bold text-white">
              {session.user.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name}
              </p>
              <p className="text-[10px] text-white/40 truncate capitalize">
                {session.user.role.replace("_", " ")}
              </p>
            </div>
          </div>

          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </Link>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 pl-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar no painel..."
                className="w-full bg-white/5 border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-[#0a0a0a]" />
            </button>
            <Link
              href="/dashboard/sites/new"
              className="btn-ghost !py-2 !px-4 !text-xs !rounded-full border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              Gerar Site IA
            </Link>
            <Link
              href="/dashboard/inventory/new"
              className="btn-primary !py-2 !px-4 !text-xs !rounded-full"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Novo Anúncio ML
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
