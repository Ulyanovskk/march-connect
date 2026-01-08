import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import yaridLogo from '@/assets/yarid-logo.jpg';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const isVendorSignup = searchParams.get('vendor') === 'true';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [accountType, setAccountType] = useState<'client' | 'vendor'>(isVendorSignup ? 'vendor' : 'client');
  
  // Debug: Log the role being sent
  console.log('[SIGNUP] isVendorSignup:', isVendorSignup, '| accountType:', accountType);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setIsLoading(true);

    const finalRole = isVendorSignup ? 'vendor' : accountType;
    console.log('[SIGNUP] Submitting with role:', finalRole);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: finalRole,
          },
        },
      });

      console.log('[SIGNUP] Response:', { 
        user: data?.user?.id, 
        session: !!data?.session, 
        error: error?.message 
      });

      if (error) {
        console.error('[SIGNUP] Error:', error);
        toast.error(error.message);
        return;
      }

      if (data.user) {
        console.log('[SIGNUP] User created:', data.user.id);
        console.log('[SIGNUP] User metadata:', data.user.user_metadata);
        console.log('[SIGNUP] Has session:', !!data.session);
        
        toast.success('Compte créé avec succès !');
        
        // If email confirmation is disabled or auto-confirmed
        if (!data.session) {
          console.warn('[SIGNUP] No session - email confirmation required');
          toast.info('Veuillez vérifier votre email pour confirmer votre compte.', { duration: 5000 });
        } else {
          console.log('[SIGNUP] Session created - user logged in automatically');
        }

        // Redirect to login or dashboard
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        console.error('[SIGNUP] No user in response!');
      }
    } catch (error: any) {
      toast.error('Une erreur est survenue lors de l\'inscription');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      // Stocker le type de compte souhaité pour le récupérer après redirection
      localStorage.setItem('pending_role', isVendorSignup ? 'vendor' : accountType);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erreur de connexion ${provider}: ` + error.message);
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { score: 0, label: '', color: '' };
    if (password.length < 6) return { score: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { score: 2, label: 'Moyen', color: 'bg-yellow-500' };
    return { score: 3, label: 'Fort', color: 'bg-accent' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={yaridLogo}
              alt="YARID"
              className="h-12 w-auto object-contain bg-white rounded-lg p-1"
            />
          </Link>

          <div className={`space-y-6 ${isVendorSignup ? 'mt-[6cm]' : 'mt-8'}`}>
            <h1 className="text-4xl font-bold text-white leading-tight">
              {isVendorSignup ? 'Ouvrez votre boutique sur YARID' : 'Rejoignez la communauté YARID'}
            </h1>
            <p className="text-white/80 text-lg">
              {isVendorSignup
                ? 'Rejoignez des centaines de vendeurs camerounais et touchez des milliers de clients partout au Cameroun.'
                : 'Créez votre compte et commencez à acheter ou vendre en toute sécurité.'
              }
            </p>

            <div className="space-y-4 pt-6">
              {isVendorSignup ? (
                <>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Inscription gratuite et sans frais de mise en place</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Commission de seulement 15% sur les ventes</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Tableau de bord complet pour gérer vos produits</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Support dédié pour les vendeurs</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Inscription gratuite et rapide</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Vendeurs vérifiés et produits de qualité</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Paiement sécurisé (Mobile Money, Cash)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 YARID. Tous droits réservés.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={yaridLogo}
                alt="YARID"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              {isVendorSignup ? 'Créer ma boutique' : 'Créer un compte'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isVendorSignup
                ? 'Remplissez le formulaire pour devenir vendeur sur YARID'
                : 'Remplissez le formulaire pour vous inscrire'
              }
            </p>
          </div>

          {/* Account Type Selection - Only show if not vendor signup */}
          {!isVendorSignup && (
            <div className="space-y-3">
              <Label>Type de compte</Label>
              <RadioGroup
                value={accountType}
                onValueChange={(value) => {
                  console.log('[SIGNUP] Type de compte changé:', value);
                  setAccountType(value as 'client' | 'vendor');
                }}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="client"
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${accountType === 'client'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <RadioGroupItem value="client" id="client" />
                  <div>
                    <span className="font-medium">Client</span>
                    <p className="text-xs text-muted-foreground">J'achète des produits</p>
                  </div>
                </Label>
                <Label
                  htmlFor="vendor"
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${accountType === 'vendor'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <RadioGroupItem value="vendor" id="vendor" />
                  <div>
                    <span className="font-medium">Vendeur</span>
                    <p className="text-xs text-muted-foreground">Je vends mes produits</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${strength.score === 3 ? 'text-accent' : strength.score === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                J'accepte les{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
                {isVendorSignup && '. Je comprends que YARID prélève une commission de 15% sur chaque vente.'}
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isVendorSignup ? 'Création de la boutique...' : 'Création du compte...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isVendorSignup ? 'Créer ma boutique' : 'Créer mon compte'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
