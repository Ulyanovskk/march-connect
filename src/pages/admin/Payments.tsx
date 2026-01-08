import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Download, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface OrderPayment {
    id: string;
    total: number;
    payment_status: string;
    payment_method: string;
    payment_reference: string | null;
    created_at: string;
    customer_name: string;
    customer_email: string | null;
    user_id: string | null;
}

const AdminPayments = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterMethod, setFilterMethod] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        checkAdminAndFetch();
    }, [filterStatus, filterMethod, filterDate]);

    const checkAdminAndFetch = async () => {
        try {
            setLoading(true);

            // TODO: Real Admin Check
            // const { data: { user } } = await supabase.auth.getUser();
            // if (!user) return navigate('/login');

            let query = supabase
                .from('orders')
                .select(`
                    id,
                    total,
                    payment_status,
                    payment_method,
                    payment_reference,
                    created_at,
                    customer_name,
                    customer_email,
                    user_id
                `)
                .order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('payment_status', filterStatus);
            }

            if (filterMethod !== 'all') {
                query = query.eq('payment_method', filterMethod);
            }

            if (filterDate !== 'all') {
                const now = new Date();
                let startDate = new Date();

                switch (filterDate) {
                    case 'today':
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'week':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'year':
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                query = query.gte('created_at', startDate.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            setOrders(data || []);
        } catch (error: any) {
            console.error('Error fetching payments:', error);
            toast.error('Erreur lors du chargement des paiements');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'succeeded':
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Payé</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0">En attente</Badge>;
            case 'failed':
                return <Badge variant="destructive">Échec</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            order.payment_reference?.toLowerCase().includes(term) ||
            order.customer_name?.toLowerCase().includes(term) ||
            order.customer_email?.toLowerCase().includes(term) ||
            order.id?.toLowerCase().includes(term)
        );
    });

    const totalRevenue = orders.reduce((acc, curr) => {
        const isPaid = ['completed', 'succeeded', 'paid'].includes(curr.payment_status?.toLowerCase() || '');
        return acc + (isPaid ? curr.total : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Paiements</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez et suivez toutes les transactions de la marketplace.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Exporter
                        </Button>
                        <Button className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filtres avancés
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenus</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalRevenue.toLocaleString('fr-CM')} FCFA
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total des paiements réussis
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Nombre total de commandes
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {orders.filter(o => {
                                    const orderDate = new Date(o.created_at);
                                    const now = new Date();
                                    return orderDate.getMonth() === now.getMonth() && 
                                           orderDate.getFullYear() === now.getFullYear();
                                }).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Commandes ce mois
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>Historique des transactions</CardTitle>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Rechercher..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="paid">Payé</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="failed">Échoué</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterMethod} onValueChange={setFilterMethod}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Méthode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes méthodes</SelectItem>
                                        <SelectItem value="card">Carte</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="orange_money">Orange Money</SelectItem>
                                        <SelectItem value="mtn_momo">MTN MoMo</SelectItem>
                                        <SelectItem value="binance">Binance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterDate} onValueChange={setFilterDate}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toute période</SelectItem>
                                        <SelectItem value="today">Aujourd'hui</SelectItem>
                                        <SelectItem value="week">7 derniers jours</SelectItem>
                                        <SelectItem value="month">30 derniers jours</SelectItem>
                                        <SelectItem value="year">Cette année</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <CardDescription>
                            Liste des derniers paiements reçus sur la plateforme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID Commande</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Méthode</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Chargement...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Aucun paiement trouvé
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">
                                                    <span className="truncate max-w-[150px]" title={order.id}>
                                                        {order.id.slice(0, 8)}...
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{order.customer_name}</span>
                                                        <span className="text-xs text-muted-foreground">{order.customer_email || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{order.total?.toLocaleString('fr-CM')} FCFA</TableCell>
                                                <TableCell className="capitalize">{order.payment_method?.replace('_', ' ')}</TableCell>
                                                <TableCell>
                                                    {order.created_at && format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.payment_status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">
                                                        Détails
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" disabled>
                                Précédent
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Suivant
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default AdminPayments;
