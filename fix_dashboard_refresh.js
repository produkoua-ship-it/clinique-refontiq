const fs = require('fs');
const path = 'dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Reorder init
content = content.replace(
    /await afficherProchainPatient\(supabase\);\s+await verifierEtMarquerManques\(\);/,
    'await verifierEtMarquerManques();\n                await afficherProchainPatient(supabase);'
);

// 2. Update setInterval
const intervalRegex = /setInterval\(async \(\) => \{\s+await verifierEtMarquerManques\(\);\s+await chargerAlertesRendezVousManques\(\);\s+await chargerRendezVousManquesAujourdhui\(\);\s+await updateDashboardStats\(supabase\);/;
if (intervalRegex.test(content)) {
    content = content.replace(
        intervalRegex,
        'setInterval(async () => {\n                await verifierEtMarquerManques();\n                await afficherProchainPatient(supabase);\n                await chargerAlertesRendezVousManques();\n                await chargerRendezVousManquesAujourdhui();\n                await updateDashboardStats(supabase);'
    );
    console.log('Successfully updated interval logic.');
} else {
    console.log('Could not find interval logic with regex.');
}

fs.writeFileSync(path, content, 'utf8');
