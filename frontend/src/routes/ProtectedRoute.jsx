import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { isAuthenticated } from "../utils/auth.js";

const resolveRole = (user) => {
  return user?.role_name || user?.role?.name || null;
};

const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (loading) {
    return null;
  }

  if (roles && roles.length > 0) {
    const role = resolveRole(user);
    if (!role || !roles.includes(role)) {
      return <Navigate to="/catalog" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
