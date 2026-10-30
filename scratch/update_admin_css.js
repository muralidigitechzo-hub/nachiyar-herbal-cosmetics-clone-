const fs = require('fs');

const cssRules = `
/* ==========================================================================
   FULL-HEIGHT STRAIGHT SIDEBAR & RIGHT-ALIGNED TOPBAR LAYOUT
   ========================================================================== */
.admin-layout {
  display: flex !important;
  min-height: 100vh !important;
  width: 100% !important;
  max-width: 100vw !important;
  position: relative !important;
  overflow-x: hidden !important;
}

.admin-sidebar {
  width: 260px !important;
  min-width: 260px !important;
  height: 100vh !important;
  position: sticky !important;
  top: 0 !important;
  left: 0 !important;
  background-color: var(--admin-sidebar-bg, #160D1E) !important;
  color: #FFFFFF !important;
  display: flex !important;
  flex-direction: column !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  overflow-y: auto !important;
  z-index: 1050 !important;
  padding: 0 !important;
  flex-shrink: 0 !important;
}

.sidebar-brand-lockup {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 18px 18px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: rgba(0, 0, 0, 0.22) !important;
  flex-shrink: 0 !important;
}

.sidebar-brand-lockup .admin-logo {
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  border: 1.5px solid var(--admin-primary, #57B71B) !important;
  object-fit: contain !important;
  background: #ffffff !important;
  padding: 2px !important;
  flex-shrink: 0 !important;
}

.sidebar-brand-lockup .brand-info {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
}

.sidebar-brand-lockup .admin-title {
  font-family: var(--font-heading) !important;
  font-weight: 800 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.06em !important;
  color: #FFFFFF !important;
  line-height: 1.15 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.sidebar-brand-lockup .admin-subtitle {
  font-size: 0.58rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.12em !important;
  color: var(--admin-primary, #57B71B) !important;
}

.sidebar-brand-lockup .admin-sidebar-close {
  display: none;
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.sidebar-nav {
  padding: 16px 12px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  flex: 1 !important;
}

.admin-main-wrapper {
  flex: 1 !important;
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important;
  background-color: var(--admin-bg, #F4F5F7) !important;
}

.admin-topbar {
  background-color: #FFFFFF !important;
  height: 68px !important;
  border-bottom: 1px solid var(--admin-border, #E2E8F0) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-inline: 28px !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
}

@media (max-width: 991px) {
  .admin-sidebar {
    position: fixed !important;
    top: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    height: 100vh !important;
    transform: translateX(-100%) !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4) !important;
  }
  .admin-sidebar.is-open {
    transform: translateX(0) !important;
  }
  .admin-sidebar-toggle {
    display: flex !important;
  }
  .sidebar-brand-lockup .admin-sidebar-close {
    display: flex !important;
  }
}
`;

['admin.css', 'client/public/admin.css'].forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('FULL-HEIGHT STRAIGHT SIDEBAR')) {
      content += '\n' + cssRules;
      fs.writeFileSync(f, content, 'utf8');
      console.log('Appended layout rules to:', f);
    }
  }
});
