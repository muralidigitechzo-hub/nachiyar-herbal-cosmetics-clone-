/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index.html',
        permanent: false
      },
      {
        source: '/shop',
        destination: '/shop.html',
        permanent: false
      },
      {
        source: '/about',
        destination: '/about.html',
        permanent: false
      },
      {
        source: '/contact',
        destination: '/contact.html',
        permanent: false
      },
      {
        source: '/account',
        destination: '/account.html',
        permanent: false
      },
      {
        source: '/checkout',
        destination: '/checkout.html',
        permanent: false
      },
      {
        source: '/order-status',
        destination: '/order-status.html',
        permanent: false
      },
      {
        source: '/product',
        destination: '/product.html',
        permanent: false
      },
      {
        source: '/nimda',
        destination: '/nimda.html',
        permanent: false
      },
      {
        source: '/nimda-login',
        destination: '/nimda-login.html',
        permanent: false
      },
      {
        source: '/privacy',
        destination: '/privacy.html',
        permanent: false
      },
      {
        source: '/terms',
        destination: '/terms.html',
        permanent: false
      },
      {
        source: '/shipping-policy',
        destination: '/shipping-policy.html',
        permanent: false
      },
      {
        source: '/sitemap',
        destination: '/sitemap.html',
        permanent: false
      },
      {
        source: '/yearsbeer',
        destination: '/yearsbeer.html',
        permanent: false
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
