import urllib.request, json

API_KEY="rnd_...BASE = "https://api.render.com/v1"
headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json", "Accept": "application/json"}

payload = {
    "type": "static_site",
    "name": "cotizacion",
    "ownerId": "tea-d9h3vlb7uimc73f1vsv0",
    "repo": "https://github.com/rbueno25/karabu-app",
    "branch": "master",
    "rootDir": "frontend",
    "buildCommand": "npm install && npm run build && cp dist/cotizacion.html dist/index.html",
    "publishDir": "dist",
    "autoDeploy": "yes",
    "envVars": [
        {"key": "VITE_API_URL", "value": "https://karabu-srv.onrender.com"}
    ]
}

req = urllib.request.Request(
    f"{BASE}/services",
    data=json.dumps(payload).encode(),
    headers=headers,
    method="POST"
)
try:
    resp = urllib.request.urlopen(req, timeout=20)
    result = json.loads(resp.read())
    print(json.dumps(result, indent=2)[:3000])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Error {e.code}: {body[:1000]}")
