import { useEffect } from "react";
import { Link } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  useEffect(() => {
    document.title = "Lumière | Your Bag";
  }, []);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate(
      { itemId, data: { quantity: newQuantity } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
      }
    );
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate(
      { itemId },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-serif mb-10">Your Bag</h1>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <h1 className="text-3xl font-serif text-primary mb-6">Your bag is empty</h1>
        <p className="text-muted-foreground font-light mb-10 max-w-md">
          Discover our latest collections and find your new favorite pieces.
        </p>
        <Link 
          href="/shop" 
          className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-6xl min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-serif text-primary mb-12">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="divide-y divide-border">
            <AnimatePresence>
              {cart.items.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  {/* Product Info */}
                  <div className="md:col-span-6 flex gap-6">
                    <Link href={`/product/${item.slug}`} className="w-24 aspect-[3/4] bg-muted flex-shrink-0 relative group block">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </Link>
                    <div className="flex flex-col justify-center">
                      <Link href={`/product/${item.slug}`} className="font-serif text-lg hover:text-primary transition-colors mb-1">
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mb-4 space-y-1">
                        <p>Color: <span className="capitalize">{item.color}</span></p>
                        <p>Size: <span className="uppercase">{item.size}</span></p>
                        <p className="md:hidden mt-2 font-medium text-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 w-fit"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-3 flex md:justify-center items-center">
                    <div className="flex items-center border border-border h-10 w-fit">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateItem.isPending}
                        className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateItem.isPending}
                        className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="md:col-span-3 text-right hidden md:block font-medium">
                    {formatCurrency(item.lineTotal)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 p-8 sticky top-28">
            <h2 className="text-xl font-serif mb-6 pb-4 border-b border-border">Order Summary</h2>
            
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="text-foreground">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="text-foreground">{formatCurrency(cart.tax)}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-border flex justify-between font-serif text-lg">
                <span>Total</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-primary text-primary-foreground h-12 uppercase tracking-widest text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
              <p>Complimentary shipping on orders over $300.</p>
              <p>Secure payment processing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
