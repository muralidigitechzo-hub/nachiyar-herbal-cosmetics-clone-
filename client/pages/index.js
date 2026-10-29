import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Nachiyar Herbals & Cosmetics</title>
        <meta httpEquiv="refresh" content="0;url=/index.html" />
      </Head>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace('/index.html');`
        }}
      />
    </>
  );
}
