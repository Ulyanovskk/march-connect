import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Users,
    Store,
    Package,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/demo-data';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        vendors: 0,
        products: 0,
        orders: 0,
        totalRevenue: 0,
        pendingEscrow: 0,
        deliveryPending: 0,
        problems: 0
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch counts
                const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: vendorCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
                const { data: ordersData } = await supabase.from('orders').select('total, status, payment_status, created_at');

                const totalRev = ordersData?.reduce((acc, order) => acc + (Number(order.total) || 0), 0) || 0;
                const pendingEscrow = ordersData?.filter(o => o.payment_status === 'paid' && o.status !== 'delivered')
                    .reduce((acc, order) => acc + (Number(order.total) || 0), 0) || 0;

                const deliveryPending = ordersData?.filter(o => o.status === 'processing' || o.status === 'shipped').length || 0;
                const problems = ordersData?.filter(o => o.status === 'cancelled' || o.payment_status === 'failed').length || 0;

                setStats({
                    users: userCount || 0,
                    vendors: vendorCount || 0,
                    products: productCount || 0,
                    orders: ordersData?.length || 0,
                    totalRevenue: totalRev,
                    pendingEscrow: pendingEscrow,
                    deliveryPending: deliveryPending,
                    problems: problems
                });

                // Generate chart data (last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(new Date(), 6 - i);
                    const dayStr = format(date, 'yyyy-MM-dd');
                    const dayLabel = format(date, 'EEE', { locale: fr });

                    const dayOrders = ordersData?.filter(o => format(new Date(o.created_at), 'yyyy-MM-dd') === dayStr);
                    const dayRevenue = dayOrders?.reduce((acc, o) => acc + (Number(o.total) || 0), 0) || 0;

                    return { name: dayLabel, revenue: dayRevenue, orders: dayOrders?.length || 0 };
                });
                setChartData(last7Days);

            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            label: 'Clients',
            value: stats.users,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+12%',
            isUp: true
        },
        {
            label: 'Vendeurs',
            value: stats.vendors,
            icon: Store,
            color: 'bg-indigo-500',
            trend: '+5%',
            isUp: true
        },
        {
            label: 'Commandes',
            value: stats.orders,
            icon: ShoppingCart,
            color: 'bg-orange-500',
            trend: '+18%',
            isUp: true
        },
        {
            label: 'Revenus Total',
            value: formatPrice(stats.totalRevenue),
            icon: TrendingUp,
            color: 'bg-emerald-500',
            trend: '+24%',
            isUp: true
        },
    ];

    const financialCards = [
        { label: 'En Escrow', value: formatPrice(stats.pendingEscrow), icon: Wallet, status: 'warning' },
        { label: 'Livraisons en cours', value: stats.deliveryPending, icon: Clock, status: 'info' },
        { label: 'Livrées', value: stats.orders - stats.deliveryPending - stats.problems, icon: CheckCircle2, status: 'success' },
        { label: 'Litiges/Problèmes', value: stats.problems, icon: AlertCircle, status: 'danger' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tableau de Bord</h1>
                        <p className="text-slate-500 font-medium">Vue d'ensemble de l'activité de la plateforme Yarid</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/admin/users'}
                            className="rounded-xl font-bold bg-white border-slate-200 hover:bg-slate-50 transition-all gap-2"
                        >
                            <Shield className="w-4 h-4 text-primary" /> Nouveau Admin
                        </Button>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            Mise à jour: Temps Réel
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-emerald-600' : 'text-red-600'} bg-slate-50 px-2 py-1 rounded-full`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-bold mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Charts & Secondary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-soft">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Flux de Revenus</h3>
                                <p className="text-sm text-slate-500 font-medium">Performance des 7 derniers jours</p>
                            </div>
                            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                <option>7 derniers jours</option>
                                <option>30 derniers jours</option>
                            </select>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                                        labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#1E293B' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563EB"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft h-full flex flex-col">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">État des Fonds</h3>
                            <div className="space-y-4 flex-1">
                                {financialCards.map((card, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${card.status === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
                        ${card.status === 'warning' ? 'bg-orange-100 text-orange-600' : ''}
                        ${card.status === 'danger' ? 'bg-red-100 text-red-600' : ''}
                        ${card.status === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                      `}>
                                                <card.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 mb-0.5">{card.label}</p>
                                                <p className="text-lg font-black text-slate-800 leading-none">{card.value}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full mt-8 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                                Consulter Finance
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - To be continued */}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
