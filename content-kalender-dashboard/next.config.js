/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Notion embeds the dashboard in an <iframe>. By default many hosts send
  // X-Frame-Options: DENY, which blocks that. This CSP explicitly allows
  // Notion to frame the page. Widen or narrow the list of origins as needed.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.notion.so https://*.notion.site;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
