import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import type { AppProps } from 'next/app'

export const metadata: Metadata = {
  title: 'Next.js Speedtest',
  description: 'Next.js Multi Host Speedtest',
}

export default function RootLayout({ children,}: {children: React.ReactNode}) {
  return (
 <html>
      <Head>
        {/* Link to Google Fonts for 'Inter'. Place this here for global font availability. */}
        <link
          href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&d>
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
 </html>
  )
}
