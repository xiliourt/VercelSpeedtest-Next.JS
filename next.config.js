
module.exports = {
  async headers() {
    return [
        {
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                {
                    key: "Access-Control-Allow-Origin",
                    value: (req) => {
                        const allowedOrigins = ["https://js.vercel.dyl.ovh", "https://js.render.dyl.ovh", "https://js.aws.dyl.ovh", "https://js.syd.dyl.ovh", "http://js.syd.dyl.ovh" ];
                        const origin = req.headers.origin;
                        if (allowedOrigins.includes(origin)) {
                            return origin;
                        }
                        return "https://default.com"; // Or deny the request
                    },
                },
                { key: "Access-Control-Allow-Headers", value: "Content-Type"},
            ],
        },
    ];
  }
}

