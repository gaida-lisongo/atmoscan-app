import datetime
import random

# --- CONFIGURATION DYNAMIQUE ---
# Tu peux changer ce header ici, le script s'adaptera tout seul
header = "timestamp;CH4;CO;O3;Gaz Fluorés;Particules;N2O;CFH"

# Calcul dynamique du temps : d'il y a 4 mois à maintenant
end_time = datetime.datetime.now()
start_time = end_time - datetime.timedelta(days=4*30) 

filename = "mesures_pollutions.csv"

# Analyse du header
columns = header.split(";")
# On compte combien de colonnes de gaz il y a (tout sauf le timestamp)
num_gases = len(columns) - 1

with open(filename, "w", encoding="utf-8") as f:
    f.write(header + "\n")
    
    # On va générer par exemple 1000 lignes pour couvrir la période
    # (Tu peux ajuster le nombre de lignes ou l'intervalle)
    for i in range(1000):
        # Calcul du temps (on avance de 3 heures par ligne pour couvrir 4 mois sur 1000 lignes)
        current_time = start_time + datetime.timedelta(hours=3 * i)
        
        # Sécurité : on s'arrête si on dépasse la date d'aujourd'hui
        if current_time > end_time:
            break
            
        ts = current_time.isoformat()[:-3] + "Z"
        
        # Génération dynamique des valeurs pour chaque gaz présent dans le header
        values = []
        for gaz in columns[1:]: # On saute 'timestamp'
            # Génération de valeurs réalistes (entre 0 et 500 selon le type)
            if "CO2" in gaz:
                val = round(random.uniform(400.0, 550.0), 2)
            elif "CH4" in gaz:
                val = round(random.uniform(10.0, 25.0), 2)
            else:
                val = round(random.uniform(0.0, 50.0), 2)
            values.append(str(val))
        
        # Construction de la ligne : timestamp + les valeurs générées
        line = f"{ts};{';'.join(values)}"
        f.write(line + "\n")

print(f"✅ Fichier {filename} généré !")
print(f"📅 Période : du {start_time.date()} au {end_time.date()}")
print(f"🧪 Gaz détectés : {', '.join(columns[1:])}")