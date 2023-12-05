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
       {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
        }
    ];
  },
   typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
