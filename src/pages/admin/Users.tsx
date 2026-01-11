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
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);
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
            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('*');

            if (rolesError) {
                console.warn("Could not fetch user roles, continuing with profiles only:", rolesError);
            }

            // Merge roles into profiles
            const mergedUsers = profilesData?.map(profile => {
                const userRoles = rolesData?.filter(role => role.user_id === profile.id) || [];
                return {
                    ...profile,
                    user_roles: userRoles
                };
            }) || [];

            setUsers(mergedUsers);
        } catch (error: any) {
            toast.error("Erreur lors du chargement des utilisateurs: " + error.message);
        } finally {
            setLoading(false);
        }
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

            toast.success(isCurrentlyBlocked ? "Utilisateur débloqué" : "Utilisateur bloqué");
            fetchUsers();
        } catch (error: any) {
            toast.error("Erreur action utilisateur");
        }
    };

    const handleToggleAdmin = async (userId: string, currentRoles: any[]) => {
        const isAdmin = currentRoles.some(r => r.role === 'admin');
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
            fetchUsers();
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

        // Note: status filter is symbolic here as we don't have a 'status' column in profiles yet
        // In a real app, you'd have an 'is_blocked' column
        return matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Clients</h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez les comptes clients et surveillez leur activité</p>
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

                {/* Users Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
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
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
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
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none capitalize font-bold text-[10px] px-2">
                                                {user.user_roles?.[0]?.role || 'client'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 flex w-fit items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Actif
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info(`Profil de ${user.full_name || 'utilisateur'}`)}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <Eye className="w-4 h-4" /> Détails Compte
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info("Historique bientôt disponible")}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" /> Historique Commandes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleAdmin(user.id, user.user_roles || [])}
                                                        className="rounded-lg gap-2 font-bold text-primary"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                        {user.user_roles?.some((r: any) => r.role === 'admin') ? "Retirer Admin" : "Promouvoir Admin"}
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <DropdownMenuItem
                                                        onClick={() => handleBlockUser(user.id, false)}
                                                        className="rounded-lg gap-2 font-bold text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <UserX className="w-4 h-4" /> Bloquer l'utilisateur
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
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
