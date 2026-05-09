const fs = require('fs');

let file = fs.readFileSync('dossier-patient.html', 'utf8');

// 1. Add mobile.css
if (!file.includes('assets/mobile.css')) {
    file = file.replace('<style>', '<link rel="stylesheet" href="assets/mobile.css">\n    <style>');
}

// 2. Add mobile header
const headerStr = `    <!-- Mobile Header -->
    <header class="mobile-header">
        <div class="header-left">
            <button class="header-btn hamburger-btn" onclick="toggleMobileSidebar()" style="margin-right: 8px;"><i class="fa-solid fa-bars"></i></button>
            <div class="header-logo">
                <i class="fa-solid fa-hospital"></i>
            </div>
            <a href="index.html" style="text-decoration: none; color: inherit;">
                <div>
                    <div class="header-title">Clinique Refontiq</div>
                    <div class="header-subtitle">Système Médical</div>
                </div>
            </a>
        </div>
    </header>\n\n    <div class="dashboard-container">`;

if (!file.includes('<header class="mobile-header">')) {
    file = file.replace('<body>\n    <div class="dashboard-container">', '<body>\n' + headerStr);
}

fs.writeFileSync('dossier-patient.html', file, 'utf8');
console.log("dossier-patient.html updated!");
