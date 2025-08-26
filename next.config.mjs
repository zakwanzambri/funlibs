import nextIntlPlugin from 'next-intl/plugin';

const withNextIntl = nextIntlPlugin('./i18n.ts');

export default withNextIntl({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: '**'}
    ]
  }
});
