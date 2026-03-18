import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminAuth } from '../../lib/admin/auth';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = adminAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    // Initial check
    checkAuth();

    // Set up periodic checks for session expiry
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-forest-green/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-green rounded-full mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-cream" />
          </div>
          <p className="text-forest-green font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  // Authenticated
  return <>{children}</>;
};