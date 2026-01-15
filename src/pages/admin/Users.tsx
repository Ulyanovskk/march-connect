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
    Shield,
    ShoppingCart,
    SearchX,
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
import { createClient } from '@supabase/supabase-js';

import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/demo-data";

// Create a secondary client for admin creation to avoid current session logout

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const creationClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [userStats, setUserStats] = useState({ ordersCount: 0, totalSpent: 0 });
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
    const [newAdmin, setNewAdmin] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Fetch all profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;

            // Fetch all roles
            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('*');

            // Fetch all shops to identify vendors without explicit role
            const { data: shopsData } = await supabase
                .from('vendors')
                .select('user_id, shop_name');

            // 1. Get all unique user IDs from all sources
            const allUserIds = Array.from(new Set([
                ...(profilesData || []).map(p => p.id),
                ...(rolesData || []).map(r => r.user_id),
                ...(shopsData || []).map(s => s.user_id)
            ]));

            // 2. Merge everything based on all available IDs
            const mergedUsers = allUserIds.map(userId => {
                const profile = profilesData?.find(p => p.id === userId);
                const userRoles = rolesData?.filter(role => role.user_id === userId) || [];
                const userShops = shopsData?.filter(shop => shop.user_id === userId) || [];
                const hasShop = userShops.length > 0;

                // Add virtual vendor role if they have a shop but no explicit role
                if (hasShop && !userRoles.some(r => r.role === 'vendor')) {
                    userRoles.push({ role: 'vendor' } as any);
                }

                // If profile is missing, create a placeholder
                return {
                    id: userId,
                    full_name: profile?.full_name || userShops[0]?.shop_name || 'Utilisateur sans profil',
                    email: profile?.email || 'N/A',
                    phone: profile?.phone || 'N/A',
                    avatar_url: profile?.avatar_url,
                    created_at: profile?.created_at || (userShops[0] as any)?.created_at || new Date().toISOString(),
                    is_blocked: profile?.is_blocked || false,
                    user_roles: userRoles
                };
            });

            setUsers(mergedUsers);
        } catch (error: any) {
            toast.error("Erreur lors du chargement des utilisateurs: " + error.message);
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
            ? "Voulez-vous débloquer cet utilisateur ?"
            : "Voulez-vous vraiment bloquer cet utilisateur ? Il ne pourra plus passer de commandes.";

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: !isCurrentlyBlocked } as any)
                .eq('id', userId);

            if (error) throw error;

            toast.success(isCurrentlyBlocked ? "Utilisateur débloqué" : "Utilisateur bloqué");

            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, is_blocked: !isCurrentlyBlocked });
            }

            fetchUsers();
        } catch (error: any) {
            toast.error("Erreur action utilisateur: " + error.message);
        }
    };

    const handleToggleAdmin = async (userId: string, currentRoles: any[]) => {
        const isAdmin = currentRoles?.some(r => r.role === 'admin');
        const confirmMsg = isAdmin
            ? "Voulez-vous retirer les droits d'administrateur à cet utilisateur ?"
            : "Voulez-vous promouvoir cet utilisateur au rang d'administrateur ? Il aura accès à tout le dashboard admin.";

        if (!confirm(confirmMsg)) return;

        try {
            if (isAdmin) {
                const { error } = await supabase
                    .from('user_roles')
                    .delete()
                    .eq('user_id', userId)
                    .eq('role', 'admin');

                if (error) throw error;
                toast.success("Droits d'administrateur retirés");
            } else {
                const { error } = await supabase
                    .from('user_roles')
                    .insert({ user_id: userId, role: 'admin' });

                if (error) throw error;
                toast.success("Utilisateur promu Administrateur");
            }

            // Refresh to get updated roles
            fetchUsers();
            // Note: Updating local selectedUser user_roles is complex without re-fetching, so relying on fetchUsers
            setIsDetailsOpen(false); // Close dialog to force refresh view
        } catch (error: any) {
            toast.error("Erreur lors de la modification des droits : " + error.message);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            setCreatingAdmin(true);

            // 1. Sign up the new admin using the ephemeral client
            // This prevents the current admin from being logged out
            const { data, error: signUpError } = await creationClient.auth.signUp({
                email: newAdmin.email,
                password: newAdmin.password,
                options: {
                    data: {
                        full_name: newAdmin.fullName,
                        phone: newAdmin.phone,
                        role: 'admin'
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // 2. Explicitly ensure role assignment 
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({ user_id: data.user.id, role: 'admin' });

                if (roleError) console.warn("Role assignment sync info:", roleError);

                toast.success("Compte Administrateur créé avec succès !");
                setIsCreateModalOpen(false);
                setNewAdmin({ fullName: '', email: '', phone: '', password: '' });
                fetchUsers();
            }
        } catch (error: any) {
            toast.error("Erreur lors de la création: " + error.message);
        } finally {
            setCreatingAdmin(false);
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Utilisateurs</h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez les comptes clients, vendeurs et administrateurs</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl font-bold border-slate-200">Export CSV</Button>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all gap-2"
                        >
                            <Shield className="w-4 h-4" /> Ajouter Admin
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher par nom, téléphone..."
                            className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all outline-none border-none ring-0 focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filter}
                            onChange={(e: any) => setFilter(e.target.value)}
                            className="h-12 flex-1 md:w-48 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="blocked">Bloqués</option>
                        </select>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                </div>

                {/* Users Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[300px] font-bold text-slate-800">Utilisateur</TableHead>
                                <TableHead className="font-bold text-slate-800">Contact</TableHead>
                                <TableHead className="font-bold text-slate-800">Rôle</TableHead>
                                <TableHead className="font-bold text-slate-800">Inscription</TableHead>
                                <TableHead className="font-bold text-slate-800">Statut</TableHead>
                                <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell><div className="h-10 bg-slate-100 rounded-lg"></div></TableCell>
                                        <TableCell><div className="h-4 bg-slate-100 rounded w-24"></div></TableCell>
                                        <TableCell><div className="h-4 bg-slate-100 rounded w-16"></div></TableCell>
                                        <TableCell><div className="h-4 bg-slate-100 rounded w-20"></div></TableCell>
                                        <TableCell><div className="h-6 bg-slate-100 rounded-full w-20"></div></TableCell>
                                        <TableCell><div className="h-8 bg-slate-100 rounded w-8 ml-auto"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-slate-50/50 transition-colors border-slate-50 group cursor-pointer"
                                        onClick={() => handleViewUser(user)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                                                        {user.full_name?.substring(0, 2) || 'CL'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-none mb-1">{user.full_name || 'Sans nom'}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">{user.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {user.phone || 'Non renseigné'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                                    <Mail className="w-3 h-3" /> UserID: {user.id.substring(0, 8)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const roles = user.user_roles?.map((r: any) => r.role) || [];
                                                if (roles.includes('admin')) {
                                                    return <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] px-2">Administrateur</Badge>;
                                                }
                                                if (roles.includes('vendor')) {
                                                    return <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px] px-2">Vendeur Pro</Badge>;
                                                }
                                                return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none capitalize font-bold text-[10px] px-2">Client</Badge>;
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_blocked ? (
                                                <Badge className="bg-red-50 text-red-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    Bloqué
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Actif
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <SearchX className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-bold">Aucun utilisateur trouvé</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Users List (Mobile) */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-50 rounded" />
                                        <div className="h-3 w-20 bg-slate-50 rounded" />
                                    </div>
                                </div>
                                <div className="h-10 bg-slate-50 rounded-xl" />
                            </div>
                        ))
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft transition-all duration-300">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setMobileExpandedId(mobileExpandedId === user.id ? null : user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                                                {user.full_name?.substring(0, 2) || 'CL'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-none mb-1">{user.full_name || 'Sans nom'}</p>
                                            <div className="flex items-center gap-1.5">
                                                {(() => {
                                                    const roles = user.user_roles?.map((r: any) => r.role) || [];
                                                    if (roles.includes('admin')) {
                                                        return <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px] px-1.5 h-4">Admin</Badge>;
                                                    }
                                                    if (roles.includes('vendor')) {
                                                        return <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[9px] px-1.5 h-4">Vendeur</Badge>;
                                                    }
                                                    return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none capitalize font-bold text-[9px] px-1.5 h-4">Client</Badge>;
                                                })()}
                                                <span className="text-[10px] text-slate-400 font-medium">#{user.id.substring(0, 6)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${mobileExpandedId === user.id ? 'rotate-180 bg-slate-100' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {mobileExpandedId === user.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact</p>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-600 truncate block max-w-[120px]">{user.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-600">{user.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Infos</p>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-600">{user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {user.is_blocked ? (
                                                <Badge className="bg-red-50 text-red-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    Bloqué
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Actif
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Button
                                                variant="outline"
                                                className="h-9 border-slate-200 hover:bg-slate-50 hover:text-primary text-[10px] font-bold"
                                                onClick={() => handleViewUser(user)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                Détails Complets
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className={`h-9 border-slate-200 hover:bg-slate-50 text-[10px] font-bold ${user.is_blocked ? 'text-emerald-600' : 'text-red-600'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBlockUser(user.id, user.is_blocked || false);
                                                }}
                                            >
                                                {user.is_blocked ? <UserCheck className="w-3.5 h-3.5 mr-1.5" /> : <UserX className="w-3.5 h-3.5 mr-1.5" />}
                                                {user.is_blocked ? 'Débloquer' : 'Bloquer'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <SearchX className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>

                {/* Create Admin Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-8 bg-slate-900 text-white">
                            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                <Shield className="w-8 h-8 text-primary" />
                                Nouvel Administrateur
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium">
                                Créez un nouveau compte avec les accès complets au dashboard Yarid.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateAdmin} className="p-8 space-y-5 bg-white">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Nom Complet</Label>
                                <Input
                                    required
                                    placeholder="ex: Paul Biya"
                                    className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all"
                                    value={newAdmin.fullName}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Email Professionnel</Label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="admin@yarid.com"
                                    className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Téléphone</Label>
                                <Input
                                    placeholder="+237 ..."
                                    className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all"
                                    value={newAdmin.phone}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Mot de passe temporaire</Label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 font-bold">L'administrateur pourra changer son mot de passe plus tard.</p>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-xl font-bold h-12 flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={creatingAdmin}
                                    className="rounded-xl font-bold h-12 flex-1 shadow-lg shadow-primary/20"
                                >
                                    {creatingAdmin ? "Création..." : "Créer le compte"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* User Details Dialog */}
                {selectedUser && (
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 border-2 border-white shadow-md rounded-2xl">
                                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-black uppercase rounded-2xl">
                                            {selectedUser.full_name?.substring(0, 2) || 'CL'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                            {selectedUser.full_name || 'Utilisateur'}
                                            {selectedUser.user_roles?.some((r: any) => r.role === 'admin') &&
                                                <Badge className="bg-primary/10 text-primary border-none text-xs">Admin</Badge>
                                            }
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-500 font-medium">
                                            ID: {selectedUser.id}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Actions Area */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Button
                                        className={`${selectedUser.is_blocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-50 text-red-600 hover:bg-red-100'} h-12 rounded-xl text-xs font-bold border-red-100`}
                                        onClick={() => handleBlockUser(selectedUser.id, selectedUser.is_blocked || false)}
                                    >
                                        {selectedUser.is_blocked ? <UserCheck className="w-3.5 h-3.5 mr-2" /> : <UserX className="w-3.5 h-3.5 mr-2" />}
                                        {selectedUser.is_blocked ? 'Débloquer' : 'Bloquer'}
                                    </Button>
                                    <Button
                                        className={`bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-xs font-bold`}
                                        onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.user_roles || [])}
                                    >
                                        <Shield className="w-3.5 h-3.5 mr-2" />
                                        {selectedUser.user_roles?.some((r: any) => r.role === 'admin') ? "Révoquer Admin" : "Promouvoir Admin"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 rounded-xl text-xs font-bold text-slate-600"
                                        onClick={() => toast.info('Historique complet bientôt disponible')}
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5 mr-2" /> Voir Commandes
                                    </Button>
                                </div>

                                <Separator />

                                {/* Stats Overview */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Commandes</p>
                                        <p className="text-2xl font-black text-slate-800">{userStats.ordersCount}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Dépensé (Est.)</p>
                                        <p className="text-2xl font-black text-primary">{formatPrice(userStats.totalSpent)}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-primary" /> Informations Personnelles
                                    </h3>
                                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden text-sm">
                                        <div className="flex border-b border-slate-50 last:border-0">
                                            <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Email</div>
                                            <div className="w-2/3 p-3 font-medium text-slate-800">{selectedUser.email || 'Non renseigné'}</div>
                                        </div>
                                        <div className="flex border-b border-slate-50 last:border-0">
                                            <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Téléphone</div>
                                            <div className="w-2/3 p-3 font-medium text-slate-800">{selectedUser.phone || 'Non renseigné'}</div>
                                        </div>
                                        <div className="flex border-b border-slate-50 last:border-0">
                                            <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Inscrit le</div>
                                            <div className="w-2/3 p-3 text-slate-800">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr }) : 'N/A'}</div>
                                        </div>
                                        <div className="flex border-b border-slate-50 last:border-0">
                                            <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Statut</div>
                                            <div className="w-2/3 p-3 text-slate-800 font-bold">
                                                {selectedUser.is_blocked
                                                    ? <span className="text-red-500">Compte Bloqué</span>
                                                    : <span className="text-emerald-500">Compte Actif</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

        </AdminLayout>
    );
};

export default AdminUsers;
