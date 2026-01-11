import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Plus, Edit, Trash2, Eye, TrendingUp, ShoppingCart,
  DollarSign, Users, BarChart3, Settings, LogOut, Store,
  CheckCircle, XCircle, Clock, Image as ImageIcon, Upload, Loader2,
  PieChart as PieChartIcon, TrendingDown, Calendar, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice, demoCategories } from '@/lib/demo-data';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchVendorViewStats } from '@/hooks/useProductViewTracking';
// Simplified type definitions to avoid deep type instantiation issues
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
  images: string[] | null;
  vendor_id: string;
  is_active: boolean | null;
  views: number | null;
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  payment_status: string;
  status: string;
  payment_method: string;
  payment_reference: string | null;
  items: any;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  vendor_id: string | null;
  currency: string;
  customer_whatsapp: string | null;
  delivery_notes: string | null;
};

// Custom Image Upload Component
const ImageUpload = ({ value, onChange, id }: { value: string[], onChange: (val: string[]) => void, id: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (value.length + newFiles.length > 10) {
      toast.error('Maximum 10 photos autorisées');
      return;
    }

    const promises = newFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      onChange([...value, ...results]);
    });
  };

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="flex justify-between items-center text-sm font-semibold">
        <span>Photos du produit</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${value.length === 0 ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
          {value.length}/10 photos
        </span>
      </Label>

      {/* Gallery Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {value.map((src, index) => (
          <div key={index} className="relative aspect-square group rounded-lg overflow-hidden border bg-muted shadow-sm">
            <img src={src} alt={`Product ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-destructive/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[8px] py-0.5 text-center font-bold tracking-wider uppercase leading-none">
                Couverture
              </div>
            )}
          </div>
        ))}

        {value.length < 10 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all bg-muted/30 hover:bg-muted/50
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/40'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <Plus className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-[9px] font-medium text-muted-foreground">Ajouter</span>
          </button>
        )}
      </div>

      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <p className="text-[10px] text-muted-foreground italic leading-tight">
          * Glissez-déposez pour ajouter d'autres photos. La 1ère est l'image principale.
        </p>
      )}
    </div>
  );
};

// Utility to generate a safe URL slug from a string
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .trim()
    .replace(/\s+/g, '-')              // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '')        // Remove all non-alphanumeric chars except -
    .replace(/--+/g, '-')              // Replace multiple - with single -
    .replace(/^-|-$/g, '');            // Remove leading/trailing -
};


const VendorDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // Static categories matching those used in Catalogue filters
  const staticCategories = [
    { id: '1', name: 'Téléphones & accessoires', slug: 'telephones-accessoires' },
    { id: '2', name: 'Électroménagers', slug: 'electromenagers' },
    { id: '3', name: 'Informatique', slug: 'informatique' },
    { id: '4', name: 'Gaming', slug: 'gaming' },
    { id: '5', name: 'Industriel & BTP', slug: 'industriel-btp' },
    { id: '6', name: '100% Cameroun', slug: '100-cameroun' },
    { id: '7', name: 'Santé & bien-être', slug: 'sante-bien-etre' },
    { id: '8', name: 'Mode', slug: 'mode' },
    { id: '9', name: 'Sport', slug: 'sport' }
  ];
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: [] as string[],
  });

  const [editProduct, setEditProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: [] as string[],
  });

  // Check auth and fetch data
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Veuillez vous connecter pour accéder au dashboard');
        navigate('/login');
        return;
      }

      setUserId(session.user.id);

      // Récupérer le vendor_id réel
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (vendorData) {
        setVendorId(vendorData.id);
        fetchCategories();
        fetchProducts(vendorData.id);
        fetchOrders(vendorData.id);
      } else {
        toast.error('Profil vendeur introuvable');
        setIsLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [navigate]);

  // No need to fetch categories from database - using static categories
  const fetchCategories = async () => {
    console.log('📋 Using static categories for product creation');
  };

  const fetchProducts = async (vendorId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (vendorId: string) => {
    try {
      // Fetch order_items for this vendor first
      const { data: items, error: itemsErr } = await (supabase as any)
        .from('order_items')
        .select(
          `order_id,
           quantity,
           unit_price,
           total_price,
           product:products (
             name,
             images
           ),
           order:orders (
             id,
             order_number,
             user_id,
             status,
             subtotal,
             total_amount,
             created_at,
             shipping_address_id,
             address:addresses (
               full_name,
               phone,
               address_line1,
               city
             )
           )`
        )
        .eq('vendor_id', vendorId)
        .order('created_at', { foreignTable: 'orders', ascending: false });

      if (itemsErr) throw itemsErr;
      if (!items || items.length === 0) {
        setOrders([]);
        return;
      }

      // Transform data to match Order type
      const transformedOrders = items.map((item: any) => ({
        id: item.order.id,
        order_number: item.order.order_number,
        customer_name: item.order.address?.full_name || 'Client anonyme',
        customer_phone: item.order.address?.phone || 'Non spécifié',
        customer_email: null, // Pas disponible dans le schéma
        delivery_address: item.order.address?.address_line1 || 'Adresse non spécifiée',
        delivery_city: item.order.address?.city || 'Ville non spécifiée',
        delivery_fee: 0, // À calculer si nécessaire
        subtotal: item.order.subtotal,
        total: item.order.total_amount,
        payment_status: item.order.status,
        status: item.order.status,
        payment_method: 'manual', // À déterminer
        payment_reference: null, // À récupérer de la table payments
        items: [item], // Les détails des produits
        created_at: item.order.created_at,
        updated_at: item.order.created_at,
        user_id: item.order.user_id,
        vendor_id: vendorId,
        currency: 'XAF',
        customer_whatsapp: null,
        delivery_notes: null
      }));

      // Remove duplicates (same order with multiple items)
      const uniqueOrders = Array.from(
        new Map(transformedOrders.map((order: any) => [order.id, order])).values()
      );

      setOrders(uniqueOrders as Order[]);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
      // Don't show error toast, just log it
    }
  };

  const handleConfirmAvailability = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'processing'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Disponibilité confirmée ! YARID a été notifié pour le ramassage.');
      if (vendorId) fetchOrders(vendorId);
    } catch (error: any) {
      toast.error('Erreur lors de la confirmation: ' + error.message);
    }
  };

  const handleMarkUnavailable = async (orderId: string) => {
    if (!confirm('Voulez-vous vraiment marquer cet article comme indisponible ? La commande sera annulée.')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          vendor_notes: 'Article marqué comme indisponible par le vendeur.'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.info('Commande annulée. Le client et YARID ont été informés.');
      if (vendorId) fetchOrders(vendorId);
    } catch (error: any) {
      toast.error('Erreur lors de l\'annulation: ' + error.message);
    }
  };

  const handleAddProduct = async () => {
    // Nettoyage des entrées pour éviter XSS et données malveillantes
    const sanitize = (text: string) => text.trim().replace(/[<>]/g, "");

    const cleanName = sanitize(newProduct.name);
    const cleanDescription = sanitize(newProduct.description);

    if (!cleanName || !newProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (newProduct.images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get category name from static categories
      const categoryName = staticCategories.find(c => c.slug === newProduct.category)?.name || null;

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: cleanName,
          slug: generateSlug(cleanName),
          price: Number(newProduct.price),
          stock: Number(newProduct.stock) || 0,
          category_name: categoryName,
          description: cleanDescription,
          images: newProduct.images,
          vendor_id: vendorId,
          is_active: Number(newProduct.stock) > 0
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts([data[0], ...products]);
      } else {
        await fetchProducts(vendorId!);
      }
      setNewProduct({ name: '', price: '', stock: '', category: '', description: '', images: [] });
      setIsAddProductOpen(false);
      toast.success('Produit ajouté avec succès !');
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category || '',
      description: product.description || '',
      images: product.images || [],
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.name || !editProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editProduct.images.length === 0) {
      toast.error('Veuillez garder au moins une photo');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get category name from static categories
      const categoryName = staticCategories.find(c => c.slug === editProduct.category)?.name || null;

      const { error } = await supabase
        .from('products')
        .update({
          name: editProduct.name,
          slug: generateSlug(editProduct.name),
          price: Number(editProduct.price),
          stock: Number(editProduct.stock) || 0,
          category_name: categoryName,
          description: editProduct.description,
          images: editProduct.images,
          is_active: Number(editProduct.stock) > 0
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      await fetchProducts(vendorId!);
      setIsEditProductOpen(false);
      setEditingProduct(null);
      toast.success('Produit modifié avec succès !');
    } catch (error: any) {
      toast.error('Erreur lors de la modification: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      toast.success('Produit supprimé');
    } catch (error: any) {
      toast.error('Erreur lors de la suppression: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-yarid-green/10 text-yarid-green border-0">Actif</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'pending':
        return <Badge className="bg-yarid-yellow/10 text-yarid-yellow border-0">En attente</Badge>;
      case 'pending_verification':
        return <Badge className="bg-orange-100 text-orange-600 border-0 text-[10px]">Paiement à vérifier</Badge>;
      case 'completed':
        return <Badge className="bg-yarid-green/10 text-yarid-green border-0 text-[10px]">Livré</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-600 border-0 text-[10px]">Payé</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  // Real stats calculation with actual view tracking
  const [realViews, setRealViews] = useState<number>(0);

  const stats = {
    totalRevenue: orders.reduce((acc, order) => acc + (Number(order.total || 0)), 0),
    totalOrders: orders.length,
    totalViews: realViews, // Real view count from database
    activeProducts: products.filter(p => p.is_active).length,
  };

  // Fetch real view statistics
  useEffect(() => {
    const loadViewStats = async () => {
      if (vendorId) {
        try {
          console.log('🔍 Loading view stats for vendor:', vendorId);
          const viewStats = await fetchVendorViewStats(vendorId);
          console.log('📊 View stats loaded:', viewStats);
          setRealViews(viewStats.totalViews);
        } catch (error) {
          console.error('❌ Could not load view stats:', error);
          // Keep 0 as fallback
          setRealViews(0);
        }
      }
    };

    loadViewStats();
  }, [vendorId, products]);

  // Simulated data for charts
  const salesHistory = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayName = format(date, 'EEE', { locale: fr });

    const daySales = orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      })
      .reduce((sum, order) => sum + (Number(order.total || 0)), 0);

    return { name: dayName, sales: daySales };
  });

  const categoryData = products.reduce((acc: { name: string; value: number }[], product) => {
    const cat = product.category_name || 'Standard';
    const existing = acc.find(item => item.name === cat);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: cat, value: 1 });
    }
    return acc;
  }, []);

  const productPerformance = products
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 10) + '...' : p.name,
      views: p.views || 0,
      orders: 0 // This would need to be calculated from order_items if needed
    }));

  const COLORS = ['#D97706', '#2563EB', '#10B981', '#7C3AED', '#F43F5E'];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-7 h-7 text-primary" />
              Espace Vendeur
            </h1>
            <p className="text-muted-foreground">Gérez vos produits et vos ventes en temps réel</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-yarid-green/10 text-yarid-green border-0 gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Boutique Active
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
              Vendeur Vérifié
            </Badge>
          </div>
        </div>

        {/* Escrow Information Banner */}
        <Card className="mb-8 border-none bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-32 bg-primary/5 -skew-x-12 translate-x-12" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Logistique & Paiements centralisés</h2>
                <div className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                  <p>La logistique et la livraison de vos commandes sont <span className="font-bold text-primary">entièrement prises en charge par YARID</span>.
                    Les paiements sont sécurisés et vous sont transférés automatiquement après :</p>
                  <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mt-2 font-medium text-foreground/80">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      La livraison effectuée par nos services
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      La validation de conformité par le client
                    </li>
                  </ul>
                  <p className="mt-2 text-xs italic opacity-80">Ce service complet vous permet de vous concentrer uniquement sur vos produits pendant que nous gérons le reste.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenus total</p>
                  <p className="font-bold text-lg">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yarid-orange/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-yarid-orange" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commandes</p>
                  <p className="font-bold text-lg">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yarid-blue/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-yarid-blue" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vues</p>
                  <p className="font-bold text-lg">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yarid-green/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-yarid-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Produits actifs</p>
                  <p className="font-bold text-lg">{stats.activeProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card shadow-soft">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytique
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mes produits ({products.length})</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <ImageUpload
                        id="image"
                        value={newProduct.images}
                        onChange={(val) => setNewProduct({ ...newProduct, images: val })}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du produit *</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Ex: iPhone 15 Pro Max"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Prix (FCFA) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="850000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {staticCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optionnel)</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Décrivez votre produit..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddProduct} className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                        ) : 'Ajouter le produit'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Product Dialog */}
                <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Modifier le produit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <ImageUpload
                        id="edit-image"
                        value={editProduct.images}
                        onChange={(val) => setEditProduct({ ...editProduct, images: val })}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nom du produit *</Label>
                        <Input
                          id="edit-name"
                          value={editProduct.name}
                          onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-price">Prix (FCFA) *</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            value={editProduct.price}
                            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-stock">Stock</Label>
                          <Input
                            id="edit-stock"
                            type="number"
                            value={editProduct.stock}
                            onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Catégorie</Label>
                        <Select
                          value={editProduct.category}
                          onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {staticCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editProduct.description}
                          onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditProductOpen(false)}
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          Annuler
                        </Button>
                        <Button onClick={handleUpdateProduct} className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                          ) : 'Enregistrer'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground">Chargement de vos produits...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun produit dans votre boutique Supabase</p>
                    <Button className="mt-4 gap-2" onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Créer votre premier article
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                        <img
                          src={product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-sm text-primary font-semibold">{formatPrice(product.price)}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Stock: {product.stock}</span>
                            <span>•</span>
                            <span>{new Date(product.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {getStatusBadge(product.is_active ? 'active' : 'out_of_stock')}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {/* Existing Orders Table Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commandes de ma boutique ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground">Chargement des commandes...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Pas encore de commandes pour vos produits.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 rounded-lg">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Commande</th>
                          <th className="px-4 py-3 text-left font-semibold">Client</th>
                          <th className="px-4 py-3 text-left font-semibold">Montant</th>
                          <th className="px-4 py-3 text-left font-semibold">Statut</th>
                          <th className="px-4 py-3 text-center font-semibold">Actions</th>
                          <th className="px-4 py-3 text-right font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4">
                              <span className="font-mono font-medium text-xs text-primary">
                                {order.id.substring(0, 8)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{order.customer_name}</span>
                                <span className="text-[10px] text-muted-foreground">{order.customer_phone}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-semibold">
                              {formatPrice(order.total)}
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(order.payment_status || order.status)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {order.status === 'pending' && (
                                <div className="flex flex-col gap-1 items-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-full text-[10px] bg-yarid-green/10 text-yarid-green border-yarid-green/20 hover:bg-yarid-green hover:text-white"
                                    onClick={() => handleConfirmAvailability(order.id)}
                                  >
                                    Confirmer disponibilité
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-full text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleMarkUnavailable(order.id)}
                                  >
                                    Indisponible
                                  </Button>
                                </div>
                              )}
                              {order.status === 'processing' && (
                                <span className="text-[10px] text-blue-600 font-medium flex items-center justify-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> En préparation
                                </span>
                              )}
                              {order.status === 'completed' && (
                                <span className="text-[10px] text-yarid-green font-medium flex items-center justify-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Terminé
                                </span>
                              )}
                              {order.status === 'paid' && (
                                <span className="text-[10px] text-yarid-green font-medium flex items-center justify-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Payé
                                </span>
                              )}
                              {order.status === 'pending_verification' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white"
                                  onClick={() => handleConfirmAvailability(order.id)}
                                >
                                  Prêt pour ramassage
                                </Button>
                              )}
                              {order.status === 'cancelled' && (
                                <span className="text-[10px] text-red-500 font-medium flex items-center justify-center gap-1">
                                  <XCircle className="w-3 h-3" /> Annulée
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right text-muted-foreground text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-black">Chiffre d'Affaires</CardTitle>
                      <p className="text-xs text-muted-foreground">Ventes des 7 derniers jours</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <div className="h-[250px] w-full pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesHistory}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#D97706"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorSales)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-black">Répartition Stock</CardTitle>
                      <p className="text-xs text-muted-foreground">Proportion par catégorie</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <PieChartIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            cornerRadius={10}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground italic text-sm">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        Aucune donnée disponible
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Bar Chart */}
            <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-black">Performance Produits</CardTitle>
                    <p className="text-xs text-muted-foreground">Vues vs Commandes (Simulé)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                      <Tooltip
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="views" name="Vues" fill="#D97706" radius={[6, 6, 0, 0]} barSize={30} />
                      <Bar dataKey="orders" name="Ventes" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
