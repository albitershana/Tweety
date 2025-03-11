// App.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Auth from "./Auth";
import Posts from "./Posts";
import Profiles from "./Profiles";
import ProfilePage from "./ProfilePage";
import { DarkModeContext } from "./DarkModeContext";
import "./App.css";
import axios from "axios";

// NEW CODE: import new pages
import EditProfile from "./EditProfile";
import Messages from "./Messages";
import Trending from "./Trending";
import HashtagPage from "./HashtagPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [token]);

  const markNotificationRead = async (id) => {
    if (!token) return;
    try {
      await axios.post(`/notifications/${id}/read/`);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    triggerToast("✅ Successfully logged in!");
    fetchNotifications(); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setNotifications([]);
    triggerToast("✅ Logged out successfully!");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary me-2"></div>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {/* Toast Notification */}
        {showToast && (
          <div className="toast-container">
            <div className="toast-content">
              {toastMsg}
              <button className="toast-close" onClick={() => setShowToast(false)}>
                ✖
              </button>
            </div>
          </div>
        )}

        {token ? (
          <>
            <Navbar
              handleLogout={handleLogout}
              toggleDarkMode={toggleDarkMode}
              darkMode={darkMode}
              notifications={notifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              markNotificationRead={markNotificationRead}
            />
            <Routes>
              <Route
                path="/"
                element={<HomePage token={token} triggerToast={triggerToast} />}
              />
              <Route
                path="/profile/:username"
                element={<ProfilePage token={token} triggerToast={triggerToast} />}
              />
              {/* NEW ROUTES */}
              <Route
                path="/edit-profile"
                element={<EditProfile token={token} triggerToast={triggerToast} />}
              />
              <Route
                path="/messages"
                element={<Messages token={token} triggerToast={triggerToast} />}
              />
              <Route
                path="/trending"
                element={<Trending token={token} triggerToast={triggerToast} />}
              />
              <Route
                path="/hashtag/:tag"
                element={<HashtagPage token={token} triggerToast={triggerToast} />}
              />
            </Routes>
          </>
        ) : (
          <Auth setToken={handleLogin} />
        )}
      </div>
    </Router>
  );
}

const Navbar = ({
  handleLogout,
  toggleDarkMode,
  darkMode,
  notifications,
  showNotifications,
  setShowNotifications,
  markNotificationRead,
}) => {
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar bg-light shadow-sm">
      <div className="navbar-left">
        <i className="bi bi-twitter brand-icon text-primary"></i>
        <h2 className="brand-title text-primary">Tweety</h2>
        <Link className="btn btn-link ms-3" to="/">
          Home
        </Link>
        <Link className="btn btn-link" to="/trending">
          Trending
        </Link>
        <Link className="btn btn-link" to="/messages">
          Messages
        </Link>
      </div>
      <div className="navbar-right">
        <button className="btn btn-light position-relative me-2" onClick={handleBellClick}>
          <i className="bi bi-bell fs-5"></i>

          {notifications.some((n) => !n.is_read) && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {notifications.filter((n) => !n.is_read).length}
            </span>
          )}
        </button>


        <button className="btn btn-secondary me-2" onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

   
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>


      {showNotifications && (
        <div className="notifications-dropdown card shadow">
          <div className="card-body p-2">
            <h5 className="card-title">Notifications</h5>
            {notifications.length === 0 ? (
              <p className="small text-muted">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item p-2 mb-1 ${
                    notif.is_read ? "bg-white" : "bg-light"
                  }`}
                >
                  <small className="text-muted">
                    {new Date(notif.created_at).toLocaleString()}
                  </small>
                  <p className="mb-1">{notif.message}</p>
                  {!notif.is_read && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// UPDATED HOMEPAGE
function HomePage({ token, triggerToast }) {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <Posts token={token} triggerToast={triggerToast} />
        </div>
        <div className="col-md-4">
          <Profiles token={token} />
        </div>
      </div>
    </div>
  );
}

export default App;
