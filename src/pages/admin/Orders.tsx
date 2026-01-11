import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    ShoppingCart,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Wallet,
    Clock,
    ArrowRight,
    Eye,
    CreditCard,
    MessageSquare,
    SearchX,
    RefreshCw,
    Ban,
    ShieldCheck,
    FileText,
    Store
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
import { formatPrice } from '@/lib/demo-data';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const [vendorsRes, profilesRes] = await Promise.all([
                supabase.from('vendors').select('id, shop_name'),
                supabase.from('profiles').select('id, full_name')
            ]);

            const mergedOrders = ordersData?.map(order => ({
                ...order,
                vendors: vendorsRes.data?.find(v => v.id === order.vendor_id) || null,
                profiles: profilesRes.data?.find(p => p.id === order.user_id) || null
            })) || [];

            setOrders(mergedOrders);
        } catch (error: any) {
            toast.error("Erreur chargement commandes: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processing':
                return <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] gap-1 px-2"><Clock className="w-3 h-3" /> Préparation</Badge>;
            case 'shipped':
                return <Badge className="bg-purple-50 text-purple-600 border-none font-bold text-[10px] gap-1 px-2"><Truck className="w-3 h-3" /> En transit</Badge>;
            case 'delivered':
                return <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] gap-1 px-2"><CheckCircle2 className="w-3 h-3" /> Livrée</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-50 text-red-600 border-none font-bold text-[10px] gap-1 px-2"><XCircle className="w-3 h-3" /> Annulée</Badge>;
            default:
                return <Badge className="bg-slate-50 text-slate-600 border-none font-bold text-[10px] px-2 capitalize">{status}</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Payé</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Attente</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Échec</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">{status}</Badge>;
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
            if (error) throw error;
            toast.success("Statut mis à jour");
            fetchOrders();
        } catch (error: any) {
            toast.error("Erreur mise à jour: " + error.message);
        }
    };

    const handleForceRelease = async (orderId: string) => {
        if (!confirm("Voulez-vous forcer le déblocage des fonds pour cette commande ? Le vendeur sera payé immédiatement.")) {
            return;
        }

        try {
            // In a real system, this would trigger an Edge Function or update a transaction status
            const { error } = await supabase.from('orders').update({ payment_status: 'paid', status: 'delivered' }).eq('id', orderId);
            if (error) throw error;
            toast.success("Fonds débloqués avec succès");
            fetchOrders();
        } catch (error: any) {
            toast.error("Erreur déblocage: " + error.message);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Voulez-vous vraiment annuler cette commande et déclencher un remboursement ?")) {
            return;
        }

        try {
            const { error } = await supabase.from('orders').update({ status: 'cancelled', payment_status: 'failed' }).eq('id', orderId);
            if (error) throw error;
            toast.success("Commande annulée");
            fetchOrders();
        } catch (error: any) {
            toast.error("Erreur annulation");
        }
    };

    const filteredOrders = orders.filter(o =>
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.vendors?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Commandes</h1>
                        <p className="text-slate-500 font-medium text-sm">Suivez le flux des transactions et l'état des livraisons</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl font-bold border-slate-200">Rapport financier</Button>
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher par client ou ID commande..."
                            className="pl-11 h-12 rounded-xl border-none bg-slate-50 focus:bg-white transition-all outline-none ring-0 focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-100 shrink-0">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="outline" onClick={fetchOrders} className="h-12 w-12 rounded-xl border-slate-100 shrink-0">
                            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Global Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-100/50">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">En préparation</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-2xl font-black text-blue-600 leading-none">{orders.filter(o => o.status === 'processing').length}</h4>
                            <Package className="w-5 h-5 text-blue-200 mb-1" />
                        </div>
                    </div>
                    <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-100/50">
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">En transit</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-2xl font-black text-purple-600 leading-none">{orders.filter(o => o.status === 'shipped').length}</h4>
                            <Truck className="w-5 h-5 text-purple-200 mb-1" />
                        </div>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100/50">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Livrées</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-2xl font-black text-emerald-600 leading-none">{orders.filter(o => o.status === 'delivered').length}</h4>
                            <CheckCircle2 className="w-5 h-5 text-emerald-200 mb-1" />
                        </div>
                    </div>
                    <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-100/50">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">En Escrow</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-xl font-black text-orange-600 leading-none max-w-[100px] truncate">
                                {formatPrice(orders.filter(o => o.payment_status === 'paid' && o.status !== 'delivered').reduce((acc, o) => acc + (Number(o.total) || 0), 0))}
                            </h4>
                            <Wallet className="w-5 h-5 text-orange-200 mb-1" />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-800">Commande</TableHead>
                                <TableHead className="font-bold text-slate-800">Boutique / Client</TableHead>
                                <TableHead className="font-bold text-slate-800">Montant</TableHead>
                                <TableHead className="font-bold text-slate-800">Paiement</TableHead>
                                <TableHead className="font-bold text-slate-800">Statut Livraison</TableHead>
                                <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6}><div className="h-14 bg-slate-50/50 rounded-xl"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-none flex items-center gap-2">
                                                    #{order.id.substring(0, 8).toUpperCase()}
                                                    <FileText className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                                    {format(new Date(order.created_at), 'dd MMM | HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-3 h-3 text-primary" />
                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{order.vendors?.shop_name || 'Yarid Official'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">{order.customer_name || 'Anonyme'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-black text-slate-800">{formatPrice(order.total)}</p>
                                            <p className="text-[10px] font-bold text-slate-400">Escrow: ACTIVE</p>
                                        </TableCell>
                                        <TableCell>
                                            {getPaymentStatusBadge(order.payment_status)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-slate-100 p-1">
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info(`Détails de la commande #${order.id.substring(0, 8)}`)}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <Eye className="w-4 h-4" /> Détails Complets
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                                        className="rounded-lg gap-2 font-bold text-indigo-600"
                                                    >
                                                        <Truck className="w-4 h-4" /> Marquer "En Transit"
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                                        className="rounded-lg gap-2 font-bold text-emerald-600"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" /> Confirmer Livraison
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <DropdownMenuItem
                                                        onClick={() => handleForceRelease(order.id)}
                                                        className="rounded-lg gap-2 font-bold text-amber-600"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" /> Forcer Déblocage Fonds
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="rounded-lg gap-2 font-bold text-red-600"
                                                    >
                                                        <Ban className="w-4 h-4" /> Annuler & Rembourser
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
                                            <p className="text-slate-400 font-bold">Aucune commande trouvée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
