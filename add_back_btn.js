const fs = require('fs');

let file = fs.readFileSync('dossier-patient.html', 'utf8');

const targetStr = `<div class="page-header">
                <h1>Dossier Patient</h1>
                <p>Consultez les informations médicales complètes du patient.</p>
            </div>`;

const replaceStr = `<div class="page-header" style="display: flex; align-items: center; gap: 20px;">
                <button onclick="window.history.back()" class="btn btn-outline" style="padding: 10px 20px; flex-shrink: 0; display: flex; align-items: center; gap: 8px; border: 1px solid var(--border); background: white; color: var(--text); border-radius: 12px; cursor: pointer; font-family: inherit; font-weight: 600; transition: all 0.2s;">
                    <i class="fa-solid fa-arrow-left"></i> Retour
                </button>
                <div>
                    <h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; color: var(--text);">Dossier Patient</h1>
                    <p style="margin: 4px 0 0 0; color: var(--text-light); font-size: 0.95rem;">Consultez les informations médicales complètes du patient.</p>
                </div>
            </div>`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, replaceStr);
    fs.writeFileSync('dossier-patient.html', file, 'utf8');
    console.log("Added back button using strict match");
} else {
    // try a more lenient regex match
    const regex = /<div class="page-header">\s*<h1>Dossier Patient<\/h1>\s*<p>Consultez les informations médicales complètes du patient.<\/p>\s*<\/div>/;
    if (regex.test(file)) {
        file = file.replace(regex, replaceStr);
        fs.writeFileSync('dossier-patient.html', file, 'utf8');
        console.log("Added back button using regex match");
    } else {
        console.log("Could not find the page header to replace");
    }
}
