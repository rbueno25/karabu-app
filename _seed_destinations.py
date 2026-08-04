import subprocess, json

API = "https://karabu-srv.onrender.com/api"

# Login and save token to file
login = subprocess.run(
    ["curl", "-s", "-X", "POST", API + "/auth/login",
     "-H", "Content-Type: application/json",
     "-d", '{"email":"admin@karabu.com","password":"admin123"}'],
    capture_output=True, text=True)

token = json.loads(login.stdout)["token"]

# Write token to temp file so we can pass it via curl -H "Authorization: Bearer *** @tokenfile"
import tempfile, os
tf = os.path.join(tempfile.gettempdir(), "karabu_token.txt")
with open(tf, "w") as f:
    f.write(token)

destinations = [
    {"name": "Republica Dominicana", "country": "Republica Dominicana",
     "description": "Paraiso caribeno con playas infinitas", "image_url": "/destinos/Republica-Dominicana.jpg"},
    {"name": "Punta Cana", "country": "Republica Dominicana",
     "description": "Playas de arena blanca y resorts", "image_url": "/destinos/punta-cana.jpg"},
    {"name": "Santo Domingo", "country": "Republica Dominicana",
     "description": "Primera ciudad de America", "image_url": "/destinos/Santo-Domingo.jpg"},
    {"name": "Samana", "country": "Republica Dominicana",
     "description": "Ballenas jorobadas y cascadas", "image_url": "/destinos/Samana.jpg"},
    {"name": "Miami", "country": "Estados Unidos",
     "description": "Compras, playas y vida nocturna", "image_url": "/destinos/Miami.jpg"},
    {"name": "New York", "country": "Estados Unidos",
     "description": "La ciudad que nunca duerme", "image_url": "/destinos/New York.jpg"},
    {"name": "Orlando", "country": "Estados Unidos",
     "description": "Diversion sin limites", "image_url": "/destinos/Orlando.jpg"},
    {"name": "Cancun", "country": "Mexico",
     "description": "Mar Caribe y ruinas mayas", "image_url": "/destinos/Cancun.jpg"},
    {"name": "Bogota", "country": "Colombia",
     "description": "Cultura, gastronomia y montanas", "image_url": "/destinos/Bogota.jpg"},
    {"name": "Paris", "country": "Francia",
     "description": "La ciudad del amor", "image_url": "/destinos/Paris.jpg"},
    {"name": "Madrid", "country": "Espana",
     "description": "Arte, tapas y vida nocturna", "image_url": "/destinos/Madrid.jpg"},
    {"name": "Europa", "country": "Europa",
     "description": "Circuitos por capitales europeas", "image_url": "/destinos/Europa.jpg"},
    {"name": "Cruceros", "country": "Cruceros",
     "description": "Experiencias todo incluido", "image_url": "/destinos/Cruceros.jpg"},
]

auth_header = "Authorization: Bearer *** + token
for d in destinations:
    cmd = ["curl", "-s", "-X", "POST", API + "/destinations",
           "-H", "Content-Type: application/json",
           "-H", auth_header,
           "-d", json.dumps(d)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        result = json.loads(r.stdout)
    except:
        result = {}
    name = d["name"]
    if "id" in result:
        print("OK  " + d["country"] + " - " + name)
    else:
        print("FAIL " + d["country"] + " - " + name + ": " + r.stdout[:80])

print("\nDone: " + str(len(destinations)) + " destinations")
