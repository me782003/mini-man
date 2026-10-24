'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Contacts } from '@/lib/hooks/useSettings';

/** Emails, phones and WhatsApp from the store settings — renders nothing when they're all empty. */
export default function ContactList({ contacts, className = 'flex flex-col gap-3' }: { contacts?: Contacts; className?: string }) {
    const t = useTranslations('Site');
    const emails = contacts?.emails?.filter(e => e.value) ?? [];
    const phones = contacts?.phone?.filter(p => p.value) ?? [];
    const whatsapp = contacts?.whatsapp?.value;

    if (emails.length === 0 && phones.length === 0 && !whatsapp) return null;

    return (
        <ul className={className}>
            {emails.map((e) => (
                <li key={e.value}>
                    <a href={`mailto:${e.value}`} className="inline-flex items-center gap-2 hover:underline">
                        <Mail size={16} className="shrink-0" aria-hidden />
                        <span dir="ltr">{e.value}</span>
                    </a>
                </li>
            ))}
            {phones.map((p) => (
                <li key={p.value}>
                    {/* Spaces removed in the link only; the number shows as entered, left-to-right even in Arabic. */}
                    <a href={`tel:${p.value.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:underline">
                        <Phone size={16} className="shrink-0" aria-hidden />
                        <span dir="ltr">{p.value}</span>
                    </a>
                </li>
            ))}
            {whatsapp && (
                <li>
                    <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 hover:underline"
                    >
                        <MessageCircle size={16} className="shrink-0" aria-hidden />
                        <span>{t('whatsapp')}</span>
                    </a>
                </li>
            )}
        </ul>
    );
}
