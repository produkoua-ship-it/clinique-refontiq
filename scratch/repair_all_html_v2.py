import os
import re

def repair_html_file(path):
    filename = os.path.basename(path)
    if filename == "index.html" or filename == "supabase-setup.html":
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix truncated script tags
    # Count <script> vs </script>
    script_count = content.count('<script')
    script_end_count = content.count('</script>')
    
    if script_count > script_end_count:
        print(f"Fixing truncated script in {filename}")
        # We assume the last script block is the one truncated
        # Add a closing brace and script tag
        # But wait, where was it truncated? 
        # In many files it seems to be at "function openDrawer() {"
        if "function openDrawer() {" in content and content.rfind("function openDrawer() {") > content.rfind("</script>"):
             # It was truncated right at the mobile function start
             # We'll just remove everything from that broken function start onwards
             content = content[:content.rfind("function openDrawer() {")]
             content += "\n    </script>\n"
        else:
            # General case: just close it
            content += "\n    </script>\n"

    # 2. Ensure </body> and </html> are present
    if "</body>" not in content:
        content += "</body>\n"
    if "</html>" not in content:
        content += "</html>\n"

    # 3. Ensure Bottom Nav and Popup are present before </body>
    if 'mobile-bottom-nav' not in content:
        active_map = {
            'dashboard.html': 'Accueil',
            'patients.html': 'Patients',
            'consultations.html': 'Consults',
            'rendez-vous.html': 'RDV'
        }
        current_active = active_map.get(filename, '')
        def nav_class(name): return "mobile-nav-item active" if name == current_active else "mobile-nav-item"
        
        mobile_html = f"""
    <!-- Mobile Bottom Nav -->
    <nav class="mobile-bottom-nav">
        <a href="dashboard.html" class="{nav_class('Accueil')}"><i class="fa-solid fa-chart-line"></i><span>Accueil</span></a>
        <a href="patients.html" class="{nav_class('Patients')}"><i class="fa-solid fa-users"></i><span>Patients</span></a>
        <a href="consultations.html" class="{nav_class('Consults')}"><i class="fa-solid fa-stethoscope"></i><span>Consults</span></a>
        <a href="rendez-vous.html" class="{nav_class('RDV')}"><i class="fa-solid fa-calendar-check"></i><span>RDV</span></a>
        <button class="mobile-nav-item more-btn" onclick="toggleMorePopup()"><i class="fa-solid fa-ellipsis-h"></i><span>Plus</span></button>
    </nav>
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
        content = content.replace('</body>', f'{mobile_html}</body>')

    # 4. Ensure Supabase and Mobile JS are present
    if 'supabase-config.js' not in content:
        scripts = """
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase-config.js"></script>\n"""
        content = content.replace('</body>', f'{scripts}</body>')

    if 'function openDrawer()' not in content:
        mobile_js = """
    <script>
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
    </script>\n"""
        content = content.replace('</body>', f'{mobile_js}</body>')

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
