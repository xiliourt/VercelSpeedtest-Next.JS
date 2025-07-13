import Head from 'next/head';
import '../styles/globals.css'
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
	    <title>Next.JS Speedtest Deployment | Xiliourt Web Design</title>
	    <meta name="description" content="A Next.Js based speedtest deployed to providers including Vercel, Azure, Cloudflare and others" />
	    <link rel="icon" href="/icon.png" />
	    <meta name="keywords" content="speedtest, next.js speedtest, vercel vs cloudflare, best next.js host" />
	    <meta name="author" content="Xiliourt Web Design, https://xiliourt.ovh" />
	    <meta name="copyright" content="MIT License - available at https://github.com/xiliourt/VercelSpeedtest-Next.JS/" />
	    <meta name="original-source" content="https://github.com/xiliourt/VercelSpeedtest-Next.JS/" />
	    <meta property="og:title" content="Next.JS Speedtest Deployment" />
	    <meta property="og:description" content="A Next.Js based speedtest deployed to multiple hosts" />
	    <meta property="og:type" content="website" />
	    <meta property="og:url" content="https://speedtestjs.vercel.app/" />
	    <meta property="og:image" content="https://speedtestjs.vercel.app/icon.png" />
	    <meta property="og:image:width" content="1024" />
	    <meta property="og:image:height" content="1024" />
	    <meta property="og:image:alt" content="Speedtest Logo" />
	    <meta property="og:logo" content="https://speedtestjs.vercel.app/icon.png" />
	    <meta name="twitter:card" content="summary_large_image" />
	    <meta name="twitter:title" content="Next.JS Speedtest Deployment" />
	    <meta name="twitter:description" content="A Next.Js based speedtest deployed to multiple hostss" />
	    <meta name="twitter:image" content="https://speedtestjs.vercel.app/icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
