import os

# Fix premium-style.css
css_path = 'assets/premium-style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '\\n\n/* GLOBAL MOBILE BOTTOM NAV & QUICK ACTIONS */' in css_content:
    css_content = css_content.replace('\\n\n/* GLOBAL MOBILE BOTTOM NAV & QUICK ACTIONS */', '\n/* GLOBAL MOBILE BOTTOM NAV & QUICK ACTIONS */')
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Fixed premium-style.css")

# Fix HTML files in app/
app_dir = 'app'
for file in os.listdir(app_dir):
    if file.endswith('.html'):
        filepath = os.path.join(app_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Replace '\n</body>' with '</body>'
        if '\\n</body>' in html_content:
            html_content = html_content.replace('\\n</body>', '\n</body>')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"Fixed {file}")
