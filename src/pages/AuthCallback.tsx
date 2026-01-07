import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Get the URL hash parameters
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (type === 'signup' && accessToken) {
                    // Email confirmation successful
                    toast.success('Votre email a été confirmé avec succès !', {
                        description: 'Vous pouvez maintenant vous connecter à votre compte.',
                        duration: 5000,
                    });

                    // Wait a bit before redirecting
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else if (type === 'recovery' && accessToken) {
                    // Password recovery
                    toast.success('Vous pouvez maintenant définir un nouveau mot de passe.');
                    navigate('/reset-password');
                } else {
                    // No valid tokens, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error during auth callback:', error);
                toast.error('Une erreur est survenue lors de la confirmation.');
                navigate('/login');
            }
        };

        handleEmailConfirmation();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Vérification en cours...</h2>
                <p className="text-muted-foreground">Veuillez patienter pendant que nous confirmons votre email.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
