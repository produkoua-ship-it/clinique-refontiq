
import os

for f in os.listdir('.'):
    if f.endswith('.html'):
        path = f
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            marker = '</html>'
            idx = content.find(marker)
            if idx != -1:
                clean_content = content[:idx + len(marker)]
                if len(clean_content) < len(content):
                    print(f"Cleaned {path}: removed {len(content) - len(clean_content)} bytes")
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(clean_content)
        except:
            pass
