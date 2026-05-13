#!/usr/bin/env python3
"""Ajoute header mobile + bottom nav simplifiée (5 icônes + popup Plus)."""

import os

PAGES = [
    'dashboard.html', 'patients.html', 'consultations.html',
    'rendez-vous.html', 'finance.html', 'stocks.html',
    'messagerie.html', 'alertes.html', 'parametres.html'
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MOBILE_HEADER = '''    <!-- Mobile Header -->
    <header class="mobile-header">
        <div class="header-left">
            <div class="header-logo"><i class="fa-solid fa-hospital"></i></div>
            <a href="index.html" style="text-decoration: none; color: inherit;">
                <div>
                    <div class="header-title">Clinique Refontiq</div>
                    <div class="header-subtitle">Système Médical</div>
                </div>
            </a>
        </div>
        <div class="header-right">
            <button class="header-btn" onclick="window.location.href='alertes.html'">
                <i class="fa-solid fa-bell"></i>
                <span class="badge">3</span>
            </button>
        </div>
    </header>

'''

# Bottom nav simplifiée : 5 icônes + bouton Plus
BOTTOM_NAV_SIMPLE = '''    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
        <a href="dashboard.html" class="mobile-nav-item {{DASHBOARD_ACTIVE}}"><i class="fa-solid fa-chart-line"></i><span>Accueil</span></a>
        <a href="patients.html" class="mobile-nav-item {{PATIENTS_ACTIVE}}"><i class="fa-solid fa-users"></i><span>Patients</span></a>
        <a href="consultations.html" class="mobile-nav-item {{CONSULT_ACTIVE}}"><i class="fa-solid fa-stethoscope"></i><span>Consult.</span></a>
        <a href="rendez-vous.html" class="mobile-nav-item {{RDV_ACTIVE}}"><i class="fa-solid fa-calendar-check"></i><span>RDV</span></a>
        <button class="mobile-nav-item more-btn" onclick="toggleMorePopup()"><i class="fa-solid fa-ellipsis-h"></i><span>Plus</span></button>
    </nav>
    <!-- Popup Plus -->
    <div class="more-popup-overlay" id="moreOverlay" onclick="closeMorePopup()"></div>
    <div class="more-popup" id="morePopup">
        <div class="popup-grid">
            <a href="messagerie.html" class="popup-item"><i class="fa-solid fa-comments"></i>Messages</a>
            <a href="finance.html" class="popup-item"><i class="fa-solid fa-coins"></i>Finance</a>
            <a href="stocks.html" class="popup-item"><i class="fa-solid fa-boxes-stacked"></i>Stocks</a>
            <a href="alertes.html" class="popup-item"><i class="fa-solid fa-bell"></i>Alertes</a>
            <a href="parametres.html" class="popup-item" style="grid-column: span 2;"><i class="fa-solid fa-cog"></i>Paramètres</a>
        </div>
    </div>

'''

MOBILE_JS = '''
        // --- Fonctions mobiles ---
        function setActiveNav(el) {
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }
        function toggleMorePopup() {
            const p = document.getElementById('morePopup');
            const o = document.getElementById('moreOverlay');
            if (p) { p.classList.toggle('open'); o.classList.toggle('open'); }
        }
        function closeMorePopup() {
            document.getElementById('morePopup').classList.remove('open');
            document.getElementById('moreOverlay').classList.remove('open');
        }
        function updateMobileHeader() {
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (!user) return;
                const names = {'medecin':'Dr. Duval','infirmiere':'Infirm. Martin','receptionniste':'M. Koffi'};
                const ht = document.querySelector('.header-title');
                if (ht) ht.textContent = names[user.role] || 'Utilisateur';
            } catch(e) {}
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateMobileHeader);
        } else {
            updateMobileHeader();
        }
'''

def process_page(filename):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    page_name = filename.replace('.html', '')
    
    am = {
        '{{DASHBOARD_ACTIVE}}': 'active' if page_name == 'dashboard' else '',
        '{{PATIENTS_ACTIVE}}': 'active' if page_name == 'patients' else '',
        '{{CONSULT_ACTIVE}}': 'active' if page_name == 'consultations' else '',
        '{{RDV_ACTIVE}}': 'active' if page_name == 'rendez-vous' else '',
        '{{FINANCE_ACTIVE}}': 'active' if page_name == 'finance' else '',
        '{{STOCKS_ACTIVE}}': 'active' if page_name == 'stocks' else '',
        '{{MSG_ACTIVE}}': 'active' if page_name == 'messagerie' else '',
        '{{ALERTES_ACTIVE}}': 'active' if page_name == 'alertes' else '',
        '{{SETTINGS_ACTIVE}}': 'active' if page_name == 'parametres' else '',
    }
    
    # Ajouter CSS mobile
    css_link = '<link rel="stylesheet" href="assets/mobile.css">'
    if css_link not in content:
        content = content.replace(
            'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"',
            'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">\n    ' + css_link
        )
    
    # Header mobile
    if 'mobile-header' not in content:
        content = content.replace('<body>', '<body>\n' + MOBILE_HEADER)
    
    # Supprimer l'ancienne bottom nav si elle existe
    if 'Mobile Bottom Navigation' in content:
        start = content.find('<!-- Mobile Bottom Navigation')
        end = content.find('</nav>', start)
        if end > 0:
            end += len('</nav>')
            content = content[:start] + content[end:]
    
    # Supprimer l'ancien popup "Plus" s'il existe
    if 'more-popup' in content:
        start = content.find('<!-- Popup Plus -->')
        if start > 0:
            end = content.find('</div>', content.find('</div>', start) + 6) + 6
            content = content[:start] + content[end:]
    
    # Ajouter la nouvelle bottom nav
    if 'mobile-bottom-nav' not in content:
        nav = BOTTOM_NAV_SIMPLE
        for key, val in am.items():
            nav = nav.replace(key, val)
        content = content.replace('</body>', nav + '</body>')
    
    # Supprimer les anciennes fonctions
    for fn in ['openDrawer', 'closeDrawer', 'updateDrawerUser', 'toggleMobileMenu']:
        if fn in content:
            import re
            pattern = r'function ' + fn + r'.*?\n\s{8}\}'
            content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Ajouter/Mettre à jour les fonctions JS
    if 'function logout()' in content:
        import re
        # On supprime d'abord l'ancien bloc "// --- Fonctions mobiles ---" jusqu'à "function logout()"
        content = re.sub(r'// --- Fonctions mobiles ---.*?function logout\(\)', 'function logout()', content, flags=re.DOTALL)
        
        # Ensuite on insert le nouveau MOBILE_JS juste avant "function logout()"
        content = content.replace('function logout()', MOBILE_JS + '\n        function logout()')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK {filename}')

def main():
    print("=== Bottom nav simplifiée (5 icônes + popup Plus) ===")
    for page in PAGES:
        fp = os.path.join(BASE_DIR, page)
        if os.path.exists(fp):
            process_page(page)
        else:
            print(f'FAIL {page} introuvable')
    print("\nTerminé ! Navigation simplifiée en bas.")

if __name__ == '__main__':
    main()