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
   typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
