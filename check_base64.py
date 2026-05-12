import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Match the favicon
fav_match = re.search(r'href="data:image/png;base64,([^"]+)"', content)
if fav_match:
    print(f"Favicon base64 length: {len(fav_match.group(1))}")

# Match the logo
logo_match = re.search(r'img src="data:image/png;base64,([^"]+)"', content)
if logo_match:
    print(f"Logo base64 length: {len(logo_match.group(1))}")
