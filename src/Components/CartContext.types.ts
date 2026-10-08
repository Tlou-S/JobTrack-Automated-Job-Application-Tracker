export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  seller?: string;
  category?: string;
  location?: string;
  imageUrl?: string;
}

export const CART_STORAGE_KEY = "unitrade_cart";

// Products.id is a numeric (bigint) primary key in Supabase.
const NUMERIC_ID_PATTERN = /^\d+$/;

export function isValidProductId(id: string): boolean {
  return NUMERIC_ID_PATTERN.test(id);
}

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
    return parsed.filter((item) => isValidProductId(item.id));
  } catch {
    return [];
  }
}
