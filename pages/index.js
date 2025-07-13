import HomePage from './HomePage'

export const metadata = {
    title: 'Next.JS Speedtest Deployment | Xiliourt Web Design',
    description: 'A Next.Js based speedtest deployed to providers including Vercel, Azure, Cloudflare and others',
    icons: { icon: '/icon.png', },
    author: 'Xiliourt Web Design, https://xiliourt.ovh',
    copyright: 'MIT License - available at https://github.com/xiliourt/VercelSpeedtest-Next.JS/',
    'original-source': 'https://github.com/xiliourt/VercelSpeedtest-Next.JS/',
    keywords: ['speedtest', 'next.js speedtest', 'vercel vs cloudflare', 'best next.js host'],
    openGraph: {
        title: 'Next.JS Speedtest Deployment',
        description: 'A Next.Js based speedtest deployed to multiple hosts',
        url: 'https://speedtestjs.vercel.app/',
        images: [ { url: 'https://speedtestjs.vercel.app/icon.png', width: 1024, height: 1024, alt: 'Speedtest Logo' } ],
        logo: 'https://scales.ovh/icon.png',
        type: 'website'
    },
    twitter: {
        title: 'Next.JS Speedtest Deployment',
        description: 'A Next.Js based speedtest deployed to multiple hostss',
        images: ['https://speedtestjs.vercel.app/icon.png'],
    },
};

export default function Page() {return (<HomePage />)}
