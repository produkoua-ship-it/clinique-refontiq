import urllib.request
import urllib.parse
import urllib.error
import json
import random
import time

SUPABASE_URL = "https://oqjmwldnwxyvcvacmtft.supabase.co"
SUPABASE_KEY = "sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def make_request(method, url, data=None):
    req = urllib.request.Request(url, method=method, headers=HEADERS)
    if data:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            return status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, body
    except Exception as e:
        return 0, str(e)

print("=== TEST DU FLUX D'INVITATION SUPABASE ===\n")

# 1. Création de l'invitation
test_username = f"test.infirmiere.{int(time.time())}"
test_code = str(random.randint(1000, 9999))
test_name = "Infirmiere Test"

print(f"1. Creation de l'invitation pour '{test_username}' avec le code '{test_code}'...")
invitation_data = {
    "nom_utilisateur": test_username,
    "nom": test_name,
    "prenom": "",
    "role": "infirmiere",
    "code_invitation": test_code,
    "utilise": False
}

status, res_data = make_request("POST", f"{SUPABASE_URL}/rest/v1/invitations", invitation_data)
if status in [200, 201]:
    invit_id = res_data[0]['id']
    print(f"[OK] Invitation creee avec succes (ID: {invit_id})\n")
else:
    print(f"[X] Erreur creation invitation. Status: {status}, Response: {res_data}")
    exit(1)

# 2. L'employé vérifie le code
print(f"2. Simulation de la Premiere Connexion (Verification identifiant et code)...")
params = urllib.parse.urlencode({
    "nom_utilisateur": f"eq.{test_username}",
    "code_invitation": f"eq.{test_code}",
    "utilise": "eq.false"
})
status, res_data = make_request("GET", f"{SUPABASE_URL}/rest/v1/invitations?{params}")
if status == 200 and isinstance(res_data, list) and len(res_data) > 0:
    print(f"[OK] Code verifie avec succes ! Bienvenue {res_data[0]['nom']}\n")
else:
    print(f"[X] Erreur de verification: Code invalide ou politique RLS bloquante. Status: {status}, Data: {res_data}")
    exit(1)

# 3. L'employé active son compte
test_email = f"test.{int(time.time())}@refontiq.ci"
print(f"3. Activation du compte avec l'email '{test_email}'...")

# Mise à jour de l'invitation
HEADERS["Prefer"] = "return=minimal"
status, res_data = make_request("PATCH", f"{SUPABASE_URL}/rest/v1/invitations?id=eq.{invit_id}", {"utilise": True})
if status in [200, 204]:
    print("[OK] Invitation marquee comme utilisee.")
else:
    print(f"[X] Erreur lors de la mise a jour de l'invitation: {res_data}")

# Création de l'utilisateur
user_data = {
    "email": test_email,
    "nom": test_name,
    "prenom": "",
    "role": "infirmiere"
}
HEADERS["Prefer"] = "return=representation"
status, res_data = make_request("POST", f"{SUPABASE_URL}/rest/v1/users", user_data)
if status in [200, 201]:
    print(f"[OK] Compte utilisateur cree avec succes dans la table 'users' !")
else:
    print(f"[X] Erreur lors de la creation de l'utilisateur: {res_data}")

print("\n=== TEST TERMINE ===")
