const fs = require('fs');
const path = require('path');
const config = require('./config/environment');
const app = require('./app');
const storageService = require('./services/storage');
function runSync() {
  try {
    delete require.cache[require.resolve('./utils/sync-site-config')];
    const { syncAll } = require('./utils/sync-site-config');
    return syncAll();
  } catch (err) {
    console.error('[Sync] Execution error:', err.message);
    return false;
  }
}

// Ensure 100% data-driven synchronization on boot
try {
  runSync();
} catch (e) {
  console.warn('[Sync] Boot sync notice:', e.message);
}

// Automatic Real-Time Watcher on data/site-config.json
const siteConfigFile = path.resolve(__dirname, '..', '..', 'data', 'site-config.json');
if (fs.existsSync(siteConfigFile)) {
  let syncDebounceTimer = null;
  fs.watchFile(siteConfigFile, { interval: 800 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(() => {
        console.log('\n⚡ [Auto-Sync] data/site-config.json modified! Triggering instant re-sync...');
        try {
          runSync();
          console.log('✅ [Auto-Sync] Storefront, Pages, Theme & DB synchronized successfully!');
        } catch (err) {
          console.error('❌ [Auto-Sync] Error during sync:', err.message);
        }
      }, 150);
    }
  });
  console.log(`👁️ [Watcher] Active on ${siteConfigFile} for instant live updates.`);
}

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
