import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { fetchOrderByReference, type OrderView } from "../lib/orders";
import { formatCurrency } from "../lib/format";
import "./OrderDetailPage.css";

export default function OrderDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!reference) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrderByReference(reference).then((result) => {
      if (cancelled) return;
      setOrder(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) {
    return (
      <div className="order-detail-page">
        <Navbar />
        <div className="order-detail-empty">
          <p>Loading order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <Navbar />
        <div className="order-detail-empty">
          <p>We couldn't find that order.</p>
          <button className="back-to-buying-btn" onClick={() => navigate("/buying")}>
            Back to Buying
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Navbar />

      <div className="order-detail-header">
        <button className="order-back-btn" onClick={() => navigate("/buying")}>
          ‹ Back to Buying
        </button>
        <h1>Order Details</h1>
      </div>

      <div className="order-detail-card">
        <div className="order-detail-top">
          <div>
            <span className="order-detail-label">ORDER REFERENCE</span>
            <p className="order-detail-reference">{order.reference}</p>
            <p className="order-detail-date">{order.date}</p>
          </div>
          <span className={`order-detail-status ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>

        <div className="order-detail-items">
          {order.items.map((item) => (
            <div className="order-detail-item" key={item.id}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
              <div className="order-detail-item-info">
                <p className="order-detail-item-name">{item.name}</p>
                <p className="order-detail-item-qty">Qty: {item.quantity}</p>
              </div>
              <span className="order-detail-item-price">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="order-detail-summary">
          <div className="order-detail-row">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="order-detail-row">
            <span>Delivery</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="order-detail-row total">
            <span>Total Paid</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}