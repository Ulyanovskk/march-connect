import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    MoreVertical,
    ShieldAlert,
    User,
    UserCheck,
    MessageCircle,
    RefreshCw,
    Eye,
    ArrowRight,
    ShieldCheck,
    Ban,
    Archive
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/demo-data';

const AdminSupport = () => {
    const [tickets, setTickets] = useState<any[]>([]); // Mock or real if table exists
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    useEffect(() => {
        fetchSupportData();
    }, []);

    const fetchSupportData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Orders with issues (simulating tickets)
            // Issues: Payment failed, Returned, Cancelled (as historical tickets)
            const { data: problemOrders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'cancelled')
                .order('created_at', { ascending: false })
                .limit(50);

            if (ordersError) throw ordersError;

            // 2. Fetch Unverified Vendors (as validation tickets)
            const { data: unverifiedVendors, error: vendorsError } = await supabase
                .from('vendors')
                .select('*')
                .eq('is_verified', false)
                .order('created_at', { ascending: false })
                .limit(20);

            if (vendorsError) throw vendorsError;

            // 3. Map to Ticket Interface
            const orderTickets = problemOrders?.map(order => {
                let subject = "Problème Inconnu";
                let status = "open";
                let priority = "medium";

                // Safely access properties even if types definition is slightly off vs DB
                const paymentStatus = (order as any).payment_status;

                if (paymentStatus === 'failed') {
                    subject = "Paiement Échoué";
                    priority = "high";
                } else if (order.status === 'returned') {
                    subject = "Retour Produit";
                    priority = "high";
                } else if (order.status === 'cancelled') {
                    subject = "Commande Annulée";
                    status = "resolved";
                    priority = "low";
                }

                if (order.total > 100000) priority = "high";

                return {
                    id: order.id,
                    type: 'order',
                    subject: `${subject} (${formatPrice(order.total || 0)})`,
                    user: order.customer_name || 'Client Inconnu',
                    status: status,
                    priority: priority,
                    date: order.created_at,
                    raw: order
                };
            }) || [];

            const vendorTickets = unverifiedVendors?.map(vendor => ({
                id: vendor.id,
                type: 'vendor',
                subject: `Validation Vendeur: ${vendor.shop_name}`,
                user: vendor.shop_name,
                status: 'open', // Pending verification
                priority: 'medium',
                date: vendor.created_at,
                raw: vendor
            })) || [];

            // Combine and sort
            const allTickets = [...vendorTickets, ...orderTickets].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setTickets(allTickets);

        } catch (error: any) {
            console.error("Error fetching support data", error);
            toast.error("Erreur chargement support: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveTicket = (id: string) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
        toast.success(`Ticket ${id} marqué comme résolu`);
    };

    const handleArchiveTicket = (id: string) => {
        setTickets(tickets.filter(t => t.id !== id));
        toast.success(`Ticket ${id} archivé`);
    };

    const handleApplyPenalty = (id: string) => {
        if (confirm("Voulez-vous vraiment appliquer une pénalité au vendeur concernant ce litige ?")) {
            toast.error(`Pénalité appliquée pour le dossier ${id}`);
        }
    };

    function subDays(date: Date, days: number) {
        const result = new Date(date);
        result.setDate(result.getDate() - days);
        return result;
    }

    const [searchTerm, setSearchTerm] = useState('');
    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || t.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getPriorityBadge = (prio: string) => {
        switch (prio) {
            case 'high': return <Badge className="bg-red-500 text-white border-none font-black text-[9px] px-2">CRITIQUE</Badge>;
            case 'medium': return <Badge className="bg-amber-500 text-white border-none font-black text-[9px] px-2">MOYEN</Badge>;
            case 'low': return <Badge className="bg-blue-500 text-white border-none font-black text-[9px] px-2">BAS</Badge>;
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-primary" />
                            Litiges & Support
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez les réclamations clients, les conflits vendeurs et la modération</p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
                            <MessageCircle className="w-4 h-4" /> Nouveau Ticket
                        </Button>
                    </div>
                </div>

                {/* Support Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft border-l-4 border-l-red-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Litiges / Problèmes</p>
                        <h4 className="text-2xl font-black text-slate-800">
                            {tickets.filter(t => t.priority === 'high' && t.status === 'open').length}
                        </h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft border-l-4 border-l-amber-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En attente (Vendeurs)</p>
                        <h4 className="text-2xl font-black text-slate-800">
                            {tickets.filter(t => t.type === 'vendor' && t.status === 'open').length}
                        </h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft border-l-4 border-l-emerald-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Résolus / Archivés</p>
                        <h4 className="text-2xl font-black text-slate-800">
                            {tickets.filter(t => t.status === 'resolved').length}
                        </h4>
                    </div>
                </div>

                {/* Support List */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                        <div className="flex items-center gap-2">
                            <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')} className="rounded-xl font-bold h-10 px-4">Tous</Button>
                            <Button variant={filter === 'open' ? 'default' : 'ghost'} onClick={() => setFilter('open')} className="rounded-xl font-bold h-10 px-4">Ouverts</Button>
                            <Button variant={filter === 'resolved' ? 'default' : 'ghost'} onClick={() => setFilter('resolved')} className="rounded-xl font-bold h-10 px-4">Résolus</Button>
                        </div>
                        <div className="relative flex-1 max-w-md w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher ticket ID, sujet..."
                                className="pl-11 h-10 rounded-xl border-none bg-slate-50 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-800">ID & Sujet</TableHead>
                                    <TableHead className="font-bold text-slate-800">Demandeur</TableHead>
                                    <TableHead className="font-bold text-slate-800">Date</TableHead>
                                    <TableHead className="font-bold text-slate-800">Priorité</TableHead>
                                    <TableHead className="font-bold text-slate-800">Statut</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6}><div className="h-32 bg-slate-50/50 animate-pulse m-4 rounded-2xl"></div></TableCell></TableRow>
                                ) : filteredTickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5" title={ticket.id}>
                                                {ticket.id.substring(0, 8)}...
                                            </p>
                                            <p className="text-sm font-bold text-slate-800">{ticket.subject}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {ticket.user}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(ticket.date), 'dd MMM', { locale: fr })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getPriorityBadge(ticket.priority)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${ticket.status === 'open' ? 'bg-indigo-50 text-indigo-600' :
                                                ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                                } border-none font-black text-[9px] px-2 py-0.5`}>
                                                {ticket.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toast.info(`Ouverture du dossier ${ticket.id}`)}
                                                    className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg transition-all group-hover:bg-white group-hover:shadow-sm"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-1">
                                                        <DropdownMenuItem
                                                            onClick={() => toast.info("Consultation de l'historique...")}
                                                            className="rounded-lg gap-2 font-bold text-slate-600"
                                                        >
                                                            <Eye className="w-4 h-4" /> Voir Historique
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleResolveTicket(ticket.id)}
                                                            className="rounded-lg gap-2 font-bold text-emerald-600"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Marquer Résolu
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <DropdownMenuItem
                                                            onClick={() => toast.info("Déblocage manuel des fonds...")}
                                                            className="rounded-lg gap-2 font-bold text-amber-600"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" /> Débloquer Paiement
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleApplyPenalty(ticket.id)}
                                                            className="rounded-lg gap-2 font-bold text-red-600"
                                                        >
                                                            <Ban className="w-4 h-4" /> Pénalité Vendeur
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleArchiveTicket(ticket.id)}
                                                            className="rounded-lg gap-2 font-bold text-slate-400"
                                                        >
                                                            <Archive className="w-4 h-4" /> Archiver
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSupport;
