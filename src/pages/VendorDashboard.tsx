import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Eye, TrendingUp, ShoppingCart, 
  DollarSign, Users, BarChart3, Settings, LogOut, Store,
  CheckCircle, XCircle, Clock
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

// Demo vendor products
const demoVendorProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 850000,
    stock: 5,
    status: 'active',
    views: 234,
    orders: 12,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200',
  },
  {
    id: '2',
    name: 'AirPods Pro 2ème génération',
    price: 165000,
    stock: 15,
    status: 'active',
    views: 156,
    orders: 8,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200',
  },
  {
    id: '3',
    name: 'MacBook Pro M3 14"',
    price: 1450000,
    stock: 0,
    status: 'out_of_stock',
    views: 89,
    orders: 3,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
  },
];

const demoOrders = [
  { id: 'ORD-001', product: 'iPhone 15 Pro Max', customer: 'Jean M.', amount: 850000, status: 'pending', date: '2024-01-05' },
  { id: 'ORD-002', product: 'AirPods Pro', customer: 'Marie K.', amount: 165000, status: 'completed', date: '2024-01-04' },
  { id: 'ORD-003', product: 'iPhone 15 Pro Max', customer: 'Paul N.', amount: 850000, status: 'completed', date: '2024-01-03' },
];

const VendorDashboard = () => {
  const [products, setProducts] = useState(demoVendorProducts);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
  });

  // Demo stats
  const stats = {
    totalRevenue: 2865000,
    totalOrders: 23,
    totalViews: 479,
    conversionRate: 4.8,
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const product = {
      id: String(Date.now()),
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 0,
      status: 'active',
      views: 0,
      orders: 0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    };

    setProducts([product, ...products]);
    setNewProduct({ name: '', price: '', stock: '', category: '', description: '' });
    setIsAddProductOpen(false);
    toast.success('Produit ajouté avec succès !');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Produit supprimé');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-yarid-green/10 text-yarid-green border-0">Actif</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'pending':
        return <Badge className="bg-yarid-yellow/10 text-yarid-yellow border-0">En attente</Badge>;
      case 'completed':
        return <Badge className="bg-yarid-green/10 text-yarid-green border-0">Complété</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
              TechPro Douala
            </h1>
            <p className="text-muted-foreground">Bienvenue sur votre espace vendeur</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-yarid-green/10 text-yarid-green border-0 gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Vendeur vérifié
            </Badge>
            <Badge variant="secondary">Plan Freemium • 3 produits max</Badge>
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
                  <TrendingUp className="w-5 h-5 text-yarid-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                  <p className="font-bold text-lg">{stats.conversionRate}%</p>
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
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mes produits ({products.length}/3)</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" disabled={products.length >= 3}>
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un produit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Décrivez votre produit..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddProduct} className="w-full">
                        Ajouter le produit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun produit pour le moment</p>
                    <Button className="mt-4 gap-2" onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Ajouter votre premier produit
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
                            <span>{product.views} vues</span>
                            <span>•</span>
                            <span>{product.orders} ventes</span>
                          </div>
                        </div>
                        {getStatusBadge(product.status)}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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

                {products.length >= 3 && (
                  <div className="mt-4 p-4 bg-yarid-orange/10 rounded-xl text-center">
                    <p className="text-sm text-yarid-orange font-medium">
                      Limite atteinte ! Passez au plan Premium pour ajouter plus de produits.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 border-yarid-orange text-yarid-orange hover:bg-yarid-orange hover:text-white">
                      Passer à Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.product}</p>
                        <p className="text-xs text-muted-foreground">Client: {order.customer} • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatPrice(order.amount)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques de performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Les statistiques détaillées seront disponibles prochainement
                  </p>
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
