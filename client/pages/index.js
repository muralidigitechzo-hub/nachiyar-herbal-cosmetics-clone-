import fs from 'fs';
import path from 'path';

export default function Home() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.write(html);
      res.end();
      return { props: {} };
    }
  } catch (e) {
    console.error('Error serving index.html:', e);
  }

  res.statusCode = 404;
  res.end('Page not found');
  return { props: {} };
}
