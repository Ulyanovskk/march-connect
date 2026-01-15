import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    Store,
    CheckCircle,
    XCircle,
    ExternalLink,
    MapPin,
    Calendar,
    Package,
    TrendingUp,
    BadgeCheck,
    AlertTriangle,
    Eye,
    Ban,
    Globe,
    Wallet,
    ChevronDown
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from '@/lib/demo-data';
import { useNavigate, Link } from 'react-router-dom';

const AdminShops = () => {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [shopStats, setShopStats] = useState({ products: 0, orders: 0, revenue: 0 });
    const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            setLoading(true);

            // 1. Fetch all shops
            const { data: shopsData, error: shopsError } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (shopsError) throw shopsError;

            // 2. Extract unique owner IDs
            const ownerIds = Array.from(new Set((shopsData || []).map(s => s.user_id)));

            if (ownerIds.length === 0) {
                setShops([]);
                return;
            }

            // 3. Fetch profiles for these owners
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', ownerIds);

            if (profilesError) throw profilesError;

            // 4. Merge data
            const mergedShops = (shopsData || []).map(shop => {
                const ownerProfile = profilesData?.find(p => p.id === shop.user_id);

                return {
                    ...shop,
                    owner: ownerProfile || {
                        full_name: shop.shop_name || 'Propriétaire inconnu',
                        avatar_url: null
                    }
                };
            });

            setShops(mergedShops);
        } catch (error: any) {
            toast.error("Erreur chargement boutiques: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchShopStats = async (shopId: string) => {
        try {
            // Count products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('vendor_id', shopId);

            // Count orders for this shop
            const { count: ordersCount } = await supabase
                .from('order_items')
                .select('*', { count: 'exact', head: true })
                .eq('vendor_id', shopId);

            // Fetch total revenue
            const { data: revenueData } = await supabase
                .from('order_items')
                .select('total_price')
                .eq('vendor_id', shopId);

            const totalRevenue = revenueData?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0;

            setShopStats({
                products: productsCount || 0,
                orders: ordersCount || 0,
                revenue: totalRevenue
            });
        } catch (error) {
            console.error("Error fetching shop stats:", error);
        }
    };

    const handleViewShop = (shop: any) => {
        setSelectedShop(shop);
        setShopStats({ products: 0, orders: 0, revenue: 0 });
        setIsDetailsOpen(true);
        fetchShopStats(shop.id);
    };

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(currentStatus ? "Boutique mise en pause" : "Boutique remise en ligne");
            fetchShops();
        } catch (error: any) {
            toast.error("Erreur: " + error.message);
        }
    };

    const handleVerifyShop = async (id: string, isVerified: boolean) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: isVerified })
                .eq('id', id);

            if (error) throw error;

            toast.success(isVerified ? "Boutique certifiée" : "Certification retirée");
            fetchShops();
        } catch (error: any) {
            toast.error("Erreur: " + error.message);
        }
    };

    const filteredShops = shops.filter(s =>
        s.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Vitrines & Boutiques</h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez l'apparence et la visibilité des commerçants sur la plateforme</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher par nom, slug ou ville..."
                            className="pl-11 h-12 rounded-xl border-none bg-slate-50 focus:bg-white transition-all outline-none ring-0 focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold">Boutique</TableHead>
                                <TableHead className="font-bold">Lien Publique</TableHead>
                                <TableHead className="font-bold">Propriétaire</TableHead>
                                <TableHead className="font-bold">Ville</TableHead>
                                <TableHead className="font-bold">Statut</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6}><div className="h-16 bg-slate-50 rounded-xl"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredShops.length > 0 ? (
                                filteredShops.map((shop) => (
                                    <TableRow key={shop.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    {shop.logo_url ? (
                                                        <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Store className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                                        {shop.shop_name}
                                                        {shop.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Boutique ID: {shop.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" className="rounded-lg gap-2 font-bold text-xs h-8 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all group" asChild>
                                                <Link to={`/boutique/${shop.slug || shop.id}`} target="_blank">
                                                    <ExternalLink className="w-3 h-3" />
                                                    Voir boutique
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={shop.owner?.avatar_url} />
                                                    <AvatarFallback>{shop.owner?.full_name?.charAt(0) || '?'}</AvatarFallback>
                                                </Avatar>
                                                {shop.owner?.full_name || 'Inconnu'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {shop.city || 'Non défini'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`rounded-lg py-1 px-3 ${shop.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {shop.is_active ? 'En ligne' : 'Invisible'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                                                    <DropdownMenuItem onClick={() => handleViewShop(shop)} className="p-3 rounded-xl gap-3 font-bold cursor-pointer">
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                        Détails & Stats
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleVisibility(shop.id, shop.is_active)} className="p-3 rounded-xl gap-3 font-bold cursor-pointer">
                                                        <Globe className="w-4 h-4 text-slate-400" />
                                                        {shop.is_active ? 'Mettre en pause' : 'Mettre en ligne'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleVerifyShop(shop.id, !shop.is_verified)} className="p-3 rounded-xl gap-3 font-bold cursor-pointer">
                                                        <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                                        {shop.is_verified ? 'Retirer la certification' : 'Certifier la boutique'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <p className="text-slate-400 font-medium">Aucune boutique trouvée</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="h-10 bg-slate-50 rounded-xl mb-4" />
                                <div className="h-20 bg-slate-50 rounded-xl" />
                            </div>
                        ))
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop) => (
                            <div key={shop.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft transition-all duration-300">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setMobileExpandedId(mobileExpandedId === shop.id ? null : shop.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            {shop.logo_url ? (
                                                <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Store className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                                                {shop.shop_name}
                                                {shop.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ID: {shop.id.substring(0, 6)}</p>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${mobileExpandedId === shop.id ? 'rotate-180 bg-slate-100' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {mobileExpandedId === shop.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Propriétaire</p>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6 border border-slate-200">
                                                        <AvatarImage src={shop.owner?.avatar_url} />
                                                        <AvatarFallback className="text-[10px] font-bold">{shop.owner?.full_name?.charAt(0) || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-bold text-slate-700 truncate">{shop.owner?.full_name || 'Inconnu'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ville</p>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-700">{shop.city || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Badge variant="secondary" className={`rounded-lg h-7 px-3 ${shop.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                                {shop.is_active ? 'En ligne' : 'Invisible'}
                                            </Badge>
                                            <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 text-xs font-bold" asChild>
                                                <Link to={`/boutique/${shop.slug || shop.id}`} target="_blank">
                                                    Voir boutique <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                                                </Link>
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 pt-1">
                                            <Button
                                                variant="outline"
                                                className="h-9 border-slate-200 hover:bg-slate-50 hover:text-primary text-[10px] font-bold flex flex-col gap-0.5 items-center justify-center p-0"
                                                onClick={() => handleViewShop(shop)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mb-0.5" />
                                                Détails
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className={`h-9 border-slate-200 hover:bg-slate-50 text-[10px] font-bold flex flex-col gap-0.5 items-center justify-center p-0 ${shop.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
                                                onClick={() => toggleVisibility(shop.id, shop.is_active)}
                                            >
                                                <Globe className="w-3.5 h-3.5 mb-0.5" />
                                                {shop.is_active ? 'Pause' : 'Publier'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className={`h-9 border-slate-200 hover:bg-slate-50 text-[10px] font-bold flex flex-col gap-0.5 items-center justify-center p-0 ${shop.is_verified ? 'text-red-500' : 'text-emerald-600'}`}
                                                onClick={() => handleVerifyShop(shop.id, !shop.is_verified)}
                                            >
                                                <BadgeCheck className="w-3.5 h-3.5 mb-0.5" />
                                                {shop.is_verified ? 'Retirer' : 'Certifier'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <Store className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucune boutique trouvée</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Shop Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4 relative overflow-hidden h-32 flex flex-col justify-end">
                        <div className="absolute inset-0 z-0">
                            {selectedShop?.cover_image_url ? (
                                <img src={selectedShop.cover_image_url} className="w-full h-full object-cover opacity-30" />
                            ) : (
                                <div className="w-full h-full bg-slate-900" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-xl p-1 shrink-0">
                                    <img src={selectedShop?.logo_url || '/placeholder.png'} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-800">{selectedShop?.shop_name}</DialogTitle>
                                    <DialogDescription className="font-bold text-slate-400">@{selectedShop?.slug}</DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 pt-6 space-y-8 bg-white">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center">
                                <Package className="w-5 h-5 text-indigo-500 mb-2" />
                                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Produits</p>
                                <p className="text-xl font-black text-indigo-600">{shopStats.products}</p>
                            </div>
                            <div className="p-4 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
                                <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                                <p className="text-[10px] font-black uppercase text-emerald-300 tracking-widest mb-1">Ventes</p>
                                <p className="text-xl font-black text-emerald-600">{shopStats.orders}</p>
                            </div>
                            <div className="p-4 rounded-[2rem] bg-amber-50/50 border border-amber-100 flex flex-col items-center text-center">
                                <Wallet className="w-5 h-5 text-amber-500 mb-2" />
                                <p className="text-[10px] font-black uppercase text-amber-300 tracking-widest mb-1">Revenu</p>
                                <p className="text-xl font-black text-amber-600">{formatPrice(shopStats.revenue)}</p>
                            </div>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Informations générales
                            </h4>
                            <div className="grid grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Localisation</p>
                                    <p className="font-bold text-slate-800">{selectedShop?.city || 'Non renseigné'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inscrit depuis le</p>
                                    <p className="font-bold text-slate-800">{selectedShop?.created_at ? format(new Date(selectedShop.created_at), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</p>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        "{selectedShop?.description || 'Aucune description disponible pour cette boutique.'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" asChild>
                                <Link to={`/boutique/${selectedShop?.slug}`} target="_blank">
                                    <ExternalLink className="w-5 h-5 mr-3" />
                                    Accéder au site
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-slate-200" onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminShops;
