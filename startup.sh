#!/bin/bash

cd /home/pi/www/
if [ ! -f config.sh ]
then
  exit
fi
. config.sh

sleep 10
node server.js $HTTP_PORT $WS_PORT &
export DISPLAY=:0
chromium-browser "http://localhost:$HTTP_PORT/main/display.html" --kiosk &
unclutter -idle 1 -root &
