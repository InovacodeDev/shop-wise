import { SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from '@/hooks/useI18n';
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { faFileLines, faMessage } from "@fortawesome/free-regular-svg-icons";
import {
    faChartColumn,
    faChevronDown,
    faCog,
    faList,
    faMicroscope,
    faPlus,
    faPlusCircle,
    faShield,
    faShieldHalved,
    faShoppingBasket,
    faSignOutAlt,
    faUser,
    faUserGroup,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button, LoadingButton } from "@/components/md3/button";
import { trackEvent } from "@/services/analytics-service";
import { Link, useRouter } from "@tanstack/react-router";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function MainNav() {
    const router = useRouter();
    const { profile, reloadUser } = useAuth();
    const { t } = useI18n();
    const isAdmin = profile?.isAdmin || false;
    const { state } = useSidebar();

    // Add async operation for logout
    const logoutOperation = useAsyncOperation();

    // Sections:
    // Routes that require premium access (these screens use PremiumFeatureGuard)
    const premiumRoutes = new Set<string>([
        "/achievements",
        "/budgets",
        "/investments",
        "/projections",
        "/education",
        "/bank",
        "/credit-cards",
    ]);
    // Finance related
    const financeMenu = [
        { href: "/investments", label: t('investments'), icon: faChartColumn },
        { href: "/budgets", label: t('budgets'), icon: faFileLines },
        { href: "/credit-cards", label: t('creditCards'), icon: faFileLines },
        { href: "/bank", label: t('bank'), icon: faFileLines },
    ];

    // Top menu: put Insights first so it's the primary entry point
    const topMenu = [
        { href: "/home", label: t('insights'), icon: faChartColumn },
        // { href: "/goals", label: t('Goals'), icon: faFileLines },
        // { href: "/achievements", label: t('achievements'), icon: faUsers },
        // { href: "/projections", label: t('projections'), icon: faChartColumn },
    ];

    // Shopping related
    const shoppingMenu = [
        { href: "/list", label: t('shoppingList'), icon: faList },
        { href: "/purchases", label: t('addPurchase'), icon: faShoppingBasket },
    ];

    const educationMenu = [
        { href: "/education", label: t('education'), icon: faFileLines },
    ];

    const settingsMenuItems = [
        { href: "/family", label: t('family'), icon: faUserGroup },
        { href: "/settings", label: t('myAccount'), icon: faUser },
    ];

    const adminMenuItems = [
        { href: "/admin", label: t('adminDashboard'), icon: faShieldHalved },
        { href: "/admin/users", label: t('manageUsers'), icon: faUsers },
        { href: "/admin/reports", label: t('usageReports'), icon: faChartColumn },
        { href: "/admin/market-insights", label: t('marketInsights'), icon: faShoppingBasket },
        { href: "/admin/settings", label: t('globalSettings'), icon: faCog },
        { href: "/admin/notifications", label: t('manageNotifications'), icon: faMessage },
        { href: "/admin/audit", label: t('auditTests'), icon: faMicroscope },
        { href: "/admin/security", label: t('security'), icon: faShield },
        { href: "/admin/logs", label: t('systemLogs'), icon: faFileLines },
    ];

    const handleSignOut = async () => {
        await logoutOperation.execute(async () => {
            try {
                await apiService.revoke();
            } catch (e) {
                // ignore
            }
            try {
                apiService.clearAuthState();
            } catch (e) {
                console.warn('Error clearing tokens on logout:', e);
            }

            try {
                await reloadUser();
            } catch {
                // ignore
            }

            trackEvent("user_logged_out");
            router.navigate({ to: "/" });
        });
    };

    const isActive = (href: string) => {
        const pathname = window.location.pathname;
        if (href === "/admin") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <SidebarContent className="pt-6">
            {/* Split Button for Add Purchase */}
            <div className={state === "collapsed" ? "mb-6" : "mb-6 px-4"}>
                {state === "collapsed" ? (
                    // Icon-only button when collapsed
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="filled"
                                size="icon"
                                className={cn(
                                    "w-10 h-10 rounded-full mx-auto",
                                    "bg-primary hover:bg-primary/90 text-on-primary"
                                )}
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link to="/purchases" className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faShoppingBasket} className="h-4 w-4" />
                                    {t('manualEntry')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/purchases" className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                                    {t('scanReceipt')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/list" className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                                    {t('shoppingList')}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Split button when expanded
                    <div className="flex rounded-full overflow-hidden">
                        <Link to="/purchases" className="flex-1">
                            <Button
                                variant="filled"
                                className={cn(
                                    "w-full justify-start rounded-r-none border-r-0",
                                    "bg-primary hover:bg-primary/90 text-on-primary",
                                    "h-10 px-4"
                                )}
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                <span className="ml-2 font-medium">{t('addPurchase')}</span>
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="filled"
                                    size="icon"
                                    className={cn(
                                        "rounded-l-none border-l border-primary-container/20",
                                        "bg-primary hover:bg-primary/90 text-on-primary",
                                        "h-10 w-12 shrink-0"
                                    )}
                                >
                                    <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link to="/purchases" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faShoppingBasket} className="h-4 w-4" />
                                        {t('manualEntry')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/purchases" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                                        {t('scanReceipt')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/list" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                                        {t('shoppingList')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <SidebarMenu>
                {topMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link to={item.href}>
                            <SidebarMenuButton
                                isActive={isActive(item.href)}
                                tooltip={item.label}
                                asChild={false}
                            >
                                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                {state === "collapsed" ? null : (
                                    <span
                                        className={cn(
                                            "transition-all duration-300 ease-in-out",
                                            "opacity-100"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
                {/* <p
                    className={cn(
                        "px-4 py-2 text-xs font-semibold text-muted-foreground transition-opacity duration-300",
                        state === "collapsed" ? "opacity-0 h-auto" : "opacity-100 h-auto"
                    )}
                >
                    {t('personalFinance')}
                </p>
                {financeMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link to={item.href}>
                            <SidebarMenuButton isActive={isActive(item.href)} tooltip={item.label} asChild={false}>
                                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                <span
                                    className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        state === "collapsed" ? "opacity-0 w-0" : "opacity-100"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))} */}
                <p
                    className={cn(
                        "px-4 py-2 text-xs font-semibold text-muted-foreground transition-opacity duration-300",
                        state === "collapsed" ? "opacity-0 h-auto" : "opacity-100 h-auto"
                    )}
                >
                    {t('purchases')}
                </p>
                {shoppingMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link to={item.href}>
                            <SidebarMenuButton
                                isActive={isActive(item.href)}
                                tooltip={item.label}
                                asChild={false}
                            >
                                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                {state === "collapsed" ? null : (
                                    <span
                                        className={cn(
                                            "transition-all duration-300 ease-in-out",
                                            "opacity-100"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
                {/* <p
                    className={cn(
                        "px-4 py-2 text-xs font-semibold text-muted-foreground transition-opacity duration-300",
                        state === "collapsed" ? "opacity-0 h-auto" : "opacity-100 h-auto"
                    )}
                >
                    {t('Educational')}
                </p>
                {educationMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link to={item.href}>
                            <SidebarMenuButton isActive={isActive(item.href)} tooltip={item.label} asChild={false}>
                                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                <span
                                    className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        state === "collapsed" ? "opacity-0 w-0" : "opacity-100"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))} */}
            </SidebarMenu>
            <SidebarMenu className="mt-auto">
                <p
                    className={cn(
                        "px-4 py-2 text-xs font-semibold text-muted-foreground transition-opacity duration-300",
                        state === "collapsed" ? "opacity-0 h-auto" : "opacity-100 h-auto"
                    )}
                >
                    {t('settings')}
                </p>
                {settingsMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link to={item.href}>
                            <SidebarMenuButton
                                isActive={isActive(item.href)}
                                tooltip={item.label}
                                asChild={false}
                            >
                                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                {state === "collapsed" ? null : (
                                    <span
                                        className={cn(
                                            "transition-all duration-300 ease-in-out",
                                            "opacity-100"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip={t('signOut')}
                                asChild={false}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
                                {state === "collapsed" ? null : (
                                    <span
                                        className={cn(
                                            "transition-all duration-300 ease-in-out",
                                            "opacity-100"
                                        )}
                                    >
                                        {t('signOut')}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('areYouSureYouWantToSignOut')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('youWillBeRedirectedToTheHomePage')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <LoadingButton 
                                    onClick={handleSignOut} 
                                    loading={logoutOperation.isLoading}
                                    disabled={logoutOperation.isLoading}
                                >
                                    {t('yesSignOut')}
                                </LoadingButton>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {isAdmin && (
                    <>
                        <p
                            className={cn(
                                "px-4 py-2 text-xs font-semibold text-muted-foreground transition-opacity duration-300",
                                state === "collapsed" ? "opacity-0 h-0" : "opacity-100 h-auto"
                            )}
                        >
                            {t('administration')}
                        </p>
                        {adminMenuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link to={item.href}>
                                    <SidebarMenuButton
                                        isActive={isActive(item.href)}
                                        tooltip={item.label}
                                        asChild={false}
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                                        {state === "collapsed" ? null : (
                                            <span
                                                className={cn(
                                                    "transition-all duration-300 ease-in-out",
                                                    "opacity-100"
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        )}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </>
                )}
            </SidebarMenu>
        </SidebarContent>
    );
}
