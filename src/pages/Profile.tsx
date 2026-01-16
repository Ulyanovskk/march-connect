import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    User, Store, Mail, ShieldCheck, Save, Loader2, Calendar,
    LogOut, Settings, Bell, CreditCard, ShoppingBag,
    ChevronRight, MapPin, Camera, Star, AlertTriangle, X, Trash2, QrCode, Image as ImageIcon, ExternalLink
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
import ProductCard from '@/components/ui/ProductCard';
import { Heart as HeartIcon } from 'lucide-react';
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
    const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        return searchParams.get('tab') || 'personal';
    });
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

    // Synchroniser l'onglet avec l'URL si elle change
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Mettre à jour l'URL quand on change d'onglet manuellement
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    useEffect(() => {
        fetchProfileAndOrders();
    }, [activeTab]);

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
                .maybeSingle();

            if (profileError) throw profileError;

            // If profile doesn't exist yet, we'll use a partial object with the user ID
            const activeProfile = profileData || { id: session.user.id, full_name: session.user.user_metadata?.full_name || '' };

            // Fetch Roles
            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);

            let roles = rolesData?.map(r => r.role) || [];

            // Fallback: Check if user exists in vendors table even if roles are missing
            const { data: vendorCheck } = await supabase
                .from('vendors')
                .select('id, shop_name, slug, description, logo_url, cover_image_url, city')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (vendorCheck && !roles.includes('vendor')) {
                roles.push('vendor');
            }

            // Fallback 2: Check session metadata
            const metadataRole = session.user.user_metadata?.role;
            if (metadataRole === 'vendor' && !roles.includes('vendor')) {
                roles.push('vendor');
            }

            if (roles.length === 0) roles = ['client'];

            const primaryRole = roles.includes('admin') ? 'admin' : (roles.includes('vendor') ? 'vendor' : 'client');
            console.log('Detected roles:', roles, 'Primary:', primaryRole);

            let mergedProfile = { ...activeProfile, role: primaryRole, roles: roles };

            // If we have vendor data (from fallback or separate fetch), merge it
            if (vendorCheck) {
                mergedProfile = {
                    ...mergedProfile,
                    shop_id: vendorCheck.id,
                    slug: vendorCheck.slug,
                    shop_name: vendorCheck.shop_name,
                    description: vendorCheck.description,
                    logo_url: vendorCheck.logo_url,
                    cover_image_url: vendorCheck.cover_image_url,
                    city: vendorCheck.city || activeProfile.city // Prioritize shop city for vendors
                };
            }

            setProfile(mergedProfile);

            // Fetch Client Orders
            try {
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

                if (ordersError) {
                    console.error('Orders fetch error:', ordersError);
                } else {
                    setOrders(ordersData || []);
                }
            } catch (err) {
                console.error('Detailed orders fetch error:', err);
            }

            // Fetch Wishlist in 2 steps for maximum reliability
            try {
                const { data: wishlistEntries, error: wishError } = await supabase
                    .from('wishlist')
                    .select('product_id')
                    .eq('user_id', session.user.id);

                if (wishError) throw wishError;

                if (wishlistEntries && wishlistEntries.length > 0) {
                    const productIds = wishlistEntries.map(entry => entry.product_id);
                    const { data: productsData, error: productsError } = await supabase
                        .from('products')
                        .select(`
                            id,
                            name,
                            price,
                            original_price,
                            images,
                            stock,
                            vendor_id,
                            vendor:vendors (
                                shop_name,
                                is_verified,
                                city
                            )
                        `)
                        .in('id', productIds)
                        .eq('is_active', true);

                    if (productsError) throw productsError;
                    setWishlistProducts(productsData || []);
                } else {
                    setWishlistProducts([]);
                }
            } catch (err) {
                console.error('Manual wishlist fetch error:', err);
            }

        } catch (error: any) {
            console.error('CRITICAL: Error fetching profile data:', error);
            toast.error(`Erreur de chargement: ${error.message || 'Problème de connexion'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Non authentifié");

            const userId = session.user.id;

            // 1. Update Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    city: profile.city,
                    avatar_url: profile.avatar_url,
                })
                .eq('id', userId);

            if (profileErr) throw profileErr;

            // 2. Update Vendor info if applicable
            const isVendorUser = profile.role === 'vendor' || profile.roles?.includes('vendor');

            if (isVendorUser) {
                const { error: vendorErr } = await supabase
                    .from('vendors')
                    .update({
                        shop_name: profile.shop_name,
                        description: profile.description,
                        city: profile.city,
                        logo_url: profile.logo_url,
                        cover_image_url: profile.cover_image_url
                    })
                    .eq('user_id', userId);

                if (vendorErr) {
                    console.error('Vendor update error:', vendorErr);
                    throw vendorErr;
                }
            }

            toast.success('Profil et boutique mis à jour !');
            // Refresh local state to ensure consistency
            fetchProfileAndOrders();
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image est trop lourde (max 2MB)');
            return;
        }

        const toastId = toast.loading('Traitement de l\'image...');
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setProfile((prev: any) => ({ ...prev, [field]: base64 }));
            toast.dismiss(toastId);
            toast.success('Image chargée (n\'oubliez pas d\'enregistrer)');
        };
        reader.onerror = () => {
            toast.dismiss(toastId);
            toast.error('Erreur lors de la lecture du fichier');
        };
        reader.readAsDataURL(file);
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

    console.log('Profile Debug:', {
        id: profile?.id,
        role: profile?.role,
        roles: profile?.roles,
        shop_id: profile?.shop_id,
        isVendor: profile?.role === 'vendor' || profile?.roles?.includes('vendor') || !!profile?.shop_id
    });

    const isVendor = profile?.role === 'vendor' || profile?.roles?.includes('vendor') || !!profile?.shop_id || !!profile?.slug;

    const menuItems = [
        { id: 'personal', label: 'Profil Personnel', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'wishlist', label: 'Ma Wishlist', icon: HeartIcon, color: 'text-rose-500', bg: 'bg-rose-50' },
        ...(isVendor ? [
            { id: 'shop', label: 'Ma Boutique', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50' }
        ] : []),
        { id: 'security', label: 'Sécurité', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

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

                <div className="container mx-auto px-4 -mt-24 relative z-10 pb-20">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">

                        <aside className="lg:col-span-3 w-full max-w-full overflow-hidden">
                            <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                                <div className="p-8 flex flex-col items-center text-center border-b">
                                    <div className="relative group mb-4">
                                        <div
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            className="w-24 h-24 rounded-full sm:rounded-3xl bg-gradient-to-br from-primary to-primary-foreground p-1 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                            <div className="w-full h-full rounded-full sm:rounded-[20px] bg-white flex items-center justify-center text-4xl font-black text-primary overflow-hidden relative">
                                                {profile?.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()
                                                )}

                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'avatar_url')}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-muted pointer-events-none">
                                            <Camera className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-1 w-full flex flex-col items-center">
                                        <h2 className="text-xl font-bold tracking-tight truncate w-full max-w-[240px]">{profile?.full_name || 'Utilisateur'}</h2>
                                        <p className="text-sm text-muted-foreground truncate w-full max-w-[240px] mb-4">{profile?.email}</p>
                                        <Badge variant="secondary" className="rounded-full px-5 py-1.5 font-bold whitespace-nowrap bg-primary/10 text-primary border-none">
                                            {isVendor ? '🏆 Vendeur Pro' : '🛍️ Client Privilège'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible p-2 sm:p-3 space-x-2 lg:space-x-0 lg:space-y-1 bg-white scrollbar-hide scroll-smooth w-full">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleTabChange(item.id)}
                                            className={cn(
                                                "flex-none lg:w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group whitespace-nowrap lg:whitespace-normal",
                                                activeTab === item.id
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 lg:shadow-none"
                                                    : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg transition-colors", activeTab === item.id ? "bg-white/20 text-white" : item.bg)}>
                                                    <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : item.color)} />
                                                </div>
                                                <span className="font-bold text-sm">{item.label}</span>
                                            </div>
                                            <ChevronRight className={cn("hidden lg:block w-4 h-4 transition-transform", activeTab === item.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                                        </button>
                                    ))}

                                    <div className="lg:hidden flex-none pr-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm whitespace-nowrap"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sortir
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden lg:block pt-4 mt-4 border-t px-6 pb-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Déconnexion
                                    </button>
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
                                                        Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
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
                            {activeTab === 'shop' && isVendor && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl font-black">Mes Boutiques</h1>
                                            <p className="text-muted-foreground font-medium">Gérez et visualisez vos vitrines commerciales</p>
                                        </div>
                                        <Button asChild variant="outline" className="rounded-2xl font-bold gap-2 self-start sm:self-auto shadow-sm">
                                            <Link to={`/boutique/${profile.slug || profile.shop_id}`} target="_blank">
                                                <ExternalLink className="w-4 h-4 text-primary" />
                                                Voir ma boutique publique
                                            </Link>
                                        </Button>
                                    </div>

                                    {/* Shop Preview Card (List style) */}
                                    <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-orange-500/5 to-primary/5 border border-orange-500/10">
                                        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-orange-500/20 shadow-inner shrink-0">
                                                {profile?.logo_url ? (
                                                    <img src={profile.logo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                                        <Store className="w-8 h-8 text-orange-200" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h2 className="text-xl font-black mb-1">{profile?.shop_name || 'Ma Boutique'}</h2>
                                                <p className="text-sm text-muted-foreground font-medium mb-4 flex items-center justify-center md:justify-start gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {profile?.city || 'Localisation non définie'}
                                                </p>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                    <Button asChild size="sm" className="rounded-xl font-bold h-10 px-6">
                                                        <Link to={`/boutique/${profile.slug || profile.shop_id}`} target="_blank">
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            Voir la boutique
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        type="button"
                                                        className="rounded-xl font-bold h-10 px-6 border-orange-500/20 bg-white/50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                        onClick={() => {
                                                            const el = document.getElementById('boutique-details-card');
                                                            el?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Modifier les infos
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card id="boutique-details-card" className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden">
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

                                                    <div className="space-y-6">
                                                        <Label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Images de la Boutique</Label>
                                                        <div className="grid sm:grid-cols-2 gap-6">
                                                            {/* Logo Upload */}
                                                            <div className="space-y-3">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Logo de la Boutique</Label>
                                                                <div
                                                                    className="relative group w-32 h-32 mx-auto sm:mx-0 cursor-pointer"
                                                                    onClick={() => document.getElementById('shop-logo-upload')?.click()}
                                                                >
                                                                    <div className="w-full h-full rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-orange-500/50">
                                                                        {profile?.logo_url ? (
                                                                            <img src={profile.logo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Camera className="w-6 h-6 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        id="shop-logo-upload"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleImageChange(e, 'logo_url')}
                                                                    />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground text-center sm:text-left italic">Idéalement un carré (PNG/JPG, max 2Mo)</p>
                                                            </div>

                                                            {/* Cover Upload */}
                                                            <div className="space-y-3">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Image de Couverture</Label>
                                                                <div
                                                                    className="relative group w-full h-32 cursor-pointer"
                                                                    onClick={() => document.getElementById('shop-cover-upload')?.click()}
                                                                >
                                                                    <div className="w-full h-full rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-orange-500/50">
                                                                        {profile?.cover_image_url ? (
                                                                            <img src={profile.cover_image_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="text-center">
                                                                                <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                                                                                <span className="text-[10px] text-muted-foreground font-medium">Dimension recommandée: 1200x400</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Camera className="w-6 h-6 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        id="shop-cover-upload"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleImageChange(e, 'cover_image_url')}
                                                                    />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground text-center sm:text-left italic">S'affiche en arrière-plan sur votre page</p>
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
                                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="space-y-1">
                                            <h1 className="text-3xl font-black tracking-tight">Mes Commandes</h1>
                                            <p className="text-muted-foreground font-medium">Suivez vos achats et gérez vos livraisons</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {orders.some(o => o.status === 'pending') && (
                                                <button
                                                    onClick={handleCancelAllOrders}
                                                    className="group flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Tout annuler
                                                </button>
                                            )}
                                            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-muted-foreground/10 font-black text-xs h-9 flex items-center gap-2">
                                                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Total</span>
                                                <span className="text-primary text-sm">{orders.length}</span>
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
                                                <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white border border-muted-foreground/5 mb-4 group">
                                                    <div className="p-5 sm:p-6">
                                                        {/* Ticket Header */}
                                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Référence</p>
                                                                    <p className="font-mono font-bold text-sm text-foreground">#{order.order_number || order.id.substring(0, 8)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0">
                                                                {getStatusBadge(order.payment_status || order.status)}
                                                            </div>
                                                        </div>

                                                        {/* Main Content */}
                                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                                            <div className="space-y-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">Total payé</p>
                                                                    <p className="text-3xl font-black text-primary tracking-tight">
                                                                        {formatPrice(order.total_amount || order.total)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold">
                                                                        <Calendar className="w-3.5 h-3.5" />
                                                                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1 sm:flex-none h-11 rounded-xl font-bold border-muted-foreground/20 hover:bg-muted/50 transition-colors"
                                                                    onClick={() => setSelectedOrderForDetails(order)}
                                                                >
                                                                    Détails
                                                                </Button>

                                                                {order.status === 'pending' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-11 px-4 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                        onClick={() => handleCancelOrder(order.id)}
                                                                    >
                                                                        <X className="w-4 h-4 sm:mr-2" />
                                                                        <span className="hidden sm:inline">Annuler</span>
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    className="flex-1 sm:flex-none h-11 rounded-xl font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                                                                >
                                                                    Recommander
                                                                </Button>
                                                            </div>
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

                            {/* Wishlist Tab */}
                            {activeTab === 'wishlist' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="space-y-1">
                                            <h1 className="text-3xl font-black tracking-tight">Ma Wishlist</h1>
                                            <p className="text-muted-foreground font-medium">Retrouvez tous vos coups de cœur</p>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-muted-foreground/10 font-black text-xs h-9 flex items-center gap-2">
                                            <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Articles</span>
                                            <span className="text-rose-500 text-sm">{wishlistProducts.length}</span>
                                        </div>
                                    </div>

                                    {wishlistProducts.length === 0 ? (
                                        <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl p-16 text-center bg-white">
                                            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <HeartIcon className="w-10 h-10 text-rose-300" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Votre wishlist est vide</h3>
                                            <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">Parcourez le catalogue et cliquez sur le cœur pour ajouter des produits ici.</p>
                                            <Button asChild size="lg" className="rounded-full px-10 h-14 font-black">
                                                <Link to="/catalogue">Découvrir des produits</Link>
                                            </Button>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                            {wishlistProducts.map((product) => (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    name={product.name}
                                                    price={product.price}
                                                    originalPrice={product.original_price}
                                                    image={product.images?.[0]}
                                                    vendorName={product.vendor?.shop_name}
                                                    vendorId={product.vendor_id}
                                                    vendorCity={product.vendor?.city}
                                                    isVerified={product.vendor?.is_verified}
                                                    stock={product.stock}
                                                />
                                            ))}
                                        </div>
                                    )}
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
