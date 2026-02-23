import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";
import Dashboard from "./Dashboard";
import Layout from "./Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Wrap pages that need sidebar inside Layout */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
