import urllib.request
import re

with open('supabase-config.js', 'r', encoding='utf-8') as f:
    content = f.read()

url_match = re.search(r"url:\s*'(.*?)'", content)
key_match = re.search(r"key:\s*'(.*?)'", content)

if url_match and key_match:
    url = url_match.group(1) + '/rest/v1/consultations?select=*&limit=1'
    req = urllib.request.Request(url)
    req.add_header('apikey', key_match.group(1))
    req.add_header('Authorization', 'Bearer ' + key_match.group(1))
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
