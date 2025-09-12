export interface Notification {
    id: string;
    title: string;
    description: string;
    createdAt: Date | string;
    read: boolean;
    type: "suggestion" | "alert" | "info";
}
