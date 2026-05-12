import os
import shutil
import re

app_dir = 'app'
comp_dir = os.path.join(app_dir, 'components')

# Create directories
os.makedirs(app_dir, exist_ok=True)
os.makedirs(comp_dir, exist_ok=True)

# Files to move to /app/
app_files = [
    'alertes.html',
    'consultations.html',
    'dashboard.html',
    'dossier-patient.html',
    'finance.html',
    'hospitalisation.html',
    'messagerie.html',
    'parametres.html',
    'patients.html',
    'rendez-vous.html',
    'reporting.html',
    'stocks.html',
    'vitals-tablet.html'
]

# Move components
components_to_move = [
    'sidebar-infirmiere.html',
    'sidebar-medecin.html',
    'sidebar-reception.html'
]

# 1. Move app files
for f in app_files:
    if os.path.exists(f):
        shutil.move(f, os.path.join(app_dir, f))
        print(f"Moved {f} to {app_dir}/")

# 2. Move components
for comp in components_to_move:
    src = os.path.join('components', comp)
    if os.path.exists(src):
        shutil.move(src, os.path.join(comp_dir, comp))
        print(f"Moved {src} to {comp_dir}/")

# 3. Update links in app files
def update_links(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace assets path
    content = content.replace('href="assets/', 'href="../assets/')
    content = content.replace("href='assets/", "href='../assets/")
    content = content.replace('src="assets/', 'src="../assets/')
    content = content.replace("src='assets/", "src='../assets/")
    
    # Replace supabase-config.js
    content = content.replace('src="supabase-config.js"', 'src="../supabase-config.js"')
    content = content.replace("src='supabase-config.js'", "src='../supabase-config.js'")
    
    # Replace index.html and login.html
    content = content.replace('href="index.html"', 'href="../index.html"')
    content = content.replace("href='index.html'", "href='../index.html'")
    content = content.replace('href="login.html"', 'href="../login.html"')
    content = content.replace("href='login.html'", "href='../login.html'")
    content = content.replace('window.location.href="login.html"', 'window.location.href="../login.html"')
    content = content.replace("window.location.href='login.html'", "window.location.href='../login.html'")
    content = content.replace('window.location.href="index.html"', 'window.location.href="../index.html"')
    content = content.replace("window.location.href='index.html'", "window.location.href='../index.html'")
    
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

# Process all html files in app_dir
for f in os.listdir(app_dir):
    if f.endswith('.html'):
        update_links(os.path.join(app_dir, f))
        print(f"Updated links in {f}")

# Process component files
for f in os.listdir(comp_dir):
    if f.endswith('.html'):
        update_links(os.path.join(comp_dir, f))
        print(f"Updated links in components/{f}")

print("Refactoring complete.")
