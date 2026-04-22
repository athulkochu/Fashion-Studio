import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  
  const { data: order, isLoading } = useGetOrder(orderNumber || "", {
    query: { enabled: !!orderNumber, queryKey: [`/api/orders/${orderNumber}`] }
  });

  useEffect(() => {
    if (order) {
      document.title = `Lumière | Order ${order.orderNumber}`;
      window.scrollTo(0, 0);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl flex flex-col items-center">
        <Skeleton className="h-16 w-16 rounded-full mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-16" />
        <div className="w-full space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-primary mb-4">Order not found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the order you're looking for.</p>
        <Link href="/" className="text-sm uppercase tracking-widest border-b border-primary pb-1 hover:text-primary transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-serif text-primary mb-4">Merci for your order.</h1>
          <p className="text-muted-foreground text-lg mb-2">We've sent a confirmation email to <span className="font-medium text-foreground">{order.email}</span></p>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mt-6">Order No. {order.orderNumber}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background border border-border p-8 md:p-12 mb-8"
        >
          <div className="flex items-start gap-4 pb-8 border-b border-border mb-8">
            <Package className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            <div>
              <h2 className="font-serif text-xl mb-1">Estimated Delivery</h2>
              <p className="text-muted-foreground">{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Via {order.shippingMethod} Shipping</p>
            </div>
          </div>

          <h3 className="font-serif text-lg mb-6">Order Details</h3>
          <div className="space-y-6 mb-8">
            {order.items.map(item => (
              <div key={item.productId} className="flex gap-4">
                <div className="w-16 aspect-[3/4] bg-muted flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="font-serif text-sm">{item.name}</span>
                  <span className="text-xs text-muted-foreground uppercase mt-1">{item.color} / {item.size} / Qty: {item.quantity}</span>
                </div>
                <div className="text-sm font-medium flex items-center">
                  {formatCurrency(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm pt-6 border-t border-border">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex justify-between font-serif text-xl text-primary">
              <span>Total Paid</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm"
        >
          <div className="bg-background border border-border p-6 md:p-8">
            <h3 className="font-serif text-lg mb-4">Shipping Address</h3>
            <div className="text-muted-foreground leading-relaxed">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
          <div className="bg-background border border-border p-6 md:p-8">
            <h3 className="font-serif text-lg mb-4">Billing Address</h3>
            <div className="text-muted-foreground leading-relaxed">
              <p>{order.billingAddress.fullName}</p>
              <p>{order.billingAddress.line1}</p>
              {order.billingAddress.line2 && <p>{order.billingAddress.line2}</p>}
              <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
              <p>{order.billingAddress.country}</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 text-center">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
