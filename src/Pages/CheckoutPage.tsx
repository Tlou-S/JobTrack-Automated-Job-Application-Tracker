import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useCart } from "../Components/useCart";
import { supabase } from "../lib/supabaseClient";
import {
  DELIVERY_FEE,
  isValidEmail,
  isValidPhone,
  loadCheckoutDetails,
  saveCheckoutDetails,
} from "../lib/checkout";
import { formatCurrency } from "../lib/format";
import "./CheckoutPage.css";

interface ShippingInfo {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  deliveryLocation: string;
}

interface FormErrors {
  fullName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  deliveryLocation?: string;
}

type PaymentMethod = "payfast" | "card" | "other";

const DISCOUNT = 0;

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();

  const saved = loadCheckoutDetails();
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: saved?.fullName ?? "",
    emailAddress: saved?.email ?? "",
    phoneNumber: saved?.phone ?? "",
    deliveryLocation: saved?.address ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("payfast");

  // Require login and prefill the email
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;

      if (!user) {
        navigate("/login?redirect=/checkout");
        return;
      }

      setShipping((prev) => ({
        ...prev,
        emailAddress: prev.emailAddress || user.email || "",
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery - DISCOUNT;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setShipping((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear the general message once the user starts correcting the form
    if (formMessage) {
      setFormMessage(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!shipping.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!shipping.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required.";
    } else if (!isValidEmail(shipping.emailAddress)) {
      newErrors.emailAddress = "Enter a valid email address.";
    }

    if (!shipping.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!isValidPhone(shipping.phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid SA number, e.g. 0821234567.";
    }

    if (!shipping.deliveryLocation.trim()) {
      newErrors.deliveryLocation = "Delivery location is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    setFormMessage(null);

    // Give feedback instead of silently doing nothing
    if (items.length === 0) {
      setFormMessage(
        "Your cart is empty. Add an item before checking out."
      );
      return;
    }

    // Validate the form and scroll to the first invalid field
    if (!validate()) {
      setFormMessage("Please fix the highlighted fields above.");

      requestAnimationFrame(() => {
        document
          .querySelector(".co-input-error")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });

      return;
    }

    // Same storage the Details and Payment pages read,
    // so nothing is asked twice
    const existing = loadCheckoutDetails();

    saveCheckoutDetails({
      fullName: shipping.fullName.trim(),
      phone: shipping.phoneNumber.trim(),
      email: shipping.emailAddress.trim(),
      fulfillmentType: existing?.fulfillmentType ?? "delivery",
      address: shipping.deliveryLocation.trim(),
      city: existing?.city ?? "",
      postalCode: existing?.postalCode ?? "",
    });

    navigate("/checkout/details");
  };

  return (
    <div className="co-page">
      <Navbar />

      <main className="co-main">
        <h1 className="co-title">Checkout</h1>

        <ol className="co-steps">
          <li className="co-step co-step-active">
            <span className="co-step-circle">1</span>
            <span className="co-step-label">Details</span>
          </li>

          <li className="co-step-connector" />

          <li className="co-step">
            <span className="co-step-circle">2</span>
            <span className="co-step-label">Payment</span>
          </li>

          <li className="co-step-connector" />

          <li className="co-step">
            <span className="co-step-circle">3</span>
            <span className="co-step-label">Confirmation</span>
          </li>
        </ol>

        <div className="co-columns">
          <div className="co-left">
            <section className="co-card">
              <h2 className="co-heading">1. Shipping Information</h2>

              <div className="co-field">
                <label htmlFor="fullName">Full Name</label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={shipping.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "co-input-error" : ""}
                />

                {errors.fullName && (
                  <span className="co-error">{errors.fullName}</span>
                )}
              </div>

              <div className="co-field">
                <label htmlFor="emailAddress">Email Address</label>

                <input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  value={shipping.emailAddress}
                  onChange={handleChange}
                  className={
                    errors.emailAddress ? "co-input-error" : ""
                  }
                />

                {errors.emailAddress && (
                  <span className="co-error">
                    {errors.emailAddress}
                  </span>
                )}
              </div>

              <div className="co-field">
                <label htmlFor="phoneNumber">Phone Number</label>

                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0821234567"
                  value={shipping.phoneNumber}
                  onChange={handleChange}
                  className={
                    errors.phoneNumber ? "co-input-error" : ""
                  }
                />

                {errors.phoneNumber && (
                  <span className="co-error">
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="co-field">
                <label htmlFor="deliveryLocation">
                  Delivery Location
                </label>

                <input
                  id="deliveryLocation"
                  name="deliveryLocation"
                  type="text"
                  placeholder="Street address"
                  value={shipping.deliveryLocation}
                  onChange={handleChange}
                  className={
                    errors.deliveryLocation
                      ? "co-input-error"
                      : ""
                  }
                />

                {errors.deliveryLocation && (
                  <span className="co-error">
                    {errors.deliveryLocation}
                  </span>
                )}
              </div>
            </section>

            <section className="co-card">
              <h2 className="co-heading">2. Payment Method</h2>

              <div className="co-payment-options">
                {(
                  [
                    ["payfast", "PayFast (Cards)"],
                    ["card", "Debit / Credit Card"],
                    ["other", "Other Payment Methods"],
                  ] as [PaymentMethod, string][]
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`co-payment-option ${
                      paymentMethod === value ? "co-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                    />

                    <span className="co-swatch" />

                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {formMessage && (
                <p className="co-form-message" role="alert">
                  {formMessage}
                </p>
              )}

              <button
                className="co-continue"
                onClick={handleContinue}
              >
                Continue to Details
              </button>
            </section>
          </div>

          <aside className="co-right">
            <div className="co-card">
              <h2 className="co-heading">Order Summary</h2>

              {items.length === 0 ? (
                <p className="co-empty">
                  No items in your cart.
                </p>
              ) : (
                items.map((item) => (
                  <div className="co-sum-item" key={item.id}>
                    <div className="co-sum-thumb">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      ) : null}
                    </div>

                    <div className="co-sum-info">
                      <p className="co-sum-name">{item.name}</p>

                      <p className="co-sum-qty">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="co-sum-price">
                      {formatCurrency(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                ))
              )}

              <div className="co-divider" />

              <div className="co-sum-row">
                <span>
                  Subtotal ({items.length} item
                  {items.length !== 1 ? "s" : ""})
                </span>

                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="co-sum-row">
                <span>Delivery</span>
                <span>{formatCurrency(delivery)}</span>
              </div>

              <div className="co-sum-row">
                <span>Discount</span>
                <span>{formatCurrency(-DISCOUNT)}</span>
              </div>

              <div className="co-divider" />

              <div className="co-sum-row co-total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="co-secure">
                <span className="co-lock">🔒</span>

                <p className="co-secure-title">
                  Secure Checkout
                </p>

                <p className="co-secure-sub">
                  Your payment is encrypted and secure.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;

