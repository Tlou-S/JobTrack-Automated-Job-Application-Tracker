import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";

import SideNav from "../Components/SideNav";

import {
  FaBell,
  FaCamera,
  FaCog,
  FaEnvelope,
  FaHeart,
  FaIdCard,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPhone,
  FaShoppingBag,
  FaSignOutAlt,
  FaStar,
  FaStore,
  FaThLarge,
  FaTrash,
} from "react-icons/fa";

import { supabase } from "../lib/supabaseClient";

import "./ProfilePage.css";

/* =========================================================
   PAGE LINKS
   These must match the paths in your App.tsx routes.
========================================================= */

const ROUTES = {
  login: "/login",
  notifications: "/notifications",
  settings: "/settings",
  reviews: "/ratings-reviews",
  myListings: "/my-listings",
  buying: "/buying",
  saved: "/saved",
};

/* =========================================================
   TYPES + DEFAULTS
========================================================= */

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  favorite_brands: string[];
  created_at: string;
};

type EditForm = {
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  brands: string;
};

type Section = "overview" | "details";

const DEFAULT_BIO =
  "Track your career goals, applications, and professional highlights in one place.";

/* Replace with a real average once your Reviews table is connected */
const RATING = 3;

const EMPTY_PROFILE: Profile = {
  id: "",
  full_name: "Community User",
  email: "",
  phone: "Not provided",
  location: "Not provided",
  role: "Community Member",
  avatar_url: "",
  cover_url: "",
  bio: "",
  favorite_brands: [],
  created_at: "",
};

/* =========================================================
   HELPERS
========================================================= */

/* Shrinks big photos before upload so they load fast */
function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height,
        1
      );

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Your browser could not process the image."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Could not process this image.")),
        "image/jpeg",
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image."));
    };

    image.src = objectUrl;
  });
}

function storageErrorMessage(message: string) {
  const reason = message.toLowerCase();

  if (reason.includes("bucket not found")) {
    return "The 'profile-images' storage bucket is missing. Run the SQL setup in Supabase.";
  }

  if (reason.includes("row-level security") || reason.includes("policy")) {
    return "Storage permissions are missing. Run the SQL setup in Supabase.";
  }

  return `Image upload failed: ${message}`;
}

/* Looks for public/assets/<brand>.png, otherwise shows the name */
const brandImagePath = (name: string) =>
  `/assets/${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.png`;

