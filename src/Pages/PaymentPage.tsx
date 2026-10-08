import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";
import CheckoutSteps from "../Components/CheckoutSteps";
import { useCart } from "../Components/useCart";
import { isValidProductId } from "../Components/CartContext.types";
import { supabase } from "../lib/supabaseClient";

import {
  clearCheckoutDetails,
  feeFor,
  loadCheckoutDetails,
  makeReference,
} from "../lib/checkout";
import { formatCurrency } from "../lib/format";

import "./PaymentPage.css";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const details = loadCheckoutDetails();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<
    string | null
  >(null);

  // Prevents the guard effect below from redirecting back to
  // /checkout/details once an order has gone through and
  // clearCheckoutDetails() has run.
  const orderPlacedRef = useRef(false);

  // --------------------------------------------------
  // Check login and checkout details
  // --------------------------------------------------

  useEffect(() => {
    if (orderPlacedRef.current) return;

    const checkCheckoutAccess = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Authentication check failed:", error);
        return;
      }

      if (!user) {
        navigate("/login?redirect=/checkout/details");
        return;
      }

      if (!details) {
        navigate("/checkout/details");
      }
    };

    checkCheckoutAccess();
  }, [navigate, details]);

  // --------------------------------------------------
  // Order totals
  // --------------------------------------------------

  const fulfillmentType =
    details?.fulfillmentType ?? "delivery";

  const delivery = feeFor(
    fulfillmentType,
    items.length
  );

  const total = subtotal + delivery;

  // --------------------------------------------------
  // Card formatting
  // --------------------------------------------------

  const formatCardNumber = (value: string) => {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return digitsOnly
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value: string) => {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (digitsOnly.length >= 3) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(
        2
      )}`;
    }

    return digitsOnly;
  };

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validate = () => {
    const newErrors: {
      [key: string]: string;
    } = {};

    const rawCardNumber =
      cardNumber.replace(/\s/g, "");

    if (!/^\d{16}$/.test(rawCardNumber)) {
      newErrors.cardNumber =
        "Card number must be 16 digits.";
    }

    // Correct MM/YY validation
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry =
        "Use MM/YY format, for example 11/28.";
    } else {
      const [month, year] = expiry
        .split("/")
        .map(Number);

      const now = new Date();

      const currentYear =
        now.getFullYear() % 100;

      const currentMonth =
        now.getMonth() + 1;

      if (
        year < currentYear ||
        (year === currentYear &&
          month < currentMonth)
      ) {
        newErrors.expiry =
          "Card has expired.";
      }
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv =
        "CVV must be 3 or 4 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // Place order
  // --------------------------------------------------

  const handlePayNow = async () => {
    setSubmitError(null);

    // Prevent empty-cart checkout
    if (items.length === 0) {
      setSubmitError(
        "Your cart is empty. Please add an item before placing an order."
      );
      return;
    }

    // Prevent double clicking
    if (submitting) {
      return;
    }

    // Validate card fields
    if (!validate()) {
      return;
    }

    // Make sure checkout details exist
    if (!details) {
      setSubmitError(
        "Your checkout details are missing. Please go back and complete the details page."
      );

      navigate("/checkout/details");
      return;
    }

    setSubmitting(true);

    try {
      // --------------------------------------------------
      // 1. Get logged-in user
      // --------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User lookup failed:", userError);

        throw new Error(
          `Could not verify your account: ${userError.message}`
        );
      }

      if (!user) {
        navigate(
          "/login?redirect=/checkout/details"
        );
        return;
      }

      // --------------------------------------------------
      // 2. Create order reference
      // --------------------------------------------------

      const reference = makeReference();

      const address = [
        details.address,
        details.city,
        details.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      // --------------------------------------------------
      // 3. Create pending order
      // --------------------------------------------------

      const { data: order, error: orderError } =
        await supabase
          .from("orders")
          .insert({
            reference,
            user_id: user.id,
            status: "pending",
            fulfillment_type:
              details.fulfillmentType,
            total,
            delivery_fee: delivery,
            contact_name: details.fullName,
            contact_phone: details.phone,
            contact_email: details.email,
            delivery_address:
              address || null,
          })
          .select("id")
          .single();

      if (orderError) {
        console.error("Order insert failed:", orderError);

        throw new Error(
          `Could not create your order: ${orderError.message}`
        );
      }

      if (!order) {
        throw new Error(
          "The order was not created. Please try again."
        );
      }

      // --------------------------------------------------
      // 4. Add products to order_items
      // --------------------------------------------------

      // Products.id is a numeric bigint. Cart items added from
      // stale/demo data (non-numeric ids) can't be purchased — catch
      // that here with a clear message instead of letting Postgres
      // reject the insert. (The cart itself filters these out on
      // load now, but this is a last line of defense.)
      const invalidItems = items.filter(
        (item) => !isValidProductId(item.id)
      );

      if (invalidItems.length > 0) {
        console.error("Invalid product id(s) in cart:", invalidItems);

        await supabase.from("orders").delete().eq("id", order.id);

        throw new Error(
          `"${invalidItems[0].name}" is no longer available for purchase. Please remove it from your cart and try again.`
        );
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const {
        error: orderItemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) {
        console.error("order_items insert failed:", orderItemsError);

        // Try to remove incomplete order
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        throw new Error(
          `Could not add the products to your order: ${orderItemsError.message}`
        );
      }

      // --------------------------------------------------
      // 5. Simulated payment
      // --------------------------------------------------
      //
      // IMPORTANT:
      // This is only for your demonstration/test system.
      //
      // A real PayFast integration should NOT mark the
      // order as paid from the browser. PayFast should
      // confirm the payment through a server-side callback.
      //

      const {
        error: paidError,
      } = await supabase
        .from("orders")
        .update({
          status: "paid",
        })
        .eq("id", order.id);

      if (paidError) {
        console.error("Payment status update failed:", paidError);

        throw new Error(
          `Your order was created, but we could not update its payment status: ${paidError.message}`
        );
      }

      // --------------------------------------------------
      // 6. Success
      // --------------------------------------------------

      orderPlacedRef.current = true;

      clearCart();
      clearCheckoutDetails();

      navigate(
        "/checkout/confirmation",
        {
          state: {
            reference,
          },
        }
      );
    } catch (err) {
      console.error("Checkout failed:", err);

      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError(
          "We couldn't place your order. You have not been charged. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <>
      <Navbar showLinks={false} />

      <div className="payment-page">
        <p className="step-label">
          STEP 2 OF 3
        </p>

        <h2>Secure Payment</h2>

        <CheckoutSteps currentStep={2} />

        <div className="payfast-card">
          {/* PayFast Header */}
          <div className="payfast-header">
            <span className="payfast-icon">
              💳
            </span>

            <div>
              <p className="payfast-title">
                PayFast
              </p>

              <p className="payfast-subtitle">
                Secure checkout gateway
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="amount-due-section">
            <p className="amount-label">
              AMOUNT DUE
            </p>

            <p className="amount-value">
              {formatCurrency(total)}
            </p>

            <p className="amount-subtext">
              {fulfillmentType === "delivery"
                ? "Delivery to your address"
                : "Collection from seller"}
            </p>
          </div>

          {/* Order Summary */}
          <div className="order-line-box">
            {items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div
                  className="order-line"
                  key={item.id}
                >
                  <span>
                    {item.name} x{" "}
                    {item.quantity}
                  </span>

                  <span>
                    {formatCurrency(
                      item.price *
                        item.quantity
                    )}
                  </span>
                </div>
              ))
            )}

            {delivery > 0 && (
              <div className="order-line">
                <span>Delivery</span>

                <span>
                  {formatCurrency(delivery)}
                </span>
              </div>
            )}

            <div className="order-line total">
              <span>Total</span>

              <span>
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Card Number */}
          <label htmlFor="cardNumber">
            CARD NUMBER
          </label>

          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={cardNumber}
            onChange={(e) =>
              setCardNumber(
                formatCardNumber(
                  e.target.value
                )
              )
            }
            placeholder="4111 1111 1111 1111"
            maxLength={19}
          />

          {errors.cardNumber && (
            <p className="field-error">
              {errors.cardNumber}
            </p>
          )}

          {/* Expiry + CVV */}
          <div className="form-row">
            <div>
              <label htmlFor="expiry">
                EXPIRY DATE
              </label>

              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(e) =>
                  setExpiry(
                    formatExpiry(
                      e.target.value
                    )
                  )
                }
                placeholder="11/28"
                maxLength={5}
              />

              {errors.expiry && (
                <p className="field-error">
                  {errors.expiry}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cvv">
                CVV
              </label>

              <input
                id="cvv"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) =>
                  setCvv(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4)
                  )
                }
                placeholder="***"
                maxLength={4}
              />

              {errors.cvv && (
                <p className="field-error">
                  {errors.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Database / checkout error */}
          {submitError && (
            <div
              className="payment-error"
              role="alert"
            >
              <strong>
                We couldn't place your order.
              </strong>

              <span>
                {submitError}
              </span>

              <small>
                You have not been charged.
              </small>
            </div>
          )}

          {/* Pay button */}
          <button
            type="button"
            className="pay-now-btn"
            onClick={handlePayNow}
            disabled={
              items.length === 0 ||
              submitting
            }
          >
            {submitting
              ? "Processing..."
              : `🔒 Pay Now - ${formatCurrency(
                  total
                )}`}
          </button>

          <p className="simulated-note">
            Simulated payment for demonstration
            purposes only
          </p>
        </div>
      </div>
    </>
  );
}
