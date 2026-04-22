import { Link } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { Search, ShoppingBag, User } from "lucide-react";

export default function SiteHeader() {
  const { data: cart } = useGetCart();
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Left Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/shop/new-arrivals" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">
            New Arrivals
          </Link>
          <Link href="/about" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">
            Our Story
          </Link>
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-serif text-primary tracking-tight">
          Lumière
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-auto md:ml-0">
          <button className="hover:text-primary transition-colors" aria-label="Search">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <Link href="/cart" className="relative hover:text-primary transition-colors flex items-center" aria-label="Cart">
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
