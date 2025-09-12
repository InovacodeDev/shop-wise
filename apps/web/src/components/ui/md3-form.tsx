import * as React from "react";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Input, PasswordInput } from "@/components/md3/input";
import { Textarea } from "@/components/md3/textarea";
import { Button } from "@/components/md3/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/md3/card";

// Re-export the main form provider
const Form = FormProvider;

// Form field context for field name tracking
type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

// Hook for accessing form field state
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

// Form item context for ID generation
type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const id = React.useId();

        return (
            <FormItemContext.Provider value={{ id }}>
                <div ref={ref} className={cn("space-y-3", className)} {...props} />
            </FormItemContext.Provider>
        );
    }
);
FormItem.displayName = "FormItem";

// MD3 Form Label Component
const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, children, ...props }, ref) => {
        const { error, formItemId } = useFormField();

        return (
            <label
                ref={ref}
                htmlFor={formItemId}
                className={cn(
                    "text-body-small font-medium text-on-surface-variant mb-2 block",
                    error && "text-error",
                    className
                )}
                {...props}
            >
                {children}
            </label>
        );
    }
);
FormLabel.displayName = "FormLabel";

// MD3 Form Control Component
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
    ({ ...props }, ref) => {
        const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

        return (
            <Slot
                ref={ref}
                id={formItemId}
                aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
                aria-invalid={!!error}
                {...props}
            />
        );
    }
);
FormControl.displayName = "FormControl";

// MD3 Form Description Component
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        const { formDescriptionId } = useFormField();

        return (
            <p
                ref={ref}
                id={formDescriptionId}
                className={cn("text-body-small text-on-surface-variant mt-1", className)}
                {...props}
            />
        );
    }
);
FormDescription.displayName = "FormDescription";

// MD3 Form Error Message Component
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        const { error, formMessageId } = useFormField();
        const body = error ? String(error?.message ?? "") : children;

        if (!body) {
            return null;
        }

        return (
            <p
                ref={ref}
                id={formMessageId}
                className={cn("text-body-small font-medium text-error mt-1", className)}
                {...props}
            >
                {body}
            </p>
        );
    }
);
FormMessage.displayName = "FormMessage";

// High-level form components
interface FormCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    variant?: "elevated" | "filled" | "outlined";
}

const FormCard = React.forwardRef<HTMLDivElement, FormCardProps>(
    ({ title, description, children, className, variant = "elevated", ...props }, ref) => {
        return (
            <Card ref={ref} variant={variant} className={cn("w-full max-w-md", className)} {...props}>
                {(title || description) && (
                    <CardHeader className="space-y-2">
                        {title && <CardTitle className="text-headline-small">{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                )}
                <CardContent>{children}</CardContent>
            </Card>
        );
    }
);
FormCard.displayName = "FormCard";

// Pre-configured input fields
interface FormInputProps extends React.ComponentProps<typeof Input> {
    name: string;
    label: string;
    description?: string;
    required?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ name, label, description, required, ...props }, ref) => {
        return (
            <FormField
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {label}
                            {required && <span className="text-error ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                            <Input {...field} {...props} ref={ref} />
                        </FormControl>
                        {description && <FormDescription>{description}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }
);
FormInput.displayName = "FormInput";

interface FormPasswordInputProps extends React.ComponentProps<typeof PasswordInput> {
    name: string;
    label: string;
    description?: string;
    required?: boolean;
}

const FormPasswordInput = React.forwardRef<HTMLInputElement, FormPasswordInputProps>(
    ({ name, label, description, required, ...props }, ref) => {
        return (
            <FormField
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {label}
                            {required && <span className="text-error ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                            <PasswordInput {...field} {...props} ref={ref} />
                        </FormControl>
                        {description && <FormDescription>{description}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }
);
FormPasswordInput.displayName = "FormPasswordInput";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
    name: string;
    label: string;
    description?: string;
    required?: boolean;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ name, label, description, required, ...props }, ref) => {
        return (
            <FormField
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {label}
                            {required && <span className="text-error ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                            <Textarea {...field} {...props} ref={ref} />
                        </FormControl>
                        {description && <FormDescription>{description}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }
);
FormTextarea.displayName = "FormTextarea";

interface FormSubmitButtonProps extends React.ComponentProps<typeof Button> {
    loading?: boolean;
    loadingText?: string;
}

const FormSubmitButton = React.forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
    ({ loading, loadingText = "Submitting...", children, disabled, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                type="submit"
                disabled={loading || disabled}
                variant="filled"
                className="w-full"
                {...props}
            >
                {loading ? loadingText : children}
            </Button>
        );
    }
);
FormSubmitButton.displayName = "FormSubmitButton";

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
    FormCard,
    FormInput,
    FormPasswordInput,
    FormTextarea,
    FormSubmitButton,
};
