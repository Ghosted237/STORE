import { Navigate, Outlet } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, hasRole } = useAuth();

    if (!isAuthenticated) {
        // Si l'utilisateur n'est pas connecté, le rediriger vers la page de login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        // Si l'utilisateur est connecté mais n'a pas le rôle requis,
        // le rediriger vers la page d'accueil ou "non autorisé"
        return <Navigate to="/" replace />;
    }

    // Si tout est bon, afficher l'écran demandé
    return <Outlet />;
}
