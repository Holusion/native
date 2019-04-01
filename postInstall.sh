#!/bin/bash

cd $1
echo "Link react dependencies"
react-native link
echo "Install third party"
rm -r ~/.rncache/
cd node_modules/react-native/scripts/ && ./ios-install-third-party.sh && cd ../../../
cd node_modules/react-native/third-party/glog-0.3.5/ && ./configure --host arm-apple-darwin && cd ../../../../../