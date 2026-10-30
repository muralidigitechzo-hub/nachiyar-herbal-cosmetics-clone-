const https = require('https');

https.get('https://www.digitechzo.com/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('Total HTML length:', html.length);
    
    // CSS links
    const cssLinks = [];
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      cssLinks.push(match[1]);
    }
    console.log('CSS links:', cssLinks);

    // Color codes
    const colors = html.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g) || [];
    const freq = {};
    colors.forEach(c => freq[c] = (freq[c] || 0) + 1);
    const topColors = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 30);
    console.log('Top colors:', topColors);

    // CSS variables
    const vars = html.match(/--[a-zA-Z0-9_-]+:\s*[^;]+/g) || [];
    console.log('CSS Variables count:', vars.length);
    console.log('Sample CSS vars:', vars.slice(0, 40));

    // Fonts
    const fonts = html.match(/font-family:[^;>]+/gi) || [];
    console.log('Font families:', [...new Set(fonts)].slice(0, 15));

    // Google fonts link
    const gfonts = html.match(/https:\/\/fonts\.googleapis\.com\/css2?[^"']+/gi) || [];
    console.log('Google Fonts:', gfonts);
  });
}).on('error', (e) => {
  console.error('Fetch error:', e);
});
