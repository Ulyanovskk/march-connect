import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Search,
    Filter,
    RefreshCw,
    CreditCard,
    ShieldCheck,
    Building2,
    Clock,
    CheckCircle2,
    TrendingUp,
    History,
    Info
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
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/demo-data';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminFinance = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProcessed: 0,
        inEscrow: 0,
        payoutReady: 0,
        platformRevenue: 0
    });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const { data: vendorsData, error: vendorsError } = await supabase
                .from('vendors')
                .select('id, shop_name, commission_rate');

            const mergedTransactions = ordersData?.map(order => {
                const vendor = vendorsData?.find(v => v.id === order.vendor_id);
                // Use vendor specific rate or default to 10% (0.10)
                const rate = vendor?.commission_rate ? vendor.commission_rate / 100 : 0.10;
                return {
                    ...order,
                    vendors: vendor || null,
                    commissionRate: rate
                };
            }) || [];

            // Calculate Stats only on valid sales (Paid & Active)
            const validSales = mergedTransactions.filter(o =>
                (o.payment_status === 'paid' || o.payment_status === 'completed') &&
                o.status !== 'cancelled' &&
                o.status !== 'returned'
            );

            const totalProc = validSales.reduce((acc, o) => acc + (Number(o.total_amount) || Number(o.total) || 0), 0);

            const escrow = validSales
                .filter(o => o.status !== 'delivered')
                .reduce((acc, o) => acc + (Number(o.total_amount) || Number(o.total) || 0), 0);

            // Platform Revenue = Sum of commissions on valid sales
            const platformRev = validSales.reduce((acc, o) => {
                const amount = Number(o.total_amount) || Number(o.total) || 0;
                return acc + (amount * o.commissionRate);
            }, 0);

            // Revenue Ready for Payout = Net Vendor Amount for DELIVERED orders
            // Formula: Sum(Total - Commission) where status === 'delivered'
            const payoutReady = validSales
                .filter(o => o.status === 'delivered')
                .reduce((acc, o) => {
                    const amount = Number(o.total_amount) || Number(o.total) || 0;
                    const comm = amount * o.commissionRate;
                    return acc + (amount - comm);
                }, 0);

            setStats({
                totalProcessed: totalProc,
                inEscrow: escrow,
                payoutReady: payoutReady,
                platformRevenue: platformRev
            });

            setTransactions(mergedTransactions);
        } catch (error: any) {
            console.error("Finance fetch error:", error);
            toast.error("Erreur de chargement des données financières");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Encaissé', value: formatPrice(stats.totalProcessed), icon: TrendingUp, color: 'text-primary' },
        { label: 'Fonds en Escrow', value: formatPrice(stats.inEscrow), icon: ShieldCheck, color: 'text-orange-500' },
        { label: 'Commissions Yarid', value: formatPrice(stats.platformRevenue), icon: Wallet, color: 'text-emerald-500' },
        { label: 'Prêt pour Paiement', value: formatPrice(stats.payoutReady), icon: CheckCircle2, color: 'text-blue-500' },
    ];

    const handleExportCSV = () => {
        const headers = ["ID", "Date", "Boutique", "Montant Brut", "Commission", "Net Vendeur", "Statut"];
        const rows = transactions.map(tr => {
            const comm = tr.total * tr.commissionRate;
            return [
                tr.id,
                format(new Date(tr.created_at), 'yyyy-MM-dd'),
                tr.vendors?.shop_name || 'System',
                tr.total,
                comm,
                tr.total - comm,
                tr.status
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `yarid_finance_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export CSV lancé");
    };

    const handlePayout = (vendorName: string, amount: number) => {
        toast.success(`Paiement de ${formatPrice(amount)} envoyé à ${vendorName}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-primary" />
                            Finance & Escrow
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Gérez les flux monétaires, les commissions et les déblocages de fonds</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => toast.info("Génération du rapport PDF...")}
                            className="rounded-xl font-bold border-slate-200"
                        >
                            Rapport PDF
                        </Button>
                        <Button onClick={handleExportCSV} className="rounded-xl font-bold gap-2">
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Finance Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-100">Temps réel</Badge>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-xl font-black text-slate-800">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                {/* Commission Alert Panel */}
                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Paramètre Commission: 10%</p>
                            <p className="text-xs font-medium opacity-80">Les commissions sont prélevées automatiquement sur chaque transaction validée.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold bg-white text-primary border-none shadow-sm hover:bg-white/90">
                        Modifier Taux
                    </Button>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />
                            Historique des Flux
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={fetchFinanceData} className="h-10 w-10 text-slate-400">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-800">Date & Réf</TableHead>
                                    <TableHead className="font-bold text-slate-800">Boutique</TableHead>
                                    <TableHead className="font-bold text-slate-800">Montant Brut</TableHead>
                                    <TableHead className="font-bold text-slate-800">Com. (10%)</TableHead>
                                    <TableHead className="font-bold text-slate-800">Net Vendeur</TableHead>
                                    <TableHead className="font-bold text-slate-800">Statut Escrow</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={7}><div className="h-12 bg-slate-50/50 m-2 rounded-xl"></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : transactions.length > 0 ? (
                                    transactions.map((tr) => {
                                        const totalAmount = Number(tr.total) || Number(tr.total_amount) || 0;
                                        const commission = totalAmount * (tr.commissionRate || 0.1);
                                        const netSeller = totalAmount - commission;

                                        return (
                                            <TableRow key={tr.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                                <TableCell>
                                                    <p className="text-xs font-black text-slate-800">#{tr.id.substring(0, 8).toUpperCase()}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{format(new Date(tr.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5 text-primary" />
                                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{tr.vendors?.shop_name || 'System'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-slate-800 text-sm">
                                                    {formatPrice(totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-emerald-600 font-bold text-xs">
                                                    -{formatPrice(commission)}
                                                    <span className="text-[9px] text-slate-400 ml-1">
                                                        ({((tr.commissionRate || 0.1) * 100).toFixed(0)}%)
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-black text-slate-700 text-sm">
                                                    {formatPrice(netSeller)}
                                                </TableCell>
                                                <TableCell>
                                                    {tr.status === 'cancelled' || tr.status === 'returned' ? (
                                                        <Badge className="bg-red-50 text-red-600 border-none font-black text-[9px] px-2 py-0.5 w-fit">
                                                            ANNULÉ / RETOUR
                                                        </Badge>
                                                    ) : tr.status === 'delivered' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 py-0.5 flex items-center gap-1 w-fit">
                                                            <CheckCircle2 className="w-3 h-3" /> DÉBLOQUÉ
                                                        </Badge>
                                                    ) : (tr.payment_status === 'paid' || tr.payment_status === 'completed') ? (
                                                        <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[9px] px-2 py-0.5 flex items-center gap-1 w-fit">
                                                            <Clock className="w-3 h-3" /> SÉCURISÉ
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] px-2 py-0.5 w-fit">
                                                            EN ATTENTE
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toast.info(`Détails transaction #${tr.id.substring(0, 8)}`)}
                                                        className="h-8 px-3 rounded-lg font-bold text-xs hover:bg-slate-100 text-primary"
                                                    >
                                                        Détails
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center text-slate-400 font-bold">Aucune transaction</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminFinance;
