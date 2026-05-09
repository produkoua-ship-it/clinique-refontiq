
import os

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.html', '.js')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'Messages' in content:
                        # Print line number and some context
                        lines = content.split('\n')
                        for i, line in enumerate(lines):
                            if 'Messages' in line:
                                print(f"{path}:{i+1}: {line.strip()[:100]}")
            except:
                pass
