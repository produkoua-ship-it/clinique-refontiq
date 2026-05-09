// ===========================================
//  CONFIGURATION SUPABASE - CLINIQUE REFONTIQ
// ===========================================
// 
// 📋 INSTRUCTIONS POUR DÉBUTANT :
// 1. Ouvrez ce fichier avec le Bloc-Notes
// 2. Remplacez 'VOTRE_URL' et 'VOTRE_CLE' par les valeurs de votre projet Supabase
// 3. Sauvegardez (Ctrl+S)
// 4. Actualisez votre navigateur (F5)
//
// Pour trouver vos clés :
// - Connectez-vous sur https://supabase.com
// - Allez dans Project Settings > API
// - Copiez "Project URL" et "anon public key"
// ===========================================

const SUPABASE_CONFIG = {
    url: 'https://oqjmwldnwxyvcvacmtft.supabase.co', 
    key: 'sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224',
    tables: {
        users: 'users',
        patients: 'patients',
        consultations: 'consultations',
        appointments: 'rendez_vous',
        transactions: 'transactions',
        stocks: 'stocks',
        orders: 'commandes',
        messages: 'messages',
        alerts: 'alertes',
        paiements: 'paiements'
    }
};

// ===========================================
//  FONCTIONS DE CONNEXION À LA BASE DE DONNÉES
// ===========================================

/**
 * Initialise la connexion à Supabase
 */
async function initSupabase() {
    try {
        // Vérifier si les clés sont configurées
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key || SUPABASE_CONFIG.url === 'VOTRE_URL_SUPABASE' || SUPABASE_CONFIG.key === 'VOTRE_CLE_ANON_SUPABASE') {
            console.warn('⚠️ Supabase non configurée. Ouvrez supabase-config.js et ajoutez vos clés.');
            return null;
        }

        // Vérifier si la bibliothèque est chargée (avec retry si nécessaire)
        let supabaseLib = window.supabase;
        if (!supabaseLib) {
            console.log('⏳ Attente du chargement de Supabase...');
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                supabaseLib = window.supabase;
                if (supabaseLib) break;
            }
        }

        if (!supabaseLib) {
            console.error('❌ Erreur: La bibliothèque Supabase n\'est pas chargée après 2.5s.');
            return null;
        }

        // Créer le client Supabase
        const supabase = supabaseLib.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

        // Tester la connexion (optionnel, on peut juste renvoyer le client)
        console.log('✅ Tentative de connexion à Supabase...');
        return supabase;
    } catch (error) {
        console.error('❌ Erreur d\'initialisation Supabase:', error.message);
        return null;
    }
}

/**
 * Charge les patients depuis Supabase
 */
async function loadPatients(supabase) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.patients)
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error('Erreur chargement patients:', error); return []; }
    return data || [];
}

/**
 * Charge les consultations depuis Supabase
 */
async function loadConsultations(supabase) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.consultations)
        .select('*, patients(*)')
        .order('date', { ascending: false });
    if (error) { console.error('Erreur chargement consultations:', error); return []; }
    return data || [];
}

/**
 * Charge les rendez-vous depuis Supabase
 */
async function loadAppointments(supabase) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.appointments)
        .select('*, patients(*)')
        .order('date', { ascending: true });
    if (error) { console.error('Erreur chargement rendez-vous:', error); return []; }
    return data || [];
}

/**
 * Charge les stocks depuis Supabase
 */
async function loadStocks(supabase) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.stocks)
        .select('*')
        .order('quantite', { ascending: true });
    if (error) { console.error('Erreur chargement stocks:', error); return []; }
    return data || [];
}

/**
 * Charge les alertes depuis Supabase
 */
async function loadAlerts(supabase) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.alerts)
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error('Erreur chargement alertes:', error); return []; }
    return data || [];
}

/**
 * Connecte un utilisateur (vérifie email et mot de passe dans la base)
 */
async function loginUser(supabase, email) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.users)
        .select('*')
        .eq('email', email)
        .single();
    if (error) { console.error('Erreur connexion:', error); return null; }
    return data;
}

/**
 * Met à jour les informations de l'utilisateur dans le menu latéral
 */
function updateDrawerUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            const userNameElement = document.getElementById('userName'); 
            const userRoleElement = document.getElementById('userRole');
            const userAvatarElement = document.getElementById('userAvatar');

            if (userNameElement) {
                // On essaie de formater joliment le nom si possible
                const roles = { 'medecin': 'Dr.', 'infirmiere': 'Infirm.', 'receptionniste': 'M.' };
                const prefix = roles[user.role] || '';
                userNameElement.textContent = prefix + " " + (user.name || "Utilisateur");
            }
            if (userRoleElement) {
                const roleNames = { 'medecin': 'Médecin', 'infirmiere': 'Infirmière', 'receptionniste': 'Réceptionniste' };
                userRoleElement.textContent = roleNames[user.role] || user.role || "Personnel";
            }
            if (userAvatarElement && user.name) {
                userAvatarElement.textContent = user.name.substring(0, 2).toUpperCase();
            }
        } catch(e) {
            console.warn("Impossible de mettre à jour le profil utilisateur:", e);
        }
    }
}

/**
 * Fonction de recherche rapide universelle pour la sidebar
 */
