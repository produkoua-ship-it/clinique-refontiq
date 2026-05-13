const fs = require('fs');
const path = require('path');

const dir = 'd:/Utilisateur/Documents/Antigravity/clients/cabinet_medical_koumassi/refontiq-dashboard';

// Clean function to normalize whitespace for comparison
function normalize(str) {
    return str.replace(/\s+/g, ' ').trim();
}

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'dashboard.html' && file !== 'supabase-setup.html' && file !== 'login.html' && file !== 'index.html') {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        let changed = false;

        // Replace Mobile Header
        const mobileHeaderRegex = /<div class="header-right">\s*<div class="notification-wrapper">\s*<div class="notification-bell" onclick="toggleNotifications\(\)">\s*<i class="fa-solid fa-bell" style="font-size: 1.2rem; color: var\(--primary\);"><\/i>\s*<span class="notification-badge">5<\/span>\s*<\/div>\s*<div id="notification-dropdown" class="notif-dropdown">\s*<div class="notif-header">Notifications<\/div>\s*<div id="notif-list" class="notif-body">\s*<p style="padding:15px; font-size:0.8rem; color:gray;">Chargement\.\.\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
        if (mobileHeaderRegex.test(content)) {
            content = content.replace(mobileHeaderRegex, `<div class="header-right">\n            <!-- Notifications déplacées vers le menu latéral -->\n        </div>`);
            changed = true;
        }

        // Replace Top Bar
        const topBarRegex = /<div class="notification-wrapper">\s*<div class="notification-bell" onclick="toggleNotifications\(\)">\s*<i class="fa-solid fa-bell" style="font-size: 1.2rem; color: var\(--text-light\);"><\/i>\s*<span class="notification-badge">5<\/span>\s*<\/div>\s*<div id="notification-dropdown" class="notif-dropdown">\s*<div class="notif-header">Notifications<\/div>\s*<div id="notif-list" class="notif-body">\s*<p style="padding:15px; font-size:0.8rem; color:gray;">Chargement\.\.\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/g;
        if (topBarRegex.test(content)) {
            content = content.replace(topBarRegex, `<!-- Notifications déplacées vers le menu latéral -->`);
            changed = true;
        }

        // Replace Sidebar
        const sidebarRegex = /<a href="alertes\.html" class="nav-item(?:\s+active)?">\s*<i class="fa-solid fa-bell"><\/i>\s*Alertes\s*<\/a>/g;
        if (sidebarRegex.test(content)) {
            content = content.replace(sidebarRegex, (match) => {
                const isActive = match.includes('active') ? ' active' : '';
                return `<a href="alertes.html" class="nav-item${isActive}" style="position: relative; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fa-solid fa-bell"></i>
                            Alertes
                        </div>
                        <span class="nav-badge" style="background: var(--danger); color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">5</span>
                    </a>`;
            });
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Updated', file);
        }
    }
});
