const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update nimda.html
const nimdaPath = path.join(rootDir, 'nimda.html');
let nimdaHtml = fs.readFileSync(nimdaPath, 'utf8');
nimdaHtml = nimdaHtml.replace(
  /const token = localStorage\.getItem\('[^']*admin_token'\);/g,
  `const token = localStorage.getItem('store_admin_token') || localStorage.getItem('nachiyar_admin_token') || localStorage.getItem('admin_token') || (document.cookie.match(/(?:store_admin_token|nachiyar_admin_token|admin_token)=([^;]+)/) || [])[1];`
);
fs.writeFileSync(nimdaPath, nimdaHtml, 'utf8');
console.log('Updated nimda.html auth check');

// 2. Update nimda-login.html
const loginPath = path.join(rootDir, 'nimda-login.html');
let loginHtml = fs.readFileSync(loginPath, 'utf8');

// Replace storage set in login res.ok
loginHtml = loginHtml.replace(
  /localStorage\.setItem\('[^']*admin_token', data\.token\);[\s\S]*?document\.cookie = `[^`]*admin_token=\${data\.token}[^`]*`;/g,
  `localStorage.setItem('store_admin_token', data.token);
            localStorage.setItem('nachiyar_admin_token', data.token);
            localStorage.setItem('store_admin_user', JSON.stringify(data.user));
            localStorage.setItem('nachiyar_admin_user', JSON.stringify(data.user));
            localStorage.removeItem('admin_active_tab');
            localStorage.setItem('admin_active_tab', 'dashboard');
            document.cookie = 'store_admin_token=' + data.token + '; path=/; max-age=86400; SameSite=Lax';
            document.cookie = 'nachiyar_admin_token=' + data.token + '; path=/; max-age=86400; SameSite=Lax';`
);

// Replace fallback local staff login token sets
loginHtml = loginHtml.replace(
  /localStorage\.setItem\('[^']*admin_token', fallbackToken\);[\s\S]*?document\.cookie = `[^`]*admin_token=\${fallbackToken}[^`]*`;/g,
  `localStorage.setItem('store_admin_token', fallbackToken);
        localStorage.setItem('nachiyar_admin_token', fallbackToken);
        localStorage.setItem('store_admin_user', JSON.stringify(matched || fallbackUser));
        localStorage.setItem('nachiyar_admin_user', JSON.stringify(matched || fallbackUser));
        localStorage.removeItem('admin_active_tab');
        localStorage.setItem('admin_active_tab', 'dashboard');
        document.cookie = 'store_admin_token=' + fallbackToken + '; path=/; max-age=86400; SameSite=Lax';
        document.cookie = 'nachiyar_admin_token=' + fallbackToken + '; path=/; max-age=86400; SameSite=Lax';`
);

fs.writeFileSync(loginPath, loginHtml, 'utf8');
console.log('Updated nimda-login.html token storage');

// 3. Update admin.js
const adminJsPath = path.join(rootDir, 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');
adminJs = adminJs.replace(
  /const adminToken = localStorage\.getItem\('nachiyar_admin_token'\);/g,
  `const adminToken = localStorage.getItem('store_admin_token') || localStorage.getItem('nachiyar_admin_token') || localStorage.getItem('admin_token') || (document.cookie.match(/(?:store_admin_token|nachiyar_admin_token|admin_token)=([^;]+)/) || [])[1];`
);
adminJs = adminJs.replace(
  /const storedUserJson = localStorage\.getItem\('nachiyar_admin_user'\);/g,
  `const storedUserJson = localStorage.getItem('store_admin_user') || localStorage.getItem('nachiyar_admin_user') || localStorage.getItem('admin_user');`
);
fs.writeFileSync(adminJsPath, adminJs, 'utf8');
console.log('Updated admin.js auth guards');
