// Shared product shape used across Home, Shop, Saved, and Landing.
// Map a Supabase "Products" row to this with mapProductRow() in
// src/lib/products.ts.
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  location: string;
  description?: string;
  brand?: string;
  condition?: string;
  available?: number;
}
