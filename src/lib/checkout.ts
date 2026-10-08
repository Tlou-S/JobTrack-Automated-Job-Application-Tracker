/* src/lib/checkout.ts
 * One delivery fee for the whole checkout, and the buyer's details
 * carried from the Details step to the Payment step (survives refresh).
 */

export const DELIVERY_FEE = 50; // change here and both pages follow

export type FulfillmentType = "delivery" | "collection";

export type CheckoutDetails = {
  fullName: string;
  phone: string;
  email: string;
  fulfillmentType: FulfillmentType;
  address: string;
  city: string;
  postalCode: string;
};

const KEY = "unitrade_checkout_details";

export const feeFor = (type: FulfillmentType, itemCount: number) =>
  type === "delivery" && itemCount > 0 ? DELIVERY_FEE : 0;

export const saveCheckoutDetails = (details: CheckoutDetails) =>
  sessionStorage.setItem(KEY, JSON.stringify(details));

export const loadCheckoutDetails = (): CheckoutDetails | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckoutDetails) : null;
  } catch {
    return null;
  }
};

export const clearCheckoutDetails = () => sessionStorage.removeItem(KEY);

export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const isValidPhone = (v: string) =>
  /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, ""));

export const makeReference = () =>
  `UT-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;