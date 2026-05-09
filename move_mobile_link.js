const fs = require('fs');
const files = ['dashboard.html', 'patients.html', 'rendez-vous.html', 'consultations.html', 'finance.html', 'stocks.html', 'messagerie.html', 'parametres.html', 'alertes.html', 'dossier-patient.html'];

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        // Find the line with mobile.css
        const mobileLink = /<link rel="stylesheet" href="assets\/mobile\.css">/;
        if (mobileLink.test(content)) {
            // Remove it
            content = content.replace(mobileLink, '');
            // Insert it before </head>
            content = content.replace('</head>', '    <link rel="stylesheet" href="assets/mobile.css">\n</head>');
            fs.writeFileSync(f, content, 'utf8');
            console.log('Moved link to bottom of head in ' + f);
        }
    } catch (e) {
        console.log('Error in ' + f + ': ' + e.message);
    }
});
