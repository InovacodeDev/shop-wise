import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/md3/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { extractDataFromPdf } from "../../routes/purchases/actions";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "@/components/md3/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/md3/dialog";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLingui } from '@lingui/react/macro';
import { getCurrencyFromLocale } from '@/lib/localeCurrency';
import {
    faHistory,
    faStore,
    faBox,
    faHashtag,
    faPencil,
    faTrash,
    faPlusCircle,
    faSave,
    faCopyright,
    faBug,
    faFilePdf,
    faTags,
    faTimesCircle,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

// currency util centralized in src/lib/localeCurrency.ts

import { Badge } from "@/components/md3/badge";
import { Chip } from "@/components/md3/chip";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Loading } from "@/components/ui/loading";
import { ExtractProductDataOutput, Product as AIProduct } from "@/types/ai-flows";
import { v4 as randomUUID } from "uuid";

// Interface local que estende Product com id para uso na interface
interface Product extends AIProduct { }

interface PdfImportProps {
    onSave: (scanResult: ExtractProductDataOutput, products: Product[]) => Promise<void>;
}

const categoriesMap: Record<string, string[]> = {
    "Hortifrúti e Ovos": ["Frutas", "Legumes", "Verduras e Folhas", "Temperos Frescos", "Ovos"],
    "Açougue e Peixaria": ["Carnes Bovinas", "Aves", "Carnes Suínas", "Peixes e Frutos do Mar"],
    "Padaria e Confeitaria": [
        "Pães",
        "Bolos e Tortas",
        "Salgados",
        "Frios e Embutidos Fatiados",
        "Torradas e Croutons",
    ],
    "Laticínios e Frios": [
        "Leites",
        "Queijos",
        "Iogurtes",
        "Manteiga e Margarina",
        "Requeijão e Cream Cheese",
        "Nata e Creme de Leite Fresco",
    ],
    Mercearia: [
        "Grãos e Cereais",
        "Massas",
        "Farináceos",
        "Açúcar e Adoçantes",
        "Óleos, Azeites e Vinagres",
        "Enlatados e Conservas",
        "Molhos e Temperos",
        "Sopas e Cremes",
    ],
    "Matinais e Doces": [
        "Café, Chás e Achocolatados em Pó",
        "Cereais Matinais e Granola",
        "Biscoitos e Bolachas",
        "Geleias e Cremes",
        "Doces e Sobremesas",
    ],
    Congelados: ["Pratos Prontos", "Salgados Congelados", "Legumes Congelados", "Polpas de Frutas", "Sorvetes e Açaí"],
    Bebidas: ["Água", "Sucos", "Refrigerantes", "Chás Prontos e Isotônicos", "Bebidas Alcoólicas"],
    Limpeza: ["Roupas", "Cozinha", "Banheiro e Geral", "Acessórios"],
    "Higiene Pessoal": [
        "Higiene Bucal",
        "Cabelo",
        "Corpo",
        "Cuidados com o Rosto",
        "Higiene Íntima e Absorventes",
        "Papel Higiênico e Lenços de Papel",
        "Barbearia",
    ],
    "Bebês e Crianças": ["Fraldas e Lenços Umedecidos", "Alimentação Infantil", "Higiene Infantil"],
    "Pet Shop": ["Alimentação", "Higiene"],
    "Utilidades e Bazar": ["Cozinha", "Geral", "Churrasco"],
    Farmácia: ["Medicamentos e Saúde", "Primeiros Socorros"],
};

const mainCategories = Object.keys(categoriesMap);

