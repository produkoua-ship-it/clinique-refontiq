/**
 * Refontiq Role Manager - Centralized RBAC
 * Handles visibility and access control based on user roles.
 */

const RoleManager = {
    roles: {
        MEDECIN: 'medecin',
        INFIRMIERE: 'infirmiere',
        RECEPTIONNISTE: 'receptionniste'
    },

    async init() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        console.log(`[RoleManager] User: ${user.name} | Role: ${user.role}`);
        
        await this.loadSidebar(user.role);
        
        this.updateProfileDisplay(user);
        this.applyPermissions(user.role);
        this.highlightActiveMenu();
        
        // Re-injecter le bouton de déconnexion car la sidebar vient d'être créée
        if (typeof injecterBoutonDeconnexion === 'function') {
            injecterBoutonDeconnexion();
        }
    },

    async loadSidebar(role) {
        const container = document.getElementById('sidebar-container');
        if (!container) return; // Ignore if the page doesn't have a sidebar
        
        // --- INJECTION MOBILE HEADER UNIQUE ---
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.querySelector('.mobile-header')) {
            let pageTitle = document.title.split('-')[0].trim();
            if (pageTitle === 'Clinique Refontiq') pageTitle = 'Dashboard';
            
            const headerHTML = `
                <header class="mobile-header">
                    <div class="mobile-header-left">
                        <button class="hamburger-btn" onclick="toggleMobileSidebar()">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <div class="logo-group" onclick="window.location.href='../index.html'">
                            <div class="logo-icon">
                                <i class="fa-solid fa-hospital"></i>
                            </div>
                            <div class="logo-text">Clinique Refontiq</div>
                        </div>
                    </div>
                    <div class="mobile-page-title">
                        ${pageTitle}
                    </div>
                </header>
            `;
            mainContent.insertAdjacentHTML('afterbegin', headerHTML);
        }
        // --- FIN INJECTION MOBILE HEADER ---

        let url = 'components/sidebar-medecin.html';
        if (role === this.roles.RECEPTIONNISTE) url = 'components/sidebar-reception.html';
        if (role === this.roles.INFIRMIERE) url = 'components/sidebar-infirmiere.html';
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur de chargement du composant HTML');
            const html = await response.text();
            container.innerHTML = html;
        } catch (e) {
            console.error('[RoleManager] Erreur chargement sidebar:', e);
            // Fallback en cas d'erreur locale (ex: fetch échoue sur file:///)
            container.innerHTML = `<div style="padding:20px; color:white;">Erreur de chargement du menu. Utilisez un serveur local.</div>`;
        }
    },

    highlightActiveMenu() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        const items = document.querySelectorAll('.nav-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === currentPage || item.id === `menu-${currentPage}` || item.id === `nav-${currentPage}`) {
                item.classList.add('active');
                const parentGroup = item.closest('.nav-group');
                if (parentGroup) {
                    parentGroup.classList.add('active');
                }
            }
        });
    },

    updateProfileDisplay(user) {
        const sideName = document.getElementById('side-name');
        const sideRole = document.getElementById('side-role');
        const sideAvatar = document.getElementById('side-avatar');

        if (sideName) sideName.textContent = user.name || 'Utilisateur';
        if (sideRole) sideRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        if (sideAvatar) sideAvatar.textContent = (user.name || 'U').substring(0, 2).toUpperCase();
    },

    getCurrentUser() {
        try {
            const u = localStorage.getItem('currentUser');
            return u ? JSON.parse(u) : null;
        } catch (e) {
            console.error("Error reading user session", e);
            return null;
        }
    },

    applyPermissions(role) {
        // La navigation est désormais sécurisée et chargée dynamiquement via loadSidebar()
        // Il n'y a plus de menus interdits à cacher dans le DOM !

        // 2. Affichage du Dashboard spécifique
        const dashReception = document.getElementById('receptionist-dashboard');
        const dashNurse = document.getElementById('nurse-dashboard');
        const dashMedical = document.getElementById('medical-dashboard');

        if (dashReception) dashReception.style.display = (role === this.roles.RECEPTIONNISTE) ? 'block' : 'none';
        if (dashNurse) dashNurse.style.display = (role === this.roles.INFIRMIERE) ? 'block' : 'none';
        if (dashMedical) dashMedical.style.display = (role === this.roles.MEDECIN) ? 'block' : 'none';

        // Initialisation des vues spécifiques
        if (role === this.roles.RECEPTIONNISTE && typeof initReceptionistView === 'function') initReceptionistView();
        if (role === this.roles.INFIRMIERE && typeof initNurseView === 'function') initNurseView();
        if (role === this.roles.MEDECIN && typeof initMedicalView === 'function') initMedicalView();

        // 3. Masquage des widgets sur le dashboard
        if (role !== this.roles.MEDECIN) {
            // Cacher les widgets financiers sur le dashboard principal
            const financeWidgets = document.querySelectorAll('.stat-card[onclick*="finance.html"], .stat-card[onclick*="reporting.html"]');
            financeWidgets.forEach(el => el.style.display = 'none');
            
            // Cacher le bouton de rapport journalier
            const reportBtn = document.getElementById('btn-rapport');
            if (reportBtn) reportBtn.style.display = 'none';
        }

        // 3. Redirection si tentative d'accès direct à une page interdite
        this.checkPageAccess(role);
    },

    checkPageAccess(role) {
        const currentPage = window.location.pathname.split('/').pop();
        const accessRules = {
            'finance.html': [this.roles.MEDECIN],
            'reporting.html': [this.roles.MEDECIN],
            'consultations.html': [this.roles.MEDECIN, this.roles.INFIRMIERE],
            'hospitalisation.html': [this.roles.MEDECIN, this.roles.INFIRMIERE]
        };

        if (accessRules[currentPage] && !accessRules[currentPage].includes(role)) {
            console.warn(`[RoleManager] Access denied for ${currentPage} (Role: ${role})`);
            window.location.href = 'dashboard.html';
        }
    }
};

// Fonctions Globales Accessibles depuis le HTML
window.toggleMobileSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

window.toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    if (typeof window.updateThemeIcon === 'function') window.updateThemeIcon(target);
};

window.updateThemeIcon = (theme) => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
            icon.style.color = '#fbbf24';
        } else {
            icon.className = 'fa-solid fa-moon';
            icon.style.color = 'inherit';
        }
    }
};

// Auto-initialisation du thème au plus tôt (avant le rendu du body)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const hour = new Date().getHours();
        if (hour >= 20 || hour < 6) document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => RoleManager.init());
