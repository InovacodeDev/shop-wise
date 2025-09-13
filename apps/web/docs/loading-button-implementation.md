# LoadingButton Implementation Guide

## Overview

This document explains how to implement loading states for buttons that call APIs, preventing multiple clicks during processing.

## Components

### LoadingButton

A button component that shows a loading indicator while an operation is in progress.

**Props:**

- `loading: boolean` - Shows loading indicator when true
- `disabled?: boolean` - Disables the button
- All other Button props are supported

**Loading Behavior:**

- When `loading={true}`, the button becomes 25% transparent (opacity-25)
- The button content is replaced with a loading indicator component
- The button is automatically disabled during loading
- Click events are prevented during loading state

### useAsyncOperation Hook

A custom hook for managing async operations with loading states.

**Returns:**

- `isLoading: boolean` - Whether operation is in progress
- `execute: (operation, onSuccess?, onError?) => Promise` - Execute async operation

## Usage Examples

### Basic API Call Button

```tsx
import { LoadingButton } from "@/components/md3/button";
import { useAsyncOperation } from "@/hooks/use-async-operation";

function MyComponent() {
    const saveOperation = useAsyncOperation();

    const handleSave = async () => {
        await saveOperation.execute(async () => {
            await apiService.saveData(data);
            toast({ title: "Success", description: "Data saved!" });
        });
    };

    return (
        <LoadingButton
            onClick={handleSave}
            loading={saveOperation.isLoading}
            disabled={saveOperation.isLoading}
        >
            Save Data
        </LoadingButton>
    );
}
```

### Delete Operation with Confirmation

```tsx
function DeleteComponent() {
    const deleteOperation = useAsyncOperation();

    const handleDelete = async () => {
        await deleteOperation.execute(async () => {
            await apiService.deleteItem(itemId);
            toast({ title: "Deleted", description: "Item deleted successfully" });
            onDeleted(); // callback
        });
    };

    return (
        <DeleteConfirmationDialog
            onConfirm={handleDelete}
            triggerButton={
                <LoadingButton
                    variant="destructive"
                    loading={deleteOperation.isLoading}
                    disabled={deleteOperation.isLoading}
                >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete Item
                </LoadingButton>
            }
        />
    );
}
```

### Form Submit Button

```tsx
function FormComponent() {
    const submitOperation = useAsyncOperation();

    const onSubmit = async (formData) => {
        await submitOperation.execute(async () => {
            const result = await apiService.submitForm(formData);
            toast({ title: "Success", description: "Form submitted!" });
            router.navigate({ to: "/success" });
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* form fields */}
            <LoadingButton
                type="submit"
                loading={submitOperation.isLoading}
                disabled={submitOperation.isLoading}
            >
                Submit Form
            </LoadingButton>
        </form>
    );
}
```

### Multiple Operations in One Component

```tsx
function MultiActionComponent() {
    const saveOperation = useAsyncOperation();
    const deleteOperation = useAsyncOperation();
    const publishOperation = useAsyncOperation();

    // Each operation is independent and has its own loading state

    return (
        <div className="flex gap-2">
            <LoadingButton
                onClick={handleSave}
                loading={saveOperation.isLoading}
                disabled={saveOperation.isLoading}
            >
                Save Draft
            </LoadingButton>

            <LoadingButton
                onClick={handlePublish}
                loading={publishOperation.isLoading}
                disabled={publishOperation.isLoading}
                variant="default"
            >
                Publish
            </LoadingButton>

            <LoadingButton
                onClick={handleDelete}
                loading={deleteOperation.isLoading}
                disabled={deleteOperation.isLoading}
                variant="destructive"
            >
                Delete
            </LoadingButton>
        </div>
    );
}
```

## Implementation Examples in Codebase

### Settings Page - Delete Operations

Location: `/apps/web/src/routes/settings/route.tsx`

```tsx
function SettingsPage() {
    const deleteDataOperation = useAsyncOperation();
    const deleteAccountOperation = useAsyncOperation();

    const handleDeleteData = async () => {
        await deleteDataOperation.execute(async () => {
            const result = await apiService.deleteAllUserData(profile._id);
            toast({ title: "Success", description: result.message });
            window.location.reload();
        });
    };

    // Used in DeleteConfirmationDialog
    <LoadingButton
        variant="destructive"
        loading={deleteDataOperation.isLoading}
        disabled={deleteDataOperation.isLoading}
    >
        <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
        Delete All Data
    </LoadingButton>
}
```

### Main Navigation - Logout

Location: `/apps/web/src/components/layout/main-nav.tsx`

```tsx
function MainNav() {
    const logoutOperation = useAsyncOperation();

    const handleSignOut = async () => {
        await logoutOperation.execute(async () => {
            await apiService.revoke();
            apiService.clearAuthState();
            await reloadUser();
            trackEvent("user_logged_out");
            router.navigate({ to: "/" });
        });
    };

    // Used in AlertDialog
    <LoadingButton
        onClick={handleSignOut}
        loading={logoutOperation.isLoading}
        disabled={logoutOperation.isLoading}
    >
        Yes, sign out
    </LoadingButton>
}
```

### Login Form - Authentication

Location: `/apps/web/src/components/auth/login-form.tsx`

```tsx
function LoginForm() {
    const loginOperation = useAsyncOperation();

    const onSubmit = async (values) => {
        await loginOperation.execute(async () => {
            await apiService.login(values.email, values.password);
            trackEvent("login", { method: "email" });
            router.navigate({ to: "/home" });
        });
    };

    // Using FormSubmitButton (which supports loading internally)
    <FormSubmitButton
        disabled={!isValid || loginOperation.isLoading}
        loading={loginOperation.isLoading}
        loadingText={t`Signing in...`}
        className="mt-6"
    >
        {t`Login`}
    </FormSubmitButton>
}
```

### Signup Form - Account Creation

Location: `/apps/web/src/components/auth/signup-form.tsx`

```tsx
function SignupForm() {
    const signupOperation = useAsyncOperation();

    const onSubmit = async (values) => {
        await signupOperation.execute(async () => {
            const resp = await apiService.signUp({
                email: values.email,
                password: values.password,
                displayName: values.name
            });
            if (resp?.token) {
                apiService.setBackendAuthToken(resp.token);
                if (resp.refresh) apiService.setBackendRefreshToken(resp.refresh);
            }
            trackEvent("sign_up", { method: "email" });
            router.navigate({ to: "/home" });
        });
    };

    <LoadingButton
        type="submit"
        className="w-full"
        disabled={!isValid || signupOperation.isLoading}
        loading={signupOperation.isLoading}
        loadingText={t`Creating Account...`}
    >
        {t`Create Account`}
    </LoadingButton>
}
```

## Benefits

1. **Prevents Double-Clicks**: Loading state disables button during operation
2. **Visual Feedback**: Users see loading indicator showing progress
3. **Consistent UX**: Standardized loading behavior across all API calls
4. **Error Handling**: Built-in error handling in useAsyncOperation hook
5. **Toast Integration**: Easy success/error message display

## Migration Guide

### Before (Regular Button)

```tsx
const [loading, setLoading] = useState(false);

const handleClick = async () => {
    setLoading(true);
    try {
        await apiService.doSomething();
        toast({ title: "Success" });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
        setLoading(false);
    }
};

<Button onClick={handleClick} disabled={loading}>
    {loading ? <LoadingIndicator /> : "Click Me"}
</Button>
```

### After (LoadingButton)

```tsx
const operation = useAsyncOperation();

const handleClick = async () => {
    await operation.execute(async () => {
        await apiService.doSomething();
        toast({ title: "Success" });
    });
};

<LoadingButton
    onClick={handleClick}
    loading={operation.isLoading}
    disabled={operation.isLoading}
>
    Click Me
</LoadingButton>
```

## Best Practices

1. Always disable the button when loading to prevent multiple submissions
2. Use descriptive loading text or keep original text with loading indicator
3. Handle errors in the execute function or provide onError callback
4. Use appropriate button variants (destructive for delete operations)
5. Include icons when they add context to the action
6. Consider using LoadingButton for all API operations, not just critical ones
