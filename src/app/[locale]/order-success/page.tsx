import { Suspense } from 'react';
import OrderSuccessClient from '@/components/Checkout/OrderSuccessClient';

export default function OrderSuccessPage() {
    return (
        <main className="my-7 md:my-10">
            <Suspense fallback={null}>
                <OrderSuccessClient />
            </Suspense>
        </main>
    );
}
