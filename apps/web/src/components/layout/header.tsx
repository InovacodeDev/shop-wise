import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShopWiseLogo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/md3/button";

import type { Notification } from "@/lib/types";
import { NotificationPopover } from "./notification-popover";
import { ShoppingListPopover } from "./shopping-list-popover";
import { useLingui } from '@lingui/react/macro';
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export function Header() {
    const { t } = useLingui();
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!profile?.familyId) return;

        // Fetch notifications from API
        const fetchNotifications = async () => {
            try {
                // const notifs = await apiService.getNotifications(profile.familyId!);
                // setNotifications(notifs);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        // Poll for notifications every 30 seconds
        const intervalId = setInterval(fetchNotifications, 30000);

        return () => clearInterval(intervalId);
    }, [profile]);

    const unreadNotifications = notifications.filter((n) => !n.read);

    const markAllAsRead = async () => {
        if (!profile?.familyId || unreadNotifications.length === 0) return;

        try {
            // Mark all notifications as read via API
            await apiService.markAllNotificationsAsRead(profile.familyId!);

            // Update local state
            setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 h-16",
            "bg-surface-container transition-all duration-300 ease-in-out"
        )}>
            <div className="flex h-full items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <SidebarTrigger
                        className={cn(
                            "h-10 w-10 shrink-0",
                            "hover:bg-on-surface/8 active:bg-on-surface/12",
                            "rounded-full transition-colors duration-200"
                        )}
                    />

                    <div className="flex items-center gap-3">
                        <ShopWiseLogo className="h-8 w-auto" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ShoppingListPopover />

                    {notifications.length > 0 && (
                        <NotificationPopover
                            notifications={notifications}
                            unreadCount={unreadNotifications.length}
                            onMarkAllAsRead={markAllAsRead}
                        />
                    )}
                </div>
            </div>
        </header>
    );
}
