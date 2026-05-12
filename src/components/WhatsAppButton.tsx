"use client";

import { useSettings } from '@/lib/hooks/useSettings';

export default function WhatsAppButton() {
  const { data } = useSettings();
  const whatsapp = data?.data?.contacts?.whatsapp?.value;

  if (!whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 end-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:bg-[#1ebe5d] transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8 fill-white"
      >
        <path d="M16 0C7.164 0 0 7.163 0 16c0 2.825.737 5.476 2.027 7.788L0 32l8.418-2.003A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.267 13.267 0 0 1-6.77-1.847l-.485-.288-5.001 1.19 1.23-4.865-.316-.5A13.234 13.234 0 0 1 2.667 16C2.667 8.637 8.636 2.667 16 2.667S29.333 8.637 29.333 16 23.364 29.333 16 29.333zm7.27-9.815c-.398-.199-2.355-1.162-2.72-1.294-.366-.133-.632-.199-.898.199-.266.398-1.031 1.294-1.264 1.56-.233.266-.465.299-.863.1-.398-.199-1.68-.62-3.2-1.977-1.183-1.056-1.98-2.361-2.213-2.759-.233-.398-.025-.613.175-.811.18-.178.398-.465.597-.698.199-.233.266-.398.398-.664.133-.266.066-.498-.033-.697-.1-.199-.898-2.163-1.23-2.96-.324-.778-.653-.672-.898-.685l-.764-.013c-.266 0-.697.1-1.063.498-.366.398-1.396 1.364-1.396 3.327s1.43 3.858 1.629 4.124c.199.266 2.815 4.298 6.821 6.027.953.412 1.697.657 2.277.841.956.304 1.827.261 2.515.158.767-.114 2.355-.963 2.688-1.893.332-.93.332-1.727.233-1.893-.1-.166-.366-.266-.764-.465z" />
      </svg>
    </a>
  );
}
