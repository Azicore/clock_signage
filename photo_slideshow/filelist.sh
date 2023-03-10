#!/bin/bash

output="filelist.json"

cd "${0%/*}/"
dir="$1"
if [ "$dir" != "" ] && [ -d "$dir" ]
then
  {
    echo '{'
    echo '  "NOTE":"THIS FILE IS CREATED BY filelist.sh",'
    echo '  "ok":true,'
    echo '  "files":['
    find "$dir" \( -name '*.jpg' -o -name '*.JPG' \) -printf "%P\n" | sed -E 's/^(.+)$/    "\1",/'
    echo '    null'
    echo '  ]'
    echo '}'
  } > $output
fi
