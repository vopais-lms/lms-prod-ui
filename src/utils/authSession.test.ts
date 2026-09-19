import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    canUseFormulaExpression,
    clearSession,
    getStoredProfileApiLabel,
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
