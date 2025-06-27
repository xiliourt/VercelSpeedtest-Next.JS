import Head from 'next/head';
import '../styles/globals.css'; // Import the global styles
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
