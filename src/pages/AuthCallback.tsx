import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // 1. Get current session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const user = session.user;
                    const pendingRole = localStorage.getItem('pending_role');

                    // 2. If we just signed up via OAuth, we might need to set the role
                    if (pendingRole) {
                        await supabase
                            .from('profiles')
                            .upsert({
                                id: user.id,
                                email: user.email,
                                full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                                role: pendingRole,
                            } as any);
                        localStorage.removeItem('pending_role');
                    }

                    // 3. Get exact profile (using as any to avoid TS errors on dynamic schema)
                    const { data: profile, error: profileError } = await (supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single() as any);

                    // 4. Redirect based on profile state
                    if (!profile || !profile.onboarding_completed) {
                        const roleToUse = profile?.role || pendingRole || 'client';
                        navigate(roleToUse === 'vendor' ? '/onboarding/vendor' : '/onboarding/client');
                    } else {
                        if (profile.role === 'admin') navigate('/admin/payments');
                        else if (profile.role === 'vendor') navigate('/vendor/dashboard');
                        else navigate('/shop');
                    }
                    return;
                }

                // 5. Fallback for Email Confirmation (legacy/non-session flow)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');

                if (type === 'signup' && accessToken) {
                    toast.success('Email confirmé avec succès !');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (type === 'recovery' && accessToken) {
                    toast.success('Vous pouvez réinitialiser votre mot de passe.');
                    navigate('/reset-password');
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
