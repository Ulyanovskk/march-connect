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
    Wallet,
    BadgeCheck,
    AlertTriangle,
    Eye
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

import { useNavigate } from 'react-router-dom';

const AdminVendors = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);

            const { data: vendorsData, error: vendorsError } = await supabase
                .from('vendors')
                .select('*');

            if (vendorsError) throw vendorsError;

            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url');

            if (profilesError) console.warn("Error fetching profiles for vendors:", profilesError);

            const mergedVendors = vendorsData?.map(vendor => ({
                ...vendor,
                profiles: profilesData?.find(p => p.id === vendor.user_id) || null
            })) || [];

            setVendors(mergedVendors);
        } catch (error: any) {
            toast.error("Erreur chargement vendeurs: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyVendor = async (id: string, isVerified: boolean) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: isVerified })
                .eq('id', id);

            if (error) throw error;
            toast.success(isVerified ? "Vendeur vérifié avec succès" : "Vérification retirée");
            fetchVendors();
        } catch (error: any) {
            toast.error("Erreur lors de la mise à jour: " + error.message);
        }
    };

    const handleBanShop = async (id: string, shopName: string) => {
        if (!confirm(`Voulez-vous vraiment bannir la boutique "${shopName}" ? Cette action désactivera tous les produits associés.`)) {
            return;
        }

        try {
            // First, de-verify the vendor
            const { error: vendorError } = await supabase
                .from('vendors')
                .update({ is_verified: false })
                .eq('id', id);

            if (vendorError) throw vendorError;

            // Then, deactivate all products
            const { error: productsError } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('vendor_id', id);

            if (productsError) throw productsError;

            toast.success(`La boutique "${shopName}" a été bannie et ses produits désactivés.`);
            fetchVendors();
        } catch (error: any) {
            toast.error("Erreur lors de l'opération de bannissement");
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Vendeurs</h1>
                        <p className="text-slate-500 font-medium text-sm">Contrôlez les accès boutiques et la certification des vendeurs</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl font-bold border-slate-200">Rapport Performance</Button>
                    </div>
                </div>

                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Vendeurs</p>
                            <h3 className="text-xl font-black text-slate-800">{vendors.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                            <BadgeCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vérifiés</p>
                            <h3 className="text-xl font-black text-slate-800">{vendors.filter(v => v.is_verified).length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">En attente</p>
                            <h3 className="text-xl font-black text-slate-800">{vendors.filter(v => !v.is_verified).length}</h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher boutique, ville..."
                            className="pl-11 h-12 rounded-xl border-none bg-slate-50 focus:bg-white transition-all outline-none ring-0 focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-800">Boutique</TableHead>
                                <TableHead className="font-bold text-slate-800">Vendeur</TableHead>
                                <TableHead className="font-bold text-slate-800">Localisation</TableHead>
                                <TableHead className="font-bold text-slate-800">Date Inscription</TableHead>
                                <TableHead className="font-bold text-slate-800">Statut</TableHead>
                                <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6}><div className="h-16 bg-slate-50/50 rounded-xl"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor) => (
                                    <TableRow key={vendor.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                                                    {vendor.logo_url ? (
                                                        <img src={vendor.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Store className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-none mb-1 flex items-center gap-2">
                                                        {vendor.shop_name}
                                                        {vendor.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/10" />}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium">Boutique ID: {vendor.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-slate-100">
                                                    <AvatarFallback className="bg-slate-50 text-[10px] font-black">{vendor.profiles?.full_name?.substring(0, 2) || 'VN'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-bold text-slate-600 truncate max-w-[120px]">{vendor.profiles?.full_name || 'Inconnu'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {vendor.city || 'Cameroun'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {vendor.created_at ? format(new Date(vendor.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {vendor.is_verified ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-2 py-1 flex w-fit items-center gap-1">
                                                    VÉRIFIÉ
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] px-2 py-1 flex w-fit items-center gap-1">
                                                    NON VÉRIFIÉ
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-1">
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info(`Navigation vers la boutique ${vendor.shop_name}`)}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <Eye className="w-4 h-4" /> Voir Boutique
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info(`Visualisation du profil de ${vendor.profiles?.full_name}`)}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <ExternalLink className="w-4 h-4" /> Profil Utilisateur
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    {vendor.is_verified ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleVerifyVendor(vendor.id, false)}
                                                            className="rounded-lg gap-2 font-bold text-amber-600"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Retirer Vérification
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleVerifyVendor(vendor.id, true)}
                                                            className="rounded-lg gap-2 font-bold text-emerald-600"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Certifier Vendeur
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleBanShop(vendor.id, vendor.shop_name)}
                                                        className="rounded-lg gap-2 font-bold text-red-600 hover:bg-red-50"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Bannir Boutique
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold">Aucun vendeur trouvé</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminVendors;
