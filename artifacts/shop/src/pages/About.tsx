import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function About() {
  useEffect(() => {
    document.title = "Lumière | Our Story";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-muted/50">
          <img 
            src="/images/about.png" 
            alt="Moodboard on wooden table" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="relative z-10 text-center max-w-2xl px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif text-primary mb-6"
          >
            The Atelier
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/90 font-light"
          >
            Where slow fashion meets modern elegance.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="prose prose-lg prose-headings:font-serif prose-headings:text-primary prose-p:text-muted-foreground prose-p:font-light prose-p:leading-relaxed mx-auto text-center md:text-left">
            <p className="text-xl md:text-2xl text-foreground !leading-snug mb-12">
              Lumière was born from a simple desire: to create the perfect dress. Not just perfect in silhouette, but perfect in feeling, construction, and origin.
            </p>
            
            <p>
              Founded in 2023 in a small apartment overlooking the Seine, we set out to build an antidote to disposable fashion. We believe a dress should not be bought for a single event, but chosen as a companion for life's many moments.
            </p>

            <h2 className="text-3xl mt-16 mb-8 text-center md:text-left">Our Philosophy</h2>
            
            <p>
              We operate on a model of quiet confidence. Our designs do not shout; they whisper. We rely on the drape of heavy silk, the breathability of fine European linen, and the structural integrity of considered tailoring. 
            </p>
            
            <p>
              Every piece in our collection is produced in small batches by skilled artisans. We source our fabrics from family-owned mills in Italy and France, prioritizing natural, biodegradable fibers. We do not chase trends. Instead, we refine classics until they feel entirely new.
            </p>

            <div className="my-16 flex justify-center">
              <div className="w-16 h-px bg-primary/20"></div>
            </div>

            <p className="italic text-center">
              "We dress the woman who knows herself. Who dresses for her own pleasure, whose confidence is quiet, and whose style is effortless."
            </p>
          </div>

          <div className="mt-24 text-center">
            <Link 
              href="/shop" 
              className="inline-block bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
