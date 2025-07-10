const SERVERS = [
    { name: 'Azure (Free AppService)', pingUrl: 'https://speedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net/api/ping', downloadUrl: 'https://speedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net/api/download', uploadUrl: 'https://speedjstestdocker-axe7bpawbeewbvaj.australiasoutheast-01.azurewebsites.net/api/upload', maxUpload: '27262976' }, // 26MB
    { name: 'Azure (Free VM AU East)', pingUrl: 'https://js.azure.xiliourt.ovh/api/ping', downloadUrl: 'https://js.azure.xiliourt.ovh/api/download', uploadUrl: 'https://js.azure.xiliourt.ovh/api/upload', maxUpload: '27262976' }, // 26MB
    { name: 'Azure (VM AU No Nginx)', pingUrl: 'http://68.218.3.24:3000/api/ping', downloadUrl: 'http://68.218.3.24:3000/api/download', uploadUrl: 'http://68.218.3.24:3000/api/upload', maxUpload: '27262976' }, // 26MB
    { name: 'Vercel (Edge CDN)', pingUrl: 'https://speedtestjs.vercel.app/api/ping', downloadUrl: 'https://speedtestjs.vercel.app/api/download', uploadUrl: 'https://speedtestjs.vercel.app/api/upload', maxUpload: '4194304'}, //4MB
    { name: 'Render', pingUrl: 'https://renderjsspeedtest.onrender.com/api/ping', downloadUrl: 'https://renderjsspeedtest.onrender.com/api/download', uploadUrl: 'https://renderjsspeedtest.onrender.com/api/upload', maxUpload: '27262976'}, // 26MB
    { name: 'Netlify (CDN)', pingUrl: 'https://speedtestnextjs.netlify.app/api/ping', downloadUrl: 'https://speedtestnextjs.netlify.app/api/download', uploadUrl: 'https://speedtestnextjs.netlify.app/api/upload', maxUpload: '4194304'}, // 4MB
    { name: 'Cloudflare (Global CDN)', pingUrl: 'https://speedtestnextjs.pages.dev/api/ping', downloadUrl: 'https://speedtestnextjs.pages.dev/api/download', uploadUrl: 'https://speedtestnextjs.pages.dev/api/upload', maxUpload: '27262976' } // 26MB
];

module.exports = SERVERS
