import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DonorHome from "./pages/DonorHome";
import Campaigns from "./pages/Campaigns";
import Donate from "./pages/Donate";
import DonationHistory from "./pages/DonationHistory";
import OrganizationDashboard from "./OrganizationDashboard";
import "./App.css";

function hasAuth() {
  // allow access if either access OR refresh exists
  // (refresh can be used to get a new access token later)
  return (
    !!localStorage.getItem("auth:access") ||
    !!localStorage.getItem("auth:refresh")
  );
}

function RequireAuth({ children }) {
  if (!hasAuth()) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  if (hasAuth()) return <Navigate to="/donor-home" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />

          {/* Public-only (if already logged in -> redirect) */}
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnly>
                <Signup />
              </PublicOnly>
            }
          />

          {/* Protected */}
          <Route
            path="/donor-home"
            element={
              <RequireAuth>
                <DonorHome />
              </RequireAuth>
            }
          />
          <Route
            path="/campaigns"
            element={
              <RequireAuth>
                <Campaigns />
              </RequireAuth>
            }
          />
          <Route
            path="/donate/:campaignId"
            element={
              <RequireAuth>
                <Donate />
              </RequireAuth>
            }
          />
          <Route
            path="/donation-history"
            element={
              <RequireAuth>
                <DonationHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/organization"
            element={
              <RequireAuth>
                <OrganizationDashboard />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
