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
    Wallet
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

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            setLoading(true);

            // Fetch all entries from vendors table (shops)
            const { data: shopsData, error: shopsError } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (shopsError) throw shopsError;

            // Fetch profiles to know the owners
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, email');

            const mergedShops = shopsData?.map(shop => ({
                ...shop,
                owner: profilesData?.find(p => p.id === shop.user_id) || null
            })) || [];

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

                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold">Boutique</TableHead>
                                <TableHead className="font-bold">Slug / Lien</TableHead>
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
                                            <div className="flex items-center gap-2">
                                                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold text-slate-600">/{shop.slug}</code>
                                                <Link to={`/boutique/${shop.slug || shop.id}`} target="_blank" className="p-1.5 hover:bg-white rounded-lg transition-colors text-primary shadow-sm border border-slate-100">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
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
