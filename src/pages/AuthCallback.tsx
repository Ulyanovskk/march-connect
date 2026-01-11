import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Debug: log full URL and all parameters
                console.log('Full URL:', window.location.href);
                console.log('Hash:', window.location.hash);
                console.log('Search:', window.location.search);

                // Check URL hash parameters first (Supabase puts params in hash)
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);

                // Also check URL search parameters as backup
                const searchParams = new URLSearchParams(window.location.search);

                const type = hashParams.get('type') || searchParams.get('type');
                const accessToken = hashParams.get('access_token') || searchParams.get('access_token');

                console.log('Parsed params:', {
                    type,
                    accessToken,
                    hashParams: Object.fromEntries(hashParams.entries()),
                    searchParams: Object.fromEntries(searchParams.entries())
                });

                // Handle password recovery flow with highest priority
                if (type === 'recovery') {
                    console.log('Handling password recovery flow');
                    toast.success('Vous pouvez réinitialiser votre mot de passe.');
                    navigate('/reset-password');
                    return;
                }

                // Handle signup confirmation
                if (type === 'signup' && accessToken) {
                    toast.success('Email confirmé avec succès !');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // Check for existing session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const user = session.user;
                    const pendingRole = localStorage.getItem('pending_role');

                    // Check if user has role in user_roles table
                    const { data: userRoles } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', user.id);

                    // Determine the role to use
                    const roleToUse = userRoles && userRoles.length > 0
                        ? userRoles[0].role
                        : (pendingRole || user.user_metadata?.role || 'client');

                    // If we have a pending role from OAuth, set it
                    if (pendingRole && (!userRoles || userRoles.length === 0)) {
                        await supabase
                            .from('user_roles')
                            .upsert({
                                user_id: user.id,
                                role: pendingRole as 'admin' | 'client' | 'vendor'
                            });

                        // Update user metadata
                        await supabase.auth.updateUser({
                            data: { role: pendingRole }
                        });

                        localStorage.removeItem('pending_role');
                    }

                    // Check if vendor needs vendor profile
                    if (roleToUse === 'vendor') {
                        const { data: vendorProfile } = await supabase
                            .from('vendors')
                            .select('id')
                            .eq('user_id', user.id)
                            .single();

                        // No vendor profile = needs onboarding
                        if (!vendorProfile) {
                            navigate('/onboarding/vendor');
                            return;
                        }
                    }

                    // Check user_metadata for onboarding status
                    const onboardingCompleted = user.user_metadata?.onboarding_completed;

                    if (!onboardingCompleted) {
                        navigate(roleToUse === 'vendor' ? '/onboarding/vendor' : '/onboarding/client');
                    } else {
                        if (roleToUse === 'admin') navigate('/admin');
                        else if (roleToUse === 'vendor') navigate('/vendor/dashboard');
                        else navigate('/shop');
                    }
                } else {
                    // No session and no obvious confirmation params, go to login
                    navigate('/login');
                }
            } catch (error: any) {
                console.error('Auth callback error:', error);
                toast.error('Erreur lors de la connexion');
                navigate('/login');
            }
        };

        handleAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Vérification en cours...</h2>
                <p className="text-muted-foreground">Veuillez patienter pendant que nous finalisons votre connexion.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
