#!/bin/bash

HTTP_PORT=8080
WS_PORT=8081

cd /home/pi/www/
sleep 10
node server.js $HTTP_PORT $WS_PORT &
export DISPLAY=:0
chromium-browser "http://localhost:$HTTP_PORT/main/display.html" --kiosk &
unclutter -idle 1 -root &
