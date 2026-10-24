import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';
import type { Branch } from '@/lib/hooks/useSettings';
import { useLocale } from 'next-intl';

interface BranchesResponse {
    data: Branch[];
    message: string;
}

export function useBranches() {
    const locale = useLocale();
    return useQuery({
        // Names and addresses are translated — one cache entry per language.
        queryKey: ['branches', locale],
        queryFn: () => get<BranchesResponse>('/user/pages/branches'),
        staleTime: 10 * 60 * 1000,
    });
}
