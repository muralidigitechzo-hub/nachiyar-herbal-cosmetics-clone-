const fs = require('fs');
const path = require('path');

const appJsPath = path.resolve(__dirname, '..', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const targetStr = `      if (isSlot1 && slot1Cfg) {
        if (slot1Cfg.price !== undefined && slot1Cfg.price !== '') activePrice = Number(slot1Cfg.price);
        if (slot1Cfg.mrp !== undefined && slot1Cfg.mrp !== '') activeMrp = Number(slot1Cfg.mrp);
        if (slot1Cfg.customImage) activeImg = slot1Cfg.customImage;
        if (slot1Cfg.title) activeName = slot1Cfg.title;
        if (slot1Cfg.subtitle) activeSub = slot1Cfg.subtitle;
      } else if (isSlot2 && slot2Cfg) {
        if (slot2Cfg.price !== undefined && slot2Cfg.price !== '') activePrice = Number(slot2Cfg.price);
        if (slot2Cfg.mrp !== undefined && slot2Cfg.mrp !== '') activeMrp = Number(slot2Cfg.mrp);
        if (slot2Cfg.customImage) activeImg = slot2Cfg.customImage;
        if (slot2Cfg.title) activeName = slot2Cfg.title;
        if (slot2Cfg.subtitle) activeSub = slot2Cfg.subtitle;
      } else if (isCombo && comboCfg) {
        if (comboCfg.price !== undefined && comboCfg.price !== '') activePrice = Number(comboCfg.price);
        if (comboCfg.mrp !== undefined && comboCfg.mrp !== '') activeMrp = Number(comboCfg.mrp);
        if (comboCfg.customImage) activeImg = comboCfg.customImage;
        if (comboCfg.title) activeName = comboCfg.title;
        if (comboCfg.subtitle) activeSub = comboCfg.subtitle;
      }`;

const replStr = `      const isSlot1Matching = slot1Cfg && (slot1Cfg.productId === pId || slot1Cfg.productId === pSlug);
      const isSlot2Matching = slot2Cfg && (slot2Cfg.productId === pId || slot2Cfg.productId === pSlug);
      const isComboMatching = comboCfg && (comboCfg.productId === pId || comboCfg.productId === pSlug);

      if (isSlot1 && isSlot1Matching) {
        if (slot1Cfg.price !== undefined && slot1Cfg.price !== '') activePrice = Number(slot1Cfg.price);
        if (slot1Cfg.mrp !== undefined && slot1Cfg.mrp !== '') activeMrp = Number(slot1Cfg.mrp);
        if (slot1Cfg.customImage) activeImg = slot1Cfg.customImage;
        if (slot1Cfg.title) activeName = slot1Cfg.title;
        if (slot1Cfg.subtitle) activeSub = slot1Cfg.subtitle;
      } else if (isSlot2 && isSlot2Matching) {
        if (slot2Cfg.price !== undefined && slot2Cfg.price !== '') activePrice = Number(slot2Cfg.price);
        if (slot2Cfg.mrp !== undefined && slot2Cfg.mrp !== '') activeMrp = Number(slot2Cfg.mrp);
        if (slot2Cfg.customImage) activeImg = slot2Cfg.customImage;
        if (slot2Cfg.title) activeName = slot2Cfg.title;
        if (slot2Cfg.subtitle) activeSub = slot2Cfg.subtitle;
      } else if (isCombo && isComboMatching) {
        if (comboCfg.price !== undefined && comboCfg.price !== '') activePrice = Number(comboCfg.price);
        if (comboCfg.mrp !== undefined && comboCfg.mrp !== '') activeMrp = Number(comboCfg.mrp);
        if (comboCfg.customImage) activeImg = comboCfg.customImage;
        if (comboCfg.title) activeName = comboCfg.title;
        if (comboCfg.subtitle) activeSub = comboCfg.subtitle;
      }`;

// Also clean up fallback badge logic so badges are dynamic
content = content.replace(/\r\n/g, '\n');
const targetNorm = targetStr.replace(/\r\n/g, '\n');
const replNorm = replStr.replace(/\r\n/g, '\n');

if (content.includes(targetNorm)) {
  content = content.replace(targetNorm, replNorm);
  console.log('Successfully replaced showcase override logic in app.js');
} else {
  console.log('Target not found in app.js');
}

fs.writeFileSync(appJsPath, content, 'utf8');
