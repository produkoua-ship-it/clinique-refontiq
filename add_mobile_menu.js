const fs = require('fs');
const path = require('path');

const dir = 'd:/Utilisateur/Documents/Antigravity/clients/cabinet_medical_koumassi/refontiq-dashboard';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'login.html' && file !== 'index.html' && file !== 'supabase-setup.html') {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        let changed = false;

        // 1. Add hamburger button
        const headerLeftRegex = /<div class="header-left">\s*<div class="header-logo">/;
        if (headerLeftRegex.test(content) && !content.includes('toggleMobileSidebar()')) {
            content = content.replace(headerLeftRegex, `<div class="header-left">\n            <button class="header-btn hamburger-btn" onclick="toggleMobileSidebar()" style="margin-right: 8px;"><i class="fa-solid fa-bars"></i></button>\n            <div class="header-logo">`);
            changed = true;
        }

        // 2. Add Overlay
        const sidebarRegex = /<aside class="sidebar">/;
        if (sidebarRegex.test(content) && !content.includes('sidebar-overlay')) {
            content = content.replace(sidebarRegex, `<!-- Overlay Mobile -->\n        <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleMobileSidebar()"></div>\n        <aside class="sidebar">`);
            changed = true;
        }

        // Add Close Button
        const userInfoRegex = /<div class="user-info">/;
        if (userInfoRegex.test(content) && !content.includes('mobile-close-btn')) {
            content = content.replace(userInfoRegex, `<button class="mobile-close-btn" onclick="toggleMobileSidebar()" title="Fermer le menu"><i class="fa-solid fa-times"></i></button>\n                <div class="user-info">`);
            changed = true;
        }

        // 3. Add JS
        const bodyEndRegex = /<\/body>/;
        if (bodyEndRegex.test(content) && !content.includes('function toggleMobileSidebar()')) {
            const jsCode = `\n    <script>
        function toggleMobileSidebar() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.getElementById('sidebarOverlay').classList.toggle('active');
            // Empêcher le scroll du body quand le menu est ouvert
            document.body.style.overflow = document.querySelector('.sidebar').classList.contains('active') ? 'hidden' : '';
        }
    </script>\n</body>`;
            content = content.replace(bodyEndRegex, jsCode);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Added mobile menu to', file);
        }
    }
});
