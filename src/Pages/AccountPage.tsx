import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../Components/SideNav";
import { supabase } from "../lib/supabaseClient";
import { formatCurrency } from "../lib/format";
import "./AccountPage.css";

/* ---------- types ---------- */

type Product = Record<string, any>;

type OrderItem = {
  id: string;
  quantity: number | null;
  unit_price: number | null;
  Products?: Product | Product[] | null;
};

type Order = {
  id: string;
  reference: string;
  status: string | null;
  created_at: string;
  fulfillment_type: string | null;
  total: number | null;
  order_items?: OrderItem[];
};

type RangeKey = "3m" | "6m" | "12m" | "all";
type StatusFilter = "all" | "pending" | "paid" | "processing" | "delivered" | "cancelled";

/* ---------- config (all routes exist in App.tsx) ---------- */

const ROUTES = {
  login: "/login",
  account: "/account",
  shop: "/shop",
  orderDetails: (reference: string) => `/orders/${reference}`,
};

const RANGES: { key: RangeKey; label: string; months: number | null }[] = [
  { key: "3m", label: "Last 3 months", months: 3 },
  { key: "6m", label: "Last 6 months", months: 6 },
  { key: "12m", label: "Last 12 months", months: 12 },
  { key: "all", label: "All time", months: null },
];

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All orders" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

/* Tried in order; the first one your database accepts is used.
   "Products" (capitalized) is the actual table name. */
const BASE = "id, reference, status, created_at, fulfillment_type, total";
const SELECTS = [
  `${BASE}, order_items(id, quantity, unit_price, Products(*))`,
  `${BASE}, order_items(id, quantity, unit_price)`,
  BASE,
];

/* ---------- helpers ---------- */

const money = formatCurrency;

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const statusOf = (o: Order) => (o.status || "pending").toLowerCase();

const productOf = (item: OrderItem): Product | null =>
  Array.isArray(item.Products) ? item.Products[0] ?? null : item.Products ?? null;

const titleOf = (p: Product | null) =>
  p?.title ?? p?.name ?? p?.product_name ?? "Item";

const imageOf = (p: Product | null): string | null => {
  const raw = p?.image_url ?? p?.image ?? p?.thumbnail ?? p?.images ?? null;
  const first = Array.isArray(raw) ? raw[0] : raw;
  return typeof first === "string" && first ? first : null;
};

/* ---------- page ---------- */

