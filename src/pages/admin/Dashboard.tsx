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
        users: { value: 0, trend: 0 },
        clients: { value: 0, trend: 0 },
        vendors: { value: 0, trend: 0 },
        admins: { value: 0, trend: 0 },
        products: 0,
        orders: { value: 0, trend: 0 },
        totalRevenue: { value: 0, trend: 0 },
        pendingEscrow: 0,
        deliveryPending: 0,
        problems: 0,
        pendingVendors: [] as any[]
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Refresh session to ensure admin rights are recognized
                await supabase.auth.refreshSession();

                // Fetch counts
                // Fetch counts - we need IDs for accurate client filtering
                // Fetch IDs for counting
                const { data: profilesData } = await supabase.from('profiles').select('id');
                const { count: vendorCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
                const { count: adminCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

                // EXTRA FETCHES FOR TOTAL USERS to match Users.tsx
                const { data: _allVendorIds } = await supabase.from('vendors').select('user_id');
                const { data: _allUserRoles } = await supabase.from('user_roles').select('user_id');

                const allUniqueUserIds = new Set([
                    ...(profilesData?.map(p => p.id) || []),
                    ...(_allVendorIds?.map(v => v.user_id) || []),
                    ...(_allUserRoles?.map(r => r.user_id) || [])
                ]);
                const totalUniqueUsers = allUniqueUserIds.size;

                // Accurate Client Count Calculation
                // Fetch data to identify non-clients (vendors and admins) to handle overlaps correctly
                const { data: vendorIds } = await supabase.from('vendors').select('user_id');
                const { data: userRoles } = await supabase.from('user_roles').select('user_id, role');

                const nonClientSet = new Set<string>();

                // Add vendors from table to non-client set
                vendorIds?.forEach(v => {
                    if (v.user_id) nonClientSet.add(v.user_id);
                });

                // Add admins and vendors (by role) to non-client set
                userRoles?.forEach(r => {
                    if (r.role === 'admin' || r.role === 'vendor') {
                        nonClientSet.add(r.user_id);
                    }
                });

                // Count profiles that are NOT in the non-client set
                let strictClientCount = 0;
                if (profilesData) {
                    strictClientCount = profilesData.filter(p => !nonClientSet.has(p.id)).length;
                }

                const safeClientCount = strictClientCount;

                // Fetch orders with total_amount matching Payment.tsx
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*, total_amount')
                    .order('created_at', { ascending: false })
                    .limit(5000);

                if (ordersError) {
                    console.error('Error fetching orders:', ordersError);
                }

                // Calculate revenue strictly for valid sales (Paid and not Cancelled/Returned)
                const totalRev = ordersData?.reduce((acc, order) => {
                    const isValidSale = order.payment_status === 'paid' &&
                        order.status !== 'cancelled' &&
                        order.status !== 'returned';

                    if (isValidSale) {
                        const amount = Number(order.total_amount) || Number(order.total) || 0;
                        return acc + amount;
                    }
                    return acc;
                }, 0) || 0;
                const pendingEscrow = ordersData?.filter(o => o.payment_status === 'paid' && o.status !== 'delivered')
                    .reduce((acc, order) => {
                        const amount = Number(order.total_amount) || Number(order.total) || 0;
                        return acc + amount;
                    }, 0) || 0;

                const deliveryPending = ordersData?.filter(o => o.status === 'processing' || o.status === 'shipped').length || 0;
                const problems = ordersData?.filter(o => o.status === 'cancelled' || o.payment_status === 'failed').length || 0;

                // Calculate Trends (Last 30 days vs Previous 30 days)
                const now = new Date();
                const thirtyDaysAgo = subDays(now, 30);
                const sixtyDaysAgo = subDays(now, 60);

                // Helper to get count by date range
                const getCountInRange = async (table: string, startDate: Date, endDate: Date) => {
                    const { count } = await supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true })
                        .gte('created_at', startDate.toISOString())
                        .lt('created_at', endDate.toISOString());
                    return count || 0;
                };

                // Fetch Trend Data
                const [
                    newUsersCurrent, newUsersPrevious,
                    newVendorsCurrent, newVendorsPrevious
                ] = await Promise.all([
                    getCountInRange('profiles', thirtyDaysAgo, now),
                    getCountInRange('profiles', sixtyDaysAgo, thirtyDaysAgo),
                    getCountInRange('vendors', thirtyDaysAgo, now),
                    getCountInRange('vendors', sixtyDaysAgo, thirtyDaysAgo)
                ]);

                // Calculate Order & Revenue Trends from local data (ordersData)
                // Note: limits analysis to the fetched 5000 orders, which is sufficient for recent trends
                const currentPeriodOrders = ordersData?.filter(o =>
                    new Date(o.created_at) >= thirtyDaysAgo && new Date(o.created_at) < now
                ) || [];
                const previousPeriodOrders = ordersData?.filter(o =>
                    new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo
                ) || [];

                const calculateRevenue = (orders: any[]) => orders.reduce((acc, order) => {
                    const isValidSale = order.payment_status === 'paid' &&
                        order.status !== 'cancelled' &&
                        order.status !== 'returned';
                    return isValidSale ? acc + (Number(order.total_amount) || Number(order.total) || 0) : acc;
                }, 0);

                const currentRevenue = calculateRevenue(currentPeriodOrders);
                const previousRevenue = calculateRevenue(previousPeriodOrders);

                const calculateTrend = (current: number, previous: number) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return ((current - previous) / previous) * 100;
                };

                setStats({
                    users: {
                        value: totalUniqueUsers,
                        trend: calculateTrend(newUsersCurrent, newUsersPrevious)
                    },
                    clients: {
                        value: safeClientCount,
                        trend: calculateTrend(newUsersCurrent - newVendorsCurrent, newUsersPrevious - newVendorsPrevious)
                    },
                    vendors: {
                        value: vendorCount || 0,
                        trend: calculateTrend(newVendorsCurrent, newVendorsPrevious)
                    },
                    admins: {
                        value: adminCount || 0,
                        trend: 0
                    },
                    products: productCount || 0,
                    orders: {
                        value: ordersData?.length || 0,
                        trend: calculateTrend(currentPeriodOrders.length, previousPeriodOrders.length)
                    },
                    totalRevenue: {
                        value: totalRev,
                        trend: calculateTrend(currentRevenue, previousRevenue)
                    },
                    pendingEscrow: pendingEscrow,
                    deliveryPending: deliveryPending,
                    problems: problems,
                    pendingVendors: []
                });

                // Fetch pending vendors separately to include in stats
                // Fix: Use two-step fetch to avoid 400 error on join
                const { data: rawPendingVendors } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('is_verified', false)
                    .limit(5);

                let mergedPendingVendors: any[] = [];

                if (rawPendingVendors && rawPendingVendors.length > 0) {
                    const userIds = rawPendingVendors.map(v => v.user_id);
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', userIds);

                    mergedPendingVendors = rawPendingVendors.map(vendor => ({
                        ...vendor,
                        profiles: profilesData?.find(p => p.id === vendor.user_id) || null
                    }));
                }

                setStats(s => ({ ...s, pendingVendors: mergedPendingVendors }));

                // Generate chart data (last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(new Date(), 6 - i);
                    const dayStr = format(date, 'yyyy-MM-dd');
                    const dayLabel = format(date, 'EEE', { locale: fr });

                    const dayOrders = ordersData?.filter(o => format(new Date(o.created_at), 'yyyy-MM-dd') === dayStr);
                    const dayRevenue = dayOrders?.reduce((acc, o) => {
                        const amount = Number(o.total_amount) || Number(o.total) || 0;
                        return acc + amount;
                    }, 0) || 0;

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
            label: 'Utilisateurs',
            value: stats.users.value,
            icon: Users,
            color: 'bg-slate-800',
            trend: `${stats.users.trend > 0 ? '+' : ''}${stats.users.trend.toFixed(1)}%`,
            isUp: stats.users.trend >= 0
        },
        {
            label: 'Clients (Acheteurs)',
            value: stats.clients.value,
            icon: ShoppingCart,
            color: 'bg-blue-500',
            trend: `${stats.clients.trend > 0 ? '+' : ''}${stats.clients.trend.toFixed(1)}%`,
            isUp: stats.clients.trend >= 0
        },
        {
            label: 'Vendeurs Pro',
            value: stats.vendors.value,
            icon: Store,
            color: 'bg-orange-500',
            trend: `${stats.vendors.trend > 0 ? '+' : ''}${stats.vendors.trend.toFixed(1)}%`,
            isUp: stats.vendors.trend >= 0
        },
        {
            label: 'Revenus Total',
            value: formatPrice(stats.totalRevenue.value),
            icon: Wallet,
            color: 'bg-emerald-500',
            trend: `${stats.totalRevenue.trend > 0 ? '+' : ''}${stats.totalRevenue.trend.toFixed(1)}%`,
            isUp: stats.totalRevenue.trend >= 0
        },
        {
            label: 'Commandes',
            value: stats.orders.value,
            icon: Package,
            color: 'bg-indigo-500',
            trend: `${stats.orders.trend > 0 ? '+' : ''}${stats.orders.trend.toFixed(1)}%`,
            isUp: stats.orders.trend >= 0
        },
        {
            label: 'Administrateurs',
            value: stats.admins.value,
            icon: Shield,
            color: 'bg-slate-600',
            trend: 'Système',
            isUp: true
        },
    ];

    const financialCards = [
        { label: 'Ventes Totales', value: formatPrice(stats.totalRevenue.value), icon: TrendingUp, status: 'success' },
        { label: 'Commandes Totales', value: stats.orders.value, icon: ShoppingCart, status: 'info' },
        { label: 'En Escrow (Sécurisé)', value: formatPrice(stats.pendingEscrow), icon: Wallet, status: 'warning' },
        { label: 'Livraisons en cours', value: stats.deliveryPending, icon: Clock, status: 'info' },
        { label: 'Livrées (Terminées)', value: (stats.orders.value || 0) - stats.deliveryPending - stats.problems, icon: CheckCircle2, status: 'success' },
        { label: 'Litiges/Problèmes', value: stats.problems, icon: AlertCircle, status: 'danger' },
        { label: 'Boutiques à certifier', value: stats.pendingVendors.length, icon: Shield, status: 'warning' },
    ];

    const handleVerifyVendor = async (id: string) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: true })
                .eq('id', id);

            if (error) throw error;

            // @ts-ignore
            import('sonner').then(({ toast }) => toast.success("Boutique certifiée avec succès !"));
            setStats(prev => ({
                ...prev,
                pendingVendors: prev.pendingVendors.filter(v => v.id !== id)
            }));
        } catch (error: any) {
            // @ts-ignore
            import('sonner').then(({ toast }) => toast.error("Erreur: " + error.message));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Tableau de Bord</h1>
                        <p className="text-sm md:text-base text-slate-500 font-medium">Vue d'ensemble de l'activité de la plateforme Yarid</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/admin/users'}
                            className="rounded-xl font-bold bg-white border-slate-200 hover:bg-slate-50 transition-all gap-2 text-xs md:text-sm"
                        >
                            <Shield className="w-4 h-4 text-primary" /> Nouveau Admin
                        </Button>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            Mise à jour: Temps Réel
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${stat.isUp ? 'text-emerald-600' : 'text-red-600'} bg-slate-50 px-2 py-1 rounded-full`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs md:text-sm font-bold mb-1">{stat.label}</p>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Charts & Secondary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-soft">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Flux de Revenus</h3>
                                <p className="text-xs md:text-sm text-slate-500 font-medium">Performance des 7 derniers jours</p>
                            </div>
                            <select name="dashboard_period" id="dashboard_period" className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-auto">
                                <option>7 derniers jours</option>
                                <option>30 derniers jours</option>
                            </select>
                        </div>

                        <div className="h-[250px] md:h-[350px] w-full">
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
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                        interval={0}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                        width={30}
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
                                        strokeWidth={3}
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
                        <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-soft h-full flex flex-col">
                            <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight mb-4 md:mb-6">État des Fonds</h3>
                            <div className="space-y-3 md:space-y-4 flex-1">
                                {financialCards.map((card, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center
                        ${card.status === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
                        ${card.status === 'warning' ? 'bg-orange-100 text-orange-600' : ''}
                        ${card.status === 'danger' ? 'bg-red-100 text-red-600' : ''}
                        ${card.status === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                      `}>
                                                <card.icon className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-0.5 truncate">{card.label}</p>
                                                <p className="text-base md:text-lg font-black text-slate-800 leading-none truncate">{card.value}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full mt-6 md:mt-8 h-10 md:h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg text-sm md:text-base">
                                Consulter Finance
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Pending Vendors */}
                <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Certification des Boutiques</h3>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Boutiques en attente de vérification</p>
                        </div>
                        <Button variant="ghost" className="text-primary font-bold text-xs md:text-sm justify-start sm:justify-center p-0 sm:p-4 hover:bg-transparent sm:hover:bg-slate-100" onClick={() => window.location.href = '/admin/shops'}>
                            Toutes les boutiques <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {stats.pendingVendors.length > 0 ? (
                            stats.pendingVendors.map((vendor) => (
                                <div key={vendor.id} className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                                            {vendor.logo_url ? (
                                                <img src={vendor.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <Store className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-xs md:text-sm leading-none mb-1 truncate">{vendor.shop_name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 truncate">Par {vendor.profiles?.full_name || 'Inconnu'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleVerifyVendor(vendor.id)}
                                        className="h-7 md:h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] px-2 md:px-3 shadow-md shadow-emerald-600/20 shrink-0"
                                    >
                                        Certifier
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-sm md:text-base">
                                Aucune boutique en attente de certification
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
