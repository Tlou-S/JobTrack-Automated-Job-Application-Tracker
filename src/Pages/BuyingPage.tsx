import { Navigate } from "react-router-dom";

// Redirects to the main "My Orders" page. Route kept so existing
// links (SideNav, ProfilePage) keep working.
export default function BuyingPage() {
  return <Navigate to="/account" replace />;
}
