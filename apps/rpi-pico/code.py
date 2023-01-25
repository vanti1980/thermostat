import machine
import network
import time
import ubinascii
import urequests

led = machine.Pin("LED", machine.Pin.OUT)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect('DIGI_e7d738', 'ddcc1828')

while not wlan.isconnected() and wlan.status() >= 0:
    print("Waiting to connect:")
    led.on()
    time.sleep(1)
    led.off()

print(wlan.ifconfig())
mac = ubinascii.hexlify(network.WLAN().config('mac'),':').decode()

led.on()
# Other things you can query
res = urequests.get("https://hu.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=George%20Washington")
print(res.text)
res.close()
led.off()