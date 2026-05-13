import os
import re

file_path = r'D:\Utilisateur\Documents\Antigravity\A-index-dashboard\refontiq-dashboard\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove onsubmit="handleSubmit(event)"
content = content.replace('onsubmit="handleSubmit(event)"', '')

# 2. Remove the scripts after </footer>
footer_end = '</footer>'
footer_idx = content.find(footer_end)

if footer_idx != -1:
    after_footer = content[footer_idx + len(footer_end):]
    
    # We want to keep </body></html> and the toast div
    # But we want to remove the <script> block
    
    # Find the toast div to keep it
    toast_div = '<div id="toast">✅ Demande envoyée ! Nous vous contacterons bientôt.</div>'
    
    # New content for after footer
    new_after_footer = f"""
{toast_div}

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
<script src="supabase-config.js" defer></script>
<script src="assets/landing-main.js" defer></script>
</body>
</html>"""
    
    new_content = content[:footer_idx + len(footer_end)] + new_after_footer
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully cleaned up the bottom of index.html.")
else:
    print("Footer not found.")
