
import os

path = 'dashboard.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

marker = '</html>'
idx = content.find(marker)
if idx != -1:
    # Keep only up to </html>
    clean_content = content[:idx + len(marker)]
    
    if len(clean_content) < len(content):
        print(f"Found and removed extra content after </html>: {len(content) - len(clean_content)} bytes")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(clean_content)
    else:
        print("No extra content after </html>")
else:
    print("</html> tag not found!")
