# Deploy status
![Docker](https://github.com/xiliourt/VercelSpeedtest-Next.JS/actions/workflows/docker.yml/badge.svg)

### Free Deployments
[![Azure](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net%2F&name=Azure)](https://speedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net/)  [![Vercel](https://deploy-badge.vercel.app/vercel/speedtestjs)](https://speedtestjs.vercel.app/)  [![Render Status](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.netlify.app%2F&logo=render&name=Render)](https://renderjsspeedtest.onrender.com/)  [![Netlify Status](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.netlify.app%2F&logo=netlify&name=Netlify)](https://speedtestnextjs.netlify.app)  [![Cloudflare](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.pages.dev%2F&logo=Cloudflare&name=Cloudflare+)](https://speedtestnextjs.pages.dev/)  



# Try it yourself
## Change the server list in /components/servers.js
Change it to your own (IP):3000, or vercel URL. IE:
```
const SERVERS = [{ name: 'Vercel', pingUrl: 'https://<vercelsubDomain>.vercel.app/api/ping', downloadUrl: 'https://<vercelsubDomain>.vercel.app/api/download', uploadUrl: 'https://<vercelsubDomain>.vercel.app/api/upload', maxUpload: '4194304'}]
```

### Via Vercel
Clone and deploy to Vercel for an edge speedtest! Change URLs or add your server in /components/servers.js

Server will be available at the Vercel URL it provides, change the components/servers.js to that URL. IE:
```
const SERVERS = [{ name: 'Vercel', pingUrl: 'https://<vercelsubDomain>.vercel.app/api/ping', downloadUrl: 'https://<vercelsubDomain>.vercel.app/api/download', uploadUrl: 'https://<vercelsubDomain>.vercel.app/api/upload', maxUpload: '4194304'}]
```
## #Via node
```
npm install
npm run build
npm run start
```
server will be available on http://(ip):3000
