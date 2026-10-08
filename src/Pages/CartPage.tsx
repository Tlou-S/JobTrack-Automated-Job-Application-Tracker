import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useCart } from "../Components/useCart";
import { useToast } from "../Components/useToast";
import { formatCurrency } from "../lib/format";
import "./CartPage.css";

const DELIVERY_FEE = 50;

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { showToast } = useToast();

  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const discount = 0;
  const total = subtotal - discount + delivery;

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    showToast(`Removed "${name}" from cart`, "info");
  };

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-table-wrapper">
          {items.length === 0 ? (
            <p className="empty-cart">
              Your cart is empty. Browse the marketplace to add items.
            </p>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th className="col-item">Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="col-item">
                      <div className="item-cell">
                        <div className="item-thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : null}
                        </div>
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          {item.seller && (
                            <p className="item-seller">
                              Sold by: {item.seller}
                            </p>
                          )}
                          {item.category && (
                            <p className="item-meta">
                              Category: {item.category}
                            </p>
                          )}
                          {item.location && (
                            <p className="item-meta">
                              Location: {item.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>
                      <div className="qty-control">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatCurrency(item.price * item.quantity)}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(item.id, item.name)}
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="cart-bottom">
          <div className="coupon-card">
            <h2 className="card-heading">Have a Coupon?</h2>
            <div className="coupon-row">
              <input type="text" placeholder="Enter Coupon code" />
              <button className="apply-btn">Apply</button>
            </div>
          </div>

          <div className="summary-card">
            <h2 className="card-heading">Cart Summary</h2>
            <div className="summary-row">
              <span>
                Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
              </span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{formatCurrency(discount)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{formatCurrency(delivery)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
