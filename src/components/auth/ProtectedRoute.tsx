import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "client" | "vendor" | "admin";
    allowDuringOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requiredRole, allowDuringOnboarding = false }: ProtectedRouteProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                setIsAuthenticated(true);

                // Get role from user_metadata first (faster)
                const roleFromMetadata = session.user.user_metadata?.role || 'client';
                setUserRole(roleFromMetadata);

                // Verify role from user_roles table
                const { data: userRolesData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id);

                if (userRolesData && userRolesData.length > 0) {
                    const dbRole = userRolesData[0].role;
                    setUserRole(dbRole);

                    // For vendors, check if vendor profile exists to determine onboarding status
                    if (dbRole === 'vendor') {
                        const { data: vendorProfile, error: vendorError } = await supabase
                            .from('vendors')
                            .select('id')
                            .eq('user_id', session.user.id)
                            .maybeSingle();

                        // Vendor profile exists = onboarding complete
                        const hasCompletedOnboarding = !!vendorProfile && !vendorError;
                        setOnboardingCompleted(hasCompletedOnboarding);

                        console.log(`[ACL] Vendor ${session.user.id} | Has Profile: ${hasCompletedOnboarding}`);
                    } else if (dbRole === 'client') {
                        // For clients, check profiles table
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('id', session.user.id)
                            .single();

                        // If profile has full_name, onboarding is complete
                        const hasCompletedOnboarding = !!profileData?.full_name;
                        setOnboardingCompleted(hasCompletedOnboarding);

                        console.log(`[ACL] Client ${session.user.id} | Onboarding: ${hasCompletedOnboarding}`);
                    } else {
                        // Admin or other roles don't need onboarding
                        setOnboardingCompleted(true);
                    }
                } else {
                    console.warn('[ACL] No role in user_roles, using metadata:', roleFromMetadata);
                    // Default client doesn't need onboarding check from vendor table
                    setOnboardingCompleted(true);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setIsAuthenticated(false);
                setUserRole(null);
                setOnboardingCompleted(false);
            } else {
                // Re-run the check when auth state changes
                checkAuth();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Only run once on mount

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Vérification de sécurité...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // If not on login/signup/landing, show toast
        const publicPaths = ['/', '/login', '/signup', '/auth/callback', '/vendeur/inscription'];
        if (!publicPaths.includes(location.pathname)) {
            toast.error("Veuillez vous connecter pour accéder à cette page");
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 1. Force redirection if on WRONG onboarding page
    if (!onboardingCompleted && allowDuringOnboarding) {
        const correctOnboardingPath = userRole === 'vendor' ? '/onboarding/vendor' : '/onboarding/client';
        if (location.pathname !== correctOnboardingPath) {
            console.log(`Wrong onboarding path. User role: ${userRole}. Redirecting to ${correctOnboardingPath}`);
            return <Navigate to={correctOnboardingPath} replace />;
        }
    }

    // 2. Handle redirect to onboarding if NOT completed and NOT already on onboarding page
    if (!onboardingCompleted && !allowDuringOnboarding) {
        const onboardingPath = userRole === 'vendor' ? '/onboarding/vendor' : '/onboarding/client';
        if (location.pathname !== onboardingPath) {
            return <Navigate to={onboardingPath} replace />;
        }
    }

    // 3. Handle redirect AWAY from onboarding if ALREADY completed
    if (onboardingCompleted && allowDuringOnboarding) {
        const destination = userRole === 'vendor' ? '/vendor/dashboard' : '/shop';
        return <Navigate to={destination} replace />;
    }

    // 4. Check Role
    if (requiredRole && userRole !== requiredRole && userRole !== "admin") {
        toast.error("Accès refusé : vous n'avez pas les droits nécessaires");
        const fallbackDestination = userRole === 'vendor' ? '/vendor/dashboard' : '/shop';
        return <Navigate to={fallbackDestination} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
