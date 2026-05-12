import os
import re

html_dir = r"D:\Utilisateur\Documents\Antigravity\A-index-dashboard\refontiq-dashboard"

# regex to find the mobile-header block
header_pattern = re.compile(r'<header class="mobile-header">.*?</header>', re.DOTALL)

count_total = 0
for file in os.listdir(html_dir):
    if file.endswith('.html'):
        filepath = os.path.join(html_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, count = header_pattern.subn('', content)
        
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Replaced in {file}")
            count_total += 1

print(f"Total files updated: {count_total}")
