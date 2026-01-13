import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { BadgeCheck, MapPin, Store, Calendar, Package, Loader2, ChevronLeft, User, Camera, Image as ImageIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const ShopDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { itemCount } = useCart();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id);

                const roles = roleData?.map(r => r.role) || [];
                setCurrentUser({
                    ...session.user,
                    isAdmin: roles.includes('admin'),
                    roles: roles
                });
            } else {
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
        queryKey: ['shop', id],
        queryFn: async () => {
            // Tentative par ID (UUID)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
            let vendorData = null;

            if (isUUID) {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (!error) vendorData = data;
            }

            // Si non trouvé par ID ou si ce n'est pas un UUID, on cherche par slug
            if (!vendorData) {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('slug', id)
                    .single();
                if (error) throw error;
                vendorData = data;
            }

            // Charger le profil du gérant séparément pour éviter les erreurs de jointure
            if (vendorData?.user_id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', vendorData.user_id)
                    .single();

                if (profileData) {
                    vendorData.profiles = profileData;
                }
            }

            return vendorData;
        },
        enabled: !!id
    });

    const isOwner = currentUser?.id === shop?.user_id || currentUser?.isAdmin;

    const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['shop-products', shop?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('vendor_id', shop?.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!shop?.id
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !shop || !isOwner) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image est trop lourde (max 2MB)');
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;

            try {
                const { error } = await supabase
                    .from('vendors')
                    .update({ logo_url: base64 })
                    .eq('id', shop.id);

                if (error) throw error;

                toast.success('Logo mis à jour avec succès');
                window.location.reload(); // Refresh to show new logo
            } catch (error: any) {
                toast.error('Erreur lors de la mise à jour du logo');
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !shop || !isOwner) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image est trop lourde (max 2MB)');
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ avatar_url: base64 })
                    .eq('id', shop.user_id);

                if (error) throw error;

                toast.success('Photo de profil mise à jour');
                window.location.reload();
            } catch (error: any) {
                toast.error('Erreur lors de la mise à jour');
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !shop || !isOwner) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image est trop lourde (max 2MB)');
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;

            try {
                const { error } = await supabase
                    .from('vendors')
                    .update({ cover_image_url: base64 })
                    .eq('id', shop.id);

                if (error) throw error;

                toast.success('Image de couverture mise à jour');
                window.location.reload();
            } catch (error: any) {
                toast.error('Erreur lors de la mise à jour');
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (shopLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!shop || shopError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Store className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Boutique non trouvée</h2>
                <p className="text-slate-500 mb-6 max-w-xs">
                    {shopError ? (shopError as any).message : `La boutique avec l'ID "${id}" n'a pas pu être trouvée. Le lien est peut-être incorrect.`}
                </p>
                <Button asChild className="rounded-xl px-8 font-bold">
                    <Link to="/catalogue">Explorer le catalogue</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header cartItemCount={itemCount} />

            <main className="flex-1">
                {/* Hero / Header Section */}
                <div className="bg-slate-900 text-white py-12 md:py-24 relative overflow-hidden group/hero">
                    {/* Background cover image */}
                    {shop.cover_image_url ? (
                        <div className="absolute inset-0 z-0">
                            <img src={shop.cover_image_url} alt="" className="w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                        </>
                    )}

                    {isOwner && (
                        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                            <div
                                onClick={() => document.getElementById('cover-upload')?.click()}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl cursor-pointer opacity-0 group-hover/hero:opacity-100 transition-opacity flex items-center gap-2 font-bold text-xs"
                            >
                                <ImageIcon className="w-4 h-4" />
                                Changer la couverture
                                <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                            </div>

                            {currentUser?.id === shop?.user_id && (
                                <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white rounded-xl h-auto py-2 px-4 opacity-0 group-hover/hero:opacity-100 transition-opacity font-bold text-xs gap-2">
                                    <Link to="/profile?tab=shop">
                                        <Settings className="w-4 h-4" />
                                        Modifier les infos
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="container mx-auto px-4 relative z-10">
                        <Link to="/catalogue" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-10 transition-colors font-bold text-sm">
                            <ChevronLeft className="w-4 h-4" />
                            Retour au catalogue
                        </Link>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[2rem] p-1.5 shadow-2xl shrink-0 rotate-3 hover:rotate-0 transition-transform duration-500 relative group">
                                <div className="w-full h-full bg-slate-50 rounded-[1.7rem] flex items-center justify-center overflow-hidden border border-slate-100 relative">
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}

                                    {shop.logo_url ? (
                                        <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="w-16 h-16 text-slate-300" />
                                    )}

                                    {isOwner && (
                                        <div
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Camera className="w-8 h-8 text-white" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Changer le logo</span>
                                            </div>
                                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight">{shop.shop_name}</h1>
                                    {shop.is_verified && (
                                        <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 animate-bounce-subtle">
                                            <BadgeCheck className="w-4 h-4" />
                                            Vendeur Certifié
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden relative group/avatar">
                                            {shop.profiles?.avatar_url ? (
                                                <img src={shop.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 text-primary" />
                                            )}

                                            {isOwner && (
                                                <div
                                                    onClick={() => document.getElementById('avatar-upload-shop')?.click()}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Camera className="w-3 h-3 text-white" />
                                                    <input id="avatar-upload-shop" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Vendeur</p>
                                            <p className="text-sm font-bold text-white">{shop.profiles?.full_name || shop.shop_name || 'Commerçant Yarid'}</p>
                                        </div>
                                    </div>
                                </div>

                                {shop.description && (
                                    <p className="text-white/70 text-lg md:text-xl max-w-2xl mb-8 font-medium leading-relaxed italic">
                                        "{shop.description}"
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-sm font-black text-white/60">
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {shop.city || 'Localisation non définie'}
                                    </div>
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Depuis {shop.created_at ? new Date(shop.created_at).getFullYear() : 'nouveau'}
                                    </div>
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md text-white">
                                        <Package className="w-4 h-4 text-primary font-black" />
                                        {products?.length || 0} Produits en ligne
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="container mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Nos Produits</h2>
                            <p className="text-slate-500 font-medium">Parcourez le stock de la boutique {shop.shop_name}</p>
                        </div>
                        <div className="h-0.5 flex-1 mx-12 bg-slate-100 rounded-full hidden lg:block" />
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-slate-50 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : (products?.length || 0) > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                            {products?.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    originalPrice={product.original_price}
                                    image={product.images?.[0]}
                                    vendorName={shop.shop_name}
                                    vendorCity={shop.city}
                                    isVerified={shop.is_verified}
                                    stock={product.stock}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Package className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">Bientôt du nouveau !</h4>
                            <p className="text-slate-400 font-bold max-w-xs mx-auto">Cette boutique n'a pas encore mis de produits en ligne ou recharge son stock.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ShopDetail;
