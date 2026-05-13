import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of data:image
matches = re.findall(r'data:image/[^;]+;base64,([^"]+)', content)
print(f"Total base64 images found: {len(matches)}")
for i, m in enumerate(matches):
    print(f"Image {i+1} length: {len(m)}")

# Check for large blocks of text
print(f"Total file length: {len(content)}")
