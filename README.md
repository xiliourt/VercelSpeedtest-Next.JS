# Deploy status
![Docker](https://github.com/xiliourt/VercelSpeedtest-Next.JS/actions/workflows/docker.yml/badge.svg)

### Free Deployments
[![Azure](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net%2F&name=Azure)](https://speedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net/)  [![Vercel](https://deploy-badge.vercel.app/vercel/speedtestjs)](https://speedtestjs.vercel.app/)  [![Render Status](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.netlify.app%2F&logo=render&name=Render)](https://renderjsspeedtest.onrender.com/)  [![Netlify Status](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.netlify.app%2F&logo=netlify&name=Netlify)](https://speedtestnextjs.netlify.app)  [![Cloudflare](https://deploy-badge.vercel.app/?url=https%3A%2F%2Fspeedtestnextjs.pages.dev%2F&logo=Cloudflare&name=Cloudflare+)](https://speedtestnextjs.pages.dev/)  


# Try it yourself
### Via Vercel / Cloudflare
Clone and deploy to Vercel / Cloudflare for an edge  CDNspeedtest! It'll auto set maximum upload to 10MB for CF or 4MB anywhere else.
The servers table will auto populate with only the server you're connecting to, unlesss SERVERS_JSON is set. Set the environment variable if you have multiple deployments.

### Via Docker 
Server will be available on http://(externaIP):3000 and will default to listing only that server with a 4MB upload limit, unless JSON_SERVERS variable is set.
```
services:
  speed:
    container_name: speed
    image: ghcr.io/xiliourt/speedjs:latest
    restart: unless-stopped
    ports:
      - 3000:3000
```
**Optional:** Add environment for multiple servers (add the below to docker-compose.yml)
```
    environment:
      SERVERS_JSON: |
        [
            {
                "name": "Server 1",
                "serverUrl": "https://acme1.com",
            },
            {
                "name": "Server 2",
                "serverUrl": "https://acme2.com",
                "maxUpload": "27262976"
            }
        ]
```

### Standalone package via node
Download the [latest](https://github.com/xiliourt/VercelSpeedtest-Next.JS/releases/tag/latest) release from the repo and unzip it

Optional: (required for multiple servers) set JSON_SERVERS variable
```
node server.js
```
server will be available on http://(externaIP):3000

Example settings JSON_SERVERS (use export JSON_SERVERs='(the below') on Linux, etc)
*(Note if maxUpload isn't set, it'll default to the 10MB value. If no JSON servers are listed, only the URL you're connecting via will be tested)*
```
[
  {
    "name": "Server 1",
    "serverUrl": "https://(externalIP):3000
  },
  {
    "name": "Server 2",
    "serverUrl": "https://(externalIP):3000
    "maxUpload": "4194304"
  }
]
```
