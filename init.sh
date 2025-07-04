#!/bin/bash

type=$1
if [ "$type" = "" ]
then
  type=sample
fi
cp -iv config.$type.sh config.sh
cp -iv signage/config/config.$type.js signage/config/config.js
cp -iv signage/config/messages.$type.js signage/config/messages.js
cp -iv photo_slideshow/config.$type.js photo_slideshow/config.js
