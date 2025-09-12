import { SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLingui } from '@lingui/react/macro';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartColumn,
    faCog,
    faList,
    faMicroscope,
    faPlusCircle,
    faShield,
    faShieldHalved,
    faShoppingBasket,
    faUsers,
    faSignOutAlt,
    faUser,
    faUserGroup,
    faPlus,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faFileLines, faMessage } from "@fortawesome/free-regular-svg-icons";
import { apiService } from "@/services/api";

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
import { Button } from "@/components/md3/button";
import { trackEvent } from "@/services/analytics-service";
import { Link, useRouter } from "@tanstack/react-router";

export function MainNav() {
    const router = useRouter();
    const { profile, reloadUser } = useAuth();
    const { t } = useLingui();
    const isAdmin = profile?.isAdmin || false;
    const { state } = useSidebar();

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
        { href: "/investments", label: t`Investments`, icon: faChartColumn },
        { href: "/budgets", label: t`Budgets`, icon: faFileLines },
        { href: "/credit-cards", label: t`Credit Cards`, icon: faFileLines },
        { href: "/bank", label: t`Bank`, icon: faFileLines },
    ];

    // Top menu: put Insights first so it's the primary entry point
    const topMenu = [
        { href: "/home", label: t`Insights`, icon: faChartColumn },
        // { href: "/goals", label: t`Goals`, icon: faFileLines },
        // { href: "/achievements", label: t`Achievements`, icon: faUsers },
        // { href: "/projections", label: t`Projections`, icon: faChartColumn },
    ];

    // Shopping related
    const shoppingMenu = [
        { href: "/list", label: t`Shopping List`, icon: faList },
        { href: "/purchases", label: t`Add Purchase`, icon: faShoppingBasket },
    ];

    const educationMenu = [
        { href: "/education", label: t`Education`, icon: faFileLines },
    ];

    const settingsMenuItems = [
        { href: "/family", label: t`Family`, icon: faUserGroup },
        { href: "/settings", label: t`My Account`, icon: faUser },
    ];

    const adminMenuItems = [
        { href: "/admin", label: t`Admin Dashboard`, icon: faShieldHalved },
        { href: "/admin/users", label: t`Manage Users`, icon: faUsers },
        { href: "/admin/reports", label: t`Usage Reports`, icon: faChartColumn },
        { href: "/admin/market-insights", label: t`Market Insights`, icon: faShoppingBasket },
        { href: "/admin/settings", label: t`Global Settings`, icon: faCog },
        { href: "/admin/notifications", label: t`Manage Notifications`, icon: faMessage },
        { href: "/admin/audit", label: t`Audit & Tests`, icon: faMicroscope },
        { href: "/admin/security", label: t`Security`, icon: faShield },
        { href: "/admin/logs", label: t`System Logs`, icon: faFileLines },
    ];

    const handleSignOut = async () => {
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
                                    {t`Manual Entry`}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/purchases" className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                                    {t`Scan Receipt`}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/list" className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                                    {t`Shopping List`}
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
                                <span className="ml-2 font-medium">{t`Add Purchase`}</span>
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
                                        {t`Manual Entry`}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/purchases" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                                        {t`Scan Receipt`}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/list" className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                                        {t`Shopping List`}
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
                    {t`Personal Finance`}
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
                    {t`Purchases`}
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
                    {t`Educacional`}
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
                    {t`Settings`}
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
                                tooltip={t`Sair`}
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
                                        {t`Sign out`}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t`Are you sure you want to sign out?`}</AlertDialogTitle>
                            <AlertDialogDescription>{t`You will be redirected to the home page.`}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button onClick={handleSignOut}>{t`Yes, sign out`}</Button>
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
                            {t`Administration`}
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
