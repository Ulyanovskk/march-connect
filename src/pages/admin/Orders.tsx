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
    Store,
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
import { formatPrice } from '@/lib/demo-data';
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
import { QRCodeCanvas } from 'qrcode.react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderDetails, setOrderDetails] = useState<{ items: any[], address: any } | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('admin-orders-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload: any) => {
                    if (payload.eventType === 'UPDATE') {
                        const updated = payload.new;
                        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));

                        // Update details view if open
                        setSelectedOrder(current => {
                            if (current?.id === updated.id) {
                                return { ...current, ...updated };
                            }
                            return current;
                        });
                    } else if (payload.eventType === 'INSERT') {
                        fetchOrders(); // Safest to refetch for inserts to get relations
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Fetch orders with all amount fields
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, total_amount')
                .order('created_at', { ascending: false })
                .limit(500); // Reasonable limit for admin

            if (ordersError) throw ordersError;

            const [vendorsRes, profilesRes] = await Promise.all([
                supabase.from('vendors').select('id, shop_name'),
                supabase.from('profiles').select('id, full_name')
            ]);

            const mergedOrders = ordersData?.map(order => ({
                ...order,
                total: order.total_amount || order.total, // Fallback for legacy
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

    const fetchOrderDetails = async (orderId: string, addressId: string) => {
        try {
            setDetailsLoading(true);
            setOrderDetails(null);

            // Fetch items with product data AND nested vendor data
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*, products(name, images, vendor_id, vendors(shop_name))')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            // Fetch address if exists
            let address = null;
            if (addressId) {
                const { data: addr, error: addrError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', addressId)
                    .single();
                if (!addrError) address = addr;
            }

            setOrderDetails({ items: items || [], address });
        } catch (error: any) {
            console.error("Error fetching details:", error);
            toast.error("Impossible de charger les détails");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
        fetchOrderDetails(order.id, order.shipping_address_id);
    };

    // Helper to extract shop name from details
    const getOrderShopName = () => {
        if (!orderDetails?.items || orderDetails.items.length === 0) return 'Chargement...';
        // Assuming single vendor per order for now, or take the first one
        const firstItem = orderDetails.items[0];
        return (firstItem.products as any)?.vendors?.shop_name || 'Boutique Inconnue';
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
            case 'completed':
            case 'paid':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Payé (Escrow)</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Attente</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Échec</Badge>;
            case 'refunded':
                return <Badge className="bg-slate-100 text-slate-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">Remboursé</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 border-none font-black text-[9px] px-1.5 uppercase tracking-wider">{status}</Badge>;
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const updates: any = { status: newStatus };
            // Auto update payment status if delivered
            if (newStatus === 'delivered') {
                // Logic handled by handleForceRelease usually, but we keep simple here
            }

            const { data, error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error("Mise à jour échouée (Permissions ou commande introuvable)");
            }

            // Update local state immediately (Optimistic UI)
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, ...updates }));
            }

            toast.success("Statut mis à jour avec succès");
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error("Erreur mise à jour: " + error.message);
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
        if (!confirm(`Voulez-vous changer le statut du paiement en : ${newStatus} ?`)) return;

        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ payment_status: newStatus })
                .eq('id', orderId)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) throw new Error("Mise à jour échouée");

            // Optimistic Update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, payment_status: newStatus }));
            }

            toast.success("Statut de paiement mis à jour");
        } catch (error: any) {
            toast.error("Erreur paiement: " + error.message);
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

            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, payment_status: 'paid', status: 'delivered' });
            }

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

            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: 'cancelled', payment_status: 'failed' });
            }

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

                {/* Orders Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
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
                                    <TableRow
                                        key={order.id}
                                        className="hover:bg-slate-50/50 transition-colors border-slate-50 group cursor-pointer"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-none flex items-center gap-2">
                                                    {order.order_number ? order.order_number : `#${order.id.substring(0, 8).toUpperCase()}`}
                                                    <FileText className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors" />
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
                                            <SearchX className="w-10 h-10 text-slate-200" />
                                            <p className="text-slate-400 font-bold">Aucune commande trouvée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Orders List (Mobile) */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-5 w-24 bg-slate-50 rounded" />
                                    <div className="h-5 w-16 bg-slate-50 rounded" />
                                </div>
                                <div className="h-12 bg-slate-50 rounded-xl" />
                            </div>
                        ))
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft transition-all duration-300">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setMobileExpandedId(mobileExpandedId === order.id ? null : order.id)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-slate-800 text-sm">
                                                {order.order_number ? order.order_number : `#${order.id.substring(0, 8).toUpperCase()}`}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-bold">{format(new Date(order.created_at), 'dd/MM', { locale: fr })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Store className="w-3 h-3 text-slate-400" />
                                            {order.vendors?.shop_name || 'Yarid'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="font-black text-slate-800 text-sm">{formatPrice(order.total)}</p>
                                            <div className="scale-75 origin-right">
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${mobileExpandedId === order.id ? 'rotate-180 bg-slate-100' : ''}`}>
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {mobileExpandedId === order.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Client</p>
                                                <div className="flex items-center gap-1.5">
                                                    <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600 truncate">{order.customer_name || 'Anonyme'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Paiement</p>
                                                <div className="flex items-center gap-1.5">
                                                    {getPaymentStatusBadge(order.payment_status)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Commande</span>
                                                <span className="font-black text-slate-800">{formatPrice(order.total)}</span>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 text-xs font-bold" onClick={() => handleViewOrder(order)}>
                                                <Eye className="w-3 h-3 mr-1.5" />
                                                Gérer
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Button
                                                className="h-9 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewOrder(order);
                                                }}
                                            >
                                                Traiter la commande
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <SearchX className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucune commande trouvée</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Dialog */}
            {selectedOrder && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-800">Commande {selectedOrder.order_number ? selectedOrder.order_number : `#${selectedOrder.id.substring(0, 8).toUpperCase()}`}</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Passée le {format(new Date(selectedOrder.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                    </DialogDescription>
                                </div>
                                <div className="flex gap-2">
                                    {getStatusBadge(selectedOrder.status)}
                                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Section 1: Actions Critiques (Paiement & Statut) */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Vérification Paiement */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold flex items-center gap-2 mb-3 text-slate-800">
                                        <Wallet className="w-4 h-4 text-primary" /> Vérification Paiement
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                                                onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'completed')}
                                                disabled={selectedOrder.payment_status === 'completed' || selectedOrder.payment_status === 'paid'}
                                            >
                                                Accepter
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                                                onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'pending')}
                                                disabled={selectedOrder.payment_status === 'pending'}
                                            >
                                                Attente
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
                                                onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'failed')}
                                                disabled={selectedOrder.payment_status === 'failed'}
                                            >
                                                Refuser
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-tight">
                                            * Confirmer le paiement place les fonds en <strong>Escrow</strong> et débloque la préparation.
                                        </p>
                                    </div>
                                </div>

                                {/* QR Code & Logistique */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold flex items-center gap-2 mb-1 text-slate-800">
                                            <ShieldCheck className="w-4 h-4 text-primary" /> Sécurité & Logistique
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-3 max-w-[200px]">
                                            Ce QR Code doit être collé sur le colis pour la confirmation de livraison.
                                        </p>
                                        <Button size="sm" variant="outline" className="font-bold rounded-xl text-xs h-8" onClick={() => window.print()}>
                                            <FileText className="w-3 h-3 mr-2" /> Imprimer Étiquette
                                        </Button>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 shrink-0">
                                        <QRCodeCanvas value={`ORDER:${selectedOrder.id}`} size={80} />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Section 2: Actions Logistiques */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Flux Logistique</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-xs font-bold"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                                        disabled={selectedOrder.status === 'processing' || selectedOrder.payment_status !== 'completed' && selectedOrder.payment_status !== 'paid'}
                                    >
                                        <Clock className="w-3.5 h-3.5 mr-2" /> Préparation
                                    </Button>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 h-12 rounded-xl text-xs font-bold"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                                        disabled={selectedOrder.status === 'shipped'}
                                    >
                                        <Truck className="w-3.5 h-3.5 mr-2" /> Expédier
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl text-xs font-bold"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                                        disabled={selectedOrder.status === 'delivered'}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Livrer (Scan Reçu)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 h-12 rounded-xl text-xs font-bold"
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                    >
                                        <Ban className="w-3.5 h-3.5 mr-2" /> Annuler
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Informations Client */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-primary" /> Informations Client / Boutique
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border border-slate-100">
                                        <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
                                            <span className="text-slate-500">Boutique:</span>
                                            <span className="font-black text-primary text-base">
                                                {detailsLoading ? <RefreshCw className="w-3 h-3 animate-spin inline" /> : getOrderShopName()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Nom Client:</span>
                                            <span className="font-bold text-slate-800">{selectedOrder.customer_name || 'Anonyme'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Email:</span>
                                            <span className="font-medium text-slate-800">{selectedOrder.customer_email || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Compte:</span>
                                            <span className="font-medium text-slate-800">{selectedOrder.user_id ? 'Utilisateur Inscrit' : 'Invité'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-primary" /> Livraison
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border border-slate-100">
                                        {detailsLoading ? (
                                            <div className="flex items-center justify-center py-2"><RefreshCw className="w-4 h-4 animate-spin text-slate-400" /></div>
                                        ) : orderDetails?.address ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Adresse:</span>
                                                    <span className="font-bold text-slate-800 text-right">{orderDetails.address.address_line1}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Ville:</span>
                                                    <span className="font-medium text-slate-800">{orderDetails.address.city}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Téléphone:</span>
                                                    <span className="font-medium text-slate-800">{orderDetails.address.phone}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-slate-400 italic text-center">Aucune adresse associée</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Articles */}
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary" /> Articles Commandés
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                                    {detailsLoading ? (
                                        <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="w-[50px]">Img</TableHead>
                                                    <TableHead>Produit</TableHead>
                                                    <TableHead className="text-right">Prix Unit.</TableHead>
                                                    <TableHead className="text-right">Qté</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {orderDetails?.items?.map((item: any) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden">
                                                                {item.products?.images?.[0] && <img src={item.products.images[0]} className="w-full h-full object-cover" />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-sm">{item.products?.name || 'Produit inconnu'}</TableCell>
                                                        <TableCell className="text-right text-xs">{formatPrice(item.unit_price)}</TableCell>
                                                        <TableCell className="text-right text-xs font-bold">{item.quantity}</TableCell>
                                                        <TableCell className="text-right text-sm font-bold">{formatPrice(item.total_price)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-slate-50 font-bold">
                                                    <TableCell colSpan={4} className="text-right">Total Commande</TableCell>
                                                    <TableCell className="text-right text-primary">{formatPrice(selectedOrder.total)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </div>

                            {/* Paiement */}
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" /> Détails Paiement
                                </h3>
                                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <div>
                                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Méthode</p>
                                        <p className="font-bold text-slate-800 capitalize">
                                            {selectedOrder.payment_method === 'orange_money' ? 'Orange Money' :
                                                selectedOrder.payment_method === 'mtn_money' ? 'Mobile Money (MTN)' :
                                                    selectedOrder.payment_method === 'paypal' ? 'PayPal' :
                                                        selectedOrder.payment_method?.replace(/_/g, ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Référence Transaction</p>
                                        <p className="font-mono font-bold text-slate-800 text-sm">{selectedOrder.payment_reference || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
