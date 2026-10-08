import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import SettingsPage from "./Pages/SettingsPage";

import ContactPage from "./Pages/ContactPage";
import BulletinBoardPage from "./Pages/BulletinBoardPage";

import NotificationsPage from "./Pages/NotificationsPage";
import MessagesPage from "./Pages/MessagesPage";
import ServicesPage from "./Pages/ServicesPage";
import AnnouncementsPage from "./Pages/AnnouncementsPage";
import EventsPage from "./Pages/EventsPage";

import OTPPage from "./Pages/OTPPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import ProfilePage from "./Pages/ProfilePage";
import TrackerPage from "./Pages/JobTrackerPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* JobTrack workspace. Legacy paths remain valid for existing links. */}
        <Route path="/" element={<TrackerPage view="dashboard" />} />
        <Route path="/home" element={<TrackerPage view="dashboard" />} />
        <Route path="/dashboard" element={<TrackerPage view="dashboard" />} />
        <Route path="/applications" element={<TrackerPage view="applications" />} />
        <Route path="/applications/:id" element={<TrackerPage view="detail" />} />
        <Route path="/shop" element={<TrackerPage view="applications" />} />
        <Route path="/companies" element={<TrackerPage view="companies" />} />
        <Route path="/interviews" element={<TrackerPage view="interviews" />} />
        <Route path="/resumes" element={<TrackerPage view="resumes" />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Account */}
        <Route path="/account" element={<TrackerPage view="applications" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Marketplace */}
        <Route path="/product-details/:id" element={<TrackerPage view="detail" />} />
        <Route path="/categories" element={<TrackerPage view="applications" />} />
        <Route path="/list-product" element={<TrackerPage view="applications" />} />
        <Route path="/my-listings" element={<TrackerPage view="applications" />} />
        <Route path="/saved" element={<TrackerPage view="applications" />} />
        <Route path="/buying" element={<TrackerPage view="applications" />} />
        <Route path="/orders/:reference" element={<TrackerPage view="applications" />} />

        {/* Cart / Checkout */}
        <Route path="/cart" element={<TrackerPage view="applications" />} />
        <Route path="/checkout" element={<TrackerPage view="applications" />} />
        <Route path="/checkout/details" element={<TrackerPage view="applications" />} />
        <Route path="/checkout/payment" element={<TrackerPage view="applications" />} />
        <Route
          path="/checkout/confirmation"
          element={<TrackerPage view="applications" />}
        />

        {/* Community */}
        <Route path="/bulletin-board" element={<BulletinBoardPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Reviews */}
        <Route path="/ratings-reviews" element={<TrackerPage view="applications" />} />

        {/* Optional old URL */}
        <Route
          path="/ratingsreviews"
          element={<TrackerPage view="applications" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;