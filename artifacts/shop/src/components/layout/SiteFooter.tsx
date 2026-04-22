import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-2xl font-serif tracking-tight mb-6 text-primary-foreground">Lumière</h2>
          <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
            Refined dresses for the modern woman. Designed in Paris, crafted with care.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-6 text-primary-foreground">Shop</h3>
          <ul className="space-y-4">
            <li><Link href="/shop" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">All Dresses</Link></li>
            <li><Link href="/shop/new-arrivals" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop/best-sellers" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Best Sellers</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-6 text-primary-foreground">About</h3>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Story</Link></li>
            <li><Link href="/journal" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Journal</Link></li>
            <li><Link href="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-6 text-primary-foreground">Newsletter</h3>
          <p className="text-sm text-primary-foreground/70 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="flex border-b border-primary-foreground/30 pb-2">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-transparent border-none outline-none text-sm w-full text-primary-foreground placeholder:text-primary-foreground/40 focus:ring-0 px-0"
            />
            <button type="submit" className="text-sm tracking-widest uppercase text-primary-foreground hover:text-primary-foreground/70 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-primary-foreground/20 text-xs text-primary-foreground/50">
        <p>&copy; {new Date().getFullYear()} Lumière. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
