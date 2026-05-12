/* ══════════════════════════════════════════════════════════════════════════════
    REFONTIQ LANDING PAGE - MAIN SCRIPTS
    ══════════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    /* ── Navbar scroll behavior ── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    /* ── Hamburger Menu ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        
        // Globally accessible close function
        window.closeMobile = () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        };

        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
                window.closeMobile();
            }
        });
    }

    /* ── Scroll reveal animation ── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ── Appointment Form Handling ── */
    const rdvForm = document.getElementById('rdvForm');
    if (rdvForm) {
        rdvForm.addEventListener('submit', handleFormSubmit);
    }

    /* 🔐 Check authentication status and update buttons */
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const navLoginLink = document.getElementById('nav-login-link');
        const mobileLoginLink = document.getElementById('mobile-login-link');
        
        if (navLoginLink) {
            navLoginLink.innerHTML = '<i class="fa-solid fa-user-circle"></i> Mon espace';
            navLoginLink.href = 'app/dashboard.html';
            navLoginLink.style.color = 'var(--success)';
        }
        if (mobileLoginLink) {
            mobileLoginLink.innerHTML = '<i class="fa-solid fa-user-circle"></i> Mon espace';
            mobileLoginLink.href = 'app/dashboard.html';
            mobileLoginLink.style.color = 'var(--primary)';
        }
    }

    /* ── Active nav link on scroll ── */
    const sections = document.querySelectorAll('section[id], div[id="hero"]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 120) current = s.id;
        });
        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = (navbar && navbar.classList.contains('scrolled')) ? 'var(--primary)' : 'white';
            }
        });
    });
});

/**
 * Handle form submission via Supabase
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const tel = document.getElementById('tel').value.trim();
    const date = document.getElementById('rdv-date').value;
    const time = document.getElementById('rdv-time').value;
    const spec = document.getElementById('specialite').value;
    const message = document.getElementById('message').value.trim();

    // Validation
    if (!prenom || !nom || !tel || !date || !time || !spec) {
        const fields = [
            [prenom, 'prenom'], [nom, 'nom'],
            [tel, 'tel'], [date, 'rdv-date'],
            [time, 'rdv-time'], [spec, 'specialite']
        ];
        fields.forEach(([val, id]) => {
            const el = document.getElementById(id);
            if(el) {
                el.style.borderColor = val ? '#e2e8f0' : 'var(--accent)';
                el.style.boxShadow = val ? '' : '0 0 0 3px rgba(230,57,70,0.1)';
            }
        });
        return;
    }

    // Reset styles
    ['prenom','nom','tel','rdv-date','rdv-time','specialite'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.style.borderColor = '#e2e8f0';
            el.style.boxShadow = '';
        }
    });

    const btn = form.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
        if (!window.SupabaseAPI) throw new Error("API Supabase non chargée.");
        const supabase = await window.SupabaseAPI.initSupabase();
        if (!supabase) throw new Error("Connexion à la base de données impossible.");

        // 1. Find or create patient
        let patientId = null;
        const { data: patients } = await supabase
            .from('patients')
            .select('id')
            .eq('telephone', tel)
            .limit(1);

        if (patients && patients.length > 0) {
            patientId = patients[0].id;
        } else {
            const { data: newP, error: iErr } = await supabase
                .from('patients')
                .insert([{ nom, prenom, telephone: tel }])
                .select('id');
            
            if (iErr) throw new Error("Impossible de créer le dossier patient: " + iErr.message);
            if (newP && newP.length > 0) patientId = newP[0].id;
        }

        if (!patientId) throw new Error("Impossible de déterminer le patient.");

        // 2. Insert appointment
        const rdv = {
            patient_id: patientId,
            date: date,
            heure: time,
            motif: spec,
            notes: message || null,
            statut: 'en_attente'
        };

        const { error: rErr } = await supabase.from('rendez_vous').insert([rdv]);
        if (rErr) throw new Error("Impossible d'enregistrer le rendez-vous: " + rErr.message);

        // Success
        form.reset();
        showToast();
        
    } catch (err) {
        console.error("❌ Erreur:", err);
        alert("Erreur: " + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function showToast() {
    const t = document.getElementById('toast');
    if (t) {
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 4000);
    }
}
