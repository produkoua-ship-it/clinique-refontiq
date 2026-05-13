import urllib.request
BASE_URL = 'https://oqjmwldnwxyvcvacmtft.supabase.co'
API_KEY = 'sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224'
url = BASE_URL + '/rest/v1/rendez_vous?id=eq.42c1632e-7787-4e02-9c7f-bd02adf68aa2'
req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', API_KEY)
req.add_header('Authorization', 'Bearer ' + API_KEY)
try:
    with urllib.request.urlopen(req) as r:
        print("Test RDV deleted!")
except Exception as e:
    print(f"Error: {e}")
