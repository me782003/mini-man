import AccountLayoutShell from '@/components/Account/AccountLayoutShell';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-7 md:my-10">
            <AccountLayoutShell>{children}</AccountLayoutShell>
        </div>
    );
}
