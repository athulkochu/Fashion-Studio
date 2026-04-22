import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col gap-4"
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-muted">
        {product.isNew && (
          <Badge className="absolute top-4 left-4 z-10 bg-background text-foreground hover:bg-background/90 uppercase tracking-widest text-[10px]">
            New
          </Badge>
        )}
        {product.isBestSeller && !product.isNew && (
          <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-[10px]">
            Best Seller
          </Badge>
        )}
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} alternate view`} 
            className="absolute inset-0 object-cover w-full h-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex justify-center">
          <span className="bg-background/90 backdrop-blur-sm px-6 py-2 text-sm uppercase tracking-widest text-foreground hover:bg-background transition-colors w-full text-center">
            Quick View
          </span>
        </div>
      </Link>
      
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/product/${product.slug}`} className="font-serif text-lg leading-tight hover:text-primary transition-colors">
            {product.name}
          </Link>
          <div className="flex flex-col items-end text-sm">
            <span className="font-medium">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through text-xs">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{product.tagline}</div>
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="w-4 h-4 rounded-full border border-border" 
            style={{ backgroundColor: product.colorHex }}
            title={product.color}
          />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.color}</span>
        </div>
      </div>
    </motion.div>
  );
}
