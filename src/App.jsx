import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Opportunities from "./pages/Opportunities";
import AdminDashboard from "./Dashboard/AdminDashboard";
import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";
import OpportunityDetails from "./pages/OpportunityDetails";
import MyApplications from "./pages/MyApplications";
import Applicants from "./pages/Applicants";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SchedulePickup from "./pages/SchedulePickup";
import AdminPickups from "./pages/AdminPickups";
import NgoDashboard from "./Dashboard/NgoDashboard";
import VolunteerDashboard from "./Dashboard/VolunteerDashboard";
import RoleBasedDashboard from "./Dashboard/RoleBasedDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <div>
      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect */}
          <Route path="dashboard"  element={<RoleBasedDashboard />} />
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="profile" element={<Profile />} />

          <Route
            path="opportunities"
            element={
              <ProtectedRoute allowedRoles={["ngo", "volunteer", "admin"]}>
                <Opportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="ngoDashboard"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="adminDashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="volunteerDashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-pickups"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPickups />
              </ProtectedRoute>
            }
          />

          <Route
            path="opportunities/:id"
            element={
              <ProtectedRoute allowedRoles={["ngo", "volunteer", "admin"]}>
                <OpportunityDetails />
              </ProtectedRoute>
            }
          />

          <Route path="my-applications" element={<MyApplications />} />
          <Route path="applicants/:id" element={<Applicants />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="schedule" element={<SchedulePickup />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;
