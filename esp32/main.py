import time

import network
import urequests
from machine import ADC, Pin

try:
    import ujson as json
except ImportError:
    import json


CONFIG_PATH = "config.json"
SENSOR_KEYS = ("mq131", "mq135", "mq7", "mq4")
ADC_MAX_VALUE = 4095


def load_config():
    with open(CONFIG_PATH, "r") as config_file:
        return json.load(config_file)


CONFIG = load_config()


class LedController:
    def __init__(self, pin_number, active_high=True):
        self.pin = Pin(pin_number, Pin.OUT)
        self.active_high = active_high
        self.off()

    def on(self):
        self.pin.value(1 if self.active_high else 0)

    def off(self):
        self.pin.value(0 if self.active_high else 1)

    def toggle(self):
        self.pin.value(0 if self.pin.value() else 1)


def create_leds():
    leds_config = CONFIG.get("leds", {})
    active_high = leds_config.get("active_high", True)
    red_pin = leds_config.get("red_pin", 4)
    blue_pin = leds_config.get("blue_pin", 2)
    return (
        LedController(red_pin, active_high=active_high),
        LedController(blue_pin, active_high=active_high),
    )


RED_LED, BLUE_LED = create_leds()


def ensure_wifi_connected():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        return wlan

    ssid = CONFIG.get("ssid")
    password = CONFIG.get("password")
    print("Reconnexion Wi-Fi...")
    wlan.connect(ssid, password)

    for _ in range(20):
        if wlan.isconnected():
            print("Wi-Fi reconnecte:", wlan.ifconfig())
            return wlan
        time.sleep(1)

    raise RuntimeError("Wi-Fi indisponible")


def build_adc(sensor_config):
    adc = ADC(Pin(sensor_config["pin"]))

    if hasattr(ADC, "ATTN_11DB"):
        adc.atten(ADC.ATTN_11DB)
    if hasattr(ADC, "WIDTH_12BIT"):
        adc.width(ADC.WIDTH_12BIT)

    return adc


def convert_adc_to_ppm(raw_value, sensor_config):
    ppm_factor = float(sensor_config.get("ppm_factor", 1.0))
    ppm_offset = float(sensor_config.get("ppm_offset", 0.0))
    ppm_max = sensor_config.get("ppm_max")

    ppm_value = (raw_value * ppm_factor) + ppm_offset

    if ppm_max is not None:
        normalized = raw_value / ADC_MAX_VALUE
        ppm_value = normalized * float(ppm_max)

    return max(0.0, ppm_value)


def collect_measures():
    timing = CONFIG.get("timing", {})
    measure_duration = int(timing.get("measure_duration_seconds", 50))
    sample_interval_ms = int(timing.get("sample_interval_ms", 1000))

    sensor_readers = []
    sensor_totals = {}
    sensor_counts = {}

    for key in SENSOR_KEYS:
        sensor_config = CONFIG.get(key)
        if not sensor_config or "pin" not in sensor_config:
            continue

        sensor_readers.append((key, sensor_config, build_adc(sensor_config)))
        sensor_totals[key] = 0
        sensor_counts[key] = 0

    if not sensor_readers:
        raise RuntimeError("Aucun capteur ADC configure dans config.json")

    end_time = time.ticks_add(time.ticks_ms(), measure_duration * 1000)
    blink_state = False

    while time.ticks_diff(end_time, time.ticks_ms()) > 0:
        blink_state = not blink_state
        if blink_state:
            RED_LED.on()
        else:
            RED_LED.off()
        BLUE_LED.off()

        for key, sensor_config, adc in sensor_readers:
            raw_value = adc.read()
            sensor_totals[key] += raw_value
            sensor_counts[key] += 1
            print(sensor_config.get("gaz", key), "ADC=", raw_value)

        time.sleep_ms(sample_interval_ms)

    RED_LED.off()

    ppm_payload = []

    for key, sensor_config, _adc in sensor_readers:
        average_raw = sensor_totals[key] / max(sensor_counts[key], 1)
        ppm_value = convert_adc_to_ppm(average_raw, sensor_config)

        ppm_payload.append(
            {
                "gaz": sensor_config["gazId"],
                "value": round(ppm_value, 3),
            }
        )

        print(
            sensor_config.get("gaz", key),
            "ADC_MOYEN=",
            average_raw,
            "PPM=",
            ppm_value,
        )

    return ppm_payload


def send_payload(ppm_payload):
    ensure_wifi_connected()

    host = CONFIG["host"].rstrip("/")
    source_id = CONFIG["sourceId"]
    entreprise_id = CONFIG["entrepriseId"]
    capteur_identifier = CONFIG.get("capteurUuid") or CONFIG.get("capteurId")

    if capteur_identifier:
        url = "{}/api/capteurs/{}".format(host, capteur_identifier)
        body = {
            "sourceId": source_id,
            "entrepriseId": entreprise_id,
            "data": [ppm_payload],
        }
        method = "PATCH"
    else:
        url = "{}/api/mesures".format(host)
        body = {
            "sourceId": source_id,
            "entrepriseId": entreprise_id,
            "ppm": ppm_payload,
        }
        method = "POST"

    response = None
    try:
        if method == "PATCH":
            response = urequests.request("PATCH", url, json=body)
        else:
            response = urequests.post(url, json=body)

        print("Envoi HTTP", method, response.status_code, response.text)
        return 200 <= response.status_code < 300
    finally:
        if response is not None:
            response.close()


def blink_blue_during_send(ppm_payload):
    duration_seconds = int(CONFIG.get("timing", {}).get("send_duration_seconds", 5))
    end_time = time.ticks_add(time.ticks_ms(), duration_seconds * 1000)
    sent = False
    success = False
    blink_state = False

    while time.ticks_diff(end_time, time.ticks_ms()) > 0:
        RED_LED.off()
        blink_state = not blink_state
        if blink_state:
            BLUE_LED.on()
        else:
            BLUE_LED.off()

        if not sent:
            try:
                success = send_payload(ppm_payload)
            except Exception as error:
                print("Erreur envoi:", error)
                success = False
            sent = True

        time.sleep(0.5)

    BLUE_LED.off()
    return success


def pause_cycle():
    duration_seconds = int(CONFIG.get("timing", {}).get("pause_duration_seconds", 5))
    RED_LED.off()
    BLUE_LED.off()
    print("Pause", duration_seconds, "secondes")
    time.sleep(duration_seconds)


def main():
    print("Demarrage acquisition ESP32")

    while True:
        print("Phase mesure 50s")
        ppm_payload = collect_measures()

        print("Phase envoi 5s")
        blink_blue_during_send(ppm_payload)

        print("Phase pause 5s")
        pause_cycle()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        RED_LED.off()
        BLUE_LED.off()
        print("Erreur main:", error)
