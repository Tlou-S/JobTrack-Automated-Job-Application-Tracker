import type { Product } from "../types/product";

// Maps a raw Supabase "Products" row to the shared Product shape.
export function mapProductRow(row: any): Product {
  const location = [row.city, row.province].filter(Boolean).join(", ");

  return {
    id: String(row.id),
    name: row.name ?? "",
    price: Number(row.price ?? 0),
    imageUrl: row.image_url ?? "",
    category: row.category ?? "",
    location,
    description: row.description ?? undefined,
    brand: row.brand ?? undefined,
    condition: row.condition ?? undefined,
    available: row.quantity ?? undefined,
  };
}
