#!/bin/bash

. /home/pi/.nvm/nvm.sh

cd ${0%/*}/
node run.js
