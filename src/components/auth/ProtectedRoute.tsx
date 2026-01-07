import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "client" | "vendor" | "admin";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
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

                // Strategy: First check user_metadata (fastest)
                const roleFromMetadata = session.user.user_metadata?.role;

                if (roleFromMetadata) {
                    setUserRole(roleFromMetadata);
                } else {
                    // Fallback: Check 'profiles' table
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    setUserRole((profile as any)?.role || "client");
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
        toast.error("Veuillez vous connecter pour accéder à cette page");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole && userRole !== "admin") {
        toast.error("Accès refusé : vous n'avez pas les droits nécessaires");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
