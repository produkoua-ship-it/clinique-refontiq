import os
import re

BASE_DIR = r"D:\Utilisateur\Documents\Antigravity\clients\cabinet_medical_koumassi\refontiq-dashboard"
PAGES = [
    'dashboard.html', 'patients.html', 'consultations.html',
    'rendez-vous.html', 'finance.html', 'stocks.html',
    'messagerie.html', 'alertes.html', 'parametres.html', 'dossier-patient.html'
]

# We want to wrap the logo-text div in an anchor tag if not already done.
# The logo-text div looks like this:
# <div class="logo-text">
#    <h1>Clinique Refontiq</h1>
#    <p>Système Médical</p>
# </div>

def update_sidebar_logo(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Avoid double wrapping
    if 'href="index.html"' in content and '<div class="logo-text">' in content:
        # Check if it's already wrapped
        if re.search(r'<a href="index.html"[^>]*>\s*<div class="logo-text">', content):
            print(f"Already updated {filename}")
            return

    # Regex to match the logo-text div and its contents
    # We use . to match any char for the accents in "Système Médical"
    pattern = r'(<div class="logo-text">\s*<h1>Clinique Refontiq</h1>\s*<p>Syst.me M.dical</p>\s*</div>)'
    replacement = r'<a href="index.html" style="text-decoration: none; color: inherit;">\n                    \1\n                    </a>'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No match in {filename}")

if __name__ == "__main__":
    for p in PAGES:
        update_sidebar_logo(p)
