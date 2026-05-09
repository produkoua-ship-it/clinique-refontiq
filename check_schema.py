import urllib.request
import json

BASE_URL = 'https://oqjmwldnwxyvcvacmtft.supabase.co'
API_KEY = 'sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224'

# Get table definition via OpenAPI spec
url = BASE_URL + '/rest/v1/?apikey=' + API_KEY
req = urllib.request.Request(url)
req.add_header('apikey', API_KEY)
req.add_header('Authorization', 'Bearer ' + API_KEY)

with urllib.request.urlopen(req) as response:
    spec = json.loads(response.read().decode('utf-8'))

# Print consultations table columns
if 'definitions' in spec and 'consultations' in spec['definitions']:
    cols = spec['definitions']['consultations']['properties']
    print("=== TABLE CONSULTATIONS ===")
    for name, info in cols.items():
        print(f"  {name}: {info.get('type', '?')} | format: {info.get('format', '-')} | desc: {info.get('description', '-')}")
else:
    print("Table consultations not found in spec")
    print("Available tables:", list(spec.get('definitions', {}).keys()))
