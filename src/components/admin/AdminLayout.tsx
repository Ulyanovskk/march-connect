import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    ShoppingCart,
    Wallet,
    Truck,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    ShieldCheck,
    Building2,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check admin role and set admin state
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);
            const hasAdminRole = roles?.some(r => r.role === 'admin');
            if (!hasAdminRole) {
                toast.error("Accès non autorisé");
                navigate('/');
            } else {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, [navigate]);

    // Responsive sidebar: set initial state based on screen width
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dashboard', path: '/admin' },
        { icon: Users, label: 'Utilisateurs', id: 'users', path: '/admin/users' },
        { icon: Building2, label: 'Vendeurs', id: 'vendors', path: '/admin/vendors' },
        { icon: Store, label: 'Boutiques', id: 'shops', path: '/admin/shops' },
        { icon: Package, label: 'Produits', id: 'products', path: '/admin/products' },
        { icon: ShoppingCart, label: 'Commandes', id: 'orders', path: '/admin/orders' },
        { icon: Wallet, label: 'Escrow & Finance', id: 'finance', path: '/admin/finance' },
        { icon: Truck, label: 'Livraisons', id: 'logistics', path: '/admin/logistics' },
        { icon: MessageSquare, label: 'Litiges', id: 'support', path: '/admin/support' },
        { icon: Settings, label: 'Paramètres', id: 'settings', path: '/admin/settings' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    if (!isAdmin) return null;

    return (
        <div className="h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out lg:relative ${isSidebarOpen ? 'w-72 translate-x-0 pointer-events-auto' : '-translate-x-full w-72 lg:w-20 lg:translate-x-0 pointer-events-none'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
                        <Link to="/admin" className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'lg:justify-center lg:w-full'}`}>
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <ShieldCheck className="text-white w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <span className="font-black text-2xl tracking-tight text-slate-800">YARID<span className="text-primary italic">.admin</span></span>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-hidden py-6 px-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                                    {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                                    {isActive && isSidebarOpen && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}

                                    {/* Tooltip for collapsed mode */}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-100 shrink-0">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative`}
                        >
                            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
                            {isSidebarOpen && <span className="font-bold text-sm">Déconnexion</span>}
                            {!isSidebarOpen && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    Déconnexion
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
            {/* Mobile backdrop */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-50 overflow-hidden">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex lg:hidden text-slate-500 hover:bg-slate-50 rounded-xl z-50"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>

                        <div className="hidden md:flex relative max-w-md w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher client, commande, boutique..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-50 rounded-xl">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </Button>
                        </div>

                        <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors leading-none mb-1">Administrateur</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Super Admin Portal</p>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-slate-200 group-hover:border-primary transition-all ring-offset-2 ring-primary/20 group-hover:ring-2">
                                <AvatarFallback className="bg-primary/10 text-primary font-black">AD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Content Section */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
