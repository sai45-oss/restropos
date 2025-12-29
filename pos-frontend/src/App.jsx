import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Home,
  Auth,
  Orders,
  Tables,
  Menu,
  Dashboard,
  Users,
  SuperAdminDashboard,
  TenantOnboarding,
} from "./pages";

/* ---------------- Protected Routes ---------------- */
function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

/* ---------------- Super Admin Routes ---------------- */
function SuperAdminRoutes({ children }) {
  const { isAuth, role } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ---------------- Layout ---------------- */
function Layout() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element={<TenantOnboarding />} />

      {/* Super Admin */}
      <Route
        path="/superadmin"
        element={
          <SuperAdminRoutes>
            <SuperAdminDashboard />
          </SuperAdminRoutes>
        }
      />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoutes>
            <Orders />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/tables"
        element={
          <ProtectedRoutes>
            <Tables />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/menu"
        element={
          <ProtectedRoutes>
            <Menu />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoutes>
            <Users />
          </ProtectedRoutes>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

/* ---------------- App ---------------- */
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
