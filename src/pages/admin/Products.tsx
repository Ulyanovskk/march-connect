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
    Trash2,
    FileText,
    User,
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

import { useNavigate, useLocation } from 'react-router-dom';

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize search term from URL parameter if present
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // 1. Fetch all products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;

            // 2. Extract unique vendor IDs
            const vendorIds = Array.from(new Set((productsData || []).map(p => p.vendor_id)));

            if (vendorIds.length === 0) {
                setProducts([]);
                return;
            }

            // 3. Fetch unique vendors
            const { data: vendorsData } = await supabase
                .from('vendors')
                .select('id, shop_name, description, user_id')
                .in('id', vendorIds);

            // 4. Extract unique owner (user) IDs from vendors
            const ownerIds = Array.from(new Set((vendorsData || []).map(v => v.user_id)));

            // 5. Fetch profiles for owners
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', ownerIds);

            // 6. Merge everything
            const mergedProducts = (productsData || []).map(product => {
                const vendor = vendorsData?.find(v => v.id === product.vendor_id);
                const profile = profilesData?.find(p => p.id === vendor?.user_id);

                return {
                    ...product,
                    vendors: {
                        shop_name: vendor?.shop_name || 'Boutique Inconnue',
                        shop_description: vendor?.description || 'Aucune description',
                        owner_name: profile?.full_name || vendor?.shop_name || 'Gérant Inconnu'
                    }
                };
            });

            setProducts(mergedProducts);
        } catch (error: any) {
            toast.error("Erreur chargement produits: " + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (product: any) => {
        setSelectedProduct(product);
        setIsDetailsOpen(true);
    };

    const handleToggleActive = async (productId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', productId);

            if (error) throw error;
            toast.success(currentStatus ? "Produit désactivé" : "Produit activé");

            // Update local state if selected
            if (selectedProduct?.id === productId) {
                setSelectedProduct({ ...selectedProduct, is_active: !currentStatus });
            }

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

                        // Update local
                        if (selectedProduct?.id === productId) {
                            setSelectedProduct({ ...selectedProduct, is_active: false });
                        }

                        fetchProducts();
                        return;
                    } else {
                        return;
                    }
                }
                throw error;
            }

            toast.success("Produit supprimé avec succès");
            setIsDetailsOpen(false); // Close modal if open
            fetchProducts();
        } catch (error: any) {
            toast.error("Erreur lors de la suppression: " + (error.message || "Une erreur est survenue"));
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendors?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendors?.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
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

                {/* Products Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-800">Produit</TableHead>
                                <TableHead className="font-bold text-slate-800">Boutique</TableHead>
                                <TableHead className="font-bold text-slate-800">Vendeur</TableHead>
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
                                        <TableCell colSpan={7}><div className="h-16 bg-slate-50/20 m-2 rounded-xl"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className="hover:bg-slate-50/50 transition-colors border-slate-50 group cursor-pointer"
                                        onClick={() => handleViewProduct(product)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
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
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">{product.vendors?.owner_name || 'Inconnu'}</span>
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
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

                {/* Products List (Mobile) */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-50 rounded" />
                                        <div className="h-3 w-20 bg-slate-50 rounded" />
                                    </div>
                                </div>
                                <div className="h-10 bg-slate-50 rounded-xl" />
                            </div>
                        ))
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft transition-all duration-300">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setMobileExpandedId(mobileExpandedId === product.id ? null : product.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{product.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400 py-0 h-4 border-slate-200 shrink-0">
                                                    {product.category || 'Général'}
                                                </Badge>
                                                <span className="font-black text-slate-800 text-xs">{formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 transition-transform duration-300 ${mobileExpandedId === product.id ? 'rotate-180 bg-slate-100' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {mobileExpandedId === product.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Boutique</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Store className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-xs font-bold text-slate-600 truncate">{product.vendors?.shop_name || 'Inconnue'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stock</p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs font-medium text-slate-600">{product.stock} unités</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Badge className={`${product.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none font-black text-[9px] px-2`}>
                                                {product.is_active ? 'EN LIGNE' : 'HORS LIGNE'}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(product.created_at), 'dd/MM/yy', { locale: fr })}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Button
                                                variant="outline"
                                                className="h-9 border-slate-200 hover:bg-slate-50 hover:text-primary text-[10px] font-bold"
                                                onClick={() => handleViewProduct(product)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                Détails
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className={`h-9 border-slate-200 hover:bg-slate-50 text-[10px] font-bold ${product.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleActive(product.id, product.is_active);
                                                }}
                                            >
                                                {product.is_active ? <Ban className="w-3.5 h-3.5 mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                                {product.is_active ? 'Désactiver' : 'Activer'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <SearchX className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucun produit trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Dialog */}
            {selectedProduct && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                    {selectedProduct.images?.[0] ? (
                                        <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-6 h-6" /></div>
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-800">{selectedProduct.name}</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Vendu par <span className="text-primary font-bold">{selectedProduct.vendors?.shop_name || 'Inconnue'}</span> • {selectedProduct.category}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Actions Rapides */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-xs font-bold"
                                    onClick={() => navigate(`/product/${selectedProduct.id}`)}
                                >
                                    <Eye className="w-3.5 h-3.5 mr-2" /> Voir sur le site
                                </Button>
                                <Button
                                    className={`${selectedProduct.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} h-12 rounded-xl text-xs font-bold`}
                                    onClick={() => handleToggleActive(selectedProduct.id, selectedProduct.is_active)}
                                >
                                    {selectedProduct.is_active ? <Ban className="w-3.5 h-3.5 mr-2" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />}
                                    {selectedProduct.is_active ? 'Désactiver' : 'Activer'}
                                </Button>
                                <Button
                                    className="bg-slate-800 hover:bg-slate-900 h-12 rounded-xl text-xs font-bold"
                                    onClick={() => toast.info("L'édition sera bientôt disponible")}
                                >
                                    <FileEdit className="w-3.5 h-3.5 mr-2" /> Modifier
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 h-12 rounded-xl text-xs font-bold"
                                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Supprimer
                                </Button>
                            </div>

                            <Separator />

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prix</p>
                                    <p className="text-xl font-black text-slate-800">{formatPrice(selectedProduct.price)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock</p>
                                    <p className={`text-xl font-black ${selectedProduct.stock < 5 ? 'text-red-500' : 'text-slate-800'}`}>{selectedProduct.stock}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vues</p>
                                    <p className="text-xl font-black text-slate-800">{selectedProduct.views || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                                    <p className={`text-xl font-black ${selectedProduct.is_active ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedProduct.is_active ? 'Actif' : 'Inactif'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> Description
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                                    {selectedProduct.description || "Aucune description fournie par le vendeur."}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {/* Additional Info */}
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Store className="w-4 h-4 text-primary" /> Informations Complémentaires
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden text-sm">
                                    <div className="flex border-b border-slate-50 last:border-0">
                                        <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Boutique</div>
                                        <div className="w-2/3 p-3 font-bold text-slate-800">{selectedProduct.vendors?.shop_name || 'Non spécifié'}</div>
                                    </div>
                                    <div className="flex border-b border-slate-50 last:border-0">
                                        <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Vendeur (Desc.)</div>
                                        <div className="w-2/3 p-3 text-slate-600 italic line-clamp-2">{selectedProduct.vendors?.shop_description || 'Aucune description'}</div>
                                    </div>
                                    <div className="flex border-b border-slate-50 last:border-0">
                                        <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Ajouté le</div>
                                        <div className="w-2/3 p-3 text-slate-700">{format(new Date(selectedProduct.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</div>
                                    </div>
                                    <div className="flex border-b border-slate-50 last:border-0">
                                        <div className="w-1/3 bg-slate-50 p-3 font-medium text-slate-500">Référence (ID)</div>
                                        <div className="w-2/3 p-3 font-mono text-[10px] text-slate-400">{selectedProduct.id}</div>
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

export default AdminProducts;
