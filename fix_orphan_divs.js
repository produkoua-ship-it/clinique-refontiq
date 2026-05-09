const fs = require('fs');

const files = [
    'dashboard.html', 'patients.html', 'rendez-vous.html', 'consultations.html',
    'finance.html', 'stocks.html', 'messagerie.html', 'parametres.html', 'alertes.html', 'dossier-patient.html'
];

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        let changed = false;

        // Remove orphan </div> that appears between </script> tags before </body>
        // Pattern: </script>\n    \n\n    \n    </div>\n\n    <script src=
        const orphanPattern = /(<\/script>[\r\n\s]+)<\/div>([\r\n\s]+<script\s+src=)/g;
        if (orphanPattern.test(content)) {
            content = content.replace(orphanPattern, '$1$2');
            changed = true;
        }

        // Also check for </div> right before supabase script without being inside a div
        const supabasePattern = /([\r\n]+)\s*<\/div>([\r\n\s]+<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase)/g;
        if (supabasePattern.test(content)) {
            content = content.replace(supabasePattern, '$1$2');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed orphan div: ' + f);
        } else {
            // check manually
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '</div>') {
                    // Check if next non-empty line is a script tag (supabase or toggleMobileSidebar)
                    for (let j = i+1; j < Math.min(i+5, lines.length); j++) {
                        if (lines[j].trim() === '') continue;
                        if (lines[j].includes('<script src=') || lines[j].includes('supabase') || lines[j].includes('toggleMobileSidebar')) {
                            // This </div> is likely orphan - remove it
                            lines[i] = '';
                            content = lines.join('\n');
                            fs.writeFileSync(f, content, 'utf8');
                            console.log('Fixed orphan div at line ' + (i+1) + ': ' + f);
                            changed = true;
                            break;
                        }
                        break;
                    }
                }
                if (changed) break;
            }
            if (!changed) console.log('No orphan div found: ' + f);
        }
    } catch(e) {
        console.log('Error: ' + f + ' -> ' + e.message);
    }
});