export function PdfImportComponent({ onSave }: PdfImportProps) {
    const { i18n, t } = useLingui();
    const [extractionResult, setExtractionResult] = useState<ExtractProductDataOutput | null>(null);
    const [debugResult, setDebugResult] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let timer: any;
        if (isLoading) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(timer);
                        return 95;
                    }
                    return prev + 5;
                });
            }, 200);
        }
        return () => {
            clearInterval(timer);
        };
    }, [isLoading]);

    const getCategoryClass = (category?: string) => {
        if (!category) return "bg-secondary text-secondary-foreground";
        const categoryMap: { [key: string]: string } = {
            "Hortifrúti e Ovos":
                "bg-category-produce-and-eggs/50 text-category-produce-and-eggs-foreground border-category-produce-and-eggs/20",
            "Açougue e Peixaria":
                "bg-category-meat-and-seafood/50 text-category-meat-and-seafood-foreground border-category-meat-and-seafood/20",
            "Padaria e Confeitaria":
                "bg-category-bakery-and-deli/50 text-category-bakery-and-deli-foreground border-category-bakery-and-deli/20",
            "Laticínios e Frios":
                "bg-category-dairy-and-chilled/50 text-category-dairy-and-chilled-foreground border-category-dairy-and-chilled/20",
            Mercearia:
                "bg-category-pantry-and-dry-goods/50 text-category-pantry-and-dry-goods-foreground border-category-pantry-and-dry-goods/20",
            "Matinais e Doces":
                "bg-category-breakfast-and-snacks/50 text-category-breakfast-and-snacks-foreground border-category-breakfast-and-snacks/20",
            Congelados:
                "bg-category-frozen-foods/50 text-category-frozen-foods-foreground border-category-frozen-foods/20",
            Bebidas: "bg-category-beverages/50 text-category-beverages-foreground border-category-beverages/20",
            Limpeza:
                "bg-category-cleaning-and-household/50 text-category-cleaning-and-household-foreground border-category-cleaning-and-household/20",
            "Higiene Pessoal":
                "bg-category-personal-care/50 text-category-personal-care-foreground border-category-personal-care/20",
            "Bebês e Crianças":
                "bg-category-baby-and-child-care/50 text-category-baby-and-child-care-foreground border-category-baby-and-child-care/20",
            "Pet Shop":
                "bg-category-pet-supplies/50 text-category-pet-supplies-foreground border-category-pet-supplies/20",
            "Utilidades e Bazar":
                "bg-category-home-and-general/50 text-category-home-and-general-foreground border-category-home-and-general/20",
            Farmácia: "bg-category-pharmacy/50 text-category-pharmacy-foreground border-category-pharmacy/20",
            Default: "bg-secondary text-secondary-foreground",
        };
        return categoryMap[category] || categoryMap.Default;
    };

    const getSubcategoryClass = (category?: string) => {
        if (!category) return "bg-secondary/50 text-secondary-foreground";
        const subcategoryMap: { [key: string]: string } = {
            "Hortifrúti e Ovos":
                "bg-category-produce-and-eggs/30 text-category-produce-and-eggs-foreground border-category-produce-and-eggs/10",
            "Açougue e Peixaria":
                "bg-category-meat-and-seafood/30 text-category-meat-and-seafood-foreground border-category-meat-and-seafood/10",
            "Padaria e Confeitaria":
                "bg-category-bakery-and-deli/30 text-category-bakery-and-deli-foreground border-category-bakery-and-deli/10",
            "Laticínios e Frios":
                "bg-category-dairy-and-chilled/30 text-category-dairy-and-chilled-foreground border-category-dairy-and-chilled/10",
            Mercearia:
                "bg-category-pantry-and-dry-goods/30 text-category-pantry-and-dry-goods-foreground border-category-pantry-and-dry-goods/10",
            "Matinais e Doces":
                "bg-category-breakfast-and-snacks/30 text-category-breakfast-and-snacks-foreground border-category-breakfast-and-snacks/10",
            Congelados:
                "bg-category-frozen-foods/30 text-category-frozen-foods-foreground border-category-frozen-foods/10",
            Bebidas: "bg-category-beverages/30 text-category-beverages-foreground border-category-beverages/10",
            Limpeza:
                "bg-category-cleaning-and-household/30 text-category-cleaning-and-household-foreground border-category-cleaning-and-household/10",
            "Higiene Pessoal":
                "bg-category-personal-care/30 text-category-personal-care-foreground border-category-personal-care/10",
            "Bebês e Crianças":
                "bg-category-baby-and-child-care/30 text-category-baby-and-child-care-foreground border-category-baby-and-child-care/10",
            "Pet Shop":
                "bg-category-pet-supplies/30 text-category-pet-supplies-foreground border-category-pet-supplies/10",
            "Utilidades e Bazar":
                "bg-category-home-and-general/30 text-category-home-and-general-foreground border-category-home-and-general/10",
            Farmácia: "bg-category-pharmacy/30 text-category-pharmacy-foreground border-category-pharmacy/10",
            Default: "bg-secondary/50 text-secondary-foreground",
        };
        return subcategoryMap[category] || subcategoryMap.Default;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setExtractionResult(null);
        setProducts([]);
        setDebugResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const pdfDataUri = reader.result as string;

                const result = await extractDataFromPdf({ pdfDataUri });

                if (result.error) {
                    throw new Error(result.error);
                }

                setDebugResult(JSON.stringify(result, null, 2));

                const finalResult: ExtractProductDataOutput = result;

                setExtractionResult(finalResult);
                setProducts(finalResult.products);

                toast({
                    title: t`PDF data extracted successfully`,
                    description: t`PDF data was extracted successfully. Please review the items below before saving.`,
                });
                setProgress(100);
                setIsLoading(false);
            };
        } catch (error: any) {
            console.error("Failed to extract data:", error);
            toast({
                variant: "destructive",
                title: t`Failed to extract PDF data`,
                description: error.message || t`We couldn't extract data from the PDF. Please ensure it's a valid electronic fiscal receipt (NFC-e) and try again. If the problem persists, you can enter the data manually.`,
            });
            handleCancelImport();
            setIsLoading(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleCancelImport = () => {
        setExtractionResult(null);
        setProducts([]);
        setDebugResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct({ ...product });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (barcode: string) => {
        setProducts(products.filter((p) => p.barcode !== barcode));
    };

    const handleSaveEdit = () => {
        if (editingProduct) {
            setProducts(products.map((p) => (p.barcode === editingProduct.barcode ? editingProduct : p)));
            setIsEditDialogOpen(false);
            setEditingProduct(null);
            toast({ title: t`Item updated successfully` });
        }
    };

    const handleAddNewItem = () => {
        const newItem: Product = {
            barcode: randomUUID(),
            name: "New Item",
            volume: "UN",
            quantity: 1,
            unitPrice: 0.0,
            price: 0.0,
            category: "Grocery",
            subcategory: "Others",
            brand: "",
        };
        setProducts([...products, newItem]);
        handleEditClick(newItem);
    };

    const handleConfirmPurchase = async () => {
        if (extractionResult) {
            setIsSaving(true);
            try {
                await onSave(extractionResult, products);
                handleCancelImport();
            } finally {
                setIsSaving(false);
            }
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    const totalAmount = products.reduce((sum, item) => sum + item.price, 0);

    return (
        <>
            <CardContent className="flex flex-col items-center gap-8 p-0">
                <Alert>
                    <FontAwesomeIcon icon={faFilePdf} />
                    <AlertTitle>{t`Import from PDF`}</AlertTitle>
                    <AlertDescription>{t`Select the PDF of your electronic fiscal receipt (NFC-e) to automatically extract the purchase data.`}</AlertDescription>
                </Alert>

                <Input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                />

                {isLoading ? (
                    <div className="w-full space-y-4">
                        <Loading
                            text={t`Processing PDF...`}
                            description={t`Extracting purchase data from your receipt. This may take a few moments.`}
                            layout="vertical"
                            size="md"
                        />
                        <Progress value={progress} />
                    </div>
                ) : (
                    <Button
                        onClick={triggerFileSelect}
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                        data-analytics-id="select-pdf-button"
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-2 h-5 w-5" />
                        {t`Select PDF File`}
                    </Button>
                )}

                {extractionResult && products.length > 0 && (
                    <div className="w-full space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faHistory} className="w-5 h-5 text-primary" />{" "}
                                    {t`Purchase Data`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-muted-foreground" />
                                        <strong>{t`Store`}:</strong> {extractionResult.storeName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-muted-foreground" />
                                        <strong>{t`Date`}:</strong>{" "}
                                        {new Date(extractionResult.date).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC",
                                        })}
                                    </div>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <FontAwesomeIcon icon={faBox} className="inline-block mr-1 w-4 h-4" />{" "}
                                                {t`Product`}
                                            </TableHead>
                                            <TableHead>
                                                <FontAwesomeIcon
                                                    icon={faCopyright}
                                                    className="inline-block mr-1 w-4 h-4"
                                                />{" "}
                                                {t`Brand`}
                                            </TableHead>
                                            <TableHead className="w-[200px]">
                                                <FontAwesomeIcon icon={faTags} className="inline-block mr-1 w-4 h-4" />{" "}
                                                {t`Category`}
                                            </TableHead>
                                            <TableHead className="text-center w-[80px]">
                                                <FontAwesomeIcon
                                                    icon={faHashtag}
                                                    className="inline-block mr-1 w-4 h-4"
                                                />{" "}
                                                {t`Quantity`}
                                            </TableHead>
                                            <TableHead className="text-right w-[120px]">
                                                {t`Unit Price`} (R$)
                                            </TableHead>
                                            <TableHead className="text-right w-[120px]">
                                                {t`Total Price`} (R$)
                                            </TableHead>
                                            <TableHead className="text-right w-[100px]">{t`Actions`}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.barcode}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.brand}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Chip
                                                            variant="category"
                                                            className={cn(getCategoryClass(product.category))}
                                                            asChild
                                                        >
                                                            <span>{product.category}</span>
                                                        </Chip>
                                                        {product.subcategory && (
                                                            <Chip
                                                                variant="category"
                                                                className={cn(getSubcategoryClass(product.category))}
                                                                asChild
                                                            >
                                                                <span>{product.subcategory}</span>
                                                            </Chip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">{product.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    {product.unitPrice.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">{product.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleEditClick(product)}
                                                        >
                                                            <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleDeleteClick(product.barcode)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant="outlined" onClick={handleAddNewItem}>
                                    <FontAwesomeIcon icon={faPlusCircle} className="mr-2 h-4 w-4" />{" "}
                                    {t`Add Item Manually`}
                                </Button>
                            </CardContent>
                            <CardFooter className="flex-col items-end space-y-2 pt-6">
                                <p className="font-semibold text-lg">
                                    {t`Total`}: {i18n.number(totalAmount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                </p>
                                {extractionResult.discount && extractionResult.discount > 0 && (
                                    <>
                                        <p className="font-semibold text-primary text-md">
                                            {t`Discounts`}: - {i18n.number(extractionResult.discount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                        </p>
                                        <p className="font-bold text-xl text-accent">
                                            {t`Total to Pay`}: {i18n.number(totalAmount - extractionResult.discount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                        </p>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                        <CardFooter className="p-0 flex flex-col items-start gap-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <span className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBug} /> {t`Debug Raw Data`}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <pre className="mt-4 p-4 bg-muted rounded-md text-xs overflow-auto max-h-96">
                                            {debugResult}
                                        </pre>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <div className="flex w-full justify-between items-center">
                                <Button variant="destructive" onClick={handleCancelImport} disabled={isSaving}>
                                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2 h-4 w-4" />
                                    {t`Cancel and Start New Import`}
                                </Button>
                                <Button size="lg" onClick={handleConfirmPurchase} disabled={isSaving}>
                                    {isSaving ? (
                                        <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                                    )}
                                    {isSaving ? t`Saving...` : t`Confirm and Save Purchase`}
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                )}
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{t`Edit Item`}</DialogTitle>
                        <DialogDescription>{t`Make corrections to the extracted item's details here.`}</DialogDescription>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="grid gap-4 py-4 overflow-x-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="sm:text-right">
                                    {t`Name`}
                                </Label>
                                <Input
                                    id="name"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="sm:col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="brand" className="sm:text-right">
                                    {t`Brand`}
                                </Label>
                                <Input
                                    id="brand"
                                    value={editingProduct.brand}
                                    onChange={(e) =>
                                        setEditingProduct({ ...editingProduct, brand: e.target.value ?? "" })
                                    }
                                    className="sm:col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="sm:text-right">
                                    {t`Category`}
                                </Label>
                                <Select
                                    value={editingProduct.category}
                                    onValueChange={(value) => {
                                        setEditingProduct({
                                            ...editingProduct,
                                            category: value,
                                            subcategory: categoriesMap[value]?.[0] ?? "", // Reset subcategory
                                        });
                                    }}
                                >
                                    <SelectTrigger className="sm:col-span-3">
                                        <SelectValue placeholder={t`Select a category`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mainCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="subcategory" className="sm:text-right">
                                    {t`Subcategory`}
                                </Label>
                                <Select
                                    value={editingProduct.subcategory}
                                    onValueChange={(value) =>
                                        setEditingProduct({ ...editingProduct, subcategory: value })
                                    }
                                    disabled={
                                        !editingProduct.category ||
                                        !categoriesMap[editingProduct.category] ||
                                        categoriesMap[editingProduct.category].length === 0
                                    }
                                >
                                    <SelectTrigger className="sm:col-span-3">
                                        <SelectValue placeholder={t`Select a subcategory`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editingProduct.category &&
                                            categoriesMap[editingProduct.category]?.map((sub) => (
                                                <SelectItem key={sub} value={sub}>
                                                    {sub}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="sm:text-right">
                                    {t`Quantity`}
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={editingProduct.quantity}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            quantity: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="sm:col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="unitPrice" className="sm:text-right">
                                    {t`Unit Price`} (R$)
                                </Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    value={editingProduct.unitPrice}
                                    onChange={(e) => {
                                        const newUnitPrice = parseFloat(e.target.value) || 0;
                                        setEditingProduct({
                                            ...editingProduct,
                                            unitPrice: newUnitPrice,
                                            price: newUnitPrice * editingProduct.quantity,
                                        });
                                    }}
                                    className="sm:col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                            {t`Cancel`}
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" /> {t`Save Changes`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
