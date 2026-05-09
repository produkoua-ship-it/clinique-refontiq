import os
import re

def fix_html_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            path = os.path.join(directory, filename)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 1. Fix malformed link tags
            # Replace <link href="..." rel="stylesheet"> rel="stylesheet">
            # and <link href="..."> (missing rel)
            content = re.sub(r'<link href="(https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/6\.4\.0/css/all\.min\.css)">', 
                             r'<link href="\1" rel="stylesheet">', content)
            content = content.replace('assets/mobile.css"> rel="stylesheet">', 'assets/mobile.css">')
            
            # 2. Add Supabase scripts before </body> if missing
            if 'supabase-js' not in content and 'index.html' not in filename:
                supabase_scripts = """    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase-config.js"></script>\n"""
                if '</body>' in content:
                    content = content.replace('</body>', f'{supabase_scripts}</body>')
                else:
                    content += f'\n{supabase_scripts}'

            # 3. Fix switchTab safety (optional but good)
            content = content.replace('document.querySelector(`[data-tab="${tabName}"]`).classList.add(\'active\');', 
                                      'const t = document.querySelector(`[data-tab="${tabName}"]`); if(t) t.classList.add(\'active\');')
            content = content.replace('document.getElementById(`tab-${tabName}`).classList.add(\'active\');', 
                                      'const c = document.getElementById(`tab-${tabName}`); if(c) c.classList.add(\'active\');')

            # 4. Ensure updateDrawerUser is called with window check
            content = content.replace('updateDrawerUser();', 'if(window.updateDrawerUser) window.updateDrawerUser();')

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filename}")

if __name__ == "__main__":
    fix_html_files(".")
