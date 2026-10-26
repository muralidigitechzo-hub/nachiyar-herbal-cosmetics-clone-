const config = require('./config/environment');
const app = require('./app');
const storageService = require('./services/storage');

const PORT = config.port || 5000;

console.log(`📁 [Storage] Standalone File-Based Database active (data/db.json). Zero external DB required.`);

const server = app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🌿 REUSABLE PRODUCT ARCHITECTURE - STANDALONE CLONE`);
  console.log(`🌍 Mode:                 Standalone File-Based (Zero DB Dependency)`);
  console.log(`🗄️ Storage Engine:       Local File Storage (data/db.json)`);
  console.log(`📁 File Storage:         ${storageService.getStorageType().toUpperCase()} (${storageService.getStorageDirectory()})`);
  console.log(`📡 Storefront:           http://localhost:${PORT}`);
  console.log(`💼 Nimda Console:        http://localhost:${PORT}/nimda/`);
  console.log(`📦 Health Check:         http://localhost:${PORT}/api/health`);
  console.log(`🧴 Products API:         http://localhost:${PORT}/api/products`);
  console.log(`⚙️ Settings API:         http://localhost:${PORT}/api/settings/public`);
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