function BrandLogo({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="pp-brand" title={name}>
      {failed ? (
        <span className="pp-brand-text">{name}</span>
      ) : (
        <img
          src={brandImagePath(name)}
          alt={`${name} logo`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function ProfilePage() {
  const navigate = useNavigate();

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [section, setSection] = useState<Section>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<EditForm>({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
    brands: "",
  });

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Show the photo again whenever the picture changes */
  useEffect(() => {
    setAvatarFailed(false);
  }, [profile.avatar_url]);

  /* Hide the little message box after a few seconds */
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => setMessage(""), 4500);

    return () => window.clearTimeout(timer);
  }, [message]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate(ROUTES.login);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Authentication error:", userError);
        setMessage("Unable to load your account.");
        return;
      }

      if (!user) {
        navigate(ROUTES.login);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, location, role, avatar_url, cover_url, bio, favorite_brands, created_at"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
        setMessage(`Unable to load your profile: ${error.message}`);
        return;
      }

      /* No profile row yet: create one from the sign-up details */
      if (!data) {
        const metadata = user.user_metadata ?? {};

        const newProfile: Profile = {
          ...EMPTY_PROFILE,
          id: user.id,
          full_name:
            typeof metadata.full_name === "string" && metadata.full_name.trim()
              ? metadata.full_name.trim()
              : "Community User",
          email: user.email ?? "",
          phone:
            typeof metadata.phone === "string" && metadata.phone.trim()
              ? metadata.phone
              : "Not provided",
          role:
            typeof metadata.role === "string" && metadata.role.trim()
              ? metadata.role
              : "Community Member",
          created_at: new Date().toISOString(),
        };

        const { error: createError } = await supabase.from("profiles").insert({
          id: newProfile.id,
          full_name: newProfile.full_name,
          email: newProfile.email,
          phone: newProfile.phone,
          location: newProfile.location,
          role: newProfile.role,
          avatar_url: "",
        });

        if (createError) {
          console.error("Profile creation error:", createError);
          setMessage(`Your profile could not be created: ${createError.message}`);
          return;
        }

        setProfile(newProfile);
        return;
      }

      setProfile({
        id: data.id,
        full_name: data.full_name || "Community User",
        email: data.email || user.email || "",
        phone: data.phone || "Not provided",
        location: data.location || "Not provided",
        role: data.role || "Community Member",
        avatar_url: data.avatar_url || "",
        cover_url: data.cover_url || "",
        bio: data.bio || "",
        favorite_brands: Array.isArray(data.favorite_brands)
          ? (data.favorite_brands as unknown[]).filter(
              (brand): brand is string => typeof brand === "string"
            )
          : [],
        created_at: data.created_at || "",
      });
    } catch (error) {
      console.error("Unexpected profile error:", error);
      setMessage("Something went wrong loading your profile.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     PROFILE + COVER IMAGES
  ======================================================= */

  const uploadImage = async (kind: "avatar" | "cover", file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 15MB.");
      return;
    }

    try {
      setBusy(true);
      setMessage(
        kind === "avatar"
          ? "Updating profile picture..."
          : "Updating cover image..."
      );

      const blob =
        kind === "avatar"
          ? await compressImage(file, 400, 400, 0.85)
          : await compressImage(file, 1400, 500, 0.82);

      /* One fixed file per image, so old ones never pile up */
      const filePath = `${profile.id}/${kind === "avatar" ? "profile" : "cover"}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        setMessage(storageErrorMessage(uploadError.message));
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(kind === "avatar" ? { avatar_url: url } : { cover_url: url })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        setMessage(`Could not save the image: ${updateError.message}`);
        return;
      }

      if (kind === "avatar") {
        setProfile((previous) => ({ ...previous, avatar_url: url }));
        setMessage("Profile picture updated.");
      } else {
        setProfile((previous) => ({ ...previous, cover_url: url }));
        setMessage("Cover image updated.");
      }
    } catch (error) {
      console.error("Image error:", error);
      setMessage("We could not use that image. Please try another one.");
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async (kind: "avatar" | "cover") => {
    try {
      setBusy(true);

      await supabase.storage
        .from("profile-images")
        .remove([`${profile.id}/${kind === "avatar" ? "profile" : "cover"}`]);

      const { error } = await supabase
        .from("profiles")
        .update(kind === "avatar" ? { avatar_url: "" } : { cover_url: "" })
        .eq("id", profile.id);

      if (error) {
        console.error("Remove image error:", error);
        setMessage(`Could not remove the image: ${error.message}`);
        return;
      }

      if (kind === "avatar") {
        setProfile((previous) => ({ ...previous, avatar_url: "" }));
        setMessage("Profile picture removed.");
      } else {
        setProfile((previous) => ({ ...previous, cover_url: "" }));
        setMessage("Cover image removed.");
      }
    } catch (error) {
      console.error("Remove image error:", error);
      setMessage("Something went wrong removing the image.");
    } finally {
      setBusy(false);
    }
  };

  const handleImageSelected =
    (kind: "avatar" | "cover") => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      event.target.value = "";

      if (file) uploadImage(kind, file);
    };

  /* =======================================================
     EDIT DETAILS
  ======================================================= */

  const startEditing = () => {
    setForm({
      full_name: profile.full_name === "Community User" ? "" : profile.full_name,
      phone: profile.phone === "Not provided" ? "" : profile.phone,
      location: profile.location === "Not provided" ? "" : profile.location,
      bio: profile.bio,
      brands: profile.favorite_brands.join(", "),
    });
    setFormError("");
    setSection("details");
    setIsEditing(true);
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.full_name.trim();

    if (!fullName) {
      setFormError("Please enter your name.");
      return;
    }

    const brands = form.brands
      .split(",")
      .map((brand) => brand.trim())
      .filter(Boolean)
      .slice(0, 6);

    const updates = {
      full_name: fullName,
      phone: form.phone.trim() || "Not provided",
      location: form.location.trim() || "Not provided",
      bio: form.bio.trim(),
      favorite_brands: brands,
    };

    try {
      setSaving(true);
      setFormError("");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) {
        console.error("Profile save error:", error);
        setFormError(`Could not save: ${error.message}`);
        return;
      }

      setProfile((previous) => ({ ...previous, ...updates }));
      setIsEditing(false);
      setMessage("Profile updated.");
    } catch (error) {
      console.error("Unexpected save error:", error);
      setFormError("Something went wrong saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SIGN OUT + DELETE ACCOUNT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ROUTES.login);
  };

  /* Needs the delete_my_account() function from the SQL file */
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await supabase.storage
        .from("profile-images")
        .remove([`${profile.id}/profile`, `${profile.id}/cover`]);

      const { error } = await supabase.rpc("delete_my_account");

      if (error) {
        console.error("Delete account error:", error);
        setMessage(`Could not delete your account: ${error.message}`);
        return;
      }

      await supabase.auth.signOut();
      navigate(ROUTES.login);
    } catch (error) {
      console.error("Unexpected delete error:", error);
      setMessage("Something went wrong deleting your account.");
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     QUICK LINKS
  ======================================================= */

  const quickLinks: { label: string; icon: IconType; path: string }[] = [
    { label: "Applications", icon: FaStore, path: "/applications" },
    { label: "Interviews", icon: FaShoppingBag, path: "/interviews" },
    { label: "Resumes & CVs", icon: FaHeart, path: "/resumes" },
    { label: "Notifications", icon: FaBell, path: ROUTES.notifications },
    { label: "Companies", icon: FaStar, path: "/companies" },
    { label: "Settings", icon: FaCog, path: ROUTES.settings },
  ];

  /* =======================================================
     PAGE SHELL (sidebar + content)
  ======================================================= */

  const renderShell = (content: ReactNode) => (
    <div className="profile-page">
      <SideNav />

      <div className="profile-page-content">
        <div className="pp-page">{content}</div>
      </div>
    </div>
  );

  if (loading) {
    return renderShell(
      <div className="pp-panel pp-center">
        <h2>Loading your profile...</h2>
        <p>Please wait while we load your account.</p>
      </div>
    );
  }

  /* Loading finished but there is no profile (an error happened) */
  if (!profile.id) {
    return renderShell(
      <div className="pp-panel pp-center">
        <h2>We couldn't load your profile</h2>
        <p>{message || "Please try again."}</p>

        <button
          type="button"
          className="pp-btn pp-btn-primary"
          onClick={loadProfile}
        >
          Try again
        </button>
      </div>
    );
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const initial = profile.full_name.charAt(0).toUpperCase();

  /* =======================================================
     PAGE
  ======================================================= */

  return renderShell(
    <>
      {/* COVER BANNER */}
      <div
        className="pp-banner"
        style={
          profile.cover_url
            ? {
                backgroundImage: `linear-gradient(115deg, rgba(18,38,63,0.55), rgba(18,38,63,0.25)), url("${profile.cover_url}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="pp-banner-actions">
          <button
            type="button"
            className="pp-cover-btn"
            onClick={() => coverInputRef.current?.click()}
            disabled={busy}
          >
            <FaCamera /> {profile.cover_url ? "Change cover" : "Add cover"}
          </button>

          {profile.cover_url && (
            <button
              type="button"
              className="pp-cover-btn"
              onClick={() => removeImage("cover")}
              disabled={busy}
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="pp-hidden-file"
          onChange={handleImageSelected("cover")}
        />
      </div>

      {/* IDENTITY */}
      <header className="pp-identity">
        <div className="pp-avatar">
          {profile.avatar_url && !avatarFailed ? (
            <img
              src={profile.avatar_url}
              alt={`${profile.full_name} profile`}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="pp-avatar-fallback">{initial}</span>
          )}

          <button
            type="button"
            className="pp-avatar-camera"
            title="Change profile picture"
            aria-label="Change profile picture"
            onClick={() => avatarInputRef.current?.click()}
            disabled={busy}
          >
            <FaCamera />
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="pp-hidden-file"
            onChange={handleImageSelected("avatar")}
          />
        </div>

        <div className="pp-identity-text">
          <h1>
            {profile.full_name}
            <span className="pp-role">{profile.role}</span>
          </h1>

          <div className="pp-meta">
            {profile.location !== "Not provided" && (
              <span>
                <FaMapMarkerAlt /> {profile.location}
              </span>
            )}

            {profile.phone !== "Not provided" && (
              <span>
                <FaPhone /> {profile.phone}
              </span>
            )}

            {profile.email && (
              <span>
                <FaEnvelope /> {profile.email}
              </span>
            )}
          </div>
        </div>

        <div className="pp-identity-actions">
          <button
            type="button"
            className="pp-btn pp-btn-outline"
            onClick={startEditing}
          >
            <FaPencilAlt /> Edit profile
          </button>

          <button
            type="button"
            className="pp-btn pp-btn-icon"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => navigate(ROUTES.notifications)}
          >
            <FaBell />
          </button>

          <button
            type="button"
            className="pp-btn pp-btn-icon"
            title="Settings"
            aria-label="Settings"
            onClick={() => navigate(ROUTES.settings)}
          >
            <FaCog />
          </button>

          <button
            type="button"
            className="pp-btn pp-btn-outline"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Sign out
          </button>
        </div>
      </header>

      {profile.avatar_url && (
        <div className="pp-avatar-remove-row">
          <button
            type="button"
            className="pp-text-button"
            onClick={() => removeImage("avatar")}
            disabled={busy}
          >
            Remove profile picture
          </button>
        </div>
      )}

      {/* LAYOUT */}
      <div className="pp-layout">
        <nav className="pp-nav">
          <button
            type="button"
            className={section === "overview" ? "pp-nav-item active" : "pp-nav-item"}
            onClick={() => setSection("overview")}
          >
            <FaThLarge /> Overview
          </button>

          <button
            type="button"
            className={section === "details" ? "pp-nav-item active" : "pp-nav-item"}
            onClick={() => setSection("details")}
          >
            <FaIdCard /> Personal details
          </button>
        </nav>

        <section className="pp-panel">
          {/* ================= OVERVIEW ================= */}
          {section === "overview" && (
            <>
              <div className="pp-panel-head">
                <h2>Overview</h2>
                <p>Your JobTrack profile at a glance.</p>
              </div>

              <p className="pp-about">{profile.bio || DEFAULT_BIO}</p>

              <div className="pp-stats">
                <div className="pp-stat">
                  <span>Member since</span>
                  <strong>{memberSince}</strong>
                </div>

                <div className="pp-stat">
                  <span>Applications tracked</span>
                  <strong>0</strong>
                </div>

                <div className="pp-stat">
                  <span>Reviews received</span>
                  <strong>0</strong>
                </div>

                <div className="pp-stat">
                  <span>Profile rating</span>

                  <div
                    className="pp-stars"
                    aria-label={`${RATING} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar
                        key={index}
                        className={index < RATING ? "pp-star filled" : "pp-star"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="pp-subhead">Target companies</h3>

              {profile.favorite_brands.length > 0 ? (
                <div className="pp-brands">
                  {profile.favorite_brands.map((brand) => (
                    <BrandLogo key={brand} name={brand} />
                  ))}
                </div>
              ) : (
                <p className="pp-muted">
                  No favourite brands yet. Add some with Edit profile.
                </p>
              )}

              <h3 className="pp-subhead">Quick links</h3>

              <div className="pp-grid">
                {quickLinks.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    type="button"
                    className="pp-card"
                    onClick={() => navigate(path)}
                  >
                    <Icon className="pp-card-icon" />
                    <p>{label}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ================= DETAILS ================= */}
          {section === "details" && (
            <>
              <div className="pp-panel-head pp-panel-head-row">
                <div>
                  <h2>Personal details</h2>
                  <p>The information linked to your account.</p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    className="pp-btn pp-btn-outline"
                    onClick={startEditing}
                  >
                    <FaPencilAlt /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} noValidate>
                  <div className="pp-form-grid">
                    <div className="pp-form-group">
                      <label htmlFor="full_name">Full name</label>
                      <input
                        id="full_name"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleFormChange}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="pp-form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleFormChange}
                        placeholder="e.g. 072 123 4567"
                      />
                    </div>

                    <div className="pp-form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleFormChange}
                        placeholder="e.g. Cape Town"
                      />
                    </div>

                    <div className="pp-form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        disabled
                      />
                    </div>

                    <div className="pp-form-group pp-form-wide">
                      <label htmlFor="bio">About me</label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        maxLength={200}
                        value={form.bio}
                        onChange={handleFormChange}
                        placeholder="Tell the community about yourself"
                      />
                    </div>

                    <div className="pp-form-group pp-form-wide">
                      <label htmlFor="brands">Favourite brands</label>
                      <input
                        id="brands"
                        name="brands"
                        value={form.brands}
                        onChange={handleFormChange}
                        placeholder="adidas, PUMA, NIKE"
                      />
                      <small>Separate brands with commas (up to 6).</small>
                    </div>
                  </div>

                  {formError && <p className="pp-form-error">{formError}</p>}

                  <div className="pp-form-actions">
                    <button
                      type="button"
                      className="pp-btn pp-btn-outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="pp-btn pp-btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pp-fields">
                  <div className="pp-field">
                    <span>Full name</span>
                    <strong>{profile.full_name}</strong>
                  </div>

                  <div className="pp-field">
                    <span>Role</span>
                    <strong>{profile.role}</strong>
                  </div>

                  <div className="pp-field">
                    <span>Phone</span>
                    <strong>{profile.phone}</strong>
                  </div>

                  <div className="pp-field">
                    <span>Location</span>
                    <strong>{profile.location}</strong>
                  </div>

                  <div className="pp-field">
                    <span>Email</span>
                    <strong>{profile.email || "Not provided"}</strong>
                  </div>

                  <div className="pp-field">
                    <span>Member since</span>
                    <strong>{memberSince}</strong>
                  </div>

                  <div className="pp-field pp-field-wide">
                    <span>About me</span>
                    <strong>{profile.bio || DEFAULT_BIO}</strong>
                  </div>

                  <div className="pp-field pp-field-wide">
                    <span>Favourite brands</span>
                    <strong>
                      {profile.favorite_brands.length > 0
                        ? profile.favorite_brands.join(", ")
                        : "Not added"}
                    </strong>
                  </div>
                </div>
              )}

              {/* DANGER ZONE */}
              <div className="pp-danger-zone">
                <div>
                  <h3>Delete account</h3>
                  <p>
                    This permanently removes your account, profile, and photos.
                  </p>
                </div>

                <button
                  type="button"
                  className="pp-btn pp-btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={busy}
                >
                  <FaTrash /> Delete account
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {message && <div className="pp-image-toast">{message}</div>}
    </>
  );
}