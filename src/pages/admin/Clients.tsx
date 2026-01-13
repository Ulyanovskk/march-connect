import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    UserX,
    UserCheck,
    Eye,
    Mail,
    Phone,
    Calendar,
    ShoppingCart,
    SearchX,
    User
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/demo-data";

const AdminClients = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [userStats, setUserStats] = useState({ ordersCount: 0, totalSpent: 0 });
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);

            // Fetch profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;

            // Fetch roles to identify/exclude vendors and admins
            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('*');

            // Fetch shops to exclude anyone owning a shop
            const { data: shopsData } = await supabase
                .from('vendors')
                .select('user_id');

            const vendorUserIds = new Set((shopsData || []).map(s => s.user_id));
            const roleUserMap = new Map();
            (rolesData || []).forEach(r => {
                if (!roleUserMap.has(r.user_id)) roleUserMap.set(r.user_id, []);
                roleUserMap.get(r.user_id).push(r.role);
            });

            // Filter out anyone who is a vendor or admin
            const clientOnly = (profilesData || []).filter(profile => {
                const roles = roleUserMap.get(profile.id) || [];
                const isVendor = roles.includes('vendor') || vendorUserIds.has(profile.id);
                const isAdmin = roles.includes('admin');
                return !isVendor && !isAdmin;
            });

            setUsers(clientOnly);
        } catch (error: any) {
            toast.error("Erreur lors du chargement des clients: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async (userId: string) => {
        try {
            const { count, data } = await supabase
                .from('orders')
                .select('total_amount', { count: 'exact' })
                .eq('user_id', userId);

            const total = data?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

            setUserStats({
                ordersCount: count || 0,
                totalSpent: total
            });
        } catch (error) {
            console.error("Error fetching user stats", error);
        }
    };

    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
        fetchUserStats(user.id);
    };

    const handleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
        const confirmMsg = isCurrentlyBlocked
            ? "Voulez-vous débloquer ce client ?"
            : "Voulez-vous vraiment bloquer ce client ? Il ne pourra plus passer de commandes.";

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: !isCurrentlyBlocked } as any)
                .eq('id', userId);

            if (error) throw error;

            toast.success(isCurrentlyBlocked ? "Client débloqué" : "Client bloqué");

            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, is_blocked: !isCurrentlyBlocked });
            }

            fetchClients();
        } catch (error: any) {
            toast.error("Erreur action: " + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);

        if (filter === 'active') return matchesSearch && !user.is_blocked;
        if (filter === 'blocked') return matchesSearch && user.is_blocked;
        return matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Clients Uniquement</h1>
                    <p className="text-slate-500 font-medium text-sm">Gérez les comptes qui ne sont ni administrateurs ni vendeurs</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un client..."
                            className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filter}
                            onChange={(e: any) => setFilter(e.target.value)}
                            className="h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="blocked">Bloqués</option>
                        </select>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold">Client</TableHead>
                                <TableHead className="font-bold">Contact</TableHead>
                                <TableHead className="font-bold">Inscription</TableHead>
                                <TableHead className="font-bold">Statut</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5}><div className="h-12 bg-slate-50 rounded-xl m-1"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleViewUser(user)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                                                        {user.full_name?.substring(0, 2) || 'CL'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-none mb-1">{user.full_name || 'Sans nom'}</p>
                                                    <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] px-2">Acheteur</Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {user.phone || 'Non renseigné'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                                    <Mail className="w-3 h-3" /> {user.email || 'Pas d\'email'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_blocked ? (
                                                <Badge className="bg-red-50 text-red-600 border-none font-bold text-[10px]">Bloqué</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">Actif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <SearchX className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                        <p className="text-slate-400 font-bold">Aucun client trouvé</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {selectedUser && (
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 rounded-2xl">
                                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">{selectedUser.full_name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <DialogTitle className="text-2xl font-black">{selectedUser.full_name}</DialogTitle>
                                        <DialogDescription>Compte Client Standard</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commandes</p>
                                    <p className="text-2xl font-black">{userStats.ordersCount}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Dépensé</p>
                                    <p className="text-2xl font-black text-primary">{formatPrice(userStats.totalSpent)}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2"><User className="w-4 h-4" /> Détails de contact</h3>
                                <div className="bg-white border rounded-xl p-4 text-sm space-y-2">
                                    <p><strong>Email :</strong> {selectedUser.email}</p>
                                    <p><strong>Téléphone :</strong> {selectedUser.phone || 'N/A'}</p>
                                    <p><strong>Inscrit le :</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant={selectedUser.is_blocked ? "default" : "destructive"}
                                    onClick={() => handleBlockUser(selectedUser.id, selectedUser.is_blocked)}
                                    className="w-full rounded-xl font-bold"
                                >
                                    {selectedUser.is_blocked ? 'Débloquer le compte' : 'Bloquer le compte'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminClients;
