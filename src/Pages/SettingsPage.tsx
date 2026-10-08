import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import SideNav from "../Components/SideNav";

import "./SettingsPage.css";

import {
  FaArrowLeft,
  FaBell,
  FaCog,
  FaUser,
  FaShieldAlt,
  FaMoon,
  FaChevronRight,
  FaSignOutAlt,
  FaTrash,
  FaSave,
} from "react-icons/fa";
/*
 * Use the SAME profile image as the Profile page.
 *
 * Your Profile page already uses:
 * /Sipho.png
 *
 * Make sure the file exists here:
 *
 * public/Sipho.png
 */
const SIPHO_PROFILE_IMAGE = "/Sipho.png";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  /*
   * =========================================================
   * SETTINGS STATE
   * =========================================================
   */

  const [pushNotifications, setPushNotifications] =
    useState<boolean>(true);

  const [messages, setMessages] =
    useState<boolean>(true);

  const [emailNotifications, setEmailNotifications] =
    useState<boolean>(true);

  const [jobAlerts, setJobAlerts] =
    useState<boolean>(false);

  const [darkMode, setDarkMode] =
    useState<boolean>(false);

  const [language, setLanguage] =
    useState<string>("English");

  const [profileImageError, setProfileImageError] =
    useState<boolean>(false);

  /*
   * =========================================================
   * HANDLERS
   * =========================================================
   */

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSave = () => {
    window.alert(
      "Your settings have been saved successfully."
    );
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (confirmed) {
      navigate("/login");
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your JobTrack account? This action cannot be undone."
    );

    if (confirmed) {
      window.alert(
        "Account deletion would be processed here."
      );
    }
  };

  /*
   * =========================================================
   * TOGGLE COMPONENT
   * =========================================================
   */

  const Toggle = ({
    enabled,
    onToggle,
    label,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
  }) => {
    return (
      <button
        type="button"
        className={`settings-toggle ${
          enabled ? "settings-toggle-on" : ""
        }`}
        onClick={onToggle}
        aria-label={label}
        aria-pressed={enabled}
      >
        <span className="settings-toggle-knob" />
      </button>
    );
  };

  /*
   * =========================================================
   * PROFILE IMAGE
   * =========================================================
   */

  const renderProfileImage = () => {
    if (!profileImageError) {
      return (
        <img
          src={SIPHO_PROFILE_IMAGE}
          alt="Sipho Khubeka"
          className="settings-avatar-image"
          onError={() => setProfileImageError(true)}
        />
      );
    }

    return (
      <span className="settings-avatar-fallback">
        S
      </span>
    );
  };

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div
      className={`settings-page ${
        darkMode ? "settings-dark-mode" : ""
      }`}
    >
      {/* =====================================================
          SIDE NAVIGATION
      ===================================================== */}

      <SideNav />

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="settings-page-content">
        <main className="settings-main">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="settings-topbar">

            {/* LEFT */}
            <button
              type="button"
              className="settings-back-button"
              onClick={handleBack}
              aria-label="Go back"
            >
              <FaArrowLeft />
              <span>Settings</span>
            </button>

            {/* RIGHT */}
            <div className="settings-top-actions">

              {/* NOTIFICATIONS */}

              <button
                type="button"
                className="settings-top-icon"
                onClick={handleNotifications}
                aria-label="Notifications"
              >
                <FaBell />

                <span className="settings-notification-dot" />
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                className="settings-top-icon settings-top-icon-active"
                onClick={handleSettings}
                aria-label="Settings"
              >
                <FaCog />
              </button>

              {/* PROFILE */}

              <button
                type="button"
                className="settings-avatar"
                onClick={handleProfile}
                aria-label="Open profile"
              >
                {renderProfileImage()}
              </button>

            </div>
          </header>

          {/* =================================================
              SETTINGS CONTENT
          ================================================= */}

          <div className="settings-content">

            {/* =================================================
                GENERAL
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <FaCog />
                </div>

                <div>
                  <h2>General</h2>

                  <p>
                    Manage your general JobTrack preferences.
                  </p>
                </div>

              </div>

              {/* LANGUAGE */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>Language</strong>

                  <span>
                    Choose the language used by your JobTrack
                    account.
                  </span>
                </div>

                <select
                  className="settings-language-select"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  aria-label="Select language"
                >
                  <option value="English">
                    English
                  </option>

                  <option value="Afrikaans">
                    Afrikaans
                  </option>

                  <option value="isiXhosa">
                    isiXhosa
                  </option>

                  <option value="isiZulu">
                    isiZulu
                  </option>
                </select>

              </div>

              {/* APPLICATION UPDATES */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>
                    Application Updates
                  </strong>

                  <span>
                    Receive important updates about applications and interviews.
                  </span>
                </div>

                <Toggle
                  enabled={pushNotifications}
                  onToggle={() =>
                    setPushNotifications(
                      (current) => !current
                    )
                  }
                  label="Toggle application updates"
                />

              </div>

            </section>

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <FaUser />
                </div>

                <div>
                  <h2>Account</h2>

                  <p>
                    Manage your JobTrack account information.
                  </p>
                </div>

              </div>

              {/* PROFILE */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>Profile</strong>

                  <span>
                    Update your personal information, profile
                    photo and account details.
                  </span>
                </div>

                <button
                  type="button"
                  className="settings-manage-button"
                  onClick={() => navigate("/profile")}
                >
                  Manage
                  <FaChevronRight />
                </button>

              </div>

              {/* PASSWORD */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>
                    Password &amp; Security
                  </strong>

                  <span>
                    Change your password and manage account
                    security.
                  </span>
                </div>

                <button
                  type="button"
                  className="settings-manage-button"
                  onClick={() =>
                    navigate("/reset-password")
                  }
                >
                  Manage
                  <FaChevronRight />
                </button>

              </div>

            </section>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <FaBell />
                </div>

                <div>
                  <h2>Notifications</h2>

                  <p>
                    Choose how JobTrack keeps you updated.
                  </p>
                </div>

              </div>

              {/* PUSH */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>
                    Push Notifications
                  </strong>

                  <span>
                    Receive notifications about your account, applications, and interviews.
                  </span>
                </div>

                <Toggle
                  enabled={pushNotifications}
                  onToggle={() =>
                    setPushNotifications(
                      (current) => !current
                    )
                  }
                  label="Toggle push notifications"
                />

              </div>

              {/* MESSAGES */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>Messages</strong>

                  <span>
                    Get notified when someone sends you a
                    message.
                  </span>
                </div>

                <Toggle
                  enabled={messages}
                  onToggle={() =>
                    setMessages(
                      (current) => !current
                    )
                  }
                  label="Toggle message notifications"
                />

              </div>

              {/* EMAIL */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>
                    Email Notifications
                  </strong>

                  <span>
                    Receive important account updates by email.
                  </span>
                </div>

                <Toggle
                  enabled={emailNotifications}
                  onToggle={() =>
                    setEmailNotifications(
                      (current) => !current
                    )
                  }
                  label="Toggle email notifications"
                />

              </div>

              {/* PROMOTIONS */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>
                    Job Alerts
                  </strong>

                  <span>
                    Receive reminders about saved opportunities and application follow-ups.
                  </span>
                </div>

                <Toggle
                  enabled={jobAlerts}
                  onToggle={() =>
                    setJobAlerts(
                      (current) => !current
                    )
                  }
                  label="Toggle job alerts"
                />

              </div>

            </section>

            {/* =================================================
                APPEARANCE
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <FaMoon />
                </div>

                <div>
                  <h2>Appearance</h2>

                  <p>
                    Customize how JobTrack looks on your device.
                  </p>
                </div>

              </div>

              {/* DARK MODE */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>Dark Mode</strong>

                  <span>
                    Change the appearance of this Settings page.
                  </span>
                </div>

                <Toggle
                  enabled={darkMode}
                  onToggle={() =>
                    setDarkMode(
                      (current) => !current
                    )
                  }
                  label="Toggle dark mode"
                />

              </div>

              {/* LANGUAGE */}

              <div className="settings-row">

                <div className="settings-row-content">
                  <strong>Language</strong>

                  <span>
                    Select your preferred language.
                  </span>
                </div>

                <select
                  className="settings-language-select"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  aria-label="Select preferred language"
                >
                  <option value="English">
                    English
                  </option>

                  <option value="Afrikaans">
                    Afrikaans
                  </option>

                  <option value="isiXhosa">
                    isiXhosa
                  </option>

                  <option value="isiZulu">
                    isiZulu
                  </option>
                </select>

              </div>

            </section>

            {/* =================================================
                PRIVACY & SECURITY
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <FaShieldAlt />
                </div>

                <div>
                  <h2>Privacy &amp; Security</h2>

                  <p>
                    Control your privacy and account security.
                  </p>
                </div>

              </div>

              {/* PRIVACY */}

              <button
                type="button"
                className="settings-clickable-row"
                onClick={() =>
                  window.alert(
                    "Privacy settings will be available here."
                  )
                }
              >

                <div className="settings-row-content">
                  <strong>Privacy Settings</strong>

                  <span>
                    Manage what information other users can see.
                  </span>
                </div>

                <FaChevronRight />

              </button>

              {/* LOGIN SECURITY */}

              <button
                type="button"
                className="settings-clickable-row"
                onClick={() =>
                  navigate("/reset-password")
                }
              >

                <div className="settings-row-content">
                  <strong>Login &amp; Security</strong>

                  <span>
                    Manage login activity and security
                    preferences.
                  </span>
                </div>

                <FaChevronRight />

              </button>

            </section>

            {/* =================================================
                SAVE CHANGES
            ================================================= */}

            <button
              type="button"
              className="settings-save-button"
              onClick={handleSave}
            >
              <FaSave />

              <span>
                Save Changes
              </span>
            </button>

            {/* =================================================
                ACCOUNT ACTIONS
            ================================================= */}

            <section className="settings-danger-card">

              <div className="settings-danger-header">

                <h2>
                  Account Actions
                </h2>

                <p>
                  These actions affect your JobTrack account.
                </p>

              </div>

              <div className="settings-danger-actions">

                {/* LOG OUT */}

                <button
                  type="button"
                  className="settings-logout-button"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />

                  <span>
                    Log Out
                  </span>
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  className="settings-delete-button"
                  onClick={handleDeleteAccount}
                >
                  <FaTrash />

                  <span>
                    Delete Account
                  </span>
                </button>

              </div>

            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;