import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'login.html']

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add online indicator
    if '<span class="online-indicator"' not in content:
        content = re.sub(r'(<h3 id="side-name">.*?)(</h3>)', r'\1 <span class="online-indicator" style="margin-left: 5px;"></span>\2', content)

    # We can extract the active item.
    match = re.search(r'<nav class="nav-menu">(.*?)</nav>', content, re.DOTALL)
    if not match:
        continue
    
    nav_inner = match.group(1)
    
    # Check which one is active
    items = ['dashboard.html', 'patients.html', 'consultations.html', 'rendez-vous.html', 'finance.html', 'stocks.html', 'messagerie.html', 'alertes.html', 'parametres.html']
    active_page = None
    for item in items:
        # Check if the anchor tag exists
        anchor_match = re.search(rf'<a href="{item}"[^>]*>', nav_inner)
        if anchor_match and 'active' in anchor_match.group(0):
            active_page = item
            break

    # Build new nav
    def get_class(page):
        return 'nav-item active' if page == active_page else 'nav-item'

    new_nav = f"""
                <a href="dashboard.html" class="{get_class('dashboard.html')}"><i class="fa-solid fa-chart-line glass-icon"></i> Dashboard</a>
                <a href="patients.html" class="{get_class('patients.html')}"><i class="fa-solid fa-users glass-icon"></i> Patients</a>
                <a href="consultations.html" class="{get_class('consultations.html')}"><i class="fa-solid fa-stethoscope glass-icon"></i> Consultations</a>
                <a href="rendez-vous.html" class="{get_class('rendez-vous.html')}"><i class="fa-solid fa-calendar-check glass-icon"></i> Rendez-vous</a>
                
                <hr class="nav-separator">
                
                <a href="finance.html" class="{get_class('finance.html')}"><i class="fa-solid fa-coins glass-icon"></i> Finance</a>
                <a href="stocks.html" class="{get_class('stocks.html')}"><i class="fa-solid fa-boxes-stacked glass-icon"></i> Stocks</a>
                
                <hr class="nav-separator">
                
                <a href="messagerie.html" class="{get_class('messagerie.html')}"><i class="fa-solid fa-comments glass-icon"></i> Messagerie</a>
                <a href="alertes.html" class="{get_class('alertes.html')}"><i class="fa-solid fa-bell glass-icon"></i> Alertes</a>
                <a href="parametres.html" class="{get_class('parametres.html')}"><i class="fa-solid fa-cog glass-icon"></i> Paramètres</a>
            """

    content = content[:match.start(1)] + "\n" + new_nav + "\n            " + content[match.end(1):]

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file}")
