import { useState, useEffect } from 'react';
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

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error: any) {
            toast.error('Erreur lors du chargement du profil');
        } finally {
            setIsLoading(false);
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

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-soft">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="truncate">{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span>Inscrit le {new Date(profile?.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yarid-green animate-pulse" />
                                            <span className="text-sm font-bold">En ligne</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Form */}
                        <div className="md:col-span-2">
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
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
