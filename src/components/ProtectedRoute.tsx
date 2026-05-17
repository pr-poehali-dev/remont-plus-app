import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import RouteLoader from "@/components/RouteLoader";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "admin" | "contractor" | "customer";
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("avangard_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return <RouteLoader />;
  }

  if (!user) {
    const back = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?back=${back}`} replace />;
  }

  if (requireRole) {
    const isAdmin = user.role === "admin" || user.user_type === "admin";
    if (requireRole === "admin" && !isAdmin) {
      return <Navigate to="/account" replace />;
    }
    if (requireRole !== "admin" && user.user_type !== requireRole && !isAdmin) {
      return <Navigate to="/account" replace />;
    }
  }

  return <>{children}</>;
}
