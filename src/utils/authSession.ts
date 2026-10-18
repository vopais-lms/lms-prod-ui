import { authApi } from '../apis/auth';
import { mapMenuLinkToRoute } from '../components/main-app/original/sidebar';
import type { LoginResponse, MenuItem } from '../apis/types';

const MENU_ITEMS_KEY = 'menu_items';
const PROFILE_API_LABEL_KEY = 'profile_api_label';
const FIRST_TIME_LOGIN_KEY = 'first_time_login';
const USER_DISPLAY_NAME_KEY = 'user_display_name';
const CUSTOMER_EID_KEY = 'customer_eid';
const CUSTOMER_PENDING_ACTIVATION_KEY = 'customer_pending_activation';

export const formatLoginDisplayName = (
    firstName?: string | null,
    lastName?: string | null,
): string =>
    [firstName, lastName]
        .map((part) => (part ?? '').trim())
        .filter((part) => part.length > 0)
        .join(' ');
export const SUPPORT_PROFILE_API_LABEL = 'support';
export const CUSTOMER_PROFILE_API_LABEL = 'customer';
export const CUSTOMER_DETAILS_ROUTE = '/customer-details';

export const storeTokens = (tokens: LoginResponse) => {
    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    if (tokens.profile_api_label) {
        localStorage.setItem(PROFILE_API_LABEL_KEY, tokens.profile_api_label);
    } else {
        localStorage.removeItem(PROFILE_API_LABEL_KEY);
    }
    if (tokens.first_time_login === true) {
        localStorage.setItem(FIRST_TIME_LOGIN_KEY, 'true');
    } else if (tokens.first_time_login === false) {
        localStorage.removeItem(FIRST_TIME_LOGIN_KEY);
    }
    if (tokens.first_name !== undefined || tokens.last_name !== undefined) {
        const displayName = formatLoginDisplayName(tokens.first_name, tokens.last_name);
        if (displayName) {
            localStorage.setItem(USER_DISPLAY_NAME_KEY, displayName);
        } else {
            localStorage.removeItem(USER_DISPLAY_NAME_KEY);
        }
    }
    if (tokens.is_active === false) {
        localStorage.setItem(CUSTOMER_PENDING_ACTIVATION_KEY, 'true');
    } else if (tokens.is_active === true) {
        localStorage.removeItem(CUSTOMER_PENDING_ACTIVATION_KEY);
    }
    if (tokens.customer_eid) {
        localStorage.setItem(CUSTOMER_EID_KEY, tokens.customer_eid);
    }
};

export const getStoredRefreshToken = (): string | null =>
    localStorage.getItem('refresh_token');

export const getStoredProfileApiLabel = (): string | null =>
    localStorage.getItem(PROFILE_API_LABEL_KEY);

export const isSupportProfile = (apiLabel: string | null | undefined): boolean =>
    (apiLabel ?? '').toLowerCase() === SUPPORT_PROFILE_API_LABEL;

export const isCustomerProfile = (apiLabel?: string | null): boolean =>
    (apiLabel ?? getStoredProfileApiLabel() ?? '').toLowerCase() === CUSTOMER_PROFILE_API_LABEL;

export const canUseFormulaExpression = (): boolean =>
    isSupportProfile(getStoredProfileApiLabel());

export const isFirstTimeLogin = (): boolean =>
    localStorage.getItem(FIRST_TIME_LOGIN_KEY) === 'true';

export const isCustomerPendingActivation = (): boolean =>
    localStorage.getItem(CUSTOMER_PENDING_ACTIVATION_KEY) === 'true';

export const getStoredCustomerEid = (): string | null =>
    localStorage.getItem(CUSTOMER_EID_KEY);

export const markCustomerActivated = () => {
    localStorage.removeItem(CUSTOMER_PENDING_ACTIVATION_KEY);
};

export const getStoredDisplayName = (): string =>
    localStorage.getItem(USER_DISPLAY_NAME_KEY) ?? '';

export const clearSession = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(MENU_ITEMS_KEY);
    localStorage.removeItem(PROFILE_API_LABEL_KEY);
    localStorage.removeItem(FIRST_TIME_LOGIN_KEY);
    localStorage.removeItem(USER_DISPLAY_NAME_KEY);
    localStorage.removeItem(CUSTOMER_EID_KEY);
    localStorage.removeItem(CUSTOMER_PENDING_ACTIVATION_KEY);
};

export const getStoredMenuItems = (): MenuItem[] => {
    const raw = localStorage.getItem(MENU_ITEMS_KEY);
    if (!raw) return [];

    try {
        return JSON.parse(raw) as MenuItem[];
    } catch {
        return [];
    }
};

export const fetchAndStoreMenuItems = async (): Promise<MenuItem[]> => {
    const res = await authApi.getMenuItems();
    localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(res.data));
    return res.data;
};

export const completeLogin = async (tokens: LoginResponse): Promise<MenuItem[]> => {
    storeTokens(tokens);
    return fetchAndStoreMenuItems();
};

export const getDefaultAppRoute = (items: MenuItem[]): string => {
    if (items.length === 0) return '/workqueue';
    return mapMenuLinkToRoute(items[0].link);
};

export const getPostLoginRoute = (
    items: MenuItem[],
    profileApiLabel?: string | null,
): string => {
    if (isCustomerProfile(profileApiLabel)) return CUSTOMER_DETAILS_ROUTE;
    return getDefaultAppRoute(items);
};

export const customerAuthHeaders = (
    linkedPhoneNumber?: string,
): Record<string, string> => {
    const headers: Record<string, string> = {};
    const tenantEid = import.meta.env.VITE_TENANT_EID;
    if (tenantEid) headers['X-Tenant-Eid'] = tenantEid;
    const phone = linkedPhoneNumber?.trim();
    if (phone) headers['X-Linked-Phone-Number'] = phone;
    return headers;
};
