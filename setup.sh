#!/bin/bash

if test -z "$1" ;then
  echo "USAGE: setup.sh <project-name>"
  exit 1
fi

react-native init $1
cd $1
sed -e "s/{{name}}/$1/" ../_template/package.json > package.json

echo "Install node dependencies"
npm install

echo "Copy AppDelegate"
cp ../Holomouseio_Template/ios/Holomouseio_Template/AppDelegate.m ./ios/$1/AppDelegate.m

echo "Create Podfile"
sed -e "s/{{name}}/$1/" ../_template/Podfile >> ./ios/Podfile

echo "Run pod"
cd ./ios
pod update
pod install
cd ..

echo "Link react dependencies"
react-native link

echo "Copy src"
cp -R ../Holomouseio_Template/native-base-theme ./
cp -R ../Holomouseio_Template/src ./
cp -R ../Holomouseio_Template/assets ./
cp ../Holomouseio_Template/App.js ./App.js
cp ../Holomouseio_Template/index.js ./index.js
cp ../Holomouseio_Template/GoogleService-Info.plist ./
cp ../Holomouseio_Template/resources.js ./
cp ../Holomouseio_Template/strings.js ./
cp ../Holomouseio_Template/navigator.js ./

echo "Link react-native dependencies"
rm -rf ./android/app/src/debug/
react-native link

echo "Install third party"
rm -r ~/.rncache/
cd node_modules/react-native/ && ./scripts/ios-install-third-party.sh && cd ../../
cd node_modules/react-native/third-party/glog-0.3.5/ && ./configure --host arm-apple-darwin && cd ../../../../
cd ios && pod install && cd ../

echo "Update AppDelegate"
sed -e "s/{{name}}/$1/" ../_template/AppDelegate.m > ./ios/$1/AppDelegate.m

echo "Open xcodeproj"
open ios/$1.xcworkspace &