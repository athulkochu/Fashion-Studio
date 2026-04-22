import type { Product } from "@workspace/db";

export function serializeProduct(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
    currency: p.currency,
    category: p.category,
    collection: p.collection,
    color: p.color,
    colorHex: p.colorHex,
    sizes: p.sizes,
    images: p.images,
    material: p.material,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
  };
}

export function serializeProductDetail(p: Product) {
  return {
    ...serializeProduct(p),
    details: p.details,
    careInstructions: p.careInstructions,
    sizeGuide: p.sizeGuide,
  };
}
