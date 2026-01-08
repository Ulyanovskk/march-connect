import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, Store, ArrowRight, CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Landing = () => {
    const navigate = useNavigate();

    // Redirect authenticated users away from Landing
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const role = session.user.user_metadata?.role || 'client';
                if (role === 'vendor') {
                    navigate('/vendor/dashboard');
                } else {
                    navigate('/shop');
                }
            }
        };
        checkAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col">
                {/* Hero Section */}
                <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                            <Zap className="w-3 h-3" />
                            LA RÉFÉRENCE DU E-COMMERCE AU CAMEROUN
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                            Achetez en toute confiance, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yarid-orange">
                                Vendez avec succès.
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            March Connect est la plateforme innovante qui connecte les acheteurs exigeants aux meilleurs vendeurs locaux. Une expérience fluide, sécurisée et ultra-rapide.
                        </p>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
                </section>

                {/* Choice Section */}
                <section className="py-12 -mt-16 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                        {/* Client Path */}
                        <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-2xl shadow-soft bg-card">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShoppingBag className="w-32 h-32" />
                            </div>
                            <CardContent className="p-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Je suis un Acheteur</h3>
                                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                                    Explorez des milliers de produits, profitez de prix compétitifs et faites-vous livrer en toute sérénité.
                                </p>
                                <div className="space-y-3 mb-8">
                                    {['Paiement 100% sécurisé', 'Livraison rapide', 'Protection acheteur'].map((text) => (
                                        <div key={text} className="flex items-center gap-2 text-xs font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-yarid-green" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="default"
                                        className="w-full h-12 text-sm font-bold gap-2 rounded-xl"
                                        onClick={() => navigate('/catalogue')}
                                    >
                                        Découvrir le catalogue
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 text-xs font-bold rounded-xl"
                                        onClick={() => navigate('/signup')}
                                    >
                                        Créer mon compte client
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vendor Path */}
                        <Card className="group relative overflow-hidden border-2 transition-all hover:border-yarid-orange/50 hover:shadow-2xl shadow-soft bg-card">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Store className="w-32 h-32" />
                            </div>
                            <CardContent className="p-8">
                                <div className="w-14 h-14 rounded-2xl bg-yarid-orange/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Store className="w-7 h-7 text-yarid-orange" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Je suis un Vendeur</h3>
                                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                                    Boostez votre visibilité, gérez votre stock et développez votre activité commerciale en ligne dès aujourd'hui.
                                </p>
                                <div className="space-y-3 mb-8">
                                    {['Dashboard intuitif', 'Zéro frais d\'entrée', 'Analytiques avancées'].map((text) => (
                                        <div key={text} className="flex items-center gap-2 text-xs font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-yarid-green" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="default"
                                        className="w-full h-12 text-sm font-bold gap-2 rounded-xl bg-yarid-orange hover:bg-yarid-orange/90 text-white"
                                        onClick={() => navigate('/vendeur/inscription')}
                                    >
                                        Ouvrir ma boutique
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 text-xs font-bold rounded-xl"
                                        onClick={() => navigate('/login')}
                                    >
                                        Accéder à mon tableau de bord
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 text-primary">Pourquoi choisir March Connect ?</h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-primary to-yarid-orange mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-background shadow-soft flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="text-lg font-bold mb-3 italic">Sécurité Garantie</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Toutes vos transactions sont protégées par des systèmes de cryptage de pointe.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-background shadow-soft flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-8 h-8 text-yarid-orange" />
                                </div>
                                <h4 className="text-lg font-bold mb-3 italic">Communauté Active</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Rejoignez des milliers d'utilisateurs qui font confiance à notre réseau local.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-background shadow-soft flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-yarid-green" />
                                </div>
                                <h4 className="text-lg font-bold mb-3 italic">Meilleur Prix</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Nous négocions avec les vendeurs pour vous offrir les tarifs les plus bas du marché.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Landing;
