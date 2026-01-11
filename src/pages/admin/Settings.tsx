import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Settings,
    Save,
    Percent,
    Truck,
    ShieldCheck,
    Globe,
    Lock,
    Bell,
    CreditCard,
    Target,
    FileText,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    Clock,
    Plus,
    Trash2,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminSettings = () => {
    const [commissions, setCommissions] = useState({
        defaultRate: '10',
        vendorPremium: '7',
        escrowDelay: '3'
    });

    const [toggles, setToggles] = useState({
        maintenace: false,
        publicSignup: true,
        autoVerify: false,
        newOrdersEmail: true
    });

    // Zone Management State
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [zones, setZones] = useState([
        { id: 1, name: 'Douala', active: true, price: 1500 },
        { id: 2, name: 'Yaoundé', active: true, price: 2000 },
        { id: 3, name: 'Bafoussam', active: true, price: 3000 },
        { id: 4, name: 'Kribi', active: true, price: 3500 },
    ]);
    const [newZone, setNewZone] = useState({ name: '', price: '' });

    const handleSave = () => {
        console.log("Saving settings:", { commissions, toggles, zones });
        toast.success("Paramètres enregistrés avec succès !");
    };

    const handleClearCache = () => {
        if (confirm("Êtes-vous sûr de vouloir vider les caches système ? Cette action peut ralentir le site temporairement.")) {
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1500)),
                {
                    loading: 'Nettoyage des caches...',
                    success: 'Caches vidés avec succès',
                    error: 'Erreur lors du nettoyage',
                }
            );
        }
    };

    const handleManageZones = () => {
        setShowZoneModal(true);
    };

    const handleAddZone = () => {
        if (!newZone.name || !newZone.price) {
            toast.error("Veuillez remplir le nom et le prix");
            return;
        }
        const zone = {
            id: Date.now(),
            name: newZone.name,
            active: true,
            price: Number(newZone.price)
        };
        setZones([...zones, zone]);
        setNewZone({ name: '', price: '' });
        toast.success("Zone ajoutée");
    };

    const handleDeleteZone = (id: number) => {
        setZones(zones.filter(z => z.id !== id));
        toast.success("Zone supprimée");
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Settings className="w-8 h-8 text-primary" />
                            Paramètres Plateforme
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Configurez les règles métier, les frais et les fonctionnalités globales</p>
                    </div>
                    <Button onClick={handleSave} className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 h-11 px-6">
                        <Save className="w-4 h-4" /> Enregistrer les modifications
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Business Rules */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Financial Section */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1">Configuration Financière</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Frais & Escrow</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-slate-700">Taux de commission standard (%)</Label>
                                        <div className="relative group">
                                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                type="number"
                                                value={commissions.defaultRate}
                                                onChange={(e) => setCommissions({ ...commissions, defaultRate: e.target.value })}
                                                className="pl-11 h-12 rounded-xl bg-slate-50 border-none ring-0 focus:ring-2 focus:ring-primary/20 font-bold"
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">Appliqué par défaut à tous les produits vendus.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-slate-700">Délai déblocage Escrow (jours)</Label>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                type="number"
                                                value={commissions.escrowDelay}
                                                onChange={(e) => setCommissions({ ...commissions, escrowDelay: e.target.value })}
                                                className="pl-11 h-12 rounded-xl bg-slate-50 border-none ring-0 focus:ring-2 focus:ring-primary/20 font-bold"
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">Temps d'attente après livraison avant déblocage automatique.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Section */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1">Logistique & Territoires</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Livraison Standard</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-none mb-1">Zones de livraison actives</p>
                                                <p className="text-xs text-slate-400 font-medium">Douala, Yaoundé, Bafoussam, Kribi</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={handleManageZones}
                                            className="text-primary font-bold text-xs underline"
                                        >
                                            Gérer les zones
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feature Toggles */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-slate-800 tracking-tight leading-none">États & Sécurité</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-black text-slate-700">Mode Maintenance</Label>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Rendre le site inaccessible</p>
                                    </div>
                                    <Switch
                                        checked={toggles.maintenace}
                                        onCheckedChange={(checked) => setToggles({ ...toggles, maintenace: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-black text-slate-700">Inscriptions Publiques</Label>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Autoriser nouveaux clients</p>
                                    </div>
                                    <Switch
                                        checked={toggles.publicSignup}
                                        onCheckedChange={(checked) => setToggles({ ...toggles, publicSignup: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-black text-slate-700">Auto-Vérification Vendeurs</Label>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Bypass validation admin</p>
                                    </div>
                                    <Switch
                                        checked={toggles.autoVerify}
                                        onCheckedChange={(checked) => setToggles({ ...toggles, autoVerify: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                                <h4 className="font-black text-sm uppercase tracking-widest">Zone de Danger</h4>
                            </div>
                            <p className="text-xs font-bold text-red-400">Ces actions sont irréversibles et impactent l'ensemble de la base de données.</p>
                            <Button
                                variant="outline"
                                onClick={handleClearCache}
                                className="w-full bg-white border-red-100 text-red-600 font-bold h-11 rounded-xl shadow-sm hover:bg-red-50"
                            >
                                Vider les caches système
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showZoneModal} onOpenChange={setShowZoneModal}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Gestion des Zones de Livraison
                        </DialogTitle>
                        <DialogDescription>
                            Ajoutez ou modifiez les zones de livraison et leurs tarifs standards.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="space-y-1 flex-1">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Nouvelle Zone</Label>
                                <Input
                                    placeholder="Ex: Douala Nord"
                                    value={newZone.name}
                                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-1 w-32">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Prix (FCFA)</Label>
                                <Input
                                    type="number"
                                    placeholder="1500"
                                    value={newZone.price}
                                    onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <Button onClick={handleAddZone} className="h-10 w-10 p-0 rounded-xl shrink-0">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="border rounded-2xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold">Zone</TableHead>
                                        <TableHead className="font-bold text-right">Tarif</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {zones.map((zone) => (
                                        <TableRow key={zone.id}>
                                            <TableCell className="font-medium text-slate-700">{zone.name}</TableCell>
                                            <TableCell className="text-right font-black text-slate-800">{zone.price} FCFA</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowZoneModal(false)} className="rounded-xl font-bold">Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout >
    );
};

export default AdminSettings;
