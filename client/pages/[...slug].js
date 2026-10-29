import fs from 'fs';
import path from 'path';

export default function CatchAll() {
  return null;
}

export async function getServerSideProps({ params, res }) {
  try {
    const slugParts = params?.slug || [];
    const joinedSlug = slugParts.join('/');
    // Check if filename has .html or without .html
    const targetName = joinedSlug.endsWith('.html') ? joinedSlug : `${joinedSlug}.html`;
    const filePath = path.join(process.cwd(), 'public', targetName);

    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.write(html);
      res.end();
      return { props: {} };
    }
  } catch (e) {
    console.error('Error serving page:', e);
  }

  res.statusCode = 404;
  res.end('Page not found');
  return { props: {} };
}
