import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCart,
  useLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Search, ShoppingBag, User, LogOut, Package } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SiteHeader() {
  const { data: cart } = useGetCart();
  const itemCount = cart?.itemCount || 0;
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const logout = useLogout();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout.mutateAsync();
    await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/");
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Left Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className="text-sm uppercase tracking-widest hover:text-primary transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/shop/new-arrivals"
            className="text-sm uppercase tracking-widest hover:text-primary transition-colors"
          >
            New Arrivals
          </Link>
          <Link
            href="/about"
            className="text-sm uppercase tracking-widest hover:text-primary transition-colors"
          >
            Our Story
          </Link>
        </nav>

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-serif text-primary tracking-tight"
        >
          Lumière
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-auto md:ml-0">
          <button
            className="hover:text-primary transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Account */}
          <div className="relative" ref={menuRef}>
            {isAuthenticated ? (
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
                aria-label="Account menu"
              >
                {initial || <User className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            ) : (
              <Link
                href="/login"
                className="hover:text-primary transition-colors flex items-center"
                aria-label="Sign in"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            )}

            {isAuthenticated && open && (
              <div className="absolute right-0 mt-3 w-64 bg-background border border-border rounded-lg shadow-xl py-2 origin-top-right">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="font-serif text-base text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition"
                >
                  <Package className="w-4 h-4" strokeWidth={1.5} />
                  Your bag
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition text-left"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative hover:text-primary transition-colors flex items-center"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-medium h-4 w-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
