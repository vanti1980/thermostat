import ujson
import utime
import machine
import network
import ubinascii
import urequests
import onewire, ds18x20, _thread
from ssd1306 import SSD1306_I2C
from writer import Writer

# Font
import font6
import freesans20

global oled, bigWriter, smallWriter
global ds, addr
global nowDate, nowTime
global heater
global infoPage

CYCLE_REREAD_SERVER = 60
THERMOSTAT_ID = 'THERMOSTAT_ID'
WIFI_SSID = 'SSID'
WIFI_PSK = 'PSK'

heaterVal = 1
infoPage = 0
lastCheckedTime = '00:00:00'
tset = 23
rereadCounter = CYCLE_REREAD_SERVER

def init_oled():
    global oled, smallWriter, bigWriter

    # Set up I2C Oled display
    sda=machine.Pin(0)
    scl=machine.Pin(1)
    i2c=machine.I2C(0,sda=sda, scl=scl, freq=400000)
    print(i2c.scan())
    oled = SSD1306_I2C(128, 64, i2c)
    oled.fill(0)
    oled.show()
    
    bigWriter = Writer(oled, freesans20)
    smallWriter = Writer(oled, font6)
    return oled;

def init_wlan():
    try:
        display_msg("Wifi INIT")

        #internal LED
        led = machine.Pin("LED", machine.Pin.OUT)

        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(WIFI_SSID, WIFI_PSK)

        while not wlan.isconnected() and wlan.status() >= 0:
            print("Waiting to connect:")
            led.on()
            utime.sleep(1)
            led.off()
        
        print(wlan.ifconfig())
        mac = ubinascii.hexlify(network.WLAN().config('mac'),':').decode()
        display_msg("Wifi OK")
    except:
        display_error("Wifi FAIL")
    

def init_temp_sensor():
    global ds, addr

    try:
        display_msg("Temp sensor INIT")
        
        # the DS18 device is on GPIO21 (Pin26)
        ow = machine.Pin(21)

        # create the onewire object
        ds = ds18x20.DS18X20(onewire.OneWire(ow))

        # scan for 1W devices on the bus
        roms = ds.scan()
        print('found devices on PIN 26:', roms)
        addr=roms[0]
        print ("Address = " + str(addr))
        display_msg("Temp sensor OK")
    except:
        display_error("Temp sensor FAIL")

def display_msg(msg, waitSec = 1):
    print(msg)
    oled.fill(0)
    Writer.set_textpos(oled, 0, 0)
    bigWriter.printstring(msg)
    oled.show()
    utime.sleep(waitSec)

def display_error(msg):
    display_msg(msg)

def display_status(msg, waitSec = 0):
    Writer.set_textpos(oled, 50, 0)  # verbose = False to suppress console output
    smallWriter.printstring(msg)
    oled.show()
    if waitSec:
        utime.sleep(waitSec)
    
def display_info(tnow, tset, heaterVal, lastCheckedTime):
    global oled, bigWriter, smallWriter, infoPage

    now = utime.localtime()
    nowDate = "{year:02d}.{month:02d}.{day:02d}".format(year=now[0] - 2000, month=now[1], day=now[2])
    nowTime = "{hour:02d}:{min:02d}:{sec:02d}".format(hour=now[3], min=now[4], sec=now[5])
    
    tnowstr = "{:.2f}C".format(tnow)    
    tsetstr= ("Set: "+ str(tset) + "C")
    heaterStr = ('ON') if heaterVal else ('OFF')
    oled.fill(0)
    Writer.set_textpos(oled, 0, 0)  # verbose = False to suppress console output
    bigWriter.printstring("{} {}\n".format(tnowstr, heaterStr))
    smallWriter.printstring((tsetstr + '\n') if infoPage == 0 else ('Checked: ' + lastCheckedTime + '\n'))
    smallWriter.printstring("{} {}".format(nowDate, nowTime))
    if infoPage == 0:
        infoPage = 1
    else:
        infoPage = 0
    
    oled.show()
    
def post_status(temp):
    status = None
    display_status("sync...")
    postStatusRequest = ujson.dumps({"temp": temp});
    print(postStatusRequest)
    try:
        res = urequests.post("https://thermo.cyclic.app/api/status", headers = {'content-type': 'application/json', 'id': THERMOSTAT_ID}, data = postStatusRequest)
        print(res.text)
        status = res.json()
        res.close()
    except:
        display_error("Connect ERROR!\n")
    return status

def read_temp():
    global addr, ds, oled, smallWriter

    display_status("...")
    try:
        ds.convert_temp()
        utime.sleep_ms(750)
        return ds.read_temp(addr)
    except:
        display_status("Temp read ERROR!", 1);

def update_datetime(ts):
    if len(ts) >= 19:
        machine.RTC().datetime((int(ts[0:4]), int(ts[5:7]), int(ts[8:10]), 0, int(ts[11:13]), int(ts[14:16]), int(ts[17:19]), 0))

def update_heater(tnow, tset):
    global heater
    
    HYSTERESIS = 0.5
    
    if tnow > (tset + HYSTERESIS):
        heater.value(1)
        return 0
    if tnow < (tset - HYSTERESIS):
        heater.value(0)
        return 1
    return 0 if heater.value() else 1


init_oled()
init_wlan()
init_temp_sensor()

#global butn_pressed
#butn_pressed = False

#heater relay driver pin GPIO18
heater = machine.Pin(18, machine.Pin.OUT, heaterVal)

# button for set temperature adjust
#setbutn = machine.Pin(14, machine.Pin.IN, machine.Pin.PULL_DOWN)


# loop and update oled with temperatures etc.
while True:
    tnow = read_temp()
    rereadCounter = rereadCounter + 1
    if rereadCounter >= CYCLE_REREAD_SERVER:
        status = post_status(tnow)
        if status:
            schedule = status['schedule']
            tset = schedule['set']
            # TODO: read timestamp from server
            lastCheckedTime = status['ts'][11:19]
            update_datetime(status['ts'])
            rereadCounter = 0

    heaterVal = update_heater(tnow, tset)
    
    display_info(tnow, tset, heaterVal, lastCheckedTime)
    
    utime.sleep(5)
