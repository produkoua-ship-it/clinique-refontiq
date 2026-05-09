const fs = require('fs');

const files = [
    'stocks.html',
    'messagerie.html',
    'parametres.html',
    'alertes.html'
];

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        let changed = false;

        // Handle compact format: @media(max-width:1200px) { .dashboard-container { ... } .sidebar { display: none } ... }
        // We replace the entire block that collapses the layout on 1200px
        const patterns = [
            // Pattern with sidebar + dashboard-container in one block
            /@media\(max-width:1200px\)\s*\{[^}]*\.dashboard-container\s*\{[^}]*\}[^}]*\.sidebar\s*\{[^}]*\}[^}]*(\.[a-z-]+\s*\{[^}]*\}[^}]*)?\}/gs,
        ];

        for (const pattern of patterns) {
            if (pattern.test(content)) {
                content = content.replace(pattern, '/* Desktop layout preserved - mobile handled by assets/mobile.css */');
                changed = true;
                break;
            }
        }

        if (!changed) {
            // Try line-by-line replacement - find and comment out the 1200px block
            const lines = content.split('\n');
            let newLines = [];
            let inBlock = false;
            let braceDepth = 0;
            let blockStart = -1;
            let foundTarget = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!inBlock && (line.includes('@media(max-width:1200px)') || line.includes('@media (max-width:1200px)') || line.includes('@media (max-width: 1200px)'))) {
                    inBlock = true;
                    blockStart = i;
                    braceDepth = 0;
                    foundTarget = true;
                }
                if (inBlock) {
                    for (const c of line) {
                        if (c === '{') braceDepth++;
                        if (c === '}') braceDepth--;
                    }
                    if (braceDepth <= 0 && foundTarget && i > blockStart) {
                        // End of block - skip it, add comment
                        newLines.push('        /* Desktop layout preserved - mobile handled by assets/mobile.css */');
                        inBlock = false;
                        changed = true;
                        continue;
                    }
                    // skip the block line
                    continue;
                }
                newLines.push(line);
            }
            if (changed) {
                content = newLines.join('\n');
            }
        }

        if (changed) {
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed: ' + f);
        } else {
            console.log('No match found: ' + f);
        }
    } catch(e) {
        console.log('Error: ' + f + ' -> ' + e.message);
    }
});

console.log('\nDone. Verifying...');
files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        const hasBadMedia = content.includes('max-width:1200px') || content.includes('max-width: 1200px');
        console.log(f + ': bad media query still present: ' + hasBadMedia);
    } catch(e) {}
});
