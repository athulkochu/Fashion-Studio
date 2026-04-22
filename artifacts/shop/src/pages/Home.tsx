import { useEffect } from "react";
import { Link } from "wouter";
import { useListFeaturedProducts, useListNewArrivals, useListBestSellers, useListCollections, useSubscribeNewsletter } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Home() {
  useEffect(() => {
    document.title = "Lumière | Refined Parisian Dresses";
  }, []);

  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts();
  const { data: newArrivals, isLoading: loadingNew } = useListNewArrivals({ limit: 4 });
  const { data: collections, isLoading: loadingCollections } = useListCollections();
  
  const subscribeMutation = useSubscribeNewsletter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof newsletterSchema>) {
    subscribeMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Subscribed successfully",
            description: "Welcome to the Lumière newsletter.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Subscription failed",
            description: "Please try again later.",
          });
        }
      }
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-muted">
        <img 
          src="/images/hero.png" 
          alt="Woman in a flowing silk dress in a sunlit Parisian apartment" 
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-background/20" />
        <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif text-primary mb-6"
          >
            Quiet Confidence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-foreground/80 mb-10 max-w-xl font-light"
          >
            Carefully curated dresses designed in Paris. For women who care about craft and details that reward attention.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link 
              href="/shop" 
              className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 md:px-8 container mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif mb-2">Featured Pieces</h2>
            <p className="text-muted-foreground">The foundation of a refined wardrobe.</p>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loadingFeatured ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            featuredProducts?.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Collections */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4">Curated Edits</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Find the perfect silhouette for every occasion in our carefully organized collections.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingCollections ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] w-full rounded-none" />)
            ) : (
              collections?.slice(0, 3).map((collection, index) => (
                <Link key={collection.slug} href={`/shop/${collection.slug}`} className="group relative aspect-[4/5] overflow-hidden block">
                  <img 
                    src={collection.coverImage} 
                    alt={collection.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <h3 className="text-2xl font-serif text-white mb-2">{collection.name}</h3>
                    <p className="text-white/80 text-sm mb-4">{collection.productCount} pieces</p>
                    <span className="inline-flex items-center gap-2 text-white text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      Discover <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brand Story Snippet */}
      <section className="py-24 px-4 md:px-8 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[3/4] max-w-md mx-auto w-full">
            <img src="/images/brand-story.png" alt="Close up of fabric texture" className="w-full h-full object-cover" />
            <div className="absolute -bottom-8 -right-8 w-2/3 aspect-square bg-muted -z-10 hidden md:block" />
          </div>
          <div className="order-1 lg:order-2 max-w-lg">
            <h2 className="text-4xl font-serif mb-6 leading-tight">Crafted with Intention</h2>
            <div className="space-y-6 text-foreground/80 font-light leading-relaxed">
              <p>
                Every Lumière dress begins its life in our sunlit Parisian atelier. We source only the finest natural fibers—breathable linens, flowing silks, and soft cottons—from heritage mills across Europe.
              </p>
              <p>
                We believe a dress should feel as beautiful on the inside as it looks on the outside. Our small team of artisans pays meticulous attention to every seam, every hem, and every detail.
              </p>
            </div>
            <Link href="/about" className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b border-primary">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-4 md:px-8 container mx-auto border-t border-border/50">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif mb-2">New Arrivals</h2>
            <p className="text-muted-foreground">The latest additions to our atelier.</p>
          </div>
          <Link href="/shop?sort=newest" className="hidden md:flex items-center gap-2 text-sm uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loadingNew ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            newArrivals?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src="/images/newsletter.png" alt="White rose still life" className="w-full h-full object-cover object-center" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-primary-foreground">Join the Atelier</h2>
          <p className="text-primary-foreground/80 mb-10 font-light text-lg">
            Subscribe to our newsletter for exclusive access to new collections, editorial content, and private sales.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Your email address" 
                        {...field} 
                        className="bg-transparent border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 h-12 rounded-none focus-visible:ring-primary-foreground/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300 text-left" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={subscribeMutation.isPending}
                className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-none uppercase tracking-widest text-xs px-8"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
