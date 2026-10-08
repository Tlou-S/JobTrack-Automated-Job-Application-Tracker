import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaComments,
  FaBell,
  FaCalendarAlt,
  FaFileAlt,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";

import "./Navbar.css";

type Props = {
  userName?: string;
  showLinks?: boolean;
};

export default function Navbar({
  userName = "",
  showLinks = true,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBulletinMenuOpen, setIsBulletinMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  /* Real signed-in user (from Supabase) instead of a fixed name */
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setSignedIn(false);
        setProfileName("");
        setAvatarUrl("");
        return;
      }

      setSignedIn(true);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      setProfileName(data?.full_name || session.user.email || "");
      setAvatarUrl(data?.avatar_url || "");
      setAvatarFailed(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("unitrade_user");
    navigate("/login");
  };

  const displayName =
    profileName || userName || (signedIn ? "My account" : "Guest");
  const menuRef = useRef<HTMLDivElement>(null);
  const bulletinMenuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
      if (
        bulletinMenuRef.current &&
        !bulletinMenuRef.current.contains(event.target as Node)
      ) {
        setIsBulletinMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsBulletinMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}
      <nav className="navbar">

        {/* LOGO */}
        <Link to="/dashboard" className="navbar-logo">
          <span className="navbar-brand-mark">JT</span>
          <span className="navbar-brand-name">JobTrack</span>
        </Link>

        {/* SEARCH */}
        <div className="navbar-search">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") navigate(`/applications?search=${encodeURIComponent(search)}`); }}
            placeholder="Search applications or companies..."
            aria-label="Search"
          />

          <button type="button" aria-label="Search applications" onClick={() => navigate(`/applications?search=${encodeURIComponent(search)}`)}>
            <FaSearch />
          </button>
        </div>

        {/* NAV ACTIONS */}
        <div className="navbar-actions">

          {/* Messages */}
          <Link to="/messages" className="nav-action">
            <FaComments className="action-icon" />
            <span className="action-label">Messages</span>
          </Link>

          {/* Notifications */}
          <Link to="/notifications" className="nav-action">
            <FaBell className="action-icon" />
            <span className="action-label">Notifications</span>
          </Link>

          {/* Interviews */}
          <Link to="/interviews" className="nav-action">
            <FaCalendarAlt className="action-icon" />
            <span className="action-label">Interviews</span>
          </Link>

          {/* Resumes */}
          <Link to="/resumes" className="nav-action">
            <FaFileAlt className="action-icon" />
            <span className="action-label">Resumes</span>
          </Link>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}
          <div className="nav-profile-wrapper" ref={menuRef}>

            <button
              type="button"
              className="nav-profile"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} profile`}
                  className="profile-avatar-image"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span className="profile-avatar-fallback">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}

              {/* <span className="profile-name">{displayName}</span> */}

              <FaChevronDown
                className={`profile-chevron ${isMenuOpen ? "open" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <div className="profile-dropdown">
                <Link
                  to="/profile"
                  className="profile-dropdown-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="dropdown-icon" />
                  Profile
                </Link>

                <button
                  type="button"
                  className="profile-dropdown-item logout"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  Log Out
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* =====================================================
          SECOND NAVIGATION
      ===================================================== */}
      {showLinks && (
        <div className="nav-links-row">

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Applications
          </NavLink>

          <NavLink
            to="/companies"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Companies
          </NavLink>

          <div className="nav-dropdown-wrapper" ref={bulletinMenuRef}>
            <button
              type="button"
              className={`nav-dropdown-trigger ${
                location.pathname === "/interviews"
                  ? "active"
                  : ""
              }`}
              onClick={() => setIsBulletinMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={isBulletinMenuOpen}
            >
              Interviews
              <FaChevronDown
                className={`nav-dropdown-chevron ${isBulletinMenuOpen ? "open" : ""}`}
              />
            </button>

            {isBulletinMenuOpen && (
              <div className="nav-dropdown-menu">
                <NavLink to="/interviews" className="nav-dropdown-item" onClick={() => setIsBulletinMenuOpen(false)}>Interview schedule</NavLink>
                <NavLink to="/resumes" className="nav-dropdown-item" onClick={() => setIsBulletinMenuOpen(false)}>Resumes & CVs</NavLink>
                <NavLink to="/notifications" className="nav-dropdown-item" onClick={() => setIsBulletinMenuOpen(false)}>Notifications</NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Settings
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Profile
          </NavLink>

          <NavLink
            to="/resumes"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Resumes / CVs
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Notifications
          </NavLink>

        </div>
      )}
    </>
  );
}