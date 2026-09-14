import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { canPerformInClub, isCesaAdmin } from '@/lib/permissions';

interface ProtectedRouteProps {
  /** If provided, the user must hold this permission, scoped to clubId. */
  requiredPermission?: string;
  /** Required when requiredPermission is club-scoped. */
  clubId?: string;
  /** Use instead of requiredPermission/clubId for routes only CESA admins can see. */
  requireCesaAdmin?: boolean;
}

export function ProtectedRoute({ requiredPermission, clubId, requireCesaAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, auth } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCesaAdmin && !isCesaAdmin(auth)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && clubId) {
    const allowed = canPerformInClub(auth, clubId, requiredPermission);
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
