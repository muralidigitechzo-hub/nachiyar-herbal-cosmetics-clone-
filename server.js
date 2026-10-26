/**
 * Nachiyar Herbals & Cosmetics
 * Root Application Entrypoint (Standalone File-Based Architecture)
 */

const config = require('./server/src/config/environment');
const app = require('./server/src/app');
const storageService = require('./server/src/services/storage');

const PORT = config.port || 5000;

console.log(`📁 [Storage] Standalone File-Based Engine Active (data/db.json). Zero External DB Required.`);

const server = app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🌿 REUSABLE PRODUCT ARCHITECTURE - STANDALONE CLONE`);
  console.log(`🌍 Mode:          Standalone Local File-Based (Zero DB Dependency)`);
  console.log(`🗄️ Storage:       Local File (data/db.json)`);
  console.log(`📁 File Storage:  ${storageService.getStorageType().toUpperCase()} (${storageService.getStorageDirectory()})`);
  console.log(`🛍️ Storefront:    http://localhost:${PORT}`);
  console.log(`💼 Admin Console: http://localhost:${PORT}/nimda/`);
  console.log(`==================================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️ Port ${PORT} is already in use by another process.`);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = server;
