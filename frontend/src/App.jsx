import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { clearLegacyDemoAuth, getSession, homeFor } from "@/utils/helpers";

// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Vehicle Owner Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import Vehicles from "@/pages/owner/Vehicles";
import RequestService from "@/pages/owner/RequestService";
import Tracking from "@/pages/owner/Tracking";
import ServiceHistory from "@/pages/owner/ServiceHistory";
import OwnerProfile from "@/pages/owner/Profile";

// Mechanic / Service Partner Pages
import MechanicDashboard from "@/pages/mechanic/MechanicDashboard";
import Requests from "@/pages/mechanic/Requests";
import ActiveJob from "@/pages/mechanic/ActiveJob";
import JobHistory from "@/pages/mechanic/JobHistory";
import Earnings from "@/pages/mechanic/Earnings";
import MechanicProfile from "@/pages/mechanic/Profile";

// Administrator Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminPartners from "@/pages/admin/Partners";
import ServiceRequests from "@/pages/admin/ServiceRequests";
import AdminComplaints from "@/pages/admin/Complaints";
import AdminReports from "@/pages/admin/Reports";

function RequireAuth({ children, allow = ["owner"] }) {
  const session = getSession();
  const hasValidSession = Boolean(session && session.token && session.id);

  if (!hasValidSession) {
    return <Navigate to="/login" replace />;
  }

  if (allow.length > 0 && !allow.includes(session.role)) {
    return <Navigate to={homeFor(session.role || "owner")} replace />;
  }

  return children;
}

/**
 * Main Application Component with Simple React Routing
 */
export function App() {
  useEffect(() => {
    clearLegacyDemoAuth();
    getSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<Home />} />
        <Route path="/for-mechanics" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Vehicle Owner Routes */}
        <Route path="/owner" element={<RequireAuth allow={["owner"]}><OwnerDashboard /></RequireAuth>} />
        <Route path="/owner/vehicles" element={<RequireAuth allow={["owner"]}><Vehicles /></RequireAuth>} />
        <Route path="/owner/request-service" element={<RequireAuth allow={["owner"]}><RequestService /></RequireAuth>} />
        <Route path="/owner/request" element={<RequireAuth allow={["owner"]}><RequestService /></RequireAuth>} />
        <Route path="/owner/tracking" element={<RequireAuth allow={["owner"]}><Tracking /></RequireAuth>} />
        <Route path="/owner/history" element={<RequireAuth allow={["owner"]}><ServiceHistory /></RequireAuth>} />
        <Route path="/owner/profile" element={<RequireAuth allow={["owner"]}><OwnerProfile /></RequireAuth>} />

        {/* Mechanic / Partner Routes */}
        <Route path="/mechanic" element={<RequireAuth allow={["mechanic", "partner"]}><MechanicDashboard /></RequireAuth>} />
        <Route path="/mechanic/requests" element={<RequireAuth allow={["mechanic", "partner"]}><Requests /></RequireAuth>} />
        <Route path="/mechanic/active-job" element={<RequireAuth allow={["mechanic", "partner"]}><ActiveJob /></RequireAuth>} />
        <Route path="/mechanic/history" element={<RequireAuth allow={["mechanic", "partner"]}><JobHistory /></RequireAuth>} />
        <Route path="/mechanic/earnings" element={<RequireAuth allow={["mechanic", "partner"]}><Earnings /></RequireAuth>} />
        <Route path="/mechanic/profile" element={<RequireAuth allow={["mechanic", "partner"]}><MechanicProfile /></RequireAuth>} />

        {/* Backward Compatibility Aliases for Partner */}
        <Route path="/partner" element={<RequireAuth allow={["mechanic", "partner"]}><MechanicDashboard /></RequireAuth>} />
        <Route path="/partner/requests" element={<RequireAuth allow={["mechanic", "partner"]}><Requests /></RequireAuth>} />
        <Route path="/partner/active-job" element={<RequireAuth allow={["mechanic", "partner"]}><ActiveJob /></RequireAuth>} />
        <Route path="/partner/history" element={<RequireAuth allow={["mechanic", "partner"]}><JobHistory /></RequireAuth>} />
        <Route path="/partner/earnings" element={<RequireAuth allow={["mechanic", "partner"]}><Earnings /></RequireAuth>} />
        <Route path="/partner/profile" element={<RequireAuth allow={["mechanic", "partner"]}><MechanicProfile /></RequireAuth>} />

        {/* Administrator Routes */}
        <Route path="/admin" element={<RequireAuth allow={["admin"]}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth allow={["admin"]}><AdminUsers /></RequireAuth>} />
        <Route path="/admin/partners" element={<RequireAuth allow={["admin"]}><AdminPartners /></RequireAuth>} />
        <Route path="/admin/requests" element={<RequireAuth allow={["admin"]}><ServiceRequests /></RequireAuth>} />
        <Route path="/admin/live-services" element={<RequireAuth allow={["admin"]}><ServiceRequests /></RequireAuth>} />
        <Route path="/admin/services" element={<RequireAuth allow={["admin"]}><ServiceRequests /></RequireAuth>} />
        <Route path="/admin/complaints" element={<RequireAuth allow={["admin"]}><AdminComplaints /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth allow={["admin"]}><AdminReports /></RequireAuth>} />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
