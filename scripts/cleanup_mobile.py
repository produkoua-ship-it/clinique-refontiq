#!/usr/bin/env python3
"""Nettoie les anciennes fonctions mobiles et met à jour le header."""

import os

PAGES = [
    'dashboard.html', 'patients.html', 'consultations.html',
    'rendez-vous.html', 'finance.html', 'stocks.html',
    'messagerie.html', 'alertes.html', 'parametres.html'
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

for page in PAGES:
    fp = os.path.join(BASE_DIR, page)
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # 1. Supprimer les anciennes fonctions de drawer
    old_funcs = [
        'function toggleMobileMenu()', 'function openDrawer()', 'function closeDrawer()',
        'function updateDrawerUser()', "document.addEventListener('DOMContentLoaded', updateDrawerUser);",
        "document.addEventListener('DOMContentLoaded', function () { updateDrawerUser(); });",
        'document.addEventListener(\"DOMContentLoaded\", updateDrawerUser);',
        'mobile-drawer-overlay', 'mobile-drawer'
    ]
    
    # Supprimer le drawer (tout ce qui est entre les commentaires)
    if 'Tiroir latéral mobile' in c:
        start = c.find('<!-- Tiroir latéral mobile')
        if start > 0:
            end = c.find('</body>', start)
            if end > 0:
                c = c[:start] + c[end:]
    
    # Supprimer l'overlay du drawer
    if 'drawerOverlay' in c:
        lines = c.split('\n')
        new_lines = []
        skip = False
        for line in lines:
            if 'drawerOverlay' in line or 'mobileDrawer' in line:
                skip = True
            if skip and '</div>' in line:
                skip = False
                continue
            if skip:
                continue
            new_lines.append(line)
        c = '\n'.join(new_lines)
    
    # 2. Remplacer le header mobile pour enlever le bouton menu hamburger
    old_header = '<button class="header-btn" id="mobileMenuBtn" onclick="toggleMobileMenu()">\n                <i class="fa-solid fa-bars"></i>\n            </button>'
    new_header = ''
    if old_header in c:
        c = c.replace(old_header, new_header)
    
    # 3. Nettoyer le JS des fonctions redondantes
    import re
    # Supprimer les blocs de fonctions obsolètes (entre commentaires)
    c = re.sub(r'        // Mobile: marquer.*?function setActiveNav.*?\n        }', '', c, flags=re.DOTALL)
    c = re.sub(r'        // Mobile: toggle menu.*?\n        }', '', c, flags=re.DOTALL)
    c = re.sub(r'        // Mobile: mettre à jour.*?\n        }', '', c, flags=re.DOTALL)
    
    # Supprimer updateDrawerUser si présent
    if 'function updateDrawerUser' in c:
        start = c.find('function updateDrawerUser')
        end = c.find('}\n', c.find('}\n', start) + 2) + 2
        c = c[:start] + c[end:]
    
    # Supprimer updateMobileUser si présent (ancienne version)
    if 'function updateMobileUser' in c and 'function updateMobileHeader' in c:
        start = c.find('function updateMobileUser')
        end = c.find('}\n', c.find('}\n', start) + 2) + 2
        c = c[:start] + c[end:]
    
    # Supprimer openDrawer/closeDrawer
    for fn in ['function openDrawer', 'function closeDrawer']:
        if fn in c:
            start = c.find(fn)
            end = c.find('}\n', c.find('}\n', start) + 2) + 2
            c = c[:start] + c[end:]
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'✅ {page} nettoyé')

print('\n🎉 Nettoyage terminé !')