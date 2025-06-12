/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // This applies the headers to all routes in your application.
        source: "/:api*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          // NOTE ON CREDENTIALS:
          // If your frontend needs to send credentials (like cookies or authentication headers),
          // you must also set the 'Access-Control-Allow-Credentials' header to 'true'.
          // However, when 'Access-Control-Allow-Credentials' is 'true', you CANNOT use '*' for
          // 'Access-Control-Allow-Origin'. You must specify the exact origin.
          // This is the primary reason why using Middleware is the recommended approach for this scenario.
          // Example (only use with a specific origin, not '*'):
          // {
          //   key: "Access-Control-Allow-Credentials",
          //   value: "true",
          // },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
