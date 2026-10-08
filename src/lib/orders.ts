import { supabase } from "./supabaseClient";

// Fetches orders (scoped to the signed-in user) for the Confirmation,
// Order Detail, and "My Orders" pages.

export interface OrderItemView {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
  price: number;
}

export interface OrderView {
  id: string;
  reference: string;
  status: string;
  date: string;
  fulfillmentType: string | null;
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: OrderItemView[];
}

const BASE =
  "id, reference, status, created_at, fulfillment_type, total, delivery_fee";

// "Products" (capitalized) is the actual table name. Tried in order;
// the first one the schema cache accepts is used.
const SELECTS = [
  `${BASE}, order_items(id, quantity, unit_price, Products(*))`,
  `${BASE}, order_items(id, quantity, unit_price)`,
  BASE,
];

function productOf(item: any): Record<string, any> | null {
  const p = item?.Products;
  return Array.isArray(p) ? p[0] ?? null : p ?? null;
}

function mapOrderRow(row: any): OrderView {
  const items: OrderItemView[] = (row.order_items ?? []).map((item: any) => {
    const product = productOf(item);
    return {
      id: item.id,
      name: product?.name ?? "Item",
      imageUrl: product?.image_url ?? null,
      category: product?.category ?? null,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.unit_price ?? 0),
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = Number(row.delivery_fee ?? 0);

  return {
    id: row.id,
    reference: row.reference,
    status: row.status ?? "pending",
    date: new Date(row.created_at).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    fulfillmentType: row.fulfillment_type ?? null,
    deliveryFee,
    subtotal,
    total: Number(row.total ?? subtotal + deliveryFee),
    items,
  };
}

export async function fetchOrderByReference(
  reference: string
): Promise<OrderView | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let row: any = null;

  for (const columns of SELECTS) {
    const { data, error } = await supabase
      .from("orders")
      .select(columns)
      .eq("user_id", user.id)
      .eq("reference", reference)
      .maybeSingle();

    if (!error) {
      row = data;
      break;
    }

    console.warn("Order query failed, trying simpler one:", error.message);
  }

  if (!row) return null;

  return mapOrderRow(row);
}

export async function fetchMyOrders(): Promise<OrderView[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let rows: any[] | null = null;

  for (const columns of SELECTS) {
    const { data, error } = await supabase
      .from("orders")
      .select(columns)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      rows = data ?? [];
      break;
    }

    console.warn("Orders query failed, trying simpler one:", error.message);
  }

  return (rows ?? []).map(mapOrderRow);
}
