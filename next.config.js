/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/path-to-your-images/:path*", // Substitua pelo caminho real das suas imagens
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://static.wikia.nocookie.net",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
