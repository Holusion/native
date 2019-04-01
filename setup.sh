#!/bin/bash

if test -z "$1" ;then
  echo "USAGE: setup.sh <project-name>"
  exit 1
fi

react-native init $1
cd $1
echo "{
  \"name\": \"$1\",
  \"version\": \"0.0.1\",
  \"private\": true,
  \"scripts\": {
    \"start\": \"node node_modules/react-native/local-cli/cli.js start\",
    \"test\": \"jest\",
    \"android-linux\": \"react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res && ANDROID_HOME=/home/yann/Android/Sdk/ react-native run-android\"
  },
  \"rnpm\": {
    \"assets\": [
      \"./assets/objects\"
    ]
  },
  \"dependencies\": {
    \"@holusion/react-native-holusion\": \"^0.0.6\",
    \"markdown-it-attrs\": \"^2.3.2\",
    \"native-base\": \"2.8.1\",
    \"react\": \"16.6.0-alpha.8af6728\",
    \"react-native\": \"0.57.3\",
    \"react-native-firebase\": \"^5.1.1\",
    \"react-native-fs\": \"^2.12.1\",
    \"react-native-gesture-handler\": \"^1.0.10\",
    \"react-native-markdown-renderer\": \"^3.2.8\",
    \"react-native-share\": \"^1.1.3\",
    \"react-native-vector-icons\": \"^6.4.2\",
    \"react-native-zeroconf\": \"^0.9.0\",
    \"react-navigation\": \"^2.18.3\",
    \"react-navigation-redux-helpers\": \"^2.0.6\"
  },
  \"devDependencies\": {
    \"babel-jest\": \"23.6.0\",
    \"jest\": \"23.6.0\",
    \"metro-react-native-babel-preset\": \"0.48.1\",
    \"react-test-renderer\": \"16.6.0-alpha.8af6728\"
  },
  \"jest\": {
    \"preset\": \"react-native\"
  }
}" > package.json
echo "Install node dependencies"
npm install
echo "Copy AppDelegate"
cp ../Holomouseio/ios/Holomouseio/AppDelegate.m ./ios/$1/AppDelegate.m
echo "Create Podfile"
echo "# Uncomment the next line to define a global platform for your project
# platform :ios, '9.0'

target '$1' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!
  pod 'React', :path => '../node_modules/react-native', :subspecs => [ 'RCTImage' ]
  pod 'yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
  pod 'Firebase/Core'
  pod 'Firebase/Auth'
  pod 'Firebase/Storage'
  pod 'Firebase/Firestore'

  pod 'RNFS', :path => '../node_modules/react-native-fs'

  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'

  target '$1Tests' do
    inherit! :search_paths
    # Pods for testing
  end

end

target '$1-tvOS' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!

  # Pods for $1-tvOS

  target '$1-tvOSTests' do
    inherit! :search_paths
    # Pods for testing
  end

end" >> ./ios/Podfile
echo "Run pod"
cd ./ios
pod update
pod install
cd ..
echo "Link react dependencies"
react-native link
echo "Copy src"
cp -R ../Holomouseio/native-base-theme ./
cp -R ../Holomouseio/src ./
cp -R ../Holomouseio/assets ./
cp ../Holomouseio/App.js ./App.js
cp ../Holomouseio/index.js ./index.js
cp ../Holomouseio/GoogleService-Info.plist ./
echo "Link react-native dependencies"
rm -rf ./android/app/src/debug/
react-native link
echo "Open xcodeproj"
open ios/$1.xcworkspace &