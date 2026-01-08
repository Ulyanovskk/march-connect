import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Plus, Edit, Trash2, Eye, TrendingUp, ShoppingCart,
  DollarSign, Users, BarChart3, Settings, LogOut, Store,
  CheckCircle, XCircle, Clock, Image as ImageIcon, Upload, Loader2
} from 'lucide-react';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};


const VendorDashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
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
      fetchProducts(session.user.id);
      fetchOrders(session.user.id);
    };

    checkAuthAndFetch();
  }, [navigate]);

  const fetchProducts = async (vendorId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (newProduct.images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          slug: generateSlug(newProduct.name),
          price: Number(newProduct.price),
          stock: Number(newProduct.stock) || 0,
          category: newProduct.category,
          description: newProduct.description,
          image: newProduct.images[0],
          images: newProduct.images,
          vendor_id: userId, // Re-ajouté car TS le demande comme obligatoire
          status: Number(newProduct.stock) > 0 ? 'active' : 'out_of_stock'
        } as any)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts([data[0], ...products]);
      } else {
        await fetchProducts(userId!);
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
      const { error } = await supabase
        .from('products')
        .update({
          name: editProduct.name,
          slug: generateSlug(editProduct.name),
          price: Number(editProduct.price),
          stock: Number(editProduct.stock) || 0,
          category: editProduct.category,
          description: editProduct.description,
          image: editProduct.images[0],
          images: editProduct.images,
          status: Number(editProduct.stock) > 0 ? 'active' : 'out_of_stock'
        } as any)
        .eq('id', editingProduct.id);

      if (error) throw error;

      await fetchProducts(userId!);
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

  // Real stats calculation
  const stats = {
    totalRevenue: orders.reduce((acc, order) => acc + (order.total || 0), 0),
    totalOrders: orders.length,
    totalViews: products.reduce((acc, product) => acc + (product.views_count || 0), 0),
    activeProducts: products.filter(p => p.status === 'active').length,
  };

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
            <Badge variant="secondary">Liaison Supabase Connectée</Badge>
          </div>
        </div>

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
                            {demoCategories.map(cat => (
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
                            {demoCategories.map(cat => (
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
                          src={product.image}
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
                        {getStatusBadge(product.status)}
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
                          <th className="px-4 py-3 text-right font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4">
                              <span className="font-mono font-medium text-xs text-primary">
                                {order.order_number || order.id.substring(0, 8)}
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
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
