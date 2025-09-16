import { Button } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { Chip } from "@/components/md3/chip";
import {
    Form,
    FormInput,
    FormSubmitButton
} from "@/components/ui/md3-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { cn } from "@/lib/utils";
import { faPlusCircle, faStore, faThumbsDown, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const marketSchema = z.object({
    name: z.string().min(2, "market_form_error_name_min"),
    type: z.enum(["supermercado", "atacado", "feira", "acougue", "padaria", "marketplace", "farmacia", "outro"]),
    cnpj: z.string().optional(),
    address: z.string().optional(),
});

type MarketData = z.infer<typeof marketSchema>;

// Mock data, in a real app this would come from Firestore
const allStores: (MarketData & { id: string })[] = [
    {
        id: "store1",
        name: "Supermercado Principal",
        type: "supermercado",
        cnpj: "12.345.678/0001-99",
        address: "Rua Principal, 123",
    },
    {
        id: "store2",
        name: "Atacarejo Preço Baixo",
        type: "atacado",
        cnpj: "98.765.432/0001-11",
        address: "Avenida Central, 456",
    },
    { id: "store3", name: "Feira de Sábado", type: "feira", cnpj: "", address: "Praça da Cidade" },
    { id: "store4", name: "Mercadinho da Esquina", type: "supermercado", cnpj: "", address: "Rua do Bairro, 789" },
];

export function MarketsForm() {
    const { t, locale } = useI18n();
    const { profile } = useAuth();
    const { toast } = useToast();
    

    // In a real app, these would be populated from the family document in Firestore
    const [favoriteStores, setFavoriteStores] = useState([allStores[0], allStores[1]]);
    const [ignoredStores, setIgnoredStores] = useState([allStores[3]]);

    const [selectedType, setSelectedType] = useState<string>("supermercado");

    const marketTypes = ["supermercado", "atacado", "feira", "acougue", "padaria", "marketplace", "farmacia", "outro"];

    const marketTypeLabels: Record<string, string> = {
        supermercado: t('supermarket'),
        atacado: t('wholesale'),
        feira: t('market'),
        acougue: t('butcher'),
        padaria: t('bakery'),
        marketplace: t('marketplace'),
        farmacia: t('pharmacy'),
        outro: t('other'),
    };

    const form = useForm<MarketData>({
        resolver: zodResolver(marketSchema),
        defaultValues: {
            name: "",
            type: "supermercado",
            cnpj: "",
            address: "",
        },
    });

    const handleAddMarket = (values: MarketData) => {
        // Include the selected type in the values
        const marketData = { ...values, type: selectedType as any };

        // In a real app, this would save to the global 'stores' collection
        // and then add the new store's ID to the family's 'favoriteStores' array.
        const newStore = { ...marketData, id: `store${Date.now()}` };
        allStores.push(newStore); // Mock adding to global list
        setFavoriteStores([...favoriteStores, newStore]);
        form.reset();
        setSelectedType("supermercado");
        toast({
            title: t('marketAdded'),
            description: t('{0} was added to your favorites.', { 0: marketData.name }),
        });
    };

    const moveToIgnored = (store: MarketData & { id: string }) => {
        setFavoriteStores(favoriteStores.filter((s) => s.id !== store.id));
        setIgnoredStores([...ignoredStores, store]);
        toast({
            title: t('movedToIgnored'),
            description: t('{0} will now be ignored in price comparisons.', { 0: store.name }),
        });
    };

    const moveToFavorites = (store: MarketData & { id: string }) => {
        setIgnoredStores(ignoredStores.filter((s) => s.id !== store.id));
        setFavoriteStores([...favoriteStores, store]);
        toast({
            title: t('movedToFavorites'),
            description: t('{0} is now a favorite store.', { 0: store.name }),
        });
    };

    const removeFromFamily = (storeId: string, list: "favorite" | "ignored") => {
        if (list === "favorite") {
            setFavoriteStores(favoriteStores.filter((s) => s.id !== storeId));
        } else {
            setIgnoredStores(ignoredStores.filter((s) => s.id !== storeId));
        }
        toast({ title: t('storeRemoved'), description: t('storeWasRemoved')});
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('addStore')}</CardTitle>
                    <CardDescription>{t('addNewSupermarket')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddMarket)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    name="name"
                                    label={t('storeName')}
                                    placeholder={t('egNeighborhoodSupermarket')}
                                    required
                                />
                                <FormInput
                                    name="cnpj"
                                    label={t('cnpjOptional')}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>

                            <FormInput
                                name="address"
                                label={t('addressOptional')}
                                placeholder={t('egAddress')}
                            />

                            <div className="space-y-3">
                                <label className="text-body-small font-medium text-on-surface-variant block">
                                    {t('storeType')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {marketTypes.map((type) => (
                                        <Chip
                                            key={type}
                                            variant={selectedType === type ? "filter" : "assist"}
                                            onClick={() => setSelectedType(type)}
                                            className={cn(
                                                "cursor-pointer transition-colors",
                                                selectedType === type && "bg-primary-container text-on-primary-container"
                                            )}
                                        >
                                            {marketTypeLabels[type]}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            <FormSubmitButton>
                                <FontAwesomeIcon icon={faPlusCircle} className="mr-2 h-4 w-4" />
                                {t('addToFavorites')}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <MarketList
                title={t('favoriteStores')}
                description={t('storesDescription')}
                icon={faThumbsUp}
                stores={favoriteStores}
                onAction={moveToIgnored}
                onRemove={removeFromFamily}
                actionIcon={faThumbsDown}
                actionTooltip={t('moveToIgnored')}
                listType="favorite"
            />

            <MarketList
                title={t('ignoredStores')}
                description={t('weWillNot')}
                icon={faThumbsDown}
                stores={ignoredStores}
                onAction={moveToFavorites}
                onRemove={removeFromFamily}
                actionIcon={faThumbsUp}
                actionTooltip={t('moveToFavorites')}
                listType="ignored"
            />
        </div>
    );
}

interface MarketListProps {
    title: string;
    description: string;
    icon: any;
    stores: (MarketData & { id: string })[];
    onAction: (store: MarketData & { id: string }) => void;
    onRemove: (storeId: string, list: "favorite" | "ignored") => void;
    actionIcon: any;
    actionTooltip: string;
    listType: "favorite" | "ignored";
}

function MarketList({
    title,
    description,
    icon,
    stores,
    onAction,
    onRemove,
    actionIcon,
    actionTooltip,
    listType,
}: MarketListProps) {
    const { t } = useI18n();
    
    const marketTypeLabels: Record<string, string> = {
        supermercado: t('supermarket'),
        atacado: t('wholesale'),
        feira: t('market'),
        acougue: t('butcher'),
        padaria: t('bakery'),
        marketplace: t('marketplace'),
        farmacia: t('pharmacy'),
        outro: t('other'),
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {stores.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                        {t('thisListIsEmpty')}
                    </div>
                ) : (
                    <div className="rounded-lg border border-outline-variant bg-surface">
                        <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-on-surface-variant">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStore} className="h-3 w-3" />
                                    {t('name')}
                                </div>
                                <div>{t('type')}</div>
                                <div>{t('address')}</div>
                                <div className="text-right">{t('actions')}</div>
                            </div>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {stores.map((store) => (
                                <div key={store.id} className="grid grid-cols-4 gap-4 p-4 hover:bg-surface-variant/50 transition-colors">
                                    <div className="font-medium text-on-surface truncate" title={store.name}>
                                        {store.name}
                                    </div>
                                    <div className="text-on-surface-variant">
                                        <Chip variant="assist" size="small" className="bg-secondary text-on-secondary">
                                            {marketTypeLabels[store.type]}
                                        </Chip>
                                    </div>
                                    <div className="text-on-surface-variant truncate" title={store.address}>
                                        {store.address}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="text"
                                            size="sm"
                                            title={actionTooltip}
                                            onClick={() => onAction(store)}
                                            className="text-primary hover:bg-primary-container/50"
                                        >
                                            <FontAwesomeIcon icon={actionIcon} className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="text"
                                            size="sm"
                                            title={t('removeFromMy')}
                                            onClick={() => onRemove(store.id, listType)}
                                            className="text-error hover:bg-error-container/50"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
