const fs = require('fs');
const path = require('path');

const dir = 'app';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'dashboard.html' && f !== 'login.html');

const htmlToInject = `
        <!-- ── BOTTOM NAVIGATION MOBILE ── -->
        <nav class="mobile-bottom-nav" style="display: none;">
            <a href="dashboard.html" class="mobile-nav-item">
                <i class="fa-solid fa-house"></i>
                <span>Accueil</span>
            </a>
            <a href="patients.html" class="mobile-nav-item">
                <i class="fa-solid fa-users"></i>
                <span>Patients</span>
            </a>
            <button class="mobile-nav-item more-btn" onclick="toggleQuickActions()">
                <i class="fa-solid fa-plus"></i>
            </button>
            <a href="rendez-vous.html" class="mobile-nav-item">
                <i class="fa-solid fa-calendar"></i>
                <span>RDV</span>
            </a>
            <a href="parametres.html" class="mobile-nav-item">
                <i class="fa-solid fa-gear"></i>
                <span>Profil</span>
            </a>
        </nav>

        <!-- ── QUICK ACTIONS OVERLAY MOBILE ── -->
        <div class="mobile-quick-overlay" id="quickOverlay" onclick="toggleQuickActions()"></div>
        <div class="mobile-quick-actions" id="quickActionsPopup">
            <h3 style="font-family: 'Space Grotesk'; margin-bottom: 20px; text-align: center;">Actions Rapides</h3>
            <div class="quick-actions-grid">
                <a href="consultations.html" class="quick-action-item">
                    <i class="fa-solid fa-file-medical"></i>
                    <span>Consultation</span>
                </a>
                <a href="patients.html?action=new" class="quick-action-item">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Patient</span>
                </a>
                <a href="rendez-vous.html" class="quick-action-item">
                    <i class="fa-solid fa-calendar-plus"></i>
                    <span>Prendre RDV</span>
                </a>
                <a href="vitals-tablet.html" class="quick-action-item">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <span>Constantes</span>
                </a>
                <a href="stocks.html" class="quick-action-item">
                    <i class="fa-solid fa-box-open"></i>
                    <span>Stocks</span>
                </a>
                <a href="finance.html" class="quick-action-item">
                    <i class="fa-solid fa-coins"></i>
                    <span>Caisse</span>
                </a>
            </div>
        </div>
`;

files.forEach(file => {
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('mobile-bottom-nav')) {
        console.log(`Skipping ${file} - already injected`);
        return;
    }

    // Set the correct active class for the bottom nav depending on the page
    let specificHtml = htmlToInject;
    if (file === 'patients.html') {
        specificHtml = specificHtml.replace('<a href="patients.html" class="mobile-nav-item">', '<a href="patients.html" class="mobile-nav-item active">');
    } else if (file === 'rendez-vous.html') {
        specificHtml = specificHtml.replace('<a href="rendez-vous.html" class="mobile-nav-item">', '<a href="rendez-vous.html" class="mobile-nav-item active">');
    } else if (file === 'parametres.html') {
        specificHtml = specificHtml.replace('<a href="parametres.html" class="mobile-nav-item">', '<a href="parametres.html" class="mobile-nav-item active">');
    }

    // Inject before closing dashboard-container, which is typically before the first modal or before <script src="https://cdn
    // Or just right before </main> by also closing </main> properly.
    // Actually, injecting just before </body> is perfectly fine for fixed elements!
    
    content = content.replace('</body>', specificHtml + '\\n</body>');
    fs.writeFileSync(filePath, content);
    console.log(`Injected into ${file}`);
});
