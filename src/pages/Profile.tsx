import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    User, Store, Mail, ShieldCheck, Save, Loader2, Calendar,
    LogOut, Settings, Bell, CreditCard, ShoppingBag,
    ChevronRight, MapPin, Camera, Star, AlertTriangle, X, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        fetchProfileAndOrders();
    }, []);

    const fetchProfileAndOrders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;

            // Check for vendor info
            let vendorData = null;
            const { data: vData } = await supabase
                .from('vendors')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            vendorData = vData;

            // Fetch User Roles to get the actual role
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);

            const userRole = roles && roles.length > 0 ? roles[0].role : 'client';

            setProfile({
                ...profileData,
                role: userRole,
                shop_name: vendorData?.shop_name || '',
                description: vendorData?.description || '',
                city: vendorData?.city || profileData?.city || ''
            });

            // Fetch Client Orders
            const { data: ordersData, error: ordersError } = await (supabase as any)
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setOrders(ordersData || []);

        } catch (error: any) {
            console.error('Error:', error.message);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
        toast.success("Déconnexion réussie");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_verification':
                return <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full"><Clock className="w-3 h-3 mr-1" /> À vérifier</Badge>;
            case 'paid':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Payé</Badge>;
            case 'processing':
                return <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1 rounded-full"><Package className="w-3 h-3 mr-1" /> En cours</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Livré</Badge>;
            default:
                return <Badge variant="secondary" className="rounded-full px-3 py-1">{status}</Badge>;
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Update Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    city: profile.city
                })
                .eq('id', profile.id);

            if (profileErr) throw profileErr;

            // Update Vendor if applicable
            if (profile.role === 'vendor') {
                const { error: vendorErr } = await supabase
                    .from('vendors')
                    .update({
                        shop_name: profile.shop_name,
                        description: profile.description,
                        city: profile.city
                    })
                    .eq('user_id', profile.id);

                if (vendorErr) throw vendorErr;
            }

            toast.success('Profil mis à jour avec succès');
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        const confirmed = window.confirm(
            "⚠️ ATTENTION : L'annulation d'une commande peut entraîner des pénalités sur votre compte utilisateur (frais de dossier ou limitation des options de paiement futures).\n\nSouhaitez-vous vraiment annuler cette commande ?"
        );

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            toast.success("Commande supprimée avec succès");
            fetchProfileAndOrders();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error("Erreur lors de la suppression de la commande");
        }
    };

    const handleCancelAllOrders = async () => {
        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length === 0) {
            toast.info("Aucune commande en attente à annuler.");
            return;
        }

        const confirmed = window.confirm(
            `⚠️ ATTENTION : Vous allez annuler ${pendingOrders.length} commandes en attente.\n\nL'annulation massive de commandes peut entraîner des pénalités sévères sur votre compte utilisateur (frais de dossier ou suspension temporaire).\n\nSouhaitez-vous vraiment tout annuler ?`
        );

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('user_id', profile.id)
                .eq('status', 'pending');

            if (error) throw error;

            toast.success("Toutes les commandes en attente ont été supprimées");
            fetchProfileAndOrders();
        } catch (error: any) {
            console.error('Delete all error:', error);
            toast.error("Erreur lors de la suppression massive");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Chargement de votre univers...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'personal', label: 'Profil Personnel', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'security', label: 'Sécurité', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    if (profile?.role === 'vendor') {
        menuItems.splice(1, 0, { id: 'shop', label: 'Ma Boutique', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50' });
    }

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Profile Banner */}
                <div className="h-48 bg-gradient-to-r from-primary/90 to-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/10" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-12 -right-12 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
                    <div className="grid lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: NAVIGATION */}
                        <aside className="lg:col-span-3 space-y-6">
                            <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                                <div className="p-6 text-center border-b bg-white">
                                    <div className="relative inline-block group mb-4">
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-foreground p-1 shadow-lg shadow-primary/20">
                                            <div className="w-full h-full rounded-[20px] bg-white flex items-center justify-center text-4xl font-black text-primary overflow-hidden">
                                                {profile?.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()
                                                )}
                                            </div>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight">{profile?.full_name || 'Utilisateur'}</h2>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">{profile?.email}</p>
                                    <Badge variant="secondary" className="rounded-full px-4 py-1 font-bold">
                                        {profile?.role === 'vendor' ? '🏆 Vendeur Pro' : '🛍️ Client Privilège'}
                                    </Badge>
                                </div>

                                <div className="p-3 space-y-1 bg-white">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                                                activeTab === item.id
                                                    ? "bg-primary/5 text-primary"
                                                    : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg transition-colors", activeTab === item.id ? "bg-primary text-white" : item.bg)}>
                                                    <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : item.color)} />
                                                </div>
                                                <span className="font-bold text-sm">{item.label}</span>
                                            </div>
                                            <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === item.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                                        </button>
                                    ))}

                                    <div className="pt-4 mt-4 border-t px-3 pb-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-lg shadow-gray-200/50 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                                <h3 className="font-bold mb-2">Besoin d'aide ?</h3>
                                <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Notre équipe support est disponible 7j/7 pour vous accompagner.</p>
                                <Button variant="secondary" size="sm" className="w-full rounded-lg font-bold">Contacter le support</Button>
                            </Card>
                        </aside>

                        {/* RIGHT COLUMN: CONTENT */}
                        <div className="lg:col-span-9 space-y-6">

                            {/* Personal Info Tab */}
                            {activeTab === 'personal' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-black">Informations Personnelles</h1>
                                            <p className="text-muted-foreground font-medium">Gérez votre identité et vos informations de contact</p>
                                        </div>
                                    </div>

                                    <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden">
                                        <CardHeader className="p-8 border-b bg-white">
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Settings className="w-4 h-4 text-blue-500" />
                                                </div>
                                                Détails du compte
                                            </CardTitle>
                                            <CardDescription>Votre identité sur la plateforme Yarid</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 bg-white">
                                            <form onSubmit={handleUpdate} className="space-y-8">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Nom Complet</Label>
                                                        <div className="relative group">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            <Input
                                                                value={profile?.full_name || ''}
                                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                                className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl font-medium"
                                                                placeholder="Votre nom"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 opacity-80">
                                                        <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Adresse Email</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input value={profile?.email} disabled className="pl-12 h-14 bg-muted/10 border-none rounded-2xl cursor-not-allowed italic" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Membre depuis le {new Date(profile?.created_at).toLocaleDateString()}
                                                    </p>
                                                    <Button
                                                        type="submit"
                                                        className="h-14 px-10 rounded-2xl font-black gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                                                        Sauvegarder les modifications
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Shop Tab (Vendor only) */}
                            {activeTab === 'shop' && profile?.role === 'vendor' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-black">Mon Espace Boutique</h1>
                                        <p className="text-muted-foreground font-medium">Configurez l'apparence et l'identité de votre commerce</p>
                                    </div>

                                    <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden">
                                        <CardHeader className="p-8 border-b bg-white">
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                    <Store className="w-4 h-4 text-orange-500" />
                                                </div>
                                                Paramètres de la vitrine
                                            </CardTitle>
                                            <CardDescription>Informations visibles par vos futurs clients</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 bg-white">
                                            <form onSubmit={handleUpdate} className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">Nom Public de la Boutique</Label>
                                                            <Input
                                                                value={profile?.shop_name || ''}
                                                                onChange={(e) => setProfile({ ...profile, shop_name: e.target.value })}
                                                                placeholder="Ex: Yaoundé Tech Store"
                                                                className="h-14 bg-muted/30 border-none rounded-2xl font-bold text-lg focus-visible:ring-2 focus-visible:ring-orange-500/20"
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">Localisation</Label>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    value={profile?.city || ''}
                                                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                                                    className="pl-12 h-14 bg-muted/30 border-none rounded-2xl font-medium focus-visible:ring-2 focus-visible:ring-orange-500/20"
                                                                    placeholder="Ex: Douala"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">Description de la Boutique</Label>
                                                        <Textarea
                                                            value={profile?.description || ''}
                                                            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                                            placeholder="Décrivez votre boutique en quelques lignes..."
                                                            className="bg-muted/30 border-none rounded-2xl min-h-[120px] focus-visible:ring-2 focus-visible:ring-orange-500/20"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        className="h-14 px-10 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/30"
                                                        disabled={isSaving}
                                                    >
                                                        Mettre à jour ma vitrine
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-black">Mes Commandes</h1>
                                            <p className="text-muted-foreground font-medium">Historique complet de vos achats et suivis</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {orders.some(o => o.status === 'pending') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-2 rounded-xl h-10 px-4"
                                                    onClick={handleCancelAllOrders}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Tout annuler
                                                </Button>
                                            )}
                                            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border font-bold text-sm h-10 flex items-center">
                                                Total: {orders.length}
                                            </div>
                                        </div>
                                    </div>

                                    {orders.length === 0 ? (
                                        <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl p-16 text-center bg-white">
                                            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Votre panier est bien calme...</h3>
                                            <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">Vous n'avez pas encore passé de commande sur notre plateforme.</p>
                                            <Button asChild size="lg" className="rounded-full px-10 h-14 font-black">
                                                <Link to="/catalogue">Explorer le catalogue</Link>
                                            </Button>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <Card key={order.id} className="border-none shadow-lg shadow-gray-200/30 rounded-2xl overflow-hidden bg-white hover:scale-[1.01] transition-all group">
                                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex items-start gap-6">
                                                            <div className="h-16 px-4 rounded-2xl bg-muted flex flex-col items-center justify-center shrink-0 border border-muted-foreground/10 group-hover:bg-primary/5 transition-colors min-w-[100px]">
                                                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter opacity-60">Référence</span>
                                                                <span className="font-mono font-black text-primary text-sm">#{order.order_number || order.id.substring(0, 8)}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <span className="font-black text-lg">{formatPrice(order.total_amount || order.total)}</span>
                                                                    {getStatusBadge(order.payment_status || order.status)}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </p>
                                                                <p className="text-xs bg-muted/50 w-fit px-2 py-1 rounded text-muted-foreground italic">
                                                                    ID: {order.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" className="rounded-xl font-bold" size="sm">
                                                                Détails
                                                            </Button>
                                                            {order.status === 'pending' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    className="rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
                                                                    size="sm"
                                                                    onClick={() => handleCancelOrder(order.id)}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                    Annuler
                                                                </Button>
                                                            )}
                                                            <Button className="rounded-xl font-bold gap-2" size="sm">
                                                                Recommander
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Security Placeholder */}
                            {activeTab === 'security' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-black">Sécurité & Confidentialité</h1>
                                        <p className="text-muted-foreground font-medium">Protégez votre compte et gérez vos accès</p>
                                    </div>
                                    <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl p-12 text-center bg-white">
                                        <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-4">Fonctionnalité en cours de déploiement</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto mb-8">Nous mettons à jour notre système de sécurité. Pour le moment, seul le changement d'email est restreint. Vous pourrez bientôt modifier votre mot de passe ici.</p>
                                        <Button variant="outline" className="rounded-2xl h-12 font-bold px-8">En savoir plus</Button>
                                    </Card>
                                </div>
                            )}

                            {/* Notifications Placeholder */}
                            {activeTab === 'notifications' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-black">Vos Notifications</h1>
                                        <p className="text-muted-foreground font-medium">Restez informé de l'activité de vos commandes</p>
                                    </div>
                                    <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl p-16 text-center bg-white">
                                        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                            <Bell className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-4">Tout est calme ici !</h3>
                                        <p className="text-muted-foreground">Vous n'avez aucune nouvelle notification pour le moment.</p>
                                    </Card>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
