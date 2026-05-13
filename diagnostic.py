"""
Diagnostic complet du projet Refontiq Dashboard avant deploiement
"""
import os, re, json, urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_DIR = r"d:\Utilisateur\Documents\Antigravity\clients\cabinet_medical_koumassi\refontiq-dashboard"
SUPABASE_URL = "https://oqjmwldnwxyvcvacmtft.supabase.co"
API_KEY = "sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224"

HTML_PAGES = [
    "index.html", "login.html", "dashboard.html", "patients.html",
    "consultations.html", "rendez-vous.html", "dossier-patient.html",
    "finance.html", "stocks.html", "messagerie.html", "alertes.html",
    "parametres.html"
]

REQUIRED_SCRIPTS = ["supabase-config.js"]

errors = []
warnings = []
ok_items = []

def add_error(msg):
    errors.append(f"❌ {msg}")
    
def add_warning(msg):
    warnings.append(f"⚠️  {msg}")
    
def add_ok(msg):
    ok_items.append(f"✅ {msg}")

print("=" * 70)
print("  DIAGNOSTIC COMPLET - Refontiq Dashboard")
print("=" * 70)

# ═══════════════════════════════════════════════════════
# 1. Vérification des fichiers
# ═══════════════════════════════════════════════════════
print("\n📁 1. VÉRIFICATION DES FICHIERS")
print("-" * 40)

for page in HTML_PAGES:
    path = os.path.join(BASE_DIR, page)
    if os.path.exists(path):
        size = os.path.getsize(path)
        add_ok(f"{page} existe ({size:,} octets)")
    else:
        add_error(f"{page} MANQUANT !")

for script in REQUIRED_SCRIPTS:
    path = os.path.join(BASE_DIR, script)
    if os.path.exists(path):
        add_ok(f"{script} existe")
    else:
        add_error(f"{script} MANQUANT !")

css_path = os.path.join(BASE_DIR, "assets", "premium-style.css")
if os.path.exists(css_path):
    add_ok("assets/premium-style.css existe")
else:
    add_error("assets/premium-style.css MANQUANT !")

# ═══════════════════════════════════════════════════════
# 2. Vérification des imports dans les pages HTML
# ═══════════════════════════════════════════════════════
print("\n📦 2. VÉRIFICATION DES IMPORTS")
print("-" * 40)

dashboard_pages = [p for p in HTML_PAGES if p not in ["index.html", "login.html"]]

for page in dashboard_pages:
    path = os.path.join(BASE_DIR, page)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "supabase-config.js" in content:
        add_ok(f"{page} → supabase-config.js importé")
    else:
        add_error(f"{page} → supabase-config.js NON importé")
    
    if "premium-style.css" in content:
        add_ok(f"{page} → premium-style.css importé")
    else:
        add_warning(f"{page} → premium-style.css non importé")

    if "@supabase/supabase-js" in content:
        add_ok(f"{page} → Supabase JS SDK importé")
    else:
        add_error(f"{page} → Supabase JS SDK NON importé")

# ═══════════════════════════════════════════════════════
# 3. Vérification des colonnes obsolètes
# ═══════════════════════════════════════════════════════
print("\n🔍 3. VÉRIFICATION DES COLONNES OBSOLÈTES")
print("-" * 40)

obsolete_columns = {
    "date_consultation": "Utiliser 'date' ou 'created_at'",
    "diagnostic": "Utiliser 'notes'",
    "traitement": "Utiliser 'historique'",
    "type_consultation": "Utiliser 'motif' ou 'type'",
}

for page in dashboard_pages:
    path = os.path.join(BASE_DIR, page)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for col, fix in obsolete_columns.items():
        # Chercher dans les contextes JS (pas les labels HTML)
        # Pattern: la colonne utilisée comme clé d'objet ou dans .select/.order
        js_pattern = rf"(?:\.order\(['\"]|\.eq\(['\"]|\.gte\(['\"]|\.lt\(['\"]|\.gt\(['\"]|{col}\s*:){col}?"
        
        matches = re.findall(rf"\b{col}\b", content)
        if matches:
            # Vérifier que ce n'est pas juste un label HTML
            lines = content.split("\n")
            for i, line in enumerate(lines, 1):
                if col in line:
                    # Ignorer les commentaires HTML et les labels
                    stripped = line.strip()
                    if stripped.startswith("<!--") or stripped.startswith("*"):
                        continue
                    if f">{col}<" in line or f"label>" in line.lower():
                        continue
                    # C'est dans du JS ou un attribut
                    if any(ctx in line for ctx in [".order(", ".eq(", ".gte(", ".lt(", ".gt(", ".select(", f"{col}:", f"c.{col}", f"p.{col}"]):
                        add_error(f"{page}:{i} → Colonne obsolète '{col}' utilisée. {fix}")

# ═══════════════════════════════════════════════════════
# 4. Vérification des liens de navigation
# ═══════════════════════════════════════════════════════
print("\n🔗 4. VÉRIFICATION DES LIENS DE NAVIGATION")
print("-" * 40)

