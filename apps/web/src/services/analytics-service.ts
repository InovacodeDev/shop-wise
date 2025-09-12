'use client';

type AnalyticsEvent =
    | 'login'
    | 'sign_up'
    | 'user_logged_out'
    | 'purchase_saved'
    | 'purchase_deleted'
    | 'purchase_items_updated'
    | 'shopping_list_item_added'
    | 'shopping_list_ai_suggestion_requested'
    | 'consumption_analysis_requested'
    | 'profile_updated'
    | 'preferences_updated'
    | 'plan_changed'
    | 'open_price_comparison_modal'
    | 'screen_view';

let analyticsAvailable = false;
let logEventFn: ((event: string, props?: Record<string, any>) => void) | null = null;
let setUserIdFn: ((id: string | null) => void) | null = null;

export const trackEvent = (_eventName: AnalyticsEvent, _properties?: Record<string, any>) => {
    // intentionally no-op
};

export const identifyUser = (_userId: string) => {
    // intentionally no-op
};

export const clearUserIdentity = () => {
    // intentionally no-op
};
