import base64
import re
import os

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if not os.path.exists('assets/img'):
    os.makedirs('assets/img')

# Find all data:image occurrences
matches = re.finditer(r'data:image/([^;]+);base64,([^"]+)', content)

new_content = content
for i, match in enumerate(matches):
    ext = match.group(1)
    b64_data = match.group(2)
    
    file_name = f'landing_img_{i+1}.{ext}'
    output_path = os.path.join('assets/img', file_name)
    
    with open(output_path, 'wb') as f:
        f.write(base64.b64decode(b64_data))
    
    print(f"Extracted image {i+1} to {output_path}")
    
    # Replace in content (caution: this might replace multiple occurrences if data is identical)
    # But for a landing page cleanup, we want to replace the specific data URL
    old_url = f'data:image/{ext};base64,{b64_data}'
    new_url = f'assets/img/{file_name}'
    new_content = new_content.replace(old_url, new_url)

with open('index_optimized.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Created index_optimized.html with externalized images.")
