/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,

    async headers() {
        return [
            {
                // Shards are requested with ?v=<catalog version>, so a rebuilt catalog busts this cache.
                source: "/json/catalog/:category/:shard",
                headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
            },
        ];
    },
};

module.exports = nextConfig;
