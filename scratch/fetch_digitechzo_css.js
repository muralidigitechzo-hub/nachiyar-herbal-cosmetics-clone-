const https = require('https');

https.get('https://www.digitechzo.com/assets/css/style.css?v=1791452000', (res) => {
  let css = '';
  res.on('data', chunk => css += chunk);
  res.on('end', () => {
    console.log('CSS length:', css.length);
    const rootBlock = css.match(/:root\s*\{[^}]+\}/i);
    if (rootBlock) {
      console.log('Root block:\n', rootBlock[0]);
    } else {
      console.log('No :root block found, showing first 2000 chars:');
      console.log(css.slice(0, 2000));
    }
  });
});
