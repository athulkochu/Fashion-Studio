import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProductBySlug, useListRelatedProducts, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProductDetail() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProductBySlug(slug || "", {
    query: { enabled: !!slug, queryKey: [`/api/products/${slug}`] }
  });
  
  const { data: relatedProducts, isLoading: loadingRelated } = useListRelatedProducts(slug || "", {
    query: { enabled: !!slug, queryKey: [`/api/products/${slug}/related`] }
  });

  const addCartItem = useAddCartItem();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      document.title = `Lumière | ${product.name}`;
      setSelectedImage(0);
      setSelectedSize("");
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="flex gap-4"><Skeleton className="h-24 w-20" /><Skeleton className="h-24 w-20" /></div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }

    addCartItem.mutate(
      { data: { productId: product.id, size: selectedSize, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Added to bag",
            description: `${product.name} - ${selectedSize} (Qty: ${quantity})`,
          });
        },
        onError: () => {
          toast({
            title: "Failed to add to bag",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 md:px-8 py-6 text-xs uppercase tracking-widest text-muted-foreground flex gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Images */}
          <div className="flex flex-col gap-4 sticky top-24">
            <div className="aspect-[3/4] relative overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedImage}
                  src={product.images[selectedImage]} 
                  alt={`${product.name} view ${selectedImage + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              </AnimatePresence>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 aspect-[3/4] flex-shrink-0 overflow-hidden ${selectedImage === idx ? 'ring-1 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'} transition-all`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col pt-4">
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2 leading-tight">{product.name}</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">{product.tagline}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xl font-medium">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-muted-foreground line-through text-sm">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-foreground/80 leading-relaxed font-light mb-10">
              {product.description}
            </p>

            {/* Color */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-semibold">Color: {product.color}</span>
              </div>
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-full border ring-2 ring-primary/20 border-primary"
                  style={{ backgroundColor: product.colorHex }}
                />
              </div>
            </div>

            {/* Size */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-semibold">Size</span>
                <button className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-10 px-4 text-xs uppercase tracking-widest border transition-all ${
                      selectedSize === size 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-transparent text-foreground border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <div className="flex items-center border border-border h-12">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={addCartItem.isPending}
                className="flex-1 bg-primary text-primary-foreground h-12 uppercase tracking-widest text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addCartItem.isPending ? "Adding..." : <><ShoppingBag className="w-4 h-4" /> Add to Bag</>}
              </button>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full border-t border-border">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm uppercase tracking-widest hover:no-underline py-6">The Details</AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  <ul className="list-disc pl-4 space-y-2">
                    {product.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                    <li>Material: {product.material}</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-sm uppercase tracking-widest hover:no-underline py-6">Care Instructions</AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  <ul className="list-disc pl-4 space-y-2">
                    {product.careInstructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {!loadingRelated && relatedProducts && relatedProducts.length > 0 && (
        <section className="py-24 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-serif text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map(related => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
