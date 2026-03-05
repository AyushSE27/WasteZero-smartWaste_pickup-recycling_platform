import NgoDashboard from "./NgoDashboard";
import VolunteerDashboard from "./VolunteerDashboard";
import AdminDashboard from "./AdminDashboard";

const RoleBasedDashboard = () => {
  const role = localStorage.getItem("role");

  if (role === "ngo") return <NgoDashboard />;
  if (role === "volunteer") return <VolunteerDashboard />;
  if (role === "admin") return <AdminDashboard />;

  return null;
};

export default RoleBasedDashboard;