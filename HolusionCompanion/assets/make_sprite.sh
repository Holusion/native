#!/bin/sh
set -e
if [ ! -d "$1" -o -z "$2"  ] ;then
  echo "Usage : make_frames.sh <frames_directory> <output_file>"
fi

montage "$1"/*.png -geometry '1x1+0+0<' -background None "$2"

