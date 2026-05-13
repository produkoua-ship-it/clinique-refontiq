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
        paiements: 'paiements',
        invitations: 'invitations'   // Gestion du personnel
    }
};

// ===========================================
//  FONCTIONS DE CONNEXION À LA BASE DE DONNÉES
// ===========================================

/**
 * Initialise la connexion à Supabase
 */
let cachedSupabase = null;
async function initSupabase() {
    try {
        if (cachedSupabase) return cachedSupabase;

        // Vérifier si les clés sont configurées
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key || SUPABASE_CONFIG.url === 'VOTRE_URL_SUPABASE' || SUPABASE_CONFIG.key === 'VOTRE_CLE_ANON_SUPABASE') {
            console.warn('⚠️ Supabase non configurée.');
            return null;
        }

        let supabaseLib = window.supabase;
        if (!supabaseLib) {
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                supabaseLib = window.supabase;
                if (supabaseLib) break;
            }
        }

        if (!supabaseLib) return null;

        cachedSupabase = supabaseLib.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('✅ Supabase connecté (Client mis en cache)');
        return cachedSupabase;
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error.message);
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
 * Connecte un utilisateur (vérifie email et met à jour le statut)
 * Système intelligent de session unique :
 *  1. Nettoie les sessions périmées (>30 min d'inactivité)
 *  2. Vérifie s'il y a une session réellement active
 *  3. Si non → connecte l'utilisateur et déconnecte les anciennes sessions du même rôle
 *  4. Si oui → bloque la connexion avec message clair
 */
async function loginUser(supabase, email) {
    if (!supabase) return { success: false, reason: 'DB_ERROR' };
    
    const { data: user, error } = await supabase
        .from(SUPABASE_CONFIG.tables.users)
        .select('*')
        .eq('email', email)
        .single();
        
    if (error || !user) {
        return { success: false, reason: 'NOT_FOUND' };
    }

    // Vérification de la restriction pour infirmière et réceptionniste
    if (user.role === 'infirmiere' || user.role === 'receptionniste') {
        const limiteTemps = new Date(Date.now() - 30 * 60000).toISOString(); // 30 minutes
        
        // ÉTAPE 1 : Nettoyer les sessions périmées (>30 min sans activité)
        await supabase
            .from(SUPABASE_CONFIG.tables.users)
            .update({ est_connecte: false })
            .eq('role', user.role)
            .eq('est_connecte', true)
            .lt('derniere_activite', limiteTemps);

        // ÉTAPE 2 : Vérifier s'il reste une session VRAIMENT active
        const { data: actifs, error: actErr } = await supabase
            .from(SUPABASE_CONFIG.tables.users)
            .select('*')
            .eq('role', user.role)
            .eq('est_connecte', true)
            .gte('derniere_activite', limiteTemps)
            .neq('email', user.email);

        if (actifs && actifs.length > 0) {
            return { 
                success: false, 
                reason: 'ALREADY_LOGGED_IN', 
                activeUser: actifs[0].nom || actifs[0].email 
            };
        }

        // ÉTAPE 3 : Déconnecter toutes les anciennes sessions du même rôle (sécurité)
        await supabase
            .from(SUPABASE_CONFIG.tables.users)
            .update({ est_connecte: false })
            .eq('role', user.role)
            .neq('email', user.email);
    }

    // ÉTAPE 4 : Connecter l'utilisateur
    await supabase.from(SUPABASE_CONFIG.tables.users)
        .update({ est_connecte: true, derniere_activite: new Date().toISOString() })
        .eq('email', user.email);

    return { success: true, data: user };
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
        .in('statut', ['en_attente', 'confirme'])
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

/**
 * Met à jour tous les badges d'alertes de l'application (Sidebar & Mobile Header)
 */
async function updateGlobalAlertBadges() {
    const badges = document.querySelectorAll('.nav-badge, .badge');
    const supabase = await initSupabase();
    if (!supabase) return;

    try {
        const { count, error } = await supabase
            .from('alertes')
            .select('*', { count: 'exact', head: true })
            .eq('lu', false);

        if (error) throw error;

        badges.forEach(badge => {
            if (count > 0 && badge.id !== 'badge-stocks') { // On exclut badge-stocks car géré séparément
                badge.textContent = count;
                badge.style.display = 'inline-flex';
            } else if (badge.id !== 'badge-stocks') {
                badge.style.display = 'none';
            }
        });

        // 2. Badges des Stocks (Produits < Seuil ou Expirant bientôt)
        const now = new Date();
        const limit30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const { data: stocks } = await supabase
            .from('stocks')
            .select('quantite, seuil_alerte, date_expiration');
            
        if (stocks) {
            let stockAlerts = 0;
            stocks.forEach(s => {
                if (s.quantite < (s.seuil_alerte || 10)) {
                    stockAlerts++;
                } else if (s.date_expiration) {
                    const expDate = new Date(s.date_expiration);
                    if (expDate <= limit30Days) stockAlerts++;
                }
            });
            
            const menuStocks = document.getElementById('menu-stocks');
            if (menuStocks) {
                let badgeStocks = document.getElementById('badge-stocks');
                if (!badgeStocks) {
                    badgeStocks = document.createElement('span');
                    badgeStocks.id = 'badge-stocks';
                    badgeStocks.className = 'nav-badge';
                    badgeStocks.style.cssText = 'margin-left:auto; background:#ef4444; color:white; font-size:0.7rem; padding:2px 6px; border-radius:10px; font-weight:700; display:none;';
                    menuStocks.appendChild(badgeStocks);
                }
                
                if (stockAlerts > 0) {
                    badgeStocks.textContent = stockAlerts;
                    badgeStocks.style.display = 'inline-flex';
                } else {
                    badgeStocks.style.display = 'none';
                }
            }
        }
    } catch (err) {
        console.warn("Erreur mise à jour badges:", err.message);
    }
}

/**
 * Met à jour le badge des rendez-vous en attente sur le menu "Rendez-vous" de la sidebar
 */
async function updateRdvPendingBadge() {
    const supabase = await initSupabase();
    if (!supabase) return;

    try {
        const { count, error } = await supabase
            .from('rendez_vous')
            .select('*', { count: 'exact', head: true })
            .eq('statut', 'en_attente');

        if (error) return;

        const menuRdv = document.getElementById('menu-rendezvous');
        if (!menuRdv) return;

        let badge = document.getElementById('badge-rdv-pending');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'badge-rdv-pending';
            badge.style.cssText = `
                margin-left: auto;
                background: linear-gradient(135deg, #f59e0b, #ef4444);
                color: white;
                font-size: 0.7rem;
                min-width: 20px;
                height: 20px;
                padding: 0 6px;
                border-radius: 10px;
                font-weight: 700;
                display: none;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
                animation: badgePulse 2s ease-in-out infinite;
            `;
            menuRdv.appendChild(badge);

            // Injecter l'animation CSS si pas encore fait
            if (!document.getElementById('badge-pulse-style')) {
                const style = document.createElement('style');
                style.id = 'badge-pulse-style';
                style.textContent = `
                    @keyframes badgePulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.15); }
                    }
                    @keyframes slideInNotif {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.warn("Erreur badge RDV:", err.message);
    }
}

/**
 * Écoute en temps réel les nouveaux rendez-vous insérés depuis le site public.
 * Fonctionne sur TOUTES les pages du dashboard.
 */
async function setupGlobalRdvListener() {
    const supabase = await initSupabase();
    if (!supabase) return;

    supabase.channel('global_rdv_alerts')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'rendez_vous' },
            (payload) => {
                if (payload.new.statut === 'en_attente') {
                    // 1. Mettre à jour le badge
                    updateRdvPendingBadge();

                    // 2. Afficher une notification visuelle premium
                    afficherNotifRDV(payload.new);
                }
            }
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rendez_vous' },
            () => {
                // Quand un RDV est confirmé, on recompte
                updateRdvPendingBadge();
            }
        )
        .subscribe();
}

/**
 * Affiche une notification flottante élégante quand un nouveau RDV arrive
 */
function afficherNotifRDV(rdv) {
    // Créer le conteneur si nécessaire
    let container = document.getElementById('rdv-notif-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'rdv-notif-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:12px; pointer-events:none;';
        document.body.appendChild(container);
    }

    const notif = document.createElement('div');
    notif.style.cssText = `
        pointer-events: auto;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: white;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(245,158,11,0.3);
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 320px;
        max-width: 420px;
        animation: slideInNotif 0.4s ease-out;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.3s;
        font-family: 'Inter', sans-serif;
    `;

    const heureStr = rdv.heure ? rdv.heure.substring(0, 5) : '--:--';
    const dateStr = rdv.date || 'Date inconnue';

    notif.innerHTML = `
        <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #f59e0b, #ef4444); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i class="fa-solid fa-calendar-plus" style="font-size:1.2rem; color:white;"></i>
        </div>
        <div style="flex:1; min-width:0;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:2px;">🔔 Nouveau Rendez-vous !</div>
            <div style="font-size:0.8rem; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${dateStr} à ${heureStr} — ${rdv.motif || 'Consultation'}
            </div>
        </div>
        <div style="font-size:0.7rem; color:#f59e0b; font-weight:600; white-space:nowrap;">EN ATTENTE</div>
    `;

    notif.onmouseenter = () => { notif.style.transform = 'scale(1.02)'; };
    notif.onmouseleave = () => { notif.style.transform = 'scale(1)'; };
    notif.onclick = () => { window.location.href = 'rendez-vous.html'; };

    container.appendChild(notif);

    // Disparition automatique après 8 secondes
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => notif.remove(), 400);
    }, 8000);

    // Son de notification (bip léger)
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
}

// Initialisation globale au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    updateGlobalAlertBadges();
    updateRdvPendingBadge();      
    setupGlobalRdvListener();     
    adapterMenuParRole();   
    injecterBoutonDeconnexion(); 
    demarrerHeartbeat(); 
});

/**
 * Maintient la session active en mettant à jour derniere_activite
 */
function demarrerHeartbeat() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;
    
    // Mettre à jour immédiatement
    envoyerHeartbeat();
    
    // Puis toutes les 5 minutes (300000 ms)
    setInterval(envoyerHeartbeat, 5 * 60 * 1000);
}

async function envoyerHeartbeat() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    
    // Le médecin n'a pas besoin de heartbeat car il n'a pas de restriction
    if (user.role === 'medecin') return;
    
    const supabase = await window.SupabaseAPI.initSupabase();
    if (!supabase) return;

    // ÉTAPE 1 : Mettre à jour ma propre présence d'abord
    await supabase.from(SUPABASE_CONFIG.tables.users)
        .update({ est_connecte: true, derniere_activite: new Date().toISOString() })
        .eq('email', user.email);

    // ÉTAPE 2 : Vérifier si un AUTRE utilisateur du même rôle est aussi connecté
    const limiteTemps = new Date(Date.now() - 30 * 60000).toISOString();
    const { data: actifs } = await supabase
        .from(SUPABASE_CONFIG.tables.users)
        .select('email, derniere_activite')
        .eq('role', user.role)
        .eq('est_connecte', true)
        .gte('derniere_activite', limiteTemps)
        .neq('email', user.email);
        
    if (actifs && actifs.length > 0) {
        // Conflit détecté ! L'autre session est plus récente que la mienne → je cède la place
        // Marquer MA session comme déconnectée en base de données (éviter les fantômes)
        await supabase.from(SUPABASE_CONFIG.tables.users)
            .update({ est_connecte: false })
            .eq('email', user.email);

        localStorage.removeItem('currentUser');
        
        // Écran de blocage professionnel avant redirection
        document.body.innerHTML = `
            <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: white; font-family: 'Inter', sans-serif;">
                <div style="width: 80px; height: 80px; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <i class="fa-solid fa-lock" style="font-size: 2.5rem; color: #ef4444;"></i>
                </div>
                <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2rem; margin-bottom: 16px;">Accès Révoqué</h2>
                <p style="color: #94a3b8; text-align: center; max-width: 450px; line-height: 1.6; font-size: 1.1rem;">
                    Un autre membre du personnel (<strong>${user.role}</strong>) s'est connecté au système. 
                    Pour des raisons de sécurité, votre session a été fermée.
                </p>
            </div>
        `;
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 4000);
        return;
    }
}

/**
 * Adapte le menu latéral selon le rôle de l'utilisateur connecté.
 * Les liens doivent avoir les IDs : menu-finance, menu-stocks, etc.
 */
function adapterMenuParRole() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const role = user.role;

    // Mettre à jour le profil sidebar si les éléments existent
    const sideAvatar = document.getElementById('side-avatar');
    const sideName   = document.getElementById('side-name');
    const sideRole   = document.getElementById('side-role');
    const roleLabels = { medecin: 'Médecin', infirmiere: 'Infirmière', receptionniste: 'Réceptionniste' };

    if (sideAvatar) sideAvatar.textContent = (user.name || 'U').substring(0, 2).toUpperCase();
    if (sideName)   sideName.childNodes[0].textContent = user.name || 'Utilisateur';
    if (sideRole)   sideRole.textContent = roleLabels[role] || role;

    // Fonction utilitaire pour masquer un élément
    const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

    if (role === 'receptionniste') {
        hide('menu-finance');
        hide('menu-stocks');
        hide('menu-consultations');
        hide('menu-parametres');
        hide('sep-finance');
    } else if (role === 'infirmiere') {
        hide('menu-finance');
        hide('menu-consultations');
        hide('menu-rendezvous');
        hide('menu-parametres');
        hide('sep-finance');
    }
    // Le médecin voit tout → rien à cacher
}

/**
 * Injecte un bouton "Se déconnecter" en bas de la sidebar
 * visible pour tous les rôles (utile quand Paramètres est caché).
 */
function injecterBoutonDeconnexion() {
    const navMenu = document.querySelector('.sidebar .nav-menu');
    if (!navMenu || document.getElementById('sidebar-logout-btn')) return;

    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'sidebar-logout-btn';
    logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket" style="margin-right: 8px;"></i> Se déconnecter';
    logoutBtn.style.cssText = `
        width: calc(100% - 24px);
        margin: 12px 12px 8px;
        padding: 12px 16px;
        border-radius: 10px;
        border: 1.5px solid rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
        font-family: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;
    logoutBtn.onmouseenter = () => {
        logoutBtn.style.background = 'rgba(239, 68, 68, 0.18)';
        logoutBtn.style.borderColor = '#ef4444';
    };
    logoutBtn.onmouseleave = () => {
        logoutBtn.style.background = 'rgba(239, 68, 68, 0.08)';
        logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    };
    logoutBtn.onclick = async () => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            const supabase = await window.SupabaseAPI.initSupabase();
            if (supabase) {
                // Libérer la session dans la base de données
                await supabase.from('users').update({ est_connecte: false }).eq('email', user.email);
            }
        }
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('dashboard_entered'); // Réinitialiser le splash screen pour la prochaine connexion
        const isAppPath = window.location.pathname.includes('/app/');
        window.location.href = isAppPath ? '../login.html' : 'login.html';
    };

    navMenu.appendChild(logoutBtn);
}

/**
 * Rend le logo de la sidebar et le nom dans le mobile header cliquables
 * vers la page d'accueil (index.html)
 */
function initLogoNavigation() {
    // 1. Logo dans la sidebar (desktop + mobile ouvert)
    const logo = document.querySelector('.sidebar .logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.style.transition = 'opacity 0.2s, transform 0.2s';
        logo.title = "Retour à l'accueil";
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        logo.addEventListener('mouseenter', () => {
            logo.style.opacity = '0.8';
            logo.style.transform = 'scale(0.97)';
        });
        logo.addEventListener('mouseleave', () => {
            logo.style.opacity = '1';
            logo.style.transform = 'scale(1)';
        });
    }

    // 2. Nom de la clinique dans le mobile header
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) {
        // Trouver le texte "Clinique Refontiq" et l'icône hôpital dans le header mobile
        const headerItems = mobileHeader.querySelectorAll('div');
        headerItems.forEach(div => {
            if (div.textContent.trim().includes('Clinique Refontiq') && !div.querySelector('button')) {
                // C'est le conteneur avec l'icône + le nom
                div.style.cursor = 'pointer';
                div.title = "Retour à l'accueil";
                div.addEventListener('click', (e) => {
                    // Ne pas déclencher si on clique sur le bouton hamburger
                    if (e.target.closest('button')) return;
                    window.location.href = 'index.html';
                });
            }
        });
    }
}

/**
 * Initialise la recherche intelligente dans la sidebar.
 * Se connecte automatiquement à l'input existant dans .search-wrapper
 */
function initSmartSearch() {
    const searchWrapper = document.querySelector('.sidebar-search .search-wrapper');
    if (!searchWrapper) return;

    const input = searchWrapper.querySelector('input');
    if (!input) return;

    // Créer le conteneur de résultats
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'smart-search-results';
    searchWrapper.style.position = 'relative';
    searchWrapper.appendChild(resultsDiv);

    // Injecter le CSS du dropdown
    const style = document.createElement('style');
    style.textContent = `
        #smart-search-results {
            display: none;
            position: absolute;
            top: calc(100% + 6px);
            left: 0; right: 0;
            background: var(--card, #fff);
            border-radius: 14px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            z-index: 9999;
            max-height: 320px;
            overflow-y: auto;
            border: 1px solid var(--border, #e2e8f0);
        }
        #smart-search-results .search-item {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px; cursor: pointer;
            transition: all 0.15s ease;
            border-bottom: 1px solid rgba(0,0,0,0.04);
            color: var(--text, #1e293b);
        }
        #smart-search-results .search-item:last-child { border-bottom: none; }
        #smart-search-results .search-item:hover {
            background: var(--primary-light, #caf0f8);
            padding-left: 20px;
        }
        #smart-search-results .search-avatar {
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg, var(--primary, #0077b6), #0ea5e9);
            color: white; display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
        }
        #smart-search-results .search-name { font-weight: 600; font-size: 0.9rem; }
        #smart-search-results .search-tel { font-size: 0.75rem; color: var(--text-light, #64748b); }
        #smart-search-results .search-empty {
            padding: 20px; text-align: center; color: var(--text-light, #64748b); font-size: 0.85rem;
        }
        #smart-search-results .search-highlight { color: var(--primary, #0077b6); font-weight: 700; }
    `;
    document.head.appendChild(style);

    // Debounce timer
    let debounceTimer = null;

    // Événement de saisie
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            const supabase = await initSupabase();
            if (!supabase) return;

            const { data: patients } = await supabase
                .from(SUPABASE_CONFIG.tables.patients)
                .select('id, nom, prenom, telephone')
                .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%`)
                .order('nom')
                .limit(6);

            if (!patients || patients.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="search-empty">
                        <i class="fa-solid fa-user-slash" style="font-size: 1.3rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                        Aucun patient trouvé pour « <strong>${query}</strong> »
                    </div>`;
                resultsDiv.style.display = 'block';
                return;
            }

            resultsDiv.innerHTML = patients.map(p => {
                const fullName = `${p.nom} ${p.prenom || ''}`;
                const initials = (p.nom[0] + (p.prenom ? p.prenom[0] : '')).toUpperCase();
                // Highlight matching text
                const regex = new RegExp(`(${query})`, 'gi');
                const highlighted = fullName.replace(regex, '<span class="search-highlight">$1</span>');
                return `
                    <div class="search-item" onclick="window.location.href='dossier-patient.html?id=${p.id}'">
                        <div class="search-avatar">${initials}</div>
                        <div>
                            <div class="search-name">${highlighted}</div>
                            <div class="search-tel"><i class="fa-solid fa-phone" style="margin-right: 4px; font-size: 0.65rem;"></i>${p.telephone || 'Pas de téléphone'}</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="margin-left: auto; opacity: 0.3; font-size: 0.7rem;"></i>
                    </div>`;
            }).join('');
            resultsDiv.style.display = 'block';
        }, 300); // Délai de 300ms pour éviter trop de requêtes
    });

    // Fermer les résultats quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });

    // Fermer avec Escape
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resultsDiv.style.display = 'none';
            input.blur();
        }
    });
}

// Exposer globalement aussi pour compatibilité
window.updateDrawerUser = updateDrawerUser;
window.rechercheRapide = rechercheRapide;
window.toggleNotifications = toggleNotifications;
window.actualiserNotifications = actualiserNotifications;
window.updateGlobalAlertBadges = updateGlobalAlertBadges;

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
window.notifier = function(message, type = 'success', duration = 4000) {
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
    }, duration);
};