import network
import time

try:
    import ujson as json
except ImportError:
    import json


CONFIG_PATH = "config.json"


def load_config():
    with open(CONFIG_PATH, "r") as config_file:
        return json.load(config_file)


def connect_wifi():
    config = load_config()
    ssid = config.get("ssid")
    password = config.get("password")

    if not ssid:
        raise ValueError("SSID manquant dans config.json")

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("Wi-Fi deja connecte:", wlan.ifconfig())
        return wlan

    print("Connexion au point d'acces:", ssid)
    wlan.connect(ssid, password)

    timeout_seconds = 20
    start = time.time()

    while not wlan.isconnected():
        if time.time() - start > timeout_seconds:
            raise RuntimeError("Impossible de se connecter au Wi-Fi")
        time.sleep(1)
        print(".", end="")

    print("\nConnecte au Wi-Fi:", wlan.ifconfig())
    return wlan


try:
    connect_wifi()
except Exception as error:
    print("Erreur boot Wi-Fi:", error)
