import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    canUseFormulaExpression,
    clearSession,
    customerAuthHeaders,
    formatLoginDisplayName,
    getStoredCustomerEid,
    getStoredDisplayName,
    isCustomerPendingActivation,
    markCustomerActivated,
    getStoredProfileApiLabel,
    isFirstTimeLogin,
    isSupportProfile,
    storeTokens,
} from './authSession';

vi.mock('../apis/auth', () => ({
    authApi: {
        getMenuItems: vi.fn(),
    },
}));

describe('isSupportProfile', () => {
    it('accepts support regardless of case', () => {
        expect(isSupportProfile('support')).toBe(true);
        expect(isSupportProfile('Support')).toBe(true);
        expect(isSupportProfile('SUPPORT')).toBe(true);
    });

    it('rejects other profiles and empty values', () => {
        expect(isSupportProfile('admin')).toBe(false);
        expect(isSupportProfile('employee')).toBe(false);
        expect(isSupportProfile('customer')).toBe(false);
        expect(isSupportProfile('')).toBe(false);
        expect(isSupportProfile(null)).toBe(false);
        expect(isSupportProfile(undefined)).toBe(false);
    });
});

describe('authSession profile_api_label', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('stores profile_api_label with tokens', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            profile_api_label: 'support',
        });
        expect(getStoredProfileApiLabel()).toBe('support');
        expect(canUseFormulaExpression()).toBe(true);
    });

    it('does not treat admin as able to use formula expressions', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            profile_api_label: 'admin',
        });
        expect(getStoredProfileApiLabel()).toBe('admin');
        expect(canUseFormulaExpression()).toBe(false);
    });

    it('clears a previous profile label when the token payload omits it', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            profile_api_label: 'support',
        });
        storeTokens({
            access_token: 'a2',
            refresh_token: 'r2',
        });
        expect(getStoredProfileApiLabel()).toBeNull();
        expect(canUseFormulaExpression()).toBe(false);
    });

    it('strips the ends of the login name and stores the display name', () => {
        expect(formatLoginDisplayName('  Admin  ', '  User  ')).toBe('Admin User');
        expect(formatLoginDisplayName('  Admin  ', '   ')).toBe('Admin');
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            first_name: '  Admin  ',
            last_name: '  ',
        });
        expect(getStoredDisplayName()).toBe('Admin');
        clearSession();
        expect(getStoredDisplayName()).toBe('');
    });

    it('stores first_time_login and clears it on logout', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            profile_api_label: 'admin',
            first_time_login: true,
        });
        expect(isFirstTimeLogin()).toBe(true);
        clearSession();
        expect(isFirstTimeLogin()).toBe(false);
    });

    it('leaves a stored first-time flag when a later token payload omits it', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            first_time_login: true,
        });
        storeTokens({
            access_token: 'a2',
            refresh_token: 'r2',
        });
        expect(isFirstTimeLogin()).toBe(true);
    });

    it('removes profile_api_label on logout', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            profile_api_label: 'support',
        });
        clearSession();
        expect(getStoredProfileApiLabel()).toBeNull();
        expect(canUseFormulaExpression()).toBe(false);
    });
});

describe('inactive customer session', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('keeps the customer eid until both verification OTPs activate the account', () => {
        storeTokens({
            access_token: 'a',
            refresh_token: 'r',
            is_active: false,
            customer_eid: '5176DA0EF087',
        });
        expect(isCustomerPendingActivation()).toBe(true);
        expect(getStoredCustomerEid()).toBe('5176DA0EF087');

        markCustomerActivated();
        expect(isCustomerPendingActivation()).toBe(false);
        expect(getStoredCustomerEid()).toBe('5176DA0EF087');
    });
});

describe('customerAuthHeaders', () => {
    it('sends the trimmed phone on X-Linked-Phone-Number', () => {
        expect(customerAuthHeaders('  7219612108  ')['X-Linked-Phone-Number']).toBe(
            '7219612108',
        );
    });

    it('omits the phone header when no number is given', () => {
        expect(customerAuthHeaders()['X-Linked-Phone-Number']).toBeUndefined();
    });
});
