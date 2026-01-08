import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Store, Mail, ShieldCheck, Save, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag as ShoppingBagIcon, Package, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfileAndOrders();
    }, []);

    const fetchProfileAndOrders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch Client Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setOrders(ordersData || []);

        } catch (error: any) {
            console.error('Error:', error.message);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_verification':
                return <Badge className="bg-orange-100 text-orange-600 border-0 flex items-center gap-1"><Clock className="w-3 h-3" /> À vérifier</Badge>;
            case 'paid':
                return <Badge className="bg-blue-100 text-blue-600 border-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Payé</Badge>;
            case 'processing':
                return <Badge className="bg-purple-100 text-purple-600 border-0 flex items-center gap-1"><Package className="w-3 h-3" /> En cours</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-600 border-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Livré</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    shop_name: profile.shop_name,
                    shop_description: profile.shop_description
                } as any)
                .eq('id', profile.id);

            if (error) throw error;
            toast.success('Profil mis à jour avec succès');
        } catch (error: any) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">
                            {profile?.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Mon Profil</h1>
                            <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4 text-yarid-green" />
                                Compte {profile?.role === 'vendor' ? 'Vendeur' : 'Client'} vérifié
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Sidebar Stats */}
                        <div className="md:col-span-1 space-y-6">
                            <Card className="border-0 shadow-soft">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="truncate">{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Inscrit le {new Date(profile?.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yarid-green animate-pulse" />
                                            <span className="text-sm font-bold">Connecté</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content with Tabs */}
                        <div className="md:col-span-3">
                            <Tabs defaultValue="info" className="space-y-6">
                                <TabsList className="bg-white/50 border shadow-sm p-1">
                                    <TabsTrigger value="info" className="gap-2 px-6">
                                        <User className="w-4 h-4" />
                                        Profil
                                    </TabsTrigger>
                                    <TabsTrigger value="orders" className="gap-2 px-6">
                                        <ShoppingBagIcon className="w-4 h-4" />
                                        Mes Commandes ({orders.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <Card className="border-0 shadow-soft bg-card overflow-hidden">
                                        <CardHeader className="bg-muted/50 border-b">
                                            <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <form onSubmit={handleUpdate} className="space-y-6">
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom Complet</Label>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                value={profile?.full_name || ''}
                                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                                className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-primary rounded-xl"
                                                                placeholder="Votre nom"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 text-muted-foreground opacity-60">
                                                        <Label className="text-xs font-black uppercase tracking-widest">Email (Non modifiable)</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                                                            <Input value={profile?.email} disabled className="pl-10 h-12 bg-muted/20 border-0 rounded-xl cursor-not-allowed" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {profile?.role === 'vendor' && (
                                                    <div className="pt-6 border-t space-y-6">
                                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                                            <Store className="w-5 h-5 text-yarid-orange" />
                                                            Informations Boutique
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom de la Boutique</Label>
                                                                <Input
                                                                    value={profile?.shop_name || ''}
                                                                    onChange={(e) => setProfile({ ...profile, shop_name: e.target.value })}
                                                                    className="h-12 bg-muted/30 border-0 focus-visible:ring-primary rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                                                                <Textarea
                                                                    value={profile?.shop_description || ''}
                                                                    onChange={(e) => setProfile({ ...profile, shop_description: e.target.value })}
                                                                    className="bg-muted/30 border-0 focus-visible:ring-primary rounded-xl"
                                                                    rows={4}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        Enregistrer les modifications
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="orders">
                                    <Card className="border-0 shadow-soft bg-card">
                                        <CardHeader className="border-b">
                                            <CardTitle className="text-lg">Historique de mes commandes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {orders.length === 0 ? (
                                                <div className="p-12 text-center space-y-4">
                                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                                        <ShoppingBagIcon className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">Vous n'avez pas encore passé de commande.</p>
                                                    <Button asChild variant="outline">
                                                        <Link to="/shop">Commencer mes achats</Link>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/50 border-b">
                                                            <tr>
                                                                <th className="px-6 py-4 text-left font-bold">Commande</th>
                                                                <th className="px-6 py-4 text-left font-bold">Date</th>
                                                                <th className="px-6 py-4 text-left font-bold">Statut</th>
                                                                <th className="px-6 py-4 text-right font-bold">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {orders.map((order) => (
                                                                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <span className="font-mono text-xs font-bold text-primary">
                                                                            {order.order_number || order.id.substring(0, 8)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-muted-foreground">
                                                                        {new Date(order.created_at).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {getStatusBadge(order.payment_status || order.status)}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right font-black">
                                                                        {formatPrice(order.total_amount || order.total)}
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
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
