const fs = require('fs');
const path = require('path');

const dir = 'd:/Utilisateur/Documents/Antigravity/clients/cabinet_medical_koumassi/refontiq-dashboard';

const mobileHeaderSearch = `<div class="header-right">
            <div class="notification-wrapper">
                <div class="notification-bell" onclick="toggleNotifications()">
                    <i class="fa-solid fa-bell" style="font-size: 1.2rem; color: var(--primary);"></i>
                    <span class="notification-badge">5</span>
                </div>
                <div id="notification-dropdown" class="notif-dropdown">
                    <div class="notif-header">Notifications</div>
                    <div id="notif-list" class="notif-body">
                        <p style="padding:15px; font-size:0.8rem; color:gray;">Chargement...</p>
                    </div>
                </div>
            </div>
        </div>`;

const mobileHeaderReplace = `<div class="header-right">
            <!-- Notifications déplacées vers le menu latéral -->
        </div>`;

const topBarSearch = `<div class="notification-wrapper">
                        <div class="notification-bell" onclick="toggleNotifications()">
                            <i class="fa-solid fa-bell" style="font-size: 1.2rem; color: var(--text-light);"></i>
                            <span class="notification-badge">5</span>
                        </div>
                        <div id="notification-dropdown" class="notif-dropdown">
                            <div class="notif-header">Notifications</div>
                            <div id="notif-list" class="notif-body">
                                <p style="padding:15px; font-size:0.8rem; color:gray;">Chargement...</p>
                            </div>
                        </div>
                    </div>`;

const topBarReplace = `<!-- Notifications déplacées vers le menu latéral -->`;

const sidebarSearch = `<a href="alertes.html" class="nav-item">
                        <i class="fa-solid fa-bell"></i>
                        Alertes
                    </a>`;

const sidebarReplace = `<a href="alertes.html" class="nav-item" style="position: relative; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fa-solid fa-bell"></i>
                            Alertes
                        </div>
                        <span class="nav-badge" style="background: var(--danger); color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">5</span>
                    </a>`;

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'dashboard.html' && file !== 'supabase-setup.html' && file !== 'login.html' && file !== 'index.html') {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        
        let changed = false;
        if (content.includes(mobileHeaderSearch)) {
            content = content.replace(mobileHeaderSearch, mobileHeaderReplace);
            changed = true;
        }
        if (content.includes(topBarSearch)) {
            content = content.replace(topBarSearch, topBarReplace);
            changed = true;
        }
        if (content.includes(sidebarSearch)) {
            content = content.replace(sidebarSearch, sidebarReplace);
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Updated', file);
        }
    }
});
