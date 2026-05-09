const fs = require('fs');

const files = [
    'dashboard.html',
    'patients.html',
    'rendez-vous.html',
    'consultations.html',
    'finance.html',
    'stocks.html',
    'messagerie.html',
    'parametres.html',
    'alertes.html',
    'dossier-patient.html'
];

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        let changed = false;

        // Pattern 1: @media (max-width: 1200px) block that hides sidebar & collapses grid
        // We want to raise the breakpoint from 1200px to 768px so it only fires on mobile (already covered by mobile.css)
        // Actually we just want to remove/fix this block so desktop shows sidebar correctly
        const mediaBlock = /@media \(max-width: 1200px\)\s*\{[\s\S]*?\.dashboard-container\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.sidebar\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}[\s\S]*?\}/g;

        if (mediaBlock.test(content)) {
            // Replace with a version that only applies at 768px (mobile, already handled by mobile.css)
            content = content.replace(
                /@media \(max-width: 1200px\)\s*\{([\s\S]*?)\.dashboard-container\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}([\s\S]*?)\.sidebar\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}([\s\S]*?)\}/,
                (match) => {
                    // Remove the entire block since mobile.css already handles this for mobile
                    return '/* Responsive handled by assets/mobile.css */';
                }
            );
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed: ' + f);
        } else {
            console.log('No match: ' + f);
        }
    } catch(e) {
        console.log('Error: ' + f + ' -> ' + e.message);
    }
});
