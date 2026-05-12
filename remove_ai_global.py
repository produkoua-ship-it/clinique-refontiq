import os
import re

html_dir = r"D:\Utilisateur\Documents\Antigravity\A-index-dashboard\refontiq-dashboard"

# Patterns to remove
patterns = [
    re.compile(r'<script src="assets/ai-assistant\.js".*?></script>', re.IGNORECASE),
    re.compile(r'<link rel="stylesheet" href="assets/ai-assistant\.css".*?>', re.IGNORECASE)
]

count_total = 0
for file in os.listdir(html_dir):
    if file.endswith('.html'):
        filepath = os.path.join(html_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        modified = False
        for pattern in patterns:
            new_content, count = pattern.subn('', new_content)
            if count > 0:
                modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned {file}")
            count_total += 1

print(f"Total files updated: {count_total}")
