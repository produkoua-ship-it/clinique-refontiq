
import os

target = "fenetrelmpression" # with an L

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.html', '.js')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if target in content:
                        print(f"Found '{target}' in {path}")
                        # Print line number
                        lines = content.split('\n')
                        for i, line in enumerate(lines):
                            if target in line:
                                print(f"Line {i+1}: {line.strip()}")
            except:
                pass
