import { useEffect, useState } from "react";
import { useParams, useSearch } from "wouter";
import { useListProducts, useGetFacets, useListCollections } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ListProductsSort } from "@workspace/api-client-react";

export default function Shop() {
  const { collection } = useParams();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(searchParams.get("category") || undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(searchParams.get("color") || undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(searchParams.get("size") || undefined);
  const [sort, setSort] = useState<ListProductsSort | undefined>((searchParams.get("sort") as ListProductsSort) || undefined);
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading: loadingProducts } = useListProducts({
    collection: collection,
    category: selectedCategory,
    color: selectedColor,
    size: selectedSize,
    sort: sort,
    page: page,
    pageSize: 12
  });

  const { data: facets, isLoading: loadingFacets } = useGetFacets();
  const { data: collections, isLoading: loadingCollections } = useListCollections();

  useEffect(() => {
    document.title = collection ? `Lumière | ${collection} Collection` : "Lumière | Shop All Dresses";
  }, [collection]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-12 items-start">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-10 sticky top-28">
        <div>
          <h1 className="text-3xl font-serif mb-8 capitalize">{collection ? collection.replace("-", " ") : "All Dresses"}</h1>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-4">Category</h3>
          {loadingFacets ? (
            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          ) : (
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => { setSelectedCategory(undefined); setPage(1); }}
                  className={`text-sm ${!selectedCategory ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'} transition-colors`}
                >
                  All Categories
                </button>
              </li>
              {facets?.categories.map(cat => (
                <li key={cat.value}>
                  <button 
                    onClick={() => { setSelectedCategory(cat.value); setPage(1); }}
                    className={`text-sm ${selectedCategory === cat.value ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'} transition-colors`}
                  >
                    {cat.value} <span className="text-xs text-muted-foreground/60 ml-1">({cat.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Colors */}
        <div>
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-4">Color</h3>
          {loadingFacets ? (
             <div className="flex gap-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-6 w-6 rounded-full" /></div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {facets?.colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => { setSelectedColor(selectedColor === color.value ? undefined : color.value); setPage(1); }}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedColor === color.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:scale-110'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.value}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sizes */}
        <div>
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-4">Size</h3>
          {loadingFacets ? (
             <div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {facets?.sizes.map(size => (
                <button
                  key={size.value}
                  onClick={() => { setSelectedSize(selectedSize === size.value ? undefined : size.value); setPage(1); }}
                  className={`min-w-[2rem] px-2 py-1 text-xs border uppercase transition-colors ${selectedSize === size.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-foreground border-border hover:border-primary'}`}
                >
                  {size.value}
                </button>
              ))}
            </div>
          )}
        </div>

      </aside>

      {/* Product Grid */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <div className="text-sm text-muted-foreground">
            {loadingProducts ? <Skeleton className="h-4 w-24" /> : `${productsData?.total || 0} Products`}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm uppercase tracking-widest text-muted-foreground hidden sm:inline">Sort By</span>
            <select 
              value={sort || ""} 
              onChange={(e) => setSort((e.target.value as ListProductsSort) || undefined)}
              className="text-sm bg-transparent border-none outline-none focus:ring-0 uppercase tracking-widest cursor-pointer"
            >
              <option value="">Featured</option>
              <option value={ListProductsSort.newest}>Newest</option>
              <option value={ListProductsSort.price_asc}>Price: Low to High</option>
              <option value={ListProductsSort.price_desc}>Price: High to Low</option>
              <option value={ListProductsSort.popular}>Popular</option>
            </select>
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : productsData?.items.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-2xl font-serif mb-2">No products found</h3>
            <p className="text-muted-foreground mb-8">Try adjusting your filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSelectedCategory(undefined); setSelectedColor(undefined); setSelectedSize(undefined); }}
              className="text-sm uppercase tracking-widest pb-1 border-b border-primary hover:text-primary transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
              {productsData?.items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 pt-8 border-t border-border">
                {Array.from({ length: productsData.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center text-sm transition-colors ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
