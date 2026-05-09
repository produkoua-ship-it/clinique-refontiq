const fs = require('fs');
const path = require('path');

const dir = 'd:/Utilisateur/Documents/Antigravity/clients/cabinet_medical_koumassi/refontiq-dashboard';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html')) {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        
        // Remove Mobile Bottom Navigation and Popup Plus
        const regex = /<!-- Mobile Bottom Navigation -->[\s\S]*?<!-- Popup Plus -->[\s\S]*?<div class="more-popup" id="morePopup">[\s\S]*?<\/div>\s*<\/div>/g;
        
        if (regex.test(content)) {
            content = content.replace(regex, '');
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Removed bottom nav from', file);
        }
    }
});
