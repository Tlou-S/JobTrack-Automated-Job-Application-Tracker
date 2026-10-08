import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import CheckoutSteps from "../Components/CheckoutSteps";
import OrderSummary from "../Components/OrderSummary";
import { useCart } from "../Components/useCart";
import { supabase } from "../lib/supabaseClient";
import {
  feeFor,
  isValidEmail,
  isValidPhone,
  loadCheckoutDetails,
  saveCheckoutDetails,
  type FulfillmentType,
} from "../lib/checkout";
import "./DetailsPage.css";

type Errors = Partial<Record<"fullName" | "phone" | "email" | "address" | "city", string>>;

export default function DetailsPage() {
  const navigate = useNavigate();
  const { items } = useCart();

  const saved = loadCheckoutDetails();
  const [fullName, setFullName] = useState(saved?.fullName ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    saved?.fulfillmentType ?? "delivery"
  );
  const [address, setAddress] = useState(saved?.address ?? "");
  const [city, setCity] = useState(saved?.city ?? "");
  const [postalCode, setPostalCode] = useState(saved?.postalCode ?? "");
  const [errors, setErrors] = useState<Errors>({});

  // Require login, then prefill anything still empty
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        navigate("/login?redirect=/checkout/details");
        return;
      }
      setEmail((prev) => prev || user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled || !profile) return;
      setFullName((prev) => prev || profile.full_name || profile.name || "");
      setPhone((prev) => prev || profile.phone || "");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const deliveryFee = feeFor(fulfillmentType, items.length);

  const validate = () => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Enter your full name";
    if (!isValidPhone(phone)) e.phone = "Enter a valid SA number, e.g. 0821234567";
    if (!isValidEmail(email)) e.email = "Enter a valid email address";
    if (fulfillmentType === "delivery") {
      if (!address.trim()) e.address = "Enter your delivery address";
      if (!city.trim()) e.city = "Enter your city or suburb";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (items.length === 0) return;
    if (!validate()) return;
    saveCheckoutDetails({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      fulfillmentType,
      address: fulfillmentType === "delivery" ? address.trim() : "",
      city: fulfillmentType === "delivery" ? city.trim() : "",
      postalCode: fulfillmentType === "delivery" ? postalCode.trim() : "",
    });
    navigate("/checkout/payment");
  };

  const orderSummaryItems = items.map((item) => ({
    name: item.name,
    specs: item.category ?? "",
    price: item.price * item.quantity,
    image: item.imageUrl ?? "",
  }));

  return (
    <>
      <Navbar showLinks={false} />
      <div className="checkout-page">
        <p className="secure-label">SECURE CHECKOUT</p>
        <h2>Your Details</h2>

        <CheckoutSteps currentStep={1} />

        <div className="checkout-content">
          <div className="details-form">
            <p className="section-label">CONTACT INFORMATION</p>

            <label htmlFor="fullName">FULL NAME</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sipho Paul Modise"
            />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}

            <div className="form-row">
              <div>
                <label htmlFor="phone">PHONE NUMBER</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0821234567"
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paulmodise12@gmail.com"
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
            </div>

            <p className="section-label">HOW DO YOU WANT YOUR ORDER?</p>
            <div className="fulfillment-options">
              <label className={`fulfillment-option ${fulfillmentType === "delivery" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === "delivery"}
                  onChange={() => setFulfillmentType("delivery")}
                />
                <span>
                  <strong>Delivery</strong>
                  <small>Brought to your address</small>
                </span>
              </label>
              <label className={`fulfillment-option ${fulfillmentType === "collection" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === "collection"}
                  onChange={() => setFulfillmentType("collection")}
                />
                <span>
                  <strong>Collection</strong>
                  <small>Meet the seller, no delivery fee</small>
                </span>
              </label>
            </div>

            {fulfillmentType === "delivery" && (
              <>
                <label htmlFor="address">STREET ADDRESS</label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 Main Road"
                />
                {errors.address && <p className="field-error">{errors.address}</p>}

                <div className="form-row">
                  <div>
                    <label htmlFor="city">CITY / SUBURB</label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bellville"
                    />
                    {errors.city && <p className="field-error">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="postal">POSTAL CODE</label>
                    <input
                      id="postal"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="7530"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <OrderSummary items={orderSummaryItems} deliveryFee={deliveryFee} />
        </div>

        <button className="continue-btn" onClick={handleContinue} disabled={items.length === 0}>
          Continue to Payment →
        </button>
      </div>
    </>
  );
}