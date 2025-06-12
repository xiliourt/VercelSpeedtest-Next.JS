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
            key: 'access-control-allow-origin',
            value: 'js.aws.dyl.ovh, js.render.dyl.ovh, js.vercel.dyl.ovh, js.syd.dyl.ovh,
          },
      
        ],
    },
    ];
  },
};