async function rechercheRapide(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    const supabase = await window.SupabaseAPI.initSupabase();
    if (!supabase) return;

    const { data: patients, error } = await supabase
        .from(SUPABASE_CONFIG.tables.patients)
        .select('id, nom, prenom')
        .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%`)
        .limit(5);

    if (patients && patients.length > 0) {
        resultsContainer.innerHTML = patients.map(p => `
            <div class="result-item" onclick="window.location.href='dossier-patient.html?id=${p.id}'">
                <span>${p.nom} ${p.prenom || ''}</span>
            </div>
        `).join('');
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

// Gestion universelle des clics (Recherche & Notifications)
document.addEventListener('click', (e) => {
    // Fermer la recherche
    const resultsContainer = document.getElementById('search-results');
    const searchInput = document.getElementById('global-search');
    if (resultsContainer && searchInput && !resultsContainer.contains(e.target) && e.target !== searchInput) {
        resultsContainer.style.display = 'none';
    }

    // Fermer les notifications (Click Outside)
    if (!e.target.closest('.notification-wrapper')) {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

/**
 * Alterne l'affichage du menu de notifications
 */
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active')) {
        actualiserNotifications(); // On rafraîchit à l'ouverture
    }
}

/**
 * Charge les dernières notifications (derniers rendez-vous du jour) depuis Supabase
 */
async function actualiserNotifications() {
    const notifList = document.getElementById('notif-list');
    const badge = document.querySelector('.notification-badge');
    const bellIcon = document.querySelector('.notification-bell i');
    if (!notifList) return;

    const supabase = await initSupabase();
    if (!supabase) return;

    const today = new Date().toISOString().split('T')[0];
    
    // On récupère les RDV prévus aujourd'hui
    const { data: rdvs, error } = await supabase
        .from(SUPABASE_CONFIG.tables.appointments)
        .select('*, patients(nom, prenom)')
        .eq('date', today)
        .eq('statut', 'prevu')
        .order('heure', { ascending: true });

    if (error || !rdvs || rdvs.length === 0) {
        notifList.innerHTML = '<p style="padding:15px; font-size:0.8rem; color:gray;">Aucune notification pour aujourd\'hui.</p>';
        if (badge) badge.style.display = 'none';
        return;
    }

    // Effet "Shake" si de nouvelles notifications sont présentes
    if (bellIcon) {
        bellIcon.classList.add('shake-animation');
        setTimeout(() => bellIcon.classList.remove('shake-animation'), 500);
    }

    // Mise à jour du badge
    if (badge) {
        badge.textContent = rdvs.length;
        badge.style.display = 'flex';
    }

    // Génération de la liste détaillée
    notifList.innerHTML = rdvs.map(rdv => `
        <div class="notif-item" onclick="window.location.href='dossier-patient.html?id=${rdv.patient_id}'">
            <div style="font-weight:600; color:var(--primary);">⏰ Rappel RDV - ${rdv.heure.substring(0,5)}</div>
            <div style="font-size:0.8rem;">Patient : ${rdv.patients.nom} ${rdv.patients.prenom || ''}</div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">
                <i class="fa-regular fa-clock"></i> Arrivée prévue bientôt
            </div>
        </div>
    `).join('');
}

// Exporter les fonctions
window.SupabaseAPI = {
    initSupabase,
    loadPatients,
    loadConsultations,
    loadAppointments,
    loadStocks,
    loadAlerts,
    loginUser,
    updateDrawerUser,
    rechercheRapide,
    toggleNotifications,
    actualiserNotifications,
    config: SUPABASE_CONFIG
};

// Exposer globalement aussi pour compatibilité
window.updateDrawerUser = updateDrawerUser;
window.rechercheRapide = rechercheRapide;
window.toggleNotifications = toggleNotifications;
window.actualiserNotifications = actualiserNotifications;

/**
 * Déconnecte l'utilisateur et redirige vers la page d'accueil
 */
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

// ===========================================
//  SYSTÈME DE NOTIFICATIONS "TOAST" PREMIUM
// ===========================================

/**
 * Affiche une notification élégante en haut à droite
 * @param {string} message - Le message à afficher
 * @param {string} type - 'success' ou 'error'
 */
window.notifier = function(message, type = 'success') {
    // 1. Créer le conteneur s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        
        // Injection dynamique du CSS des toasts
        const style = document.createElement('style');
        style.textContent = `
            #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; pointer-events: none; }
            .toast { 
                background: white; border-left: 5px solid #22c55e; color: #1e293b; 
                padding: 16px 25px; margin-bottom: 10px; border-radius: 12px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; 
                gap: 15px; min-width: 320px; pointer-events: auto;
                animation: toastIn 0.5s ease forwards; transition: all 0.5s ease;
            }
            .toast.error { border-left-color: #ef4444; }
            .toast i { font-size: 1.4rem; }
            .toast.success i { color: #22c55e; }
            .toast.error i { color: #ef4444; }
            @keyframes toastIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Créer l'élément de notification
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    const title = type === 'success' ? 'Succès' : 'Attention';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div>
            <strong style="display:block; font-size:0.9rem;">${title}</strong>
            <span style="font-size:0.85rem;">${message}</span>
        </div>
    `;

    // 3. Ajouter au conteneur
    container.appendChild(toast);

    // 4. Disparition automatique après 4 secondes
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};