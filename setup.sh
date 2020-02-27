#!/bin/bash
set -e 

if test -z "$1" ;then
  echo "USAGE: setup.sh <project-name>"
  exit 1
fi


NAME="$1"

if test -d "$NAME" ;then 
  echo "a folder named $NAME already exists. Aborting..."
  exit 1
fi

npx react-native init "$NAME" --non-interactive

echo "Install node dependencies"
cd "$NAME" &&  npm install "@holusion/react-native-holusion" "@react-native-community/netinfo" "native-base" \
      "react-native-firebase" "react-native-fs" "react-native-gesture-handler" "react-native-vector-icons" \
    "react-native-zeroconf" \
    "react-navigation" "react-navigation-stack"  \
    "react-redux"


sed -i '/#import "AppDelegate.h"/a\n#import "Firebase.h"' "$NAME/ios/AppDelegate.m"


cd "$NAME/ios" && pod install