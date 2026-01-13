import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    UserX,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    AlertCircle,
    Eye,
    ChevronRight,
    SearchX
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

const AdminVendors = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);

            // 1. Get user IDs from roles
            const { data: roleAssignments } = await supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'vendor');

            // 2. Get user IDs from vendors table (shops)
            const { data: shopAssignments } = await supabase
                .from('vendors')
                .select('user_id');

            const roleIds = roleAssignments?.map(r => r.user_id) || [];
            const shopIds = shopAssignments?.map(s => s.user_id) || [];

            // Unify IDs (all users who are either marked as vendor OR have a shop)
            const combinedIds = Array.from(new Set([...roleIds, ...shopIds]));

            if (combinedIds.length === 0) {
                setVendors([]);
                return;
            }

            // 3. Get profiles for these users
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', combinedIds);

            if (profileError) throw profileError;

            // 4. Get shops for these users
            const { data: shops } = await supabase
                .from('vendors')
                .select('id, user_id, shop_name, is_verified, is_active, email, phone, created_at');

            // Merge data based on combinedIds to not miss anyone
            const mergedVendors = combinedIds.map(userId => {
                const profile = profiles?.find(p => p.id === userId);
                const userShops = shops?.filter(s => s.user_id === userId) || [];

                // Prioritize shop info if profile info is missing/empty
                const email = profile?.email || userShops[0]?.email;
                const phone = profile?.phone || userShops[0]?.phone;
                const name = profile?.full_name || userShops[0]?.shop_name || 'Utilisateur sans nom';

                return {
                    id: userId,
                    full_name: name,
                    email: email,
                    phone: phone,
                    avatar_url: profile?.avatar_url,
                    created_at: profile?.created_at || (userShops[0] as any)?.created_at,
                    shops_count: userShops.length,
                    shops: userShops,
                    is_verified: userShops.some(s => s.is_verified)
                };
            });

            setVendors(mergedVendors);
        } catch (error: any) {
            toast.error("Erreur chargement vendeurs: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (vendorId: string, action: string) => {
        toast.info(`Action "${action}" bientôt disponible pour le vendeur ${vendorId.substring(0, 5)}`);
    };

    const filteredVendors = vendors.filter(v =>
        v.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.includes(searchTerm) ||
        v.shops?.some((s: any) => s.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gérants & Vendeurs</h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez les comptes des commerçants et leur identité</p>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold border-slate-200" onClick={fetchVendors}>Actualiser</Button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher par nom, email, téléphone..."
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
                                <TableHead className="font-bold">Manager</TableHead>
                                <TableHead className="font-bold">Contact</TableHead>
                                <TableHead className="font-bold text-center">Boutiques</TableHead>
                                <TableHead className="font-bold">Inscription</TableHead>
                                <TableHead className="font-bold">Identité</TableHead>
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
                            ) : filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor) => (
                                    <TableRow key={vendor.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarImage src={vendor.avatar_url} />
                                                    <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-black uppercase">
                                                        {vendor.full_name?.substring(0, 2) || 'VN'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-none mb-1">{vendor.full_name || 'Vendeur sans nom'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {vendor.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Mail className="w-3 h-3 text-slate-400" /> {vendor.email || 'Pas d\'email'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {vendor.phone || 'Non renseigné'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-xs px-2.5 py-1 rounded-lg">
                                                {vendor.shops_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                {vendor.created_at ? format(new Date(vendor.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {vendor.is_verified ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1.5">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Vérifié
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1.5">
                                                    <AlertCircle className="w-3 h-3" />
                                                    En attente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                                                    <DropdownMenuItem onClick={() => { setSelectedVendor(vendor); setIsDetailsOpen(true); }} className="p-3 rounded-xl gap-3 font-bold cursor-pointer">
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                        Détails du gérant
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction(vendor.id, 'verification')} className="p-3 rounded-xl gap-3 font-bold cursor-pointer">
                                                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                                                        Vérifier documents
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction(vendor.id, 'ban')} className="p-3 rounded-xl gap-3 font-bold cursor-pointer text-red-500">
                                                        <UserX className="w-4 h-4" />
                                                        Révoquer rôle vendeur
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <SearchX className="w-10 h-10 text-slate-200" />
                                            <p className="text-slate-400 font-medium">Aucun gérant trouvé</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Vendor Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900 text-white">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-20 h-20 border-4 border-white/10 rounded-3xl overflow-hidden">
                                <AvatarImage src={selectedVendor?.avatar_url} />
                                <AvatarFallback className="bg-indigo-500 text-white text-2xl font-black uppercase">
                                    {selectedVendor?.full_name?.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-3xl font-black">{selectedVendor?.full_name}</DialogTitle>
                                <DialogDescription className="text-indigo-300 font-bold flex items-center gap-2 mt-1">
                                    Compte Vendeur Professionnel
                                    {selectedVendor?.is_verified && <ShieldCheck className="w-4 h-4" />}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Coordonnées</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold text-sm">{selectedVendor?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold text-sm">{selectedVendor?.phone || 'Non renseigné'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Statistiques Compte</h4>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Boutiques</p>
                                        <p className="text-2xl font-black text-indigo-600">{selectedVendor?.shops_count}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Actif depuis</p>
                                        <p className="text-xs font-black text-slate-800">
                                            {selectedVendor?.created_at ? format(new Date(selectedVendor.created_at), 'MMM yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Boutiques rattachées</h4>
                            <div className="space-y-3">
                                {selectedVendor?.shops?.map((shop: any) => (
                                    <div key={shop.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                                                <Store className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{shop.shop_name}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    {shop.is_verified && <Badge className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0 h-4 border-none uppercase">Vérifiée</Badge>}
                                                    {!shop.is_active && <Badge className="bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0 h-4 border-none uppercase">Invisible</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                                {selectedVendor?.shops_count === 0 && (
                                    <p className="text-center py-4 text-slate-400 font-medium italic">Ce manager n'a pas encore de boutique créée.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminVendors;
