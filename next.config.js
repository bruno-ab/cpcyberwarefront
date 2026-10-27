/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/mural',
        destination: '/memorial',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
      'http://localhost:4444';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/path-to-your-images/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://static.wikia.nocookie.net",
          },
        ],
      },
      {
        source: "/(.*)", // Correspondendo a todas as rotas
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://cyberpunk-api-262d98a845d6.herokuapp.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }];
    return config;
  },
};

module.exports = nextConfig;
