import urllib.request
import urllib.parse
import urllib.error
import json

SUPABASE_URL = "https://oqjmwldnwxyvcvacmtft.supabase.co"
SUPABASE_KEY = "sb_publishable_8ZJz9HSooy9ayCvNdUdTgQ_xIwB4224"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def execute_sql(sql):
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql" # Often doesn't exist by default, wait.
    pass

print("Please run this SQL in Supabase SQL Editor manually.")
