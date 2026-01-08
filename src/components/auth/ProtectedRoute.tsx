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

                // Fast role check from metadata
                const roleFromMetadata = session.user.user_metadata?.role || 'client';
                setUserRole(roleFromMetadata);

                // Check profile for onboarding status
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("role, onboarding_completed")
                    .eq("id", session.user.id)
                    .single();

                if (profileError) {
                    // PGRST116 means "No rows found", which is normal for a new user
                    if (profileError.code !== 'PGRST116') {
                        console.error("Erreur structurelle Profile:", profileError);
                        // Si l'erreur est "Column not found", on l'affiche pour debugger
                        if (profileError.message.includes("onboarding_completed")) {
                            toast.error("Base de données non à jour : colonne 'onboarding_completed' manquante.");
                        }
                    }
                }

                if (profile) {
                    const profileData = profile as any;
                    setUserRole(profileData.role || roleFromMetadata);
                    setOnboardingCompleted(!!profileData.onboarding_completed);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

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

    // Handle redirect to onboarding if NOT completed and NOT already on onboarding page
    if (!onboardingCompleted && !allowDuringOnboarding) {
        const onboardingPath = userRole === 'vendor' ? '/onboarding/vendor' : '/onboarding/client';
        if (location.pathname !== onboardingPath) {
            return <Navigate to={onboardingPath} replace />;
        }
    }

    // Handle redirect AWAY from onboarding if ALREADY completed
    if (onboardingCompleted && allowDuringOnboarding) {
        const destination = userRole === 'vendor' ? '/vendor/dashboard' : '/shop';
        return <Navigate to={destination} replace />;
    }

    // Check Role
    if (requiredRole && userRole !== requiredRole && userRole !== "admin") {
        toast.error("Accès refusé : vous n'avez pas les droits nécessaires");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
