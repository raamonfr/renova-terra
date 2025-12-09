"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TreePine, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shrink-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/imgs/logo-transparent.png"
            alt="Logo RenovaTerra"
            className="w-16"
          />
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/mapa"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Mapa
          </Link>
          <Link
            href="/eventos"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Eventos
          </Link>
          <Link
            href="/recompensas"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Recompensas
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </nav>

        {/* Botão Menu Mobile */}
        <button
          className="md:hidden text-foreground hover:text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border absolute w-full left-0 top-full shadow-lg z-50 p-4 flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/mapa"
            className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsMenuOpen(false)}
          >
            Mapa
          </Link>
          <Link
            href="/eventos"
            className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsMenuOpen(false)}
          >
            Eventos
          </Link>
          <Link
            href="/recompensas"
            className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsMenuOpen(false)}
          >
            Recompensas
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      )}
    </header>
  );
}
