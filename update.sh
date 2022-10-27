#!/bin/bash

cd `dirname $0`
ts=`date +%s`
echo "{\"timestamp\":$ts}" > update.json
sed -i -E 's/\?update=[0-9]+/?update='$ts'/g' signage/index.html
cat update.json
