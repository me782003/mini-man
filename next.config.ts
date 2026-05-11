import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.18'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'mini-man.shaarapp.com',
      },
      {
        protocol: 'https',
        hostname: 'mini-man.shaarapp.com',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
