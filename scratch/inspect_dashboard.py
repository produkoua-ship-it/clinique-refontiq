
with open('dashboard.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'Messages' in line or '🟣' in line or 'fenetre' in line:
            print(f"{i+1}: {line.strip()}")
