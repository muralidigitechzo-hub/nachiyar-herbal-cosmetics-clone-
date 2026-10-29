const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'app.js');
let app = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

const oldFavBlock = `    // Dynamic Browser Tab Favicon
    const rawFavicon = settings.brand?.favicon || settings.faviconUrl || '';
    const isExternalFavicon = rawFavicon.includes('unsplash.com') || rawFavicon.includes('nachiyar-logo') || rawFavicon.includes('technova-logo');
    const faviconHref = (rawFavicon && !isExternalFavicon) ? rawFavicon : '/favicon.png';
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => {
      el.href = faviconHref;
    });`;

const newFavBlock = `    // Dynamic Browser Tab Favicon (re-attach to force instant browser cache refresh)
    const rawFavicon = settings.brand?.favicon || settings.faviconUrl || '';
    const isExternalFavicon = rawFavicon.includes('unsplash.com') || rawFavicon.includes('nachiyar-logo') || rawFavicon.includes('technova-logo');
    const cleanFavicon = (rawFavicon && !isExternalFavicon) ? rawFavicon : '/favicon.png';
    const cacheBustedFavicon = cleanFavicon + (cleanFavicon.includes('?') ? '&' : '?') + 'v=2';
    
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    ['icon', 'shortcut icon', 'apple-touch-icon'].forEach(rel => {
      const link = document.createElement('link');
      link.rel = rel;
      link.type = 'image/png';
      link.href = cacheBustedFavicon;
      document.head.appendChild(link);
    });`;

if (app.includes(oldFavBlock)) {
  app = app.replace(oldFavBlock, newFavBlock);
  fs.writeFileSync(appPath, app.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated app.js favicon logic');
} else {
  console.log('oldFavBlock not matched');
}
