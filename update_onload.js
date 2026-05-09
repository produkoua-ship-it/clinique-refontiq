const fs = require('fs');

let file = fs.readFileSync('rendez-vous.html', 'utf8');

const targetStr1 = `            // Définir la date d'aujourd'hui par défaut
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date_rdv').value = today;
        };`;

const targetStr2 = `            // Définir la date d'aujourd'hui par défaut\r
            const today = new Date().toISOString().split('T')[0];\r
            document.getElementById('date_rdv').value = today;\r
        };`;

const targetStr3 = `// Définir la date d'aujourd'hui par défaut\n            const today = new Date().toISOString().split('T')[0];\n            document.getElementById('date_rdv').value = today;\n        };`;

const replacement = `            // Définir la date d'aujourd'hui par défaut
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date_rdv').value = today;

            // Charger les données initiales
            reinitialiserCalendrier(today);
            remplirListePatients();
            chargerListeRDV();
        };`;

if (file.includes(targetStr1)) {
    file = file.replace(targetStr1, replacement);
    fs.writeFileSync('rendez-vous.html', file, 'utf8');
    console.log('Replaced using targetStr1');
} else if (file.includes(targetStr2)) {
    file = file.replace(targetStr2, replacement);
    fs.writeFileSync('rendez-vous.html', file, 'utf8');
    console.log('Replaced using targetStr2');
} else if (file.includes(targetStr3)) {
    file = file.replace(targetStr3, replacement);
    fs.writeFileSync('rendez-vous.html', file, 'utf8');
    console.log('Replaced using targetStr3');
} else {
    // try regex
    const regex = /\/\/ Définir la date d'aujourd'hui par défaut[\s\S]*?document\.getElementById\('date_rdv'\)\.value = today;[\s\S]*?};/;
    if (regex.test(file)) {
        file = file.replace(regex, replacement);
        fs.writeFileSync('rendez-vous.html', file, 'utf8');
        console.log('Replaced using regex');
    } else {
        console.log('Target string not found');
    }
}
