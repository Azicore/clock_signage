#!/bin/bash

HTTP_PORT=8080
cd /home/pi/www/
sleep 10
python3 -m http.server $HTTP_PORT &
export DISPLAY=:0
chromium-browser http://localhost:$HTTP_PORT/ --kiosk &
unclutter -idle 1 -root &
