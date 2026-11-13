"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_LINKS = [
  { label: "Vitrine",        href: "/vitrine" },
  { label: "Eletrônicos",    href: "/vitrine?categoria=Eletrônicos" },
  { label: "Casa e Cozinha", href: "/vitrine?categoria=Casa e Cozinha" },
  { label: "Games",          href: "/vitrine?categoria=Games" },
  { label: "Promoções",      href: "/vitrine?desconto=true" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  // Detect scroll
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setIsScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        id="navbar"
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "navbar-glass py-3" : "py-5"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Animated background overlay */}
        <motion.div
          className="absolute inset-0 navbar-glass -z-10"
          style={{ opacity: navOpacity }}
        />

        <div className="section-container">
          <div className="flex items-center justify-between gap-8">
            {/* ── Logo ── */}
            <Link href="/" id="navbar-logo" className="flex items-center gap-2.5 group flex-shrink-0">
              <motion.div
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #10b981, #d4af37)",
                }}
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="leading-none">
                <span className="block font-serif font-bold text-lg text-white tracking-tight">
                  Prime <span className="text-emerald-400">Vitrine</span>
                </span>
                <span className="block text-[9px] text-white/40 tracking-[0.2em] uppercase font-medium">
                  Curadoria Mercado Livre
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    id={`nav-${link.label.toLowerCase()}`}
                    className={clsx(
                      "relative px-4 py-2 text-sm font-medium rounded-lg",
                      "transition-colors duration-200",
                      isActive
                        ? "text-emerald"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: "rgba(16,185,129,0.1)" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/vitrine"
                  id="navbar-search"
                  aria-label="Buscar peças"
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Search className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* WhatsApp - Compartilhar site */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="https://wa.me/?text=Confira%20as%20melhores%20ofertas%20do%20Mercado%20Livre%20na%20Prime%20Vitrine!"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="navbar-whatsapp"
                  aria-label="Compartilhar no WhatsApp"
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-green-400 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </motion.div>

              {/* Dashboard Shortcut */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard"
                  id="navbar-dashboard"
                  aria-label="Painel Administrativo"
                  title="Painel Administrativo"
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-emerald-400 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Auth */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    id="navbar-user-menu"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald to-rose-gold flex items-center justify-center text-white text-[10px] font-bold">
                      {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <ChevronDown
                      className={clsx(
                        "w-3.5 h-3.5 text-white/50 transition-transform duration-200",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/8 overflow-hidden"
                        style={{
                          background: "rgba(10,10,10,0.95)",
                          backdropFilter: "blur(24px)",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        }}
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-white/40 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="p-1.5">
                          {(session.user?.role === "ADMIN" || (session.user?.role as string) === "SUPER_ADMIN") && (
                            <Link
                              href="/dashboard"
                              id="nav-dashboard"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard Admin
                            </Link>
                          )}
                          <Link
                            href="/perfil"
                            id="nav-profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <User className="w-4 h-4" />
                            Meu Perfil
                          </Link>
                          <button
                            id="nav-signout"
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/auth/login"
                    id="navbar-login"
                    className="btn-primary !py-2 !px-4 !text-xs"
                  >
                    Entrar
                  </Link>
                </motion.div>
              )}

              {/* Mobile menu button */}
              <motion.button
                id="navbar-mobile-menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Menu mobile"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:hidden overflow-hidden border-t border-white/5"
              style={{ background: "rgba(5,5,5,0.95)", backdropFilter: "blur(32px)" }}
            >
              <nav className="section-container py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className={clsx(
                        "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        pathname === link.href
                          ? "text-emerald bg-emerald/8"
                          : "text-white/60 hover:text-white hover:bg-white/4"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}
