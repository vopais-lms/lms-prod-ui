import { authApi } from '../apis/auth';
import { mapMenuLinkToRoute } from '../components/main-app/original/sidebar';
import type { LoginResponse, MenuItem } from '../apis/types';

const MENU_ITEMS_KEY = 'menu_items';
const PROFILE_API_LABEL_KEY = 'profile_api_label';
export const SUPPORT_PROFILE_API_LABEL = 'support';

export const storeTokens = (tokens: LoginResponse) => {
    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    if (tokens.profile_api_label) {
        localStorage.setItem(PROFILE_API_LABEL_KEY, tokens.profile_api_label);
    } else {
        localStorage.removeItem(PROFILE_API_LABEL_KEY);
    }
};

export const getStoredRefreshToken = (): string | null =>
    localStorage.getItem('refresh_token');

export const getStoredProfileApiLabel = (): string | null =>
    localStorage.getItem(PROFILE_API_LABEL_KEY);

export const isSupportProfile = (apiLabel: string | null | undefined): boolean =>
    (apiLabel ?? '').toLowerCase() === SUPPORT_PROFILE_API_LABEL;

export const canUseFormulaExpression = (): boolean =>
    isSupportProfile(getStoredProfileApiLabel());

export const clearSession = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(MENU_ITEMS_KEY);
    localStorage.removeItem(PROFILE_API_LABEL_KEY);
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

export const customerAuthHeaders = (): Record<string, string> => {
    const tenantEid = import.meta.env.VITE_TENANT_EID;
    return tenantEid ? { 'X-Tenant-Eid': tenantEid } : {};
};