nav_links_expected = [
    "dashboard.html", "patients.html", "consultations.html",
    "rendez-vous.html", "finance.html", "stocks.html",
    "messagerie.html", "alertes.html", "parametres.html"
]

for page in dashboard_pages:
    path = os.path.join(BASE_DIR, page)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    missing_links = []
    for link in nav_links_expected:
        if f'href="{link}"' not in content:
            missing_links.append(link)
    
    if missing_links:
        add_warning(f"{page} → Liens manquants dans la sidebar: {', '.join(missing_links)}")
    else:
        add_ok(f"{page} → Tous les liens de navigation présents")

# ═══════════════════════════════════════════════════════
# 5. Vérification de la connexion Supabase
# ═══════════════════════════════════════════════════════
print("\n🌐 5. VÉRIFICATION DE LA CONNEXION SUPABASE")
print("-" * 40)

tables_to_check = ["patients", "consultations", "rendez_vous", "paiements", "stocks"]

for table in tables_to_check:
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
        req = urllib.request.Request(url)
        req.add_header("apikey", API_KEY)
        req.add_header("Authorization", f"Bearer {API_KEY}")
        
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if isinstance(data, list):
                add_ok(f"Table '{table}' accessible ({len(data)} enregistrement(s) retourné(s))")
                if len(data) > 0:
                    cols = list(data[0].keys())
                    print(f"    Colonnes: {', '.join(cols)}")
            else:
                add_warning(f"Table '{table}' → Réponse inattendue")
    except Exception as e:
        add_error(f"Table '{table}' → Erreur: {e}")

# ═══════════════════════════════════════════════════════
# 6. Vérification du système de notification
# ═══════════════════════════════════════════════════════
print("\n🔔 6. VÉRIFICATION DU SYSTÈME DE NOTIFICATION")
print("-" * 40)

for page in dashboard_pages:
    path = os.path.join(BASE_DIR, page)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "alert(" in content and "swal(" not in content:
        lines = content.split("\n")
        for i, line in enumerate(lines, 1):
            if "alert(" in line and not line.strip().startswith("//") and "seuil_alerte" not in line and "alerte" not in line.lower().replace("alert(", ""):
                add_warning(f"{page}:{i} → alert() natif détecté (utiliser window.notifier)")

# ═══════════════════════════════════════════════════════
# 7. Vérification des IDs de modal cohérents
# ═══════════════════════════════════════════════════════
print("\n🪟 7. VÉRIFICATION DES MODALS")
print("-" * 40)

for page in dashboard_pages:
    path = os.path.join(BASE_DIR, page)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Chercher les getElementById pour les modals
    modal_gets = re.findall(r"getElementById\(['\"]([^'\"]*modal[^'\"]*)['\"]", content, re.IGNORECASE)
    modal_ids = re.findall(r'id=["\']([^"\']*modal[^"\']*)["\']', content, re.IGNORECASE)
    
    for mg in modal_gets:
        if mg not in modal_ids:
            add_error(f"{page} → getElementById('{mg}') mais l'élément n'existe pas dans le HTML")

# ═══════════════════════════════════════════════════════
# 8. Fichiers temporaires/de test à nettoyer
# ═══════════════════════════════════════════════════════
print("\n🧹 8. FICHIERS À NETTOYER AVANT DÉPLOIEMENT")
print("-" * 40)

cleanup_patterns = [
    "test_insert.py", "check_schema.py", "check_supabase.py",
    "check_consultations.py", "check_db.js", "check_css.js",
    "fix_dashboard.js", "fix_dashboard_refresh.js", "fix_desktop_layout.js",
    "fix_desktop_layout2.js", "fix_dossier.js", "fix_orphan_divs.js",
    "fix_spelling.py", "add_back_btn.js", "add_mobile_menu.js",
    "move_mobile_link.js", "remove_dropdown.js", "remove_mobile_bottom_nav.js",
    "restore.js", "update_nav.py", "update_notifications.js",
    "update_notifications2.js", "update_onload.js", "diagnostic.py",
    "supabase-setup.html"
]

for f in cleanup_patterns:
    path = os.path.join(BASE_DIR, f)
    if os.path.exists(path):
        add_warning(f"Fichier de dev/test à supprimer: {f}")

# ═══════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("  RÉSUMÉ DU DIAGNOSTIC")
print("=" * 70)

print(f"\n✅ {len(ok_items)} vérifications réussies")
for item in ok_items:
    print(f"   {item}")

if warnings:
    print(f"\n⚠️  {len(warnings)} avertissements")
    for item in warnings:
        print(f"   {item}")

if errors:
    print(f"\n❌ {len(errors)} erreurs critiques")
    for item in errors:
        print(f"   {item}")

print("\n" + "=" * 70)
if errors:
    print(f"  ⛔ {len(errors)} ERREUR(S) À CORRIGER AVANT LE DÉPLOIEMENT")
else:
    print("  🚀 PROJET PRÊT POUR LE DÉPLOIEMENT !")
print("=" * 70)
