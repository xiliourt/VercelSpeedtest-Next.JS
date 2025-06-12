module.exports = {
  async headers() {
    return [
      {
        source: '/:api*',
        headers: [
          {
            key: 'access-control-allow-credentials',
            value: 'true',
          },
          {
            key: 'access-control-allow-headers',
            value: 'Content-Type',
          },
          {
            key: "Access-Control-Allow-Origin",
            value: (req) => {
              const allowedOrigins = ["https://js.vercel.dyl.ovh", "https://js.render.dyl.ovh", "https://js.aws.dyl.ovh", "https://js.syd.dyl.ovh", "http://js.syd.dyl.ovh" ];
              const origin = req.headers.origin;
              if (allowedOrigins.includes(origin)) {
                return origin;
            }
              return "https://js.vercel.dyl.ovh"
          }, 
        ],
    },
    ];
  },
};
