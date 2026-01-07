import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Loader2, Sparkles, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const VendorOnboarding = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        shop_name: '',
        shop_description: '',
        has_physical_store: 'no',
        shop_category: '',
    });

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .single();

            if ((profile as any)?.onboarding_completed) {
                navigate('/vendor/dashboard');
            }
            setIsLoading(false);
        };

        checkStatus();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shop_name || !formData.shop_category) {
            toast.error('Veuillez remplir les champs obligatoires');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error } = await supabase
                .from('profiles')
                .update({
                    shop_name: formData.shop_name,
                    shop_description: formData.shop_description,
                    has_physical_store: formData.has_physical_store === 'yes',
                    shop_category: formData.shop_category,
                    onboarding_completed: true
                } as any)
                .eq('id', session?.user.id);

            if (error) throw error;

            toast.success('Votre boutique est prête ! Bienvenue cher partenaire.');
            navigate('/vendor/dashboard');
        } catch (error: any) {
            toast.error('Erreur: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 flex items-center justify-center">
            <Card className="max-w-xl w-full border-0 shadow-2xl rounded-3xl overflow-hidden bg-card">
                <div className="bg-primary p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                    <Sparkles className="w-10 h-10 mx-auto mb-4 text-yarid-yellow" />
                    <CardTitle className="text-3xl font-black mb-2">Créez votre identité</CardTitle>
                    <p className="text-primary-foreground/80 font-medium">Configurez les détails essentiels de votre future boutique</p>
                </div>

                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="shop_name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Comment souhaitez-vous appeler votre boutique ? *
                            </Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="shop_name"
                                    placeholder="Ex: Electra Tech Douala"
                                    className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-primary rounded-xl"
                                    value={formData.shop_name}
                                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Disposez-vous d’une boutique physique ?
                            </Label>
                            <RadioGroup
                                value={formData.has_physical_store}
                                onValueChange={(v) => setFormData({ ...formData, has_physical_store: v })}
                                className="grid grid-cols-2 gap-4 pt-2"
                            >
                                <div>
                                    <RadioGroupItem value="yes" id="yes" className="peek-hidden peer" />
                                    <Label
                                        htmlFor="yes"
                                        className="flex items-center justify-center h-12 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all gap-2 font-bold"
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Oui, j'ai un local
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="no" id="no" className="peek-hidden peer" />
                                    <Label
                                        htmlFor="no"
                                        className="flex items-center justify-center h-12 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all gap-2 font-bold"
                                    >
                                        Non, 100% en ligne
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shop_category" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Quel type de produits vendez-vous ? *
                            </Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, shop_category: v })}>
                                <SelectTrigger className="h-12 bg-muted/50 border-0 focus-visible:ring-primary rounded-xl">
                                    <SelectValue placeholder="Sélectionnez un secteur" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">Électronique & High-Tech</SelectItem>
                                    <SelectItem value="fashion">Mode & Vêtements</SelectItem>
                                    <SelectItem value="beauty">Beauté & Santé</SelectItem>
                                    <SelectItem value="home">Maison & Décoration</SelectItem>
                                    <SelectItem value="food">Alimentation & Boissons</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shop_description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Description de votre activité (Optionnel)
                            </Label>
                            <Textarea
                                id="shop_description"
                                placeholder="Décrivez ce qui rend votre boutique unique..."
                                className="bg-muted/50 border-0 focus-visible:ring-primary rounded-xl min-h-[100px]"
                                value={formData.shop_description}
                                onChange={(e) => setFormData({ ...formData, shop_description: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Finaliser ma boutique"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorOnboarding;
