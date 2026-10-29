/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/shop', destination: '/shop.html' },
        { source: '/about', destination: '/about.html' },
        { source: '/contact', destination: '/contact.html' },
        { source: '/account', destination: '/account.html' },
        { source: '/checkout', destination: '/checkout.html' },
        { source: '/order-status', destination: '/order-status.html' },
        { source: '/product', destination: '/product.html' },
        { source: '/nimda', destination: '/nimda.html' },
        { source: '/nimda-login', destination: '/nimda-login.html' },
        { source: '/privacy', destination: '/privacy.html' },
        { source: '/terms', destination: '/terms.html' },
        { source: '/shipping-policy', destination: '/shipping-policy.html' },
        { source: '/sitemap', destination: '/sitemap.html' },
        { source: '/yearsbeer', destination: '/yearsbeer.html' }
      ],
      afterFiles: [],
      fallback: [
        { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' }
      ]
    };
  }
};

export default nextConfig;
