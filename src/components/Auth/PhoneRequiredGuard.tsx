'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from '@/i18n/navigation';
import { get } from '@/lib/fetcher';
import { useHasAuthToken } from '@/lib/auth-token';
import { COMPLETE_PHONE_PAGE_ENABLED, completePhoneHref, needsVerifiedPhone } from '@/lib/auth-session';
import type { ProfileResponse } from '@/lib/hooks/useProfile';
import { PHONE_PROMPT_SKIPPED_KEY } from './CompletePhoneClient';

// Screens that are part of signing in / verifying — never redirect away from them.
const EXEMPT = ['/complete-phone', '/verify-otp', '/login', '/register', '/forgot-password', '/reset-password'];
// Follows the page switch: while the page is hidden, nobody is prompted.
const PHONE_PROMPT_ENABLED = COMPLETE_PHONE_PAGE_ENABLED;

const matches = (path: string, list: string[]) => list.some(r => path === r || path.startsWith(`${r}/`));

function promptSkipped(): boolean {
    try { return window.sessionStorage.getItem(PHONE_PROMPT_SKIPPED_KEY) === '1'; } catch { return false; }
}

/**
 * Accounts with `needs_phone` (Google sign-ups) are asked for a phone right after signing in.
 * "Later" skips it for this visit; the checkout asks again if the store requires it.
 */
export default function PhoneRequiredGuard() {
    const loggedIn = useHasAuthToken();
    const pathname = usePathname(); // without the locale prefix
    const router = useRouter();
    // Same query as useProfile — shares its cache, no extra request.
    const { data } = useQuery({
        queryKey: ['profile'],
        queryFn: () => get<ProfileResponse>('/user/auth/profile'),
        enabled: PHONE_PROMPT_ENABLED && loggedIn,
        staleTime: 1000 * 60 * 5,
    });
    const user = data?.data;

    useEffect(() => {
        if (!PHONE_PROMPT_ENABLED || !loggedIn || !user || !needsVerifiedPhone(user)) return;
        if (matches(pathname, EXEMPT) || promptSkipped()) return;
        router.replace(completePhoneHref(pathname + window.location.search));
    }, [loggedIn, user, pathname, router]);

    return null;
}