export default function AccountPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>("6m");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [reloadKey, setReloadKey] = useState(0);

  /* Keep content clear of SideNav whether it is fixed or in the flow */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [navOffset, setNavOffset] = useState(0);

  useEffect(() => {
    const nav = wrapperRef.current?.querySelector<HTMLElement>(".side-nav");
    if (!nav) return;
    const measure = () => {
      const fixed = getComputedStyle(nav).position === "fixed";
      setNavOffset(fixed ? nav.getBoundingClientRect().width : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const loadOrders = useCallback(
    async (isCancelled: () => boolean) => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (isCancelled()) return;

      if (!user) {
        navigate(`${ROUTES.login}?redirect=${ROUTES.account}`);
        return;
      }

      const months = RANGES.find((r) => r.key === range)?.months;
      let from: string | null = null;
      if (months) {
        const d = new Date();
        d.setMonth(d.getMonth() - months);
        from = d.toISOString();
      }

      let rows: unknown = null;
      let lastError: { message: string } | null = null;

      for (const columns of SELECTS) {
        let q = supabase
          .from("orders")
          .select(columns)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (from) q = q.gte("created_at", from);

        const res = await q;
        if (!res.error) {
          rows = res.data;
          lastError = null;
          break;
        }
        lastError = res.error;
        console.warn("Orders query failed, trying simpler one:", res.error.message);
      }

      if (isCancelled()) return;

      if (lastError) {
        console.error("Could not load orders:", lastError);
        setError("We couldn't load your orders. Please try again.");
        setOrders([]);
      } else {
        setOrders((rows ?? []) as Order[]);
      }
      setLoading(false);
    },
    [range, navigate]
  );

  useEffect(() => {
    let cancelled = false;
    loadOrders(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadOrders, reloadKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      c[statusOf(o)] = (c[statusOf(o)] ?? 0) + 1;
    });
    return c;
  }, [orders]);

  const visible = useMemo(
    () =>
      statusFilter === "all"
        ? orders
        : orders.filter((o) => statusOf(o) === statusFilter),
    [orders, statusFilter]
  );

  const rangeLabel = RANGES.find((r) => r.key === range)?.label.toLowerCase();

  return (
    <div className="account-page-wrapper" ref={wrapperRef}>
      <SideNav />

      <main className="account-main" style={{ marginLeft: navOffset }}>
        <div className="account-page">
          <header className="account-header">
            <h1>My orders</h1>

            <label className="range-filter">
              <span>Orders placed in</span>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as RangeKey)}
              >
                {RANGES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div className="order-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === t.key}
                className={`order-tab ${statusFilter === t.key ? "active" : ""}`}
                onClick={() => setStatusFilter(t.key)}
              >
                {t.label}
                {orders.length > 0 && (
                  <span className="tab-count">{counts[t.key] ?? 0}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="orders-state">
              <div className="spinner" role="status" aria-label="Loading orders" />
            </div>
          ) : error ? (
            <div className="orders-state">
              <p className="state-title">{error}</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="orders-state">
              <svg
                className="empty-art"
                viewBox="0 0 64 64"
                width="72"
                height="72"
                aria-hidden="true"
              >
                <path d="M8 22 32 10l24 12v26L32 60 8 48z" fill="#e6f6f3" stroke="#1fb5a3" strokeWidth="2" strokeLinejoin="round" />
                <path d="M8 22l24 12 24-12M32 34v26" fill="none" stroke="#1fb5a3" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <p className="state-title">
                {orders.length === 0
                  ? `You haven't placed any orders in the ${rangeLabel}`
                  : `No ${statusFilter} orders`}
              </p>
              <p className="state-text">
                {orders.length === 0
                  ? "Orders you place will show up here so you can follow them."
                  : "Try another status or a longer date range."}
              </p>
              {orders.length === 0 && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => navigate(ROUTES.shop)}
                >
                  Browse listings
                </button>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {visible.map((order) => {
                const status = statusOf(order);
                const items = order.order_items ?? [];

                return (
                  <article className="order-card" key={order.id}>
                    <div className="order-strip">
                      <div className="strip-field">
                        <span>Order placed</span>
                        <strong>{day(order.created_at)}</strong>
                      </div>
                      <div className="strip-field">
                        <span>Total</span>
                        <strong>{money(order.total)}</strong>
                      </div>
                      <div className="strip-field">
                        <span>Delivery</span>
                        <strong>{order.fulfillment_type ?? "-"}</strong>
                      </div>
                      <div className="strip-field strip-ref">
                        <span>Order no.</span>
                        <strong>{order.reference}</strong>
                      </div>
                    </div>

                    <div className="order-body">
                      <div className="order-body-main">
                        <span className={`status-badge ${status}`}>{status}</span>

                        {items.length > 0 ? (
                          <ul className="item-list">
                            {items.map((item) => {
                              const p = productOf(item);
                              const img = imageOf(p);
                              return (
                                <li className="item-row" key={item.id}>
                                  {img ? (
                                    <img src={img} alt="" className="item-thumb" />
                                  ) : (
                                    <span className="item-thumb item-thumb-empty" />
                                  )}
                                  <div>
                                    <p className="item-title">{titleOf(p)}</p>
                                    <p className="item-meta">
                                      Qty {item.quantity ?? 1}
                                      {item.unit_price != null &&
                                        ` · ${money(item.unit_price)} each`}
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="item-meta">Order {order.reference}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="view-details-btn"
                        onClick={() => navigate(ROUTES.orderDetails(order.reference))}
                      >
                        View order
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}