const fs = require('fs');
const path = require('path');

const dir = 'd:/Utilisateur/Documents/Antigravity/clients/cabinet_medical_koumassi/refontiq-dashboard';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'login.html' && file !== 'index.html' && file !== 'supabase-setup.html') {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        let changed = false;

        // Remove the dropdown block completely
        const dropdownRegex = /<div class="dropdown">[\s\S]*?<div class="dropdown-btn">[\s\S]*?<i class="fa-solid fa-ellipsis-vertical"><\/i>[\s\S]*?<\/div>\s*<div class="dropdown-content">[\s\S]*?<\/div>\s*<\/div>/g;
        
        if (dropdownRegex.test(content)) {
            content = content.replace(dropdownRegex, '');
            changed = true;
        }

        // Wait, what if there's a mobile header three dots?
        // Let's also check for any generic button with fa-ellipsis-vertical
        const genericDotsRegex = /<button[^>]*><i class="fa-solid fa-ellipsis-vertical"><\/i><\/button>/g;
        if (genericDotsRegex.test(content)) {
            content = content.replace(genericDotsRegex, '');
            changed = true;
        }

        // Are there three dots in mobile-header right? Let's verify
        // Sometimes it's inside <div class="header-right">...</div>
        
        if (changed) {
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Removed three dots from', file);
        }
    }
});
