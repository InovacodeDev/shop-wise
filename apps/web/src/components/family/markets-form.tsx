import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import {
    Form,
    FormInput,
    FormSubmitButton
} from "@/components/ui/md3-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { Chip } from "@/components/md3/chip";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faStore, faTrash, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useLingui } from '@lingui/react/macro';

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
    const { profile } = useAuth();
    const { toast } = useToast();
    const { t } = useLingui();

    // In a real app, these would be populated from the family document in Firestore
    const [favoriteStores, setFavoriteStores] = useState([allStores[0], allStores[1]]);
    const [ignoredStores, setIgnoredStores] = useState([allStores[3]]);

    const [selectedType, setSelectedType] = useState<string>("supermercado");

    const marketTypes = ["supermercado", "atacado", "feira", "acougue", "padaria", "marketplace", "farmacia", "outro"];

    const marketTypeLabels: Record<string, string> = {
        supermercado: t`Supermarket`,
        atacado: t`Wholesale`,
        feira: t`Market`,
        acougue: t`Butcher`,
        padaria: t`Bakery`,
        marketplace: t`Marketplace`,
        farmacia: t`Pharmacy`,
        outro: t`Other`,
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
            title: t`Market Added`,
            description: t`${values.name} was added to your favorites.`,
        });
    };

    const moveToIgnored = (store: MarketData & { id: string }) => {
        setFavoriteStores(favoriteStores.filter((s) => s.id !== store.id));
        setIgnoredStores([...ignoredStores, store]);
        toast({
            title: t`Moved to Ignored`,
            description: t`${store.name} will now be ignored in price comparisons.`,
        });
    };

    const moveToFavorites = (store: MarketData & { id: string }) => {
        setIgnoredStores(ignoredStores.filter((s) => s.id !== store.id));
        setFavoriteStores([...favoriteStores, store]);
        toast({
            title: t`Moved to Favorites`,
            description: t`${store.name} is now a favorite store.`,
        });
    };

    const removeFromFamily = (storeId: string, list: "favorite" | "ignored") => {
        if (list === "favorite") {
            setFavoriteStores(favoriteStores.filter((s) => s.id !== storeId));
        } else {
            setIgnoredStores(ignoredStores.filter((s) => s.id !== storeId));
        }
        toast({ title: t`Store Removed`, description: t`The store was removed from your lists.` });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t`Add New Store`}</CardTitle>
                    <CardDescription>{t`Add a new supermarket, wholesale or market to your preferred locations.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddMarket)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    name="name"
                                    label={t`Store Name`}
                                    placeholder={t`e.g., Neighborhood Supermarket`}
                                    required
                                />
                                <FormInput
                                    name="cnpj"
                                    label={t`CNPJ (Optional)`}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>

                            <FormInput
                                name="address"
                                label={t`Address (Optional)`}
                                placeholder={t`e.g., 123 Flower St, City`}
                            />

                            <div className="space-y-3">
                                <label className="text-body-small font-medium text-on-surface-variant block">
                                    {t`Store Type`}
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
                                {t`Add to Favorites`}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <MarketList
                title={t`Favorite Stores`}
                description={t`These are the stores you shop at most often. We'll use them to generate personalized insights.`}
                icon={faThumbsUp}
                stores={favoriteStores}
                onAction={moveToIgnored}
                onRemove={removeFromFamily}
                actionIcon={faThumbsDown}
                actionTooltip={t`Move to ignored`}
                listType="favorite"
            />

            <MarketList
                title={t`Ignored Stores`}
                description={t`We will not use data from these stores for price comparison insights.`}
                icon={faThumbsDown}
                stores={ignoredStores}
                onAction={moveToFavorites}
                onRemove={removeFromFamily}
                actionIcon={faThumbsUp}
                actionTooltip={t`Move to favorites`}
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
    const { t } = useLingui();

    const marketTypeLabels: Record<string, string> = {
        supermercado: t`Supermarket`,
        atacado: t`Wholesale`,
        feira: t`Market`,
        acougue: t`Butcher`,
        padaria: t`Bakery`,
        marketplace: t`Marketplace`,
        farmacia: t`Pharmacy`,
        outro: t`Other`,
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
                        {t`This list is empty.`}
                    </div>
                ) : (
                    <div className="rounded-lg border border-outline-variant bg-surface">
                        <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-on-surface-variant">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStore} className="h-3 w-3" />
                                    {t`Name`}
                                </div>
                                <div>{t`Type`}</div>
                                <div>{t`Address`}</div>
                                <div className="text-right">{t`Actions`}</div>
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
                                            title={t`Remove from my lists`}
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
