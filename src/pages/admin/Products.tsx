import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    Package,
    Eye,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Store,
    Tag,
    Clock,
    Ban,
    ShieldCheck,
    SearchX,
    FileEdit,
    Trash2
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

import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;

            const { data: vendorsData, error: vendorsError } = await supabase
                .from('vendors')
                .select('id, shop_name');

            if (vendorsError) console.warn("Error fetching vendors for products:", vendorsError);

            const mergedProducts = productsData?.map(product => ({
                ...product,
                vendors: vendorsData?.find(v => v.id === product.vendor_id) || null
            })) || [];

            setProducts(mergedProducts);
        } catch (error: any) {
            toast.error("Erreur chargement produits: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (productId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', productId);

            if (error) throw error;
            toast.success(currentStatus ? "Produit désactivé" : "Produit activé");
            fetchProducts();
        } catch (error: any) {
            toast.error("Erreur de mise à jour: " + error.message);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Cette action est irréversible.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) {
                // Check for foreign key constraint error (PostgreSQL code 23503)
                if (error.code === '23503') {
                    if (confirm("Ce produit ne peut pas être supprimé car il est lié à des commandes existantes. Voulez-vous le désactiver à la place pour le retirer de la vente ?")) {
                        const { error: updateError } = await supabase
                            .from('products')
                            .update({ is_active: false })
                            .eq('id', productId);

                        if (updateError) throw updateError;
                        toast.success("Produit désactivé car il possède un historique de commandes.");
                        fetchProducts();
                        return;
                    } else {
                        return;
                    }
                }
                throw error;
            }

            toast.success("Produit supprimé avec succès");
            fetchProducts();
        } catch (error: any) {
            toast.error("Erreur lors de la suppression: " + (error.message || "Une erreur est survenue"));
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendors?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for the filter
    const categories = ['all', ...new Set(products.map(p => p.category || 'Général'))];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Modération des Produits</h1>
                        <p className="text-slate-500 font-medium text-sm">Surveillez le contenu et gérez la visibilité du catalogue</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => toast.info("Cette fonction sera bientôt disponible")} className="rounded-xl font-bold border-slate-200">Produits Signalés</Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher produit, boutique, catégorie..."
                            className="pl-11 h-12 rounded-xl border-none bg-slate-50 focus:bg-white transition-all outline-none ring-0 focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            className="h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 w-full"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'all' ? 'Toutes les catégories' : cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Produits</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-slate-800">{products.length}</h4>
                            <Package className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Actifs</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-emerald-700">{products.filter(p => p.is_active).length}</h4>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Hors ligne</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-amber-700">{products.filter(p => !p.is_active).length}</h4>
                            <Ban className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Stock Critique</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-blue-700">{products.filter(p => p.stock < 5).length}</h4>
                            <AlertTriangle className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-800">Produit</TableHead>
                                <TableHead className="font-bold text-slate-800">Boutique</TableHead>
                                <TableHead className="font-bold text-slate-800">Prix & Stock</TableHead>
                                <TableHead className="font-bold text-slate-800">Date</TableHead>
                                <TableHead className="font-bold text-slate-800">Statut</TableHead>
                                <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6}><div className="h-16 bg-slate-50/20 m-2 rounded-xl"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>
                                                    )}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{product.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400 py-0 h-4 border-slate-200">
                                                            {product.category || 'Général'}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-400 font-bold">{product.views || 0} vues</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-xs font-bold text-slate-600">{product.vendors?.shop_name || 'Inconnue'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-black text-slate-800 text-sm leading-none mb-1">{formatPrice(product.price)}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-slate-400">{product.stock} en stock</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(product.created_at), 'dd/MM/yy', { locale: fr })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${product.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none font-black text-[9px] px-2`}>
                                                {product.is_active ? 'EN LIGNE' : 'HORS LIGNE'}
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
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <Eye className="w-4 h-4" /> Voir sur le site
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info("L'éditeur de produit sera bientôt disponible dans l'admin")}
                                                        className="rounded-lg gap-2 font-bold text-slate-600"
                                                    >
                                                        <FileEdit className="w-4 h-4" /> Modifier détails
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(product.id, product.is_active)}
                                                        className={`rounded-lg gap-2 font-bold ${product.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
                                                    >
                                                        {product.is_active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                        {product.is_active ? "Désactiver produit" : "Activer produit"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="rounded-lg gap-2 font-bold text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Supprimer définitivement
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center"><SearchX className="w-8 h-8 text-slate-200" /></div>
                                            <p className="text-slate-400 font-bold">Aucun produit trouvé</p>
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

export default AdminProducts;
