import os
import re

def clean_and_repair(path):
    filename = os.path.basename(path)
    if filename == "index.html" or filename == "supabase-setup.html":
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix the double-wrapped window check mess
    content = re.sub(r'if\s*\(window\.updateDrawerUser\)\s*window\.if\(window\.updateDrawerUser\)\s*window\.updateDrawerUser\(\);', 
                     'if (window.updateDrawerUser) window.updateDrawerUser();', content)
    
    # 2. Find the TRUNCATION POINT
    # We want to keep everything up to the end of the page's UNIQUE logic.
    # Page unique logic usually ends before "--- Fonctions mobiles ---" or "Mobile Bottom Nav"
    
    trunc_points = [
        "// --- Fonctions mobiles ---",
        "<!-- Mobile Bottom Navigation -->",
        "<!-- Mobile Bottom Nav -->",
        "<!-- Popup Plus -->",
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
        "supabase-config.js"
    ]
    
    first_trunc = len(content)
    found_any = False
    for p in trunc_points:
        idx = content.find(p)
        if idx != -1 and idx < first_trunc:
            first_trunc = idx
            found_any = True
            
    if found_any:
        content = content[:first_trunc]
        
    # 3. Clean up any trailing broken script tags or open functions
    content = content.rstrip()
    if content.endswith('{'):
        # Probably truncated mid-function
        last_newline = content.rfind('\n')
        content = content[:last_newline]
    
    if content.count('<script') > content.count('</script>'):
        content += "\n    </script>"

    # 4. Add the CLEAN SINGLE FOOTER
    active_map = {
        'dashboard.html': 'Accueil',
        'patients.html': 'Patients',
        'consultations.html': 'Consults',
        'rendez-vous.html': 'RDV'
    }
    current_active = active_map.get(filename, '')
    def nav_class(name): return "mobile-nav-item active" if name == current_active else "mobile-nav-item"

    footer = f"""
    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
        <a href="dashboard.html" class="{nav_class('Accueil')}"><i class="fa-solid fa-chart-line"></i><span>Accueil</span></a>
        <a href="patients.html" class="{nav_class('Patients')}"><i class="fa-solid fa-users"></i><span>Patients</span></a>
        <a href="consultations.html" class="{nav_class('Consults')}"><i class="fa-solid fa-stethoscope"></i><span>Consults</span></a>
        <a href="rendez-vous.html" class="{nav_class('RDV')}"><i class="fa-solid fa-calendar-check"></i><span>RDV</span></a>
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

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase-config.js"></script>
    <script>
        // --- Fonctions mobiles ---
        function openDrawer() {{
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }}
        function closeDrawer() {{
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }}
        function toggleMorePopup() {{
            const p = document.getElementById('morePopup');
            const o = document.getElementById('moreOverlay');
            if (p && o) {{
                if(p.classList.contains('active')) {{
                    p.classList.remove('active');
                    o.classList.remove('active');
                }} else {{
                    p.classList.add('active');
                    o.classList.add('active');
                }}
            }}
        }}
        function closeMorePopup() {{
            const p = document.getElementById('morePopup');
            const o = document.getElementById('moreOverlay');
            if (p && o) {{
                p.classList.remove('active');
                o.classList.remove('active');
            }}
        }}
        
        // Initialisation mobile
        document.addEventListener('DOMContentLoaded', () => {{
            const menuBtn = document.querySelector('.header-logo');
            if (menuBtn) menuBtn.onclick = openDrawer;
            
            // S'assurer que updateDrawerUser est appelé
            if (window.updateDrawerUser) window.updateDrawerUser();
        }});
    </script>
</body>
</html>
"""
    # Ensure we don't have multiple </body></html>
    content = content.replace('</body>', '').replace('</html>', '')
    content += footer

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned and Repaired {filename}")

if __name__ == "__main__":
    for f in os.listdir("."):
        if f.endswith(".html"):
            clean_and_repair(f)
