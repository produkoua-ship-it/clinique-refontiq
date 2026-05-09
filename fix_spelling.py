import os

mojibake_map = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã«': 'ë',
    'Ã ': 'à', 
    'Ã ': 'à',
    'Ã¢': 'â',
    'Ã®': 'î',
    'Ã¯': 'ï',
    'Ã´': 'ô',
    'Ã¹': 'ù',
    'Ã»': 'û',
    'Ã§': 'ç',
    'Ã€': 'À',
    'Ã‰': 'É',
    'Ãˆ': 'È',
    'â€™': "'",
    'Å“': 'œ',
    'Ã‚': 'Â',
    'ÃŽ': 'Î',
    'Ã”': 'Ô',
    'Ã›': 'Û'
}

specific_fixes = {
    'MÃ©decin': 'Médecin',
    'TÃ©lÃ©phone': 'Téléphone',
    'RÃ©fÃ©rence': 'Référence',
    'AntÃ©cÃ©dents': 'Antécédents',
    'DÃ©tails': 'Détails',
    'CrÃ©ation': 'Création',
    'enregistrÃ©': 'enregistré',
    'RÃ©sumÃ©': 'Résumé',
    'Ã‚ge': 'Âge',
    'trouvÃ©': 'trouvé',
    'accÃ¨s': 'accès',
    'AccÃ¨s': 'Accès',
    'donnÃ©es': 'données',
    'dÃ©clarÃ©': 'déclaré',
    'DÃ©connexion': 'Déconnexion',
    'sÃ©curisÃ©': 'sécurisé',
    'MÃ©dical': 'Médical',
    'mÃ©dical': 'médical',
    'ParamÃ¨tres': 'Paramètres',
    'paramÃ¨tres': 'paramètres',
    'DÃ©penses': 'Dépenses',
    'BÃ©nÃ©fice': 'Bénéfice',
    'Ã€ payer': 'À payer',
    'DÃ©tails': 'Détails',
    'rÃ©alisÃ©e': 'réalisée',
    'SÃ©lectionnez': 'Sélectionnez',
    'gÃ©nÃ©rer': 'générer',
    'bÃ©nÃ©fices': 'bénéfices'
}

# Fautes d'orthographe classiques
spelling_fixes = {
    'dinamique': 'dynamique',
    'designe': 'design',
    'Face a face': 'Face à face',
    'a jour': 'à jour',
    'les grande tableau': 'les grands tableaux'
}

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original = content
        
        for bad, good in specific_fixes.items():
            content = content.replace(bad, good)
            
        for bad, good in mojibake_map.items():
            content = content.replace(bad, good)
            
        for bad, good in spelling_fixes.items():
            content = content.replace(bad, good)
            
        if content != original:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
