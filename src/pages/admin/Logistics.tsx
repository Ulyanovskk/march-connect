import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Truck,
    MapPin,
    Package,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    ChevronRight,
    Navigation,
    ExternalLink,
    MoreVertical,
    Plus
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

const AdminLogistics = () => {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            // For demo, we use orders with status processing, shipped, or delivered
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDeliveries(data || []);
        } catch (error: any) {
            toast.error("Erreur chargement logistique");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Statut mis à jour: ${newStatus}`);
            fetchDeliveries();
        } catch (error: any) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleTrackGPS = (id: string) => {
        toast.info(`Initialisation du suivi GPS pour TRK-${id.substring(0, 8).toUpperCase()}`);
    };

    const handleReportIncident = (id: string) => {
        const reason = prompt("Décrivez brièvement l'incident de livraison :");
        if (reason) {
            toast.error(`Incident signalé pour #${id.substring(0, 8)} : ${reason}`);
        }
    };

    const filteredDeliveries = deliveries.filter(d =>
        d.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const logisticsStats = [
        { label: 'À Collecter', value: deliveries.filter(d => d.status === 'processing').length, icon: Package, color: 'text-amber-500' },
        { label: 'En Transit', value: deliveries.filter(d => d.status === 'shipped').length, icon: Truck, color: 'text-indigo-500' },
        { label: 'Livrées', value: deliveries.filter(d => d.status === 'delivered').length, icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Incidents', value: deliveries.filter(d => d.status === 'cancelled').length, icon: AlertCircle, color: 'text-red-500' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Navigation className="w-8 h-8 text-primary" />
                            Logistique & Livraisons
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Supervisez l'expédition, suivez les livreurs et validez les preuves de dépôt</p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> Nouvelle Expédition
                        </Button>
                    </div>
                </div>

                {/* Real-time Logistics Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {logisticsStats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black text-slate-800 leading-none">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                {/* Active Fleet Simulation (Optional) */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-500"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Navigation className="w-7 h-7 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight">Suivi de Flotte en Direct</h3>
                                <p className="text-slate-400 text-sm font-medium">12 livreurs connectés à Douala et Yaoundé</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12">
                                Voir la Carte
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Delivery Management Table */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Rechercher par n° de suivi, client, destination..."
                                className="pl-11 h-11 rounded-xl border-none bg-slate-50 focus:bg-white transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-100 font-bold text-sm text-slate-600">Filtres Avancés</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-800">Expédition</TableHead>
                                    <TableHead className="font-bold text-slate-800">Destination</TableHead>
                                    <TableHead className="font-bold text-slate-800">Livreur</TableHead>
                                    <TableHead className="font-bold text-slate-800">Mise à jour</TableHead>
                                    <TableHead className="font-bold text-slate-800">État</TableHead>
                                    <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={6}><div className="h-16 bg-slate-50/50 m-2 rounded-xl"></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : deliveries.length > 0 ? (
                                    deliveries.map((delivery) => (
                                        <TableRow key={delivery.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                                                        <Truck className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">TRK-{delivery.id.substring(0, 8).toUpperCase()}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">Poids: 1.2kg | Standard</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                                                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{delivery.shipping_address || 'Douala, Cameroun'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">Yarid Express</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(delivery.created_at), 'HH:mm | dd MMM', { locale: fr })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`
                              ${delivery.status === 'processing' ? 'bg-amber-50 text-amber-600' : ''}
                              ${delivery.status === 'shipped' ? 'bg-indigo-50 text-indigo-600' : ''}
                              ${delivery.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : ''}
                              ${delivery.status === 'cancelled' ? 'bg-red-50 text-red-600' : ''}
                              border-none font-black text-[9px] px-2 py-0.5
                           `}>
                                                    {delivery.status.toUpperCase()}
                                                </Badge>
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
                                                            onClick={() => handleTrackGPS(delivery.id)}
                                                            className="rounded-lg gap-2 font-bold text-slate-600"
                                                        >
                                                            <Navigation className="w-4 h-4" /> Suivi GPS
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => toast.info(`Détails commande #${delivery.id.substring(0, 8)}`)}
                                                            className="rounded-lg gap-2 font-bold text-slate-600"
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> Détails Commande
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                                                            className="rounded-lg gap-2 font-bold text-primary"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Valider Livraison
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleReportIncident(delivery.id)}
                                                            className="rounded-lg gap-2 font-bold text-red-600"
                                                        >
                                                            <AlertCircle className="w-4 h-4" /> Signaler Problème
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold">Aucune expédition en cours</TableCell>
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

export default AdminLogistics;
