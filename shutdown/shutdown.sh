#!/bin/bash

if [ "$1" = "restart" ]
then
  sudo shutdown -r now
elif [ "$1" = "shutdown" ]
then
  sudo shutdown -h now
fi
