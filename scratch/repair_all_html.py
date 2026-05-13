import os
import re

def repair_html_file(path):
    filename = os.path.basename(path)
    if filename == "index.html" or filename == "supabase-setup.html":
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. CLEANUP: Remove potentially broken end of file (truncated scripts, missing tags)
    # Find where the last </div> before the mobile nav/scripts was
    # Usually it's </main></div> or similar
    
    # Search for the last </main>
    main_end = content.rfind('</main>')
    if main_end == -1:
        # Fallback to last </div>
        main_end = content.rfind('</div>')
        
    if main_end != -1:
        # We keep everything up to the end of main content
        # But we need to keep the dashboard-container closing div too if it exists
        next_div = content.find('</div>', main_end + 7)
        if next_div != -1:
            content = content[:next_div + 6]
        else:
            content = content[:main_end + 7] + "\n    </div>"
    
    # 2. ADD MOBILE HTML
    # Determine active nav item
    active_map = {
        'dashboard.html': 'Accueil',
        'patients.html': 'Patients',
        'consultations.html': 'Consults',
        'rendez-vous.html': 'RDV'
    }
    current_active = active_map.get(filename, '')
    
    def nav_class(name):
        return "mobile-nav-item active" if name == current_active else "mobile-nav-item"

    mobile_html = f"""
    <!-- Mobile Bottom Nav -->
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
    </div>\n"""
    
    content += mobile_html
    
    # 3. ADD SUPABASE AND MOBILE JS
    mobile_js = """
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase-config.js"></script>
    <script>
        // --- Fonctions mobiles ---
        function openDrawer() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeDrawer() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
        function toggleMorePopup() {
            const p = document.getElementById('morePopup');
            const o = document.getElementById('moreOverlay');
            if (p && o) {
                if(p.classList.contains('active')) {
                    p.classList.remove('active');
                    o.classList.remove('active');
                } else {
                    p.classList.add('active');
                    o.classList.add('active');
                }
            }
        }
        function closeMorePopup() {
            const p = document.getElementById('morePopup');
            const o = document.getElementById('moreOverlay');
            if (p && o) {
                p.classList.remove('active');
                o.classList.remove('active');
            }
        }
        
        // S'assurer que les boutons sont reliés (si nécessaire)
        document.addEventListener('DOMContentLoaded', () => {
            const menuBtn = document.querySelector('.header-logo'); // Le logo ouvre souvent le menu
            if (menuBtn) menuBtn.onclick = openDrawer;
        });
    </script>
</body>
</html>\n"""
    
    content += mobile_js
    
    # Final check for duplicate tags (if any were left over from cleanup)
    # This is a bit risky but we'll try to keep it clean
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Repaired {filename}")

def main():
    directory = "."
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            repair_html_file(os.path.join(directory, filename))

if __name__ == "__main__":
    main()
