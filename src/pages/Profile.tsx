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
    ChevronRight, MapPin, Camera, Star, AlertTriangle, X, Trash2, QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

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
            setProfile(profileData);

            // Fetch Client Orders
            const { data: ordersData, error: ordersError } = await (supabase as any)
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (*)
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setOrders(ordersData || []);

        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    shop_name: profile.shop_name,
                    description: profile.description,
                    city: profile.city,
                })
                .eq('id', profile.id);

            if (profileErr) throw profileErr;

            if (profile.role === 'vendor') {
                const { error: vendorErr } = await supabase
                    .from('vendors')
                    .update({
                        name: profile.shop_name,
                        description: profile.description,
                        city: profile.city,
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
            case 'processing':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">En préparation</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Livré</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Annulé</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
                                                            <Button
                                                                variant="outline"
                                                                className="rounded-xl font-bold gap-2"
                                                                size="sm"
                                                                onClick={() => setSelectedOrderForDetails(order)}
                                                            >
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

            <Dialog open={!!selectedOrderForDetails} onOpenChange={() => setSelectedOrderForDetails(null)}>
                <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-2 border-b text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <DialogTitle className="text-2xl font-black">Détails de la Commande</DialogTitle>
                                <DialogDescription className="font-medium">Référence #{selectedOrderForDetails?.order_number}</DialogDescription>
                            </div>
                            <div className="mx-auto md:mx-0">
                                {selectedOrderForDetails && getStatusBadge(selectedOrderForDetails.status)}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        <div className="space-y-8">
                            {/* Product List */}
                            <div className="space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Articles commandés
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrderForDetails?.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-muted-foreground/5 transition-colors hover:bg-muted/30">
                                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border shrink-0">
                                                <img
                                                    src={item.products?.images?.[0] || '/placeholder.png'}
                                                    alt={item.products?.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{item.products?.name}</p>
                                                <p className="text-xs text-muted-foreground font-medium">Qté: {item.quantity} × {formatPrice(item.unit_price)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-primary text-sm">{formatPrice(item.total_price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* QR Code Section - Visible only if not cancelled */}
                            {selectedOrderForDetails?.status !== 'cancelled' && (
                                <div className="pt-8 border-t">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <QrCode className="w-3 h-3" />
                                            Confirmation de Livraison
                                        </div>
                                        <h3 className="font-bold text-lg">Votre Code de Livraison</h3>

                                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-4 border-dashed border-primary/20 max-w-[280px] mx-auto shadow-inner">
                                            {selectedOrderForDetails?.qr_code_secret ? (
                                                <>
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-muted">
                                                        <QRCodeCanvas
                                                            value={selectedOrderForDetails.qr_code_secret}
                                                            size={180}
                                                            level="H"
                                                            includeMargin={true}
                                                            imageSettings={{
                                                                src: "/favicon.ico",
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 35,
                                                                width: 35,
                                                                excavate: true,
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="mt-4 font-mono font-black text-lg text-primary tracking-[0.2em] bg-primary/5 px-6 py-1.5 rounded-full border border-primary/10">
                                                        {selectedOrderForDetails.order_number}
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                                                    <p className="text-xs text-muted-foreground">Initialisation du code...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-left max-w-lg mx-auto">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                                                IMPORTANT : Ne présentez ce code à l'agent YARID qu'une fois vos articles vérifiés. Le scan de ce code confirme officiellement la livraison et débloque le paiement.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Financial Summary */}
                            <div className="pt-6 border-t space-y-3">
                                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                    <span>Montant des articles</span>
                                    <span>{formatPrice(selectedOrderForDetails?.subtotal || selectedOrderForDetails?.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                    <span>Frais de livraison</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t text-xl font-black text-primary">
                                    <span>Total Payé</span>
                                    <span>{formatPrice(selectedOrderForDetails?.total_amount || selectedOrderForDetails?.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-2 border-t mt-0">
                        <Button
                            className="w-full h-14 rounded-2xl font-black text-lg"
                            onClick={() => setSelectedOrderForDetails(null)}
                        >
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
