import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import { Input } from "@/components/md3/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTrash, faSave, faCalendarAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';

const itemSchema = z.object({
    name: z.string().min(1, `Name is required`),
    quantity: z.coerce.number().min(0.01, `Quantity must be greater than 0`),
    unitPrice: z.coerce.number().min(0, `Price cannot be negative`),
    price: z.coerce.number(),
    barcode: z.string().optional(),
    volume: z.string().optional(),
});

const purchaseSchema = z.object({
    storeName: z.string().min(1, `Store name is required`),
    date: z.date({ required_error: `Date is required` }),
    items: z.array(itemSchema).min(1, `Add at least one item`),
});

export type PurchaseData = z.infer<typeof purchaseSchema>;
export type ItemData = z.infer<typeof itemSchema>;

interface ManualPurchaseFormProps {
    onSave: (data: PurchaseData, products: ItemData[]) => Promise<void>;
}

export function ManualPurchaseForm({ onSave }: ManualPurchaseFormProps) {
    const { t } = useLingui();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PurchaseData>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            storeName: "",
            date: new Date(),
            items: [{ name: "", quantity: 1, unitPrice: 0, price: 0, barcode: "", volume: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = async (data: PurchaseData) => {
        setIsSaving(true);
        try {
            const productsWithTotalPrice = data.items.map((item) => ({
                ...item,
                price: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
            }));
            await onSave({ ...data, items: productsWithTotalPrice }, productsWithTotalPrice);
            form.reset({
                storeName: "",
                date: new Date(),
                items: [{ name: "", quantity: 1, unitPrice: 0, price: 0, barcode: "", volume: "" }],
            });
        } finally {
            setIsSaving(false);
        }
    };

    const totalAmount = form.watch("items").reduce((acc, item) => {
        return acc + (item.unitPrice || 0) * (item.quantity || 0);
    }, 0);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t`Purchase Details`}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="storeName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t`Store Name`}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t`e.g., Neighborhood Supermarket`} {...field} />
                                        <FormLabel>{t`Date`}</FormLabel>
                                        <span>{t`Select a date`}</span>
                                        <CardTitle>{t`Items`}</CardTitle>
                                        <TableHead className="w-auto">{t`Product`}</TableHead>
                                        <TableHead className="w-[100px] text-center">{t`Qty.`}</TableHead>
                                        <TableHead className="w-[140px] text-center">{t`Unit Price`}</TableHead>
                                        <Input
                                            {...field}
                                            placeholder={t`Item name`}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t`Date`}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outlined"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: ptBR })
                                                    ) : (
                                                        <span>{t`Select a date`}</span>
                                                    )}
                                                    <FontAwesomeIcon
                                                        icon={faCalendarAlt}
                                                        className="ml-auto h-4 w-4 opacity-50"
                                                    />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t`Items`}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-auto">{t`Product`}</TableHead>
                                    <TableHead className="w-[140px]">{t`Volume`}</TableHead>
                                    <TableHead className="w-[100px] text-center">{t`Qty.`}</TableHead>
                                    <TableHead className="w-[140px] text-center">{t`Unit Price`}</TableHead>
                                    <TableHead className="w-[50px] text-right">{t`Actions`}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="align-top py-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.name`}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder={t`Item name`}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="align-top py-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.volume`}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <FormControl>
                                                            <Input {...field} placeholder={t`ex: 1kg, 500ml`} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="align-top py-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                className="text-center"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="align-top py-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.unitPrice`}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                className="text-center"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="align-middle py-1 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                disabled={fields.length <= 1}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
                        <Button
                            type="button"
                            variant="outlined"
                            className="mt-4"
                            onClick={() =>
                                append({ name: "", quantity: 1, unitPrice: 0, price: 0, barcode: "", volume: "" })
                            }
                        >
                            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> {t`Add Item`}
                        </Button>
                        <div className="mt-4 flex items-center justify-between">
                            <span>
                                {t`Total`}: R$ {totalAmount.toFixed(2)}
                            </span>
                            <div>{isSaving ? t`Saving...` : t`Save Purchase`}</div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end font-bold text-lg">
                        <span>
                            {t`Total`}: R$ {totalAmount.toFixed(2)}
                        </span>
                    </CardFooter>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSaving} data-analytics-id="save-manual-purchase-button">
                        {isSaving ? (
                            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        ) : (
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                        )}
                        {isSaving ? t`Saving...` : t`Save Purchase`}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
