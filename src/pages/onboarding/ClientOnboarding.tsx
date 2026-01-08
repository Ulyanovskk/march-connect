import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { demoCategories } from '@/lib/demo-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

const ClientOnboarding = () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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
                navigate('/shop');
            }
            setIsLoading(false);
        };

        checkStatus();
    }, [navigate]);

    const toggleCategory = (id: string) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleSubmit = async () => {
        if (selectedCategories.length < 3) {
            toast.error('Veuillez choisir au moins 3 catégories');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session?.user.id,
                    email: session?.user.email,
                    favorite_categories: selectedCategories,
                    onboarding_completed: true
                } as any);

            if (error) throw error;

            toast.success('Préférences enregistrées ! Bienvenue chez March Connect.');
            navigate('/shop');
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
        <div className="min-h-screen bg-muted/30 py-12 px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                    <PartyPopper className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black tracking-tight">Personnalisez votre expérience</h1>
                    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Dites-nous ce qui vous intéresse le plus. Nous mettrons ces catégories en avant pour vous.
                    </p>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl inline-block">
                    <p className="text-primary text-sm font-bold">
                        Choisissez au moins 3 catégories ({selectedCategories.length}/3)
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {demoCategories.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                            <Card
                                key={category.id}
                                className={`cursor-pointer transition-all border-2 rounded-2xl relative overflow-hidden group
                  ${isSelected ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'hover:border-primary/30'}`}
                                onClick={() => toggleCategory(category.id)}
                            >
                                <CardContent className="p-6 flex flex-col items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        <CheckCircle2 className={`w-6 h-6 ${isSelected ? 'opacity-100' : 'opacity-20'}`} />
                                    </div>
                                    <span className={`font-bold text-sm ${isSelected ? 'text-primary' : ''}`}>
                                        {category.name}
                                    </span>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="pt-8">
                    <Button
                        size="lg"
                        className="h-14 px-12 rounded-2xl font-bold text-base gap-2 shadow-xl"
                        disabled={selectedCategories.length < 3 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commencer mon shopping"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClientOnboarding;
